"use client";
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@ecocollect/ui';
import toast from 'react-hot-toast';
import { submitScan } from '../../utils/api';
import Navigation from '../../components/Navigation';
import { 
  addScan, 
  getAllScans, 
  getQueueLength, 
  syncAll, 
  initAutoSync 
} from '../../utils/offlineQueue';
import config from '@ecocollect/config';
const { API_BASE } = config;

// TypeScript declaration for jsQR loaded via CDN
declare global {
  interface Window {
    jsQR: any;
  }
}

export default function StaffScanPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  
  const [email, setEmail] = useState<string>('');
  const [role, setRole] = useState<'ADMIN' | 'MANAGER' | 'RESIDENT' | 'STAFF' | 'USER'>('USER');
  const [scanning, setScanning] = useState(false);
  const [lastScannedData, setLastScannedData] = useState<string | null>(null);
  const [queueLength, setQueueLength] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  
  // Prevent duplicate scans of the same QR code
  const lastResultRef = useRef<string | null>(null);

  // Check session
  useEffect(() => {
    (async () => {
      try {
        const me = await fetch(`${API_BASE}/auth/session`, { credentials: 'include' });
        if (!me.ok) { router.replace('/login' as any); return; }
        const data = await me.json();
        const upper = String(data?.role || '').toUpperCase() as 'ADMIN' | 'MANAGER' | 'RESIDENT' | 'STAFF' | 'USER';
        setRole(upper);
        setEmail(data?.email || '');
      } catch { router.replace('/login' as any); }
    })();
  }, [router]);

  // Initialize auto-sync on mount
  useEffect(() => {
    initAutoSync();
    updateQueueLength();
  }, []);

  // Update queue length
  const updateQueueLength = async () => {
    try {
      const count = await getQueueLength();
      setQueueLength(count);
    } catch (error) {
      console.error('Error getting queue length:', error);
    }
  };

  // Start camera and scanning
  const startScanning = async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.play();
        setScanning(true);
        requestAnimationFrame(tick);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setCameraError('Unable to access camera. Please grant camera permissions.');
      toast.error('Camera access denied');
    }
  };

  // Stop camera and scanning
  const stopScanning = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setScanning(false);
    lastResultRef.current = null;
  };

  // QR code scanning loop
  const tick = () => {
    if (!videoRef.current || !canvasRef.current || !scanning) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const canvasCtx = canvas.getContext('2d');

    if (!canvasCtx) return;

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.height = video.videoHeight;
      canvas.width = video.videoWidth;
      canvasCtx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const imageData = canvasCtx.getImageData(0, 0, canvas.width, canvas.height);
      
      if (window.jsQR) {
        const code = window.jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert',
        });

        if (code && code.data) {
          // Prevent duplicate scans
          if (code.data !== lastResultRef.current) {
            lastResultRef.current = code.data;
            handleQRCode(code.data);
          }

          // Draw detection box
          drawBoundingBox(canvasCtx, code.location);
        }
      }
    }

    animationFrameRef.current = requestAnimationFrame(tick);
  };

  // Draw bounding box around detected QR code
  const drawBoundingBox = (ctx: CanvasRenderingContext2D, location: any) => {
    ctx.beginPath();
    ctx.moveTo(location.topLeftCorner.x, location.topLeftCorner.y);
    ctx.lineTo(location.topRightCorner.x, location.topRightCorner.y);
    ctx.lineTo(location.bottomRightCorner.x, location.bottomRightCorner.y);
    ctx.lineTo(location.bottomLeftCorner.x, location.bottomLeftCorner.y);
    ctx.lineTo(location.topLeftCorner.x, location.topLeftCorner.y);
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#10b981';
    ctx.stroke();
  };

  // Handle QR code detection
  const handleQRCode = async (data: string) => {
    setLastScannedData(data);
    
    // TODO: Replace with authenticated collector ID from user session
    const collectorId = 'FRONTEND-TEST-01';
    
    const payload = {
      binId: data,
      collectorId,
      timestamp: new Date().toISOString(),
    };

    try {
      // Try to submit directly
      const response = await submitScan(payload);
      toast.success(`Scan recorded: ${response.binId}`);
      console.log('Scan successful:', response);
    } catch (error) {
      // If offline or failed, queue it
      console.error('Scan submission failed, queuing:', error);
      try {
        await addScan(payload);
        await updateQueueLength();
        toast.error('Offline - Scan queued for later sync');
      } catch (queueError) {
        console.error('Failed to queue scan:', queueError);
        toast.error('Failed to save scan');
      }
    }
  };

  // Manual sync
  const handleSyncNow = async () => {
    if (isSyncing) return;
    
    setIsSyncing(true);
    try {
      const result = await syncAll();
      await updateQueueLength();
      
      if (result.success > 0) {
        toast.success(`Synced ${result.success} scan(s)`);
      }
      if (result.failed > 0) {
        toast.error(`Failed to sync ${result.failed} scan(s)`);
      }
      if (result.success === 0 && result.failed === 0) {
        toast('No scans to sync');
      }
    } catch (error) {
      console.error('Sync error:', error);
      toast.error('Sync failed');
    } finally {
      setIsSyncing(false);
    }
  };

  // Show pending scans
  const handleShowPending = async () => {
    try {
      const scans = await getAllScans();
      if (scans.length === 0) {
        toast('No pending scans');
      } else {
        const scanList = scans
          .map((s, i) => `${i + 1}. Bin: ${s.payload.binId} (${new Date(s.queuedAt).toLocaleString()})`)
          .join('\n');
        alert(`Pending scans (${scans.length}):\n\n${scanList}`);
      }
    } catch (error) {
      console.error('Error fetching pending scans:', error);
      toast.error('Failed to fetch pending scans');
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  return (
    <>
      <Navigation email={email} role={role} currentPage="/scan" />
      <main className="max-w-3xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
            QR Scanner
          </h1>
          {queueLength > 0 && (
            <div className="px-4 py-2 rounded-full bg-amber-100 text-amber-700 text-sm font-medium flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {queueLength} pending
            </div>
          )}
        </div>

        {/* Camera/Scanner Area */}
      <div className="rounded-lg border bg-white p-4 shadow-sm">
        <div className="space-y-4">
          {!scanning ? (
            <div className="space-y-4">
              <div className="aspect-square bg-gray-100 rounded flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <svg className="mx-auto h-16 w-16 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                  <p className="font-medium">Camera Ready</p>
                  <p className="text-sm">Click Start to scan QR codes</p>
                </div>
              </div>
              {cameraError && (
                <div className="p-3 bg-red-50 text-red-700 rounded text-sm">
                  {cameraError}
                </div>
              )}
              <Button className="w-full" onClick={startScanning}>
                Start Scanning
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative">
                <video
                  ref={videoRef}
                  className="w-full rounded"
                  playsInline
                />
                <canvas
                  ref={canvasRef}
                  className="absolute top-0 left-0 w-full h-full"
                />
              </div>
              <Button className="w-full" onClick={stopScanning}>
                Stop Scanning
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Last Scanned Data */}
      {lastScannedData && (
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <h2 className="font-semibold mb-2">Last Scanned</h2>
          <div className="bg-emerald-50 text-emerald-800 p-3 rounded font-mono text-sm break-all">
            {lastScannedData}
          </div>
        </div>
      )}

      {/* Offline Queue Status */}
      <div className="rounded-lg border bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">Offline Queue</h2>
          <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {queueLength} pending
          </span>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <Button 
            onClick={handleSyncNow}
            disabled={isSyncing || queueLength === 0}
          >
            {isSyncing ? 'Syncing...' : 'Sync Now'}
          </Button>
          <Button 
            onClick={handleShowPending}
            disabled={queueLength === 0}
          >
            Show Pending
          </Button>
        </div>
        
        {queueLength > 0 && (
          <div className="mt-3 text-sm text-gray-600">
            <p>📱 Scans will sync automatically when back online</p>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="rounded-lg border bg-blue-50 p-4 text-sm text-blue-800">
        <h3 className="font-semibold mb-2">How to use:</h3>
        <ul className="list-disc list-inside space-y-1">
          <li>Click &quot;Start Scanning&quot; to activate camera</li>
          <li>Point camera at QR code on waste bin</li>
          <li>Scan will be recorded automatically</li>
          <li>If offline, scans are queued and synced later</li>
        </ul>
      </div>
      </main>
    </>
  );
}
