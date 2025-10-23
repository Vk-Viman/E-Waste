"use client";
import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@ecocollect/ui';
import config from '@ecocollect/config';
import Navigation from '../../components/Navigation';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
const { API_BASE } = config;

// Dynamically import map components to avoid SSR issues with Leaflet
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);
const Polyline = dynamic(
  () => import('react-leaflet').then((mod) => mod.Polyline),
  { ssr: false }
);

// Fix default marker icons in Next.js (avoid 404s by pointing to CDN-hosted assets)
if (typeof window !== 'undefined') {
  const iconRetinaUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png';
  const iconUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
  const shadowUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';
  // @ts-ignore
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({ iconRetinaUrl, iconUrl, shadowUrl });
}

interface BinLocation {
  order: number;
  binId: string;
  location: string;
  category: string;
  latitude: number;
  longitude: number;
  areaId?: string;
}

export default function ManagerRoutesPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string>('');
  const [role, setRole] = useState<'ADMIN' | 'MANAGER' | 'RESIDENT' | 'STAFF' | 'USER'>('USER');
  const [optimizedRoute, setOptimizedRoute] = useState<BinLocation[]>([]);
  const [loading, setLoading] = useState(false);
  const [areaId, setAreaId] = useState<string>('');
  const [isMapReady, setIsMapReady] = useState(false);
  const [csrfToken, setCsrfToken] = useState<string>('');

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
    
    // Set map ready after component mounts
    setIsMapReady(true);
    // Fetch CSRF token for POST requests
    (async () => {
      try {
        const resp = await fetch(`${API_BASE}/csrf-token`, { credentials: 'include' });
        if (resp.ok) {
          const t = await resp.json();
          setCsrfToken(t?.csrfToken || '');
        }
      } catch {}
    })();
  }, [router]);

  // Calculate route path for Polyline
  const routePath = useMemo(() => {
    return optimizedRoute.map(bin => [bin.latitude, bin.longitude] as [number, number]);
  }, [optimizedRoute]);

  // Calculate map center
  const mapCenter = useMemo<[number, number]>(() => {
    if (optimizedRoute.length === 0) {
      return [6.9271, 79.8612]; // Default to Colombo, Sri Lanka
    }
    const avgLat = optimizedRoute.reduce((sum, bin) => sum + bin.latitude, 0) / optimizedRoute.length;
    const avgLng = optimizedRoute.reduce((sum, bin) => sum + bin.longitude, 0) / optimizedRoute.length;
    return [avgLat, avgLng];
  }, [optimizedRoute]);

  async function onOptimize() {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/routes/optimize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrfToken },
        credentials: 'include',
        body: JSON.stringify({ areaId: areaId || undefined })
      });
      
      if (!response.ok) {
        throw new Error('Failed to optimize routes');
      }
      
      const data = await response.json();
      setOptimizedRoute(data.optimizedRoute || []);
      
      if (data.optimizedRoute?.length === 0) {
        alert(data.message || 'No bins found to optimize');
      }
    } catch (error) {
      console.error('Error optimizing routes:', error);
      alert('Failed to optimize routes. Please try again.');
    } finally {
      setLoading(false);
    }
  }
  
  return (
    <>
      <Navigation email={email} role={role} currentPage="/routes" />
      <main className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Route Optimization
          </h1>
          <div className="flex gap-3 items-center">
            <input
              type="text"
              placeholder="Area ID (optional)"
              value={areaId}
              onChange={(e) => setAreaId(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Button onClick={onOptimize} disabled={loading}>
              {loading ? 'Optimizing...' : 'Generate Optimized Routes'}
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Map */}
          <div className="rounded-2xl border-2 border-gray-200 bg-white p-6 shadow-lg">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              Route Map
            </h2>
            <div className="h-96 rounded-xl overflow-hidden border-2 border-gray-200">
              {isMapReady && (
                <MapContainer
                  center={mapCenter}
                  zoom={13}
                  style={{ height: '100%', width: '100%' }}
                  key={`map-${optimizedRoute.length}`}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  
                  {/* Render markers for each bin */}
                  {optimizedRoute.map((bin, index) => (
                    <Marker key={bin.binId} position={[bin.latitude, bin.longitude]}>
                      <Popup>
                        <div className="text-sm">
                          <strong>Stop #{bin.order}</strong><br />
                          <strong>Bin ID:</strong> {bin.binId}<br />
                          <strong>Location:</strong> {bin.location}<br />
                          <strong>Category:</strong> {bin.category}
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                  
                  {/* Draw the route path */}
                  {routePath.length > 1 && (
                    <Polyline
                      positions={routePath}
                      color="blue"
                      weight={3}
                      opacity={0.7}
                    />
                  )}
                </MapContainer>
              )}
            </div>
          </div>

          {/* Routes Stats */}
          <div className="rounded-2xl border-2 border-gray-200 bg-white p-6 shadow-lg">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Route Statistics
            </h2>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200">
                <div className="text-sm text-gray-600">Optimized Route Stops</div>
                <div className="text-3xl font-bold text-blue-600">{optimizedRoute.length}</div>
              </div>
              <div className="p-4 rounded-lg bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200">
                <div className="text-sm text-gray-600">Route Status</div>
                <div className="text-xl font-bold text-emerald-600">
                  {optimizedRoute.length > 0 ? 'Optimized' : 'Not Generated'}
                </div>
              </div>
              <div className="p-4 rounded-lg bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200">
                <div className="text-sm text-gray-600">Area Filter</div>
                <div className="text-xl font-bold text-amber-600">
                  {areaId || 'All Areas'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Routes Table */}
        <div className="rounded-2xl border-2 border-gray-200 bg-white p-6 shadow-lg">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Optimized Route Sequence
          </h2>
          {optimizedRoute.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stop #</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bin ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Coordinates</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {optimizedRoute.map((bin) => (
                    <tr key={bin.binId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{bin.order}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{bin.binId}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{bin.location}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{bin.category}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {bin.latitude.toFixed(4)}, {bin.longitude.toFixed(4)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="h-48 bg-gray-50 rounded-xl flex items-center justify-center border-2 border-gray-200">
              <p className="text-gray-500">Click "Generate Optimized Routes" to see the route sequence</p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
