"use client";
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import config from '@ecocollect/config';
import toast from 'react-hot-toast';

const { API_BASE } = config;

async function getCsrf(): Promise<string> {
  try {
    const r = await fetch(`${API_BASE}/csrf-token`, { credentials: 'include' });
    const j = await r.json();
    return j?.csrfToken || '';
  } catch { return ''; }
}

export default function ResetPasswordPage() {
  const params = useParams();
  const token = String(params?.token || '');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) { toast.error('Passwords do not match'); return; }
    if (password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/reset-password/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': await getCsrf() },
        credentials: 'include',
        body: JSON.stringify({ password })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || 'Reset failed');
      toast.success('Password updated. Please sign in.');
      router.replace('/login');
    } catch (e: any) {
      toast.error(e.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4">Reset Password</h1>
        <form onSubmit={onSubmit} className="space-y-4">
          <input
            type="password"
            required
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none"
          />
          <input
            type="password"
            required
            placeholder="Confirm new password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none"
          />
          <button disabled={loading} className="w-full px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold disabled:opacity-50">{loading ? 'Updating…' : 'Update password'}</button>
        </form>
      </div>
    </main>
  );
}
