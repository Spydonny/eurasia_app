import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import * as api from '@/api';
import { Button, Input, Icons, AddressPicker } from '@/components/ui';
import type { Event } from '@/types';

const CATEGORY_VALUES = ['environment', 'education', 'health', 'animals', 'culture', 'sports', 'technology', 'social', 'other'];
const STATUS_VALUES = ['draft', 'published', 'in_progress', 'completed', 'cancelled'];

export function EditEventPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

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
  const [maxParticipants, setMaxParticipants] = useState('');
  const [tags, setTags] = useState('');
  const [status, setStatus] = useState('draft');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    api.getEvent(id).then((e: Event) => {
      setTitle(e.title);
      setDescription(e.description);
      setShortDescription(e.short_description);
      setCategory(e.category);
      setStartDate(e.start_date.split('T')[0]);
      setStartTime(e.start_date.split('T')[1]?.substring(0, 5) || '');
      setEndDate(e.end_date.split('T')[0]);
      setCity(e.location.city || '');
      setVenue(e.location.venue || '');
      setLat(e.location.lat ?? null);
      setLng(e.location.lng ?? null);
      setMaxParticipants(e.max_participants > 0 ? String(e.max_participants) : '');
      setTags(e.tags.join(', '));
      setStatus(e.status);
      setInitialLoading(false);
    }).catch(() => {
      navigate('/events', { replace: true });
    });
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const event = await api.updateEvent(id!, {
        title,
        description,
        short_description: shortDescription,
        category,
        start_date: `${startDate}T${startTime}:00`,
        end_date: `${endDate}T23:59:00`,
        max_participants: maxParticipants ? parseInt(maxParticipants, 10) : 0,
        location: { city, venue, address: venue, lat, lng },
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
        status: status as any,
      });
      navigate(`/events/${event.id}`, { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.detail || t('events.update_failed'));
    }
    setLoading(false);
  };

  if (initialLoading) return <div className="page-loader">{t('common.loading')}</div>;

  return (
    <div className="page">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button className="btn btn--ghost btn--sm" onClick={() => navigate(`/events/${id}`)}><Icons.back size={16} /> {t('common.back')}</button>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{t('events.edit_page')}</h1>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {error && <div className="alert alert--error">{error}</div>}

        <Input label={t('events.fields.title')} value={title} onChange={(e) => setTitle(e.target.value)} required />
        <div className="input__wrapper">
          <label className="input__label">{t('events.fields.description')}</label>
          <textarea className="input" value={description} onChange={(e) => setDescription(e.target.value)} required rows={5} style={{ resize: 'vertical' }} />
        </div>
        <Input label={t('events.fields.short_description')} value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} />

        <div className="input__wrapper">
          <label className="input__label">{t('events.fields.category')}</label>
          <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORY_VALUES.map((c) => <option key={c} value={c}>{t(`category.${c}`)}</option>)}
          </select>
        </div>

        <div className="input__wrapper">
          <label className="input__label">{t('events.fields.status')}</label>
          <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
            {STATUS_VALUES.map((s) => <option key={s} value={s}>{t(`events.status.${s}`)}</option>)}
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Input label={t('events.fields.start_date')} type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
          <Input label={t('events.fields.start_time')} type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
        </div>
        <Input label={t('events.fields.end_date')} type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
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
        <Input label={t('events.fields.max_participants')} type="number" value={maxParticipants} onChange={(e) => setMaxParticipants(e.target.value)} />
        <Input label={t('events.fields.tags')} value={tags} onChange={(e) => setTags(e.target.value)} />

        <Button type="submit" loading={loading} className="auth-form__submit">{t('common.save')}</Button>
      </form>
    </div>
  );
}
