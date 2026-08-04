import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import { ChevronLeft, ScanLine, CheckCircle2, XCircle, Camera } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { TicketsAPI } from '../../lib/queries';

const SCANNER_ID = 'nexus-qr-scanner';

export default function CheckInPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const scannerRef = useRef(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null); // { ok, message, name }
  const [cameraError, setCameraError] = useState(null);
  const processingRef = useRef(false);

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        await scannerRef.current.clear();
      } catch (e) {
        // already stopped
      }
      scannerRef.current = null;
    }
    setScanning(false);
  };

  const handleDecoded = async (decodedText) => {
    if (processingRef.current) return;
    processingRef.current = true;
    try {
      const res = await TicketsAPI.checkIn({ qrCodeData: decodedText, eventId });
      setResult({ ok: true, message: 'Checked in!', name: res.data.data.user?.name });
    } catch (error) {
      setResult({ ok: false, message: error.response?.data?.message || 'Invalid ticket' });
    } finally {
      setTimeout(() => {
        processingRef.current = false;
      }, 1500);
    }
  };

  const startScanner = async () => {
    setCameraError(null);
    setResult(null);
    try {
      const scanner = new Html5Qrcode(SCANNER_ID);
      scannerRef.current = scanner;
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        handleDecoded,
        () => {} // ignore per-frame decode failures
      );
      setScanning(true);
    } catch (error) {
      setCameraError('Could not access the camera. Check browser permissions.');
    }
  };

  useEffect(() => () => { stopScanner(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      <button
        onClick={() => navigate('/organizer/events')}
        className="flex items-center gap-2 text-xs font-semibold text-luma-text-muted hover:text-white mb-6 cursor-pointer bg-transparent border-none p-0"
      >
        <ChevronLeft className="w-4 h-4" /> Back to My Events
      </button>

      <div className="flex items-center gap-2 text-luma-blue text-xs font-semibold uppercase tracking-widest mb-1.5">
        <ScanLine className="w-4 h-4" />
        <span>Check-in Scanner</span>
      </div>
      <h1 className="text-2xl font-extrabold text-white tracking-tight mb-6">Scan tickets at the door</h1>

      <Card className="max-w-md bg-[#121315]/45 border border-white/[0.06] rounded-[24px] p-6">
        <div id={SCANNER_ID} className="rounded-2xl overflow-hidden bg-black/40 min-h-[260px] flex items-center justify-center">
          {!scanning && !cameraError && <Camera className="w-8 h-8 text-luma-text-muted" />}
        </div>

        {cameraError && <p className="text-xs text-luma-red mt-3">{cameraError}</p>}

        {result && (
          <div className={`mt-4 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold ${result.ok ? 'bg-luma-green-bg/25 text-luma-yellow' : 'bg-luma-red/10 text-luma-red'}`}>
            {result.ok ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
            {result.message} {result.name && `-- ${result.name}`}
          </div>
        )}

        <div className="mt-5">
          {!scanning ? (
            <Button variant="primary" onClick={startScanner} className="w-full rounded-xl flex items-center justify-center gap-2">
              <Camera className="w-4 h-4" /> Start Scanning
            </Button>
          ) : (
            <Button variant="secondary" onClick={stopScanner} className="w-full rounded-xl">
              Stop Scanner
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
