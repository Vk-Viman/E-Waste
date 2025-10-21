"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@ecocollect/ui';
import config from '@ecocollect/config';
import Navigation from '../../components/Navigation';

const { API_BASE } = config;

type Account = {
  address?: string;
  balance?: number;
  pickups?: Array<{ date: string; notes?: string }>;
};

export default function ResidentDashboardPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string>('');
  const [role, setRole] = useState<'ADMIN' | 'MANAGER' | 'RESIDENT' | 'STAFF' | 'USER'>('USER');
  const [acct, setAcct] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);
  const [pickDate, setPickDate] = useState('');
  const [notes, setNotes] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Protect route: require session and USER role; redirect ADMINs to /settings
  useEffect(() => {
    (async () => {
      try {
        const me = await fetch(`${API_BASE}/auth/session`, { credentials: 'include' });
        if (!me.ok) { router.replace('/login' as any); return; }
        const m = await me.json();
        const upper = String(m?.role || '').toUpperCase() as 'ADMIN' | 'MANAGER' | 'RESIDENT' | 'STAFF' | 'USER';
        if (upper === 'ADMIN') { router.replace('/settings' as any); return; }
        setRole(upper);
        setEmail(m?.email || '');
      } catch { router.replace('/login' as any); return; }
    })();
    // Fetch account info
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/accounts/me`, { credentials: 'include' });
        if (!res.ok) throw new Error('Failed to fetch account');
        const data = await res.json();
        setAcct(data);
      } catch (e: any) {
        setError(e.message || 'Failed to load');
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  async function submitPickup(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setError(null);
    try {
      const csrf = await (await fetch(`${API_BASE}/csrf-token`, { credentials: 'include' })).json();
      const res = await fetch(`${API_BASE}/accounts/pickups`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrf?.csrfToken || '',
        },
        credentials: 'include',
        body: JSON.stringify({ date: pickDate, notes }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Failed to schedule pickup');
      setMessage('Pickup scheduled successfully');
      setAcct(data);
      setPickDate('');
      setNotes('');
    } catch (e: any) {
      setError(e.message || 'Failed to schedule pickup');
    }
  }

  const pickups = acct?.pickups || [];

  return (
    <>
      <Navigation email={email} role={role} currentPage="/dashboard" />
      <main className="mx-auto max-w-4xl p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            Welcome, {email || 'Resident'}!
          </h1>
          <div className="flex items-center gap-2">
            <div className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-sm font-medium">
              Balance: ${acct?.balance || 0}
            </div>
          </div>
        </div>

      {loading ? (
        <div className="text-gray-600">Loading your account…</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : (
        <>
          {/* Waste History */}
          <section className="rounded border bg-white p-4">
            <h2 className="mb-3 text-lg font-medium">Your Waste History</h2>
            {pickups.length === 0 ? (
              <div className="text-sm text-gray-600">No pickups yet. Schedule your first pickup below.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium text-gray-700">Date</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-700">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pickups.map((p, i) => (
                      <tr key={i} className="border-t">
                        <td className="px-3 py-2">{new Date(p.date).toLocaleDateString()}</td>
                        <td className="px-3 py-2">{p.notes || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Schedule a Special Pickup */}
          <section className="rounded border bg-white p-4">
            <h2 className="mb-3 text-lg font-medium">Schedule a Special Pickup</h2>
            <form className="space-y-4" onSubmit={submitPickup}>
              <div>
                <label className="block text-sm font-medium">Pickup Date</label>
                <input
                  type="date"
                  className="mt-1 w-full rounded border px-3 py-2"
                  value={pickDate}
                  onChange={(e) => setPickDate(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Notes</label>
                <textarea
                  className="mt-1 w-full rounded border px-3 py-2"
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g., bulky items, access instructions"
                />
              </div>
              {message && <div className="text-sm text-emerald-700">{message}</div>}
              {error && <div className="text-sm text-red-600">{error}</div>}
              <Button type="submit">Submit Request</Button>
            </form>
          </section>
        </>
      )}
      </main>
    </>
  );
}
