"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@ecocollect/ui';
import config from '@ecocollect/config';
import Navigation from '../../components/Navigation';
const { API_BASE } = config;

export default function ManagerRoutesPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string>('');
  const [role, setRole] = useState<'ADMIN' | 'MANAGER' | 'RESIDENT' | 'STAFF' | 'USER'>('USER');

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

  async function onOptimize() {
    alert(`Would POST to ${API_BASE}/routes/optimize`);
  }
  
  return (
    <>
      <Navigation email={email} role={role} currentPage="/routes" />
      <main className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Route Optimization
          </h1>
          <Button onClick={onOptimize}>Optimize Routes</Button>
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
            <div className="h-64 bg-gradient-to-br from-emerald-50 to-teal-100 rounded-xl flex items-center justify-center border-2 border-emerald-200">
              <div className="text-center">
                <svg className="w-16 h-16 mx-auto text-emerald-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                <p className="text-emerald-700 font-medium">Interactive Map Coming Soon</p>
              </div>
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
                <div className="text-sm text-gray-600">Active Routes</div>
                <div className="text-3xl font-bold text-blue-600">12</div>
              </div>
              <div className="p-4 rounded-lg bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200">
                <div className="text-sm text-gray-600">Bins Monitored</div>
                <div className="text-3xl font-bold text-emerald-600">248</div>
              </div>
              <div className="p-4 rounded-lg bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200">
                <div className="text-sm text-gray-600">Avg. Collection Time</div>
                <div className="text-3xl font-bold text-amber-600">2.4h</div>
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
            All Routes
          </h2>
          <div className="h-48 bg-gray-50 rounded-xl flex items-center justify-center border-2 border-gray-200">
            <p className="text-gray-500">Routes table will be displayed here</p>
          </div>
        </div>
      </main>
    </>
  );
}
