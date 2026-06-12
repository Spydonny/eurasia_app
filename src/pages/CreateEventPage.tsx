import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import * as api from '@/api';
import { Button, Input, Icons, AddressPicker } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';

const CATEGORY_VALUES = ['environment', 'education', 'health', 'animals', 'culture', 'sports', 'technology', 'social', 'other'];

export function CreateEventPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  const approved = (user?.provider_status ?? 'approved') === 'approved';
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [category, setCategory] = useState('environment');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [city, setCity] = useState('');
  const [venue, setVenue] = useState('');
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [locationType, setLocationType] = useState('offline');
  const [maxParticipants, setMaxParticipants] = useState('');
  const [tags, setTags] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title || !description || !startDate || !startTime || !endDate) {
      setError(t('events.required_fields'));
      return;
    }

    setLoading(true);
    try {
      const event = await api.createEvent({
        title,
        description,
        short_description: shortDescription,
        category,
        start_date: `${startDate}T${startTime}:00`,
        end_date: `${endDate}T23:59:00`,
        max_participants: maxParticipants ? parseInt(maxParticipants, 10) : 0,
        location: {
          type: locationType,
          city,
          venue,
          address: venue,
          lat,
          lng,
        },
        tags: tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
      });
      navigate(`/events/${event.id}`, { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.detail || t('events.create_failed'));
    }
    setLoading(false);
  };

  return (
    <div className="page">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button className="btn btn--ghost btn--sm" onClick={() => navigate('/events')}>
          <Icons.back size={16} /> {t('common.back')}
        </button>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>
          {t('events.create_page')}
        </h1>
      </div>

      {!approved ? (
        <div className="empty-state">
          <p className="empty-state__text">
            {t('events.create_pending_approval')}
          </p>
        </div>
      ) : (
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {error && <div className="alert alert--error">{error}</div>}

        <Input label={t('events.fields.title')} value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={200} />
        <div className="input__wrapper">
          <label className="input__label">{t('events.fields.description')}</label>
          <textarea
            className="input"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={5}
            style={{ resize: 'vertical', minHeight: 100 }}
          />
        </div>
        <Input label={t('events.fields.short_description')} value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} maxLength={300} />

        <div className="input__wrapper">
          <label className="input__label">{t('events.fields.category')}</label>
          <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORY_VALUES.map((c) => (
              <option key={c} value={c}>{t(`category.${c}`)}</option>
            ))}
          </select>
        </div>

        <div className="form-grid-2">
          <Input label={t('events.fields.start_date')} type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
          <Input label={t('events.fields.start_time')} type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
        </div>
        <Input label={t('events.fields.end_date')} type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />

        <div className="input__wrapper">
          <label className="input__label">{t('events.fields.location_type')}</label>
          <select className="input" value={locationType} onChange={(e) => setLocationType(e.target.value)}>
            <option value="offline">{t('events.fields.offline')}</option>
            <option value="online">{t('events.fields.online')}</option>
            <option value="hybrid">{t('events.fields.hybrid')}</option>
          </select>
        </div>

        {locationType !== 'online' && (
          <AddressPicker
            label={t('events.fields.venue')}
            value={{ address: venue, city, lat, lng }}
            onChange={(v) => {
              setVenue(v.address);
              setCity(v.city);
              setLat(v.lat);
              setLng(v.lng);
            }}
          />
        )}

        <Input label={t('events.fields.max_participants')} type="number" value={maxParticipants} onChange={(e) => setMaxParticipants(e.target.value)} min={0} />
        <Input label={t('events.fields.tags')} value={tags} onChange={(e) => setTags(e.target.value)} placeholder={t('events.fields.tags_placeholder')} />

        <Button type="submit" loading={loading} className="auth-form__submit" style={{ marginTop: 8 }}>
          {t('events.create_page')}
        </Button>
      </form>
      )}
    </div>
  );
}
