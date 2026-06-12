import { useEffect, useRef, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Html5Qrcode } from 'html5-qrcode';
import * as api from '@/api';
import { Icons } from '@/components/ui';

interface QRScannerModalProps {
  eventId: string;
  onClose: () => void;
  /** Called after a successful verification so the parent can refresh participants. */
  onVerified: () => void;
}

const READER_ID = 'qr-scanner-reader';

type ScanResult = { ok: boolean; text: string };

/** Organizer-facing camera scanner that verifies a participant's QR token. */
export function QRScannerModal({ eventId, onClose, onVerified }: QRScannerModalProps) {
  const { t } = useTranslation();
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const busyRef = useRef(false);
  const [cameraError, setCameraError] = useState('');
  const [result, setResult] = useState<ScanResult | null>(null);

  const stopScanner = useCallback(async () => {
    const scanner = scannerRef.current;
    if (!scanner) return;
    try {
      // isScanning is true only while the camera stream is active.
      if (scanner.isScanning) await scanner.stop();
      scanner.clear();
    } catch {
      /* ignore stop races */
    }
  }, []);

  const handleDecoded = useCallback(
    async (decodedText: string) => {
      if (busyRef.current) return;
      busyRef.current = true;
      await stopScanner();
      try {
        const res = await api.verifyEventQr(eventId, decodedText.trim());
        setResult({ ok: true, text: res.message || t('events.qr.scan_success') });
        onVerified();
      } catch {
        setResult({ ok: false, text: t('events.qr.scan_error') });
      }
    },
    [eventId, onVerified, stopScanner, t],
  );

  const startScanner = useCallback(async () => {
    setCameraError('');
    setResult(null);
    busyRef.current = false;
    const scanner = scannerRef.current ?? new Html5Qrcode(READER_ID);
    scannerRef.current = scanner;
    try {
      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: (vw, vh) => {
            const size = Math.floor(Math.min(vw, vh) * 0.7);
            return { width: size, height: size };
          },
        },
        (decodedText) => {
          void handleDecoded(decodedText);
        },
        () => {
          /* per-frame decode misses are normal; ignore */
        },
      );
    } catch {
      setCameraError(t('events.qr.camera_error'));
    }
  }, [handleDecoded, t]);

  useEffect(() => {
    void startScanner();
    return () => {
      void stopScanner();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClose = async () => {
    await stopScanner();
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal qr-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <span className="modal__title">{t('events.qr.scanner_title')}</span>
          <button className="qr-modal__close" onClick={handleClose} aria-label={t('common.cancel')}>
            <Icons.close size={20} />
          </button>
        </div>
        <div className="modal__body qr-modal__body">
          {cameraError ? (
            <div className="alert alert--error">{cameraError}</div>
          ) : (
            <>
              <div id={READER_ID} className="qr-scanner__viewport" />
              {result ? (
                <div className={`qr-scanner__result ${result.ok ? 'qr-scanner__result--ok' : 'qr-scanner__result--err'}`}>
                  {result.ok ? <Icons.success size={20} /> : <Icons.error size={20} />}
                  <span>{result.text}</span>
                </div>
              ) : (
                <p className="qr-modal__hint">{t('events.qr.scanner_hint')}</p>
              )}
            </>
          )}
        </div>
        <div className="modal__footer">
          {result && !cameraError && (
            <button className="btn btn--primary" onClick={() => void startScanner()}>
              {t('events.qr.scan_next')}
            </button>
          )}
          <button className="btn btn--ghost" onClick={handleClose}>
            {t('common.cancel')}
          </button>
        </div>
      </div>
    </div>
  );
}
