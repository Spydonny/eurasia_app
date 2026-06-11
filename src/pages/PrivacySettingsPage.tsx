import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { getPrivacySettings, updatePrivacySettings } from '@/api';
import type { PrivacySettings } from '@/types';

export function PrivacySettingsPage() {
  const { t } = useTranslation();
  const [settings, setSettings] = useState<PrivacySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<'saved' | 'load_failed' | 'save_failed' | ''>('');

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getPrivacySettings();
      setSettings(res.settings);
    } catch {
      setMessage('load_failed');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggle = async (field: keyof PrivacySettings) => {
    if (!settings) return;
    const updated = { ...settings, [field]: !settings[field] };
    setSettings(updated);
    setSaving(true);
    setMessage('');
    try {
      await updatePrivacySettings({ [field]: updated[field] });
      setMessage('saved');
    } catch {
      setSettings(settings);
      setMessage('save_failed');
    } finally {
      setSaving(false);
    }
  };

  const rows: { key: keyof PrivacySettings; labelKey: string; descKey: string }[] = [
    { key: 'show_contacts', labelKey: 'privacy.show_contacts', descKey: 'privacy.show_contacts_desc' },
    { key: 'show_social_links', labelKey: 'privacy.show_social_links', descKey: 'privacy.show_social_links_desc' },
    { key: 'show_activity_feed', labelKey: 'privacy.show_activity_feed', descKey: 'privacy.show_activity_feed_desc' },
    { key: 'show_event_history', labelKey: 'privacy.show_event_history', descKey: 'privacy.show_event_history_desc' },
    { key: 'show_reward_history', labelKey: 'privacy.show_reward_history', descKey: 'privacy.show_reward_history_desc' },
    { key: 'allow_friend_requests', labelKey: 'privacy.allow_friend_requests', descKey: 'privacy.allow_friend_requests_desc' },
  ];

  if (loading) {
    return <div className="page-loader">{t('common.loading')}</div>;
  }

  return (
    <div className="page">
      <h1 className="page__title" style={{ marginBottom: 16 }}>{t('privacy.title')}</h1>

      {message && (
        <div className={`alert ${message === 'saved' ? 'alert--success' : 'alert--error'}`}>
          {message === 'saved' && t('privacy.saved')}
          {message === 'load_failed' && t('privacy.failed_load')}
          {message === 'save_failed' && t('privacy.failed_save')}
        </div>
      )}

      {rows.map(row => (
        <div key={row.key} className="settings-row">
          <div>
            <div className="settings-row__label">{t(row.labelKey)}</div>
            <div className="settings-row__desc">{t(row.descKey)}</div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={!!settings?.[row.key]}
            onClick={() => toggle(row.key)}
            disabled={saving}
            className={`toggle ${settings?.[row.key] ? 'toggle--on' : ''}`}
          >
            <span className="toggle__knob" />
          </button>
        </div>
      ))}
    </div>
  );
}
