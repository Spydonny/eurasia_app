import { useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { GoogleMap, Marker, Autocomplete, useJsApiLoader } from '@react-google-maps/api';
import { Input } from './Input';

export interface AddressValue {
  address: string;
  city: string;
  lat: number | null;
  lng: number | null;
}

interface AddressPickerProps {
  value: AddressValue;
  onChange: (value: AddressValue) => void;
  label?: string;
}

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? '';
// Loaded once for the whole app — `libraries` must be a stable reference to avoid reloads.
const LIBRARIES: ('places')[] = ['places'];
// Default map center (Almaty) when the event has no coordinates yet.
const DEFAULT_CENTER = { lat: 43.2389, lng: 76.8897 };

const mapContainerStyle = { width: '100%', height: 280, borderRadius: 12 };

/** Pull a human-friendly city name out of Google address components. */
function extractCity(components?: google.maps.GeocoderAddressComponent[]): string {
  if (!components) return '';
  const byType = (type: string) =>
    components.find((c) => c.types.includes(type))?.long_name ?? '';
  return (
    byType('locality') ||
    byType('postal_town') ||
    byType('administrative_area_level_2') ||
    byType('administrative_area_level_1') ||
    ''
  );
}

/**
 * Address selector backed by Google Maps: Places autocomplete + a draggable
 * marker, both of which keep `address`, `city`, `lat`, `lng` in sync.
 * When no API key is configured it degrades to plain text inputs so the form
 * still works.
 */
export function AddressPicker({ value, onChange, label }: AddressPickerProps) {
  const { t } = useTranslation();
  const resolvedLabel = label || t('address_picker.address_label');
  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <>
        <Input label={t('address_picker.city')} value={value.city} onChange={(e) => onChange({ ...value, city: e.target.value })} />
        <Input label={resolvedLabel} value={value.address} onChange={(e) => onChange({ ...value, address: e.target.value })} />
      </>
    );
  }
  return <MapAddressPicker value={value} onChange={onChange} label={resolvedLabel} />;
}

function MapAddressPicker({ value, onChange, label }: Required<AddressPickerProps>) {
  const { t } = useTranslation();
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: LIBRARIES,
  });

  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const cityTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const hasPin = value.lat != null && value.lng != null;
  const center = hasPin ? { lat: value.lat as number, lng: value.lng as number } : DEFAULT_CENTER;

  const geocoder = () => (geocoderRef.current ??= new google.maps.Geocoder());

  // Move the camera to whatever city is typed (does not touch the venue pin).
  const panToCity = useCallback((query: string) => {
    const q = query.trim();
    if (!q || !mapRef.current) return;
    geocoder().geocode({ address: q }, (results, status) => {
      if (status === 'OK' && results?.[0]?.geometry?.location && mapRef.current) {
        mapRef.current.panTo(results[0].geometry.location);
        mapRef.current.setZoom(11);
      }
    });
  }, []);

  const handleCityChange = useCallback(
    (city: string) => {
      onChange({ ...value, city });
      if (cityTimer.current) clearTimeout(cityTimer.current);
      cityTimer.current = setTimeout(() => panToCity(city), 600);
    },
    [onChange, value, panToCity],
  );

  const handlePlaceChanged = useCallback(() => {
    const place = autocompleteRef.current?.getPlace();
    if (!place?.geometry?.location) return;
    onChange({
      address: place.formatted_address || place.name || value.address,
      city: extractCity(place.address_components),
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng(),
    });
  }, [onChange, value.address]);

  // Reverse-geocode when the user drags the marker so the text fields follow the pin.
  const handleMarkerDragEnd = useCallback(
    (e: google.maps.MapMouseEvent) => {
      const lat = e.latLng?.lat();
      const lng = e.latLng?.lng();
      if (lat == null || lng == null) return;
      onChange({ ...value, lat, lng });
      geocoder().geocode({ location: { lat, lng } }, (results, status) => {
        if (status === 'OK' && results?.[0]) {
          onChange({
            address: results[0].formatted_address,
            city: extractCity(results[0].address_components),
            lat,
            lng,
          });
        }
      });
    },
    [onChange, value],
  );

  if (!isLoaded) {
    return <div className="page-loader" style={{ height: 280 }}>{t('address_picker.loading_map')}</div>;
  }

  return (
    <div className="input__wrapper" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Autocomplete
        onLoad={(ac) => {
          autocompleteRef.current = ac;
          ac.setFields(['formatted_address', 'geometry', 'address_components', 'name']);
        }}
        onPlaceChanged={handlePlaceChanged}
      >
        <Input
          label={label}
          value={value.address}
          onChange={(e) => onChange({ ...value, address: e.target.value })}
          placeholder={t('address_picker.search_placeholder')}
        />
      </Autocomplete>

      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={hasPin ? 15 : 11}
        options={{ streetViewControl: false, mapTypeControl: false, fullscreenControl: false }}
        onLoad={(map) => { mapRef.current = map; }}
        onUnmount={() => { mapRef.current = null; }}
        onClick={handleMarkerDragEnd}
      >
        {hasPin && (
          <Marker
            position={{ lat: value.lat as number, lng: value.lng as number }}
            draggable
            onDragEnd={handleMarkerDragEnd}
          />
        )}
      </GoogleMap>

      <Input
        label={t('address_picker.city')}
        value={value.city}
        onChange={(e) => handleCityChange(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); panToCity(value.city); } }}
        placeholder={t('address_picker.city_placeholder')}
      />
    </div>
  );
}
