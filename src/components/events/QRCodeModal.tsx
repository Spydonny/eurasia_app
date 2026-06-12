import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { QRCodeSVG } from 'qrcode.react';
import * as api from '@/api';
import { Icons } from '@/components/ui';

interface QRCodeModalProps {
  eventId: string;
  onClose: () => void;
}

/** Shows the joined volunteer their personal QR token so an organizer can scan it. */
export function QRCodeModal({ eventId, onClose }: QRCodeModalProps) {
  const { t } = useTranslation();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    api
      .getEventQrCode(eventId)
      .then((res) => {
        if (active) setCode(res.qr_code);
      })
      .catch(() => {
        if (active) setError(t('events.qr.load_error'));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [eventId, t]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal qr-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <span className="modal__title">{t('events.qr.my_title')}</span>
          <button className="qr-modal__close" onClick={onClose} aria-label={t('common.cancel')}>
            <Icons.close size={20} />
          </button>
        </div>
        <div className="modal__body qr-modal__body">
          {loading && <div className="qr-modal__status">{t('common.loading')}</div>}
          {error && <div className="alert alert--error">{error}</div>}
          {!loading && !error && code && (
            <>
              <div className="qr-modal__code">
                <QRCodeSVG value={code} size={224} level="M" includeMargin marginSize={2} />
              </div>
              <p className="qr-modal__hint">{t('events.qr.my_hint')}</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
