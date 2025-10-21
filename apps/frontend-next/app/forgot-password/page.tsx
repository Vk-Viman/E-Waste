"use client";
import { useState } from 'react';
import config from '@ecocollect/config';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

const { API_BASE } = config;

async function getCsrf(): Promise<string> {
  try {
    const r = await fetch(`${API_BASE}/csrf-token`, { credentials: 'include' });
    const j = await r.json();
    return j?.csrfToken || '';
  } catch { return ''; }
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) { toast.error('Enter your email'); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': await getCsrf() },
        credentials: 'include',
        body: JSON.stringify({ email })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || 'Failed to send reset email');
      }
      toast.success('If that email exists, a reset link has been sent');
      router.replace('/login');
    } catch (e: any) {
      toast.error(e.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4">Forgot Password</h1>
        <p className="text-sm text-gray-600 mb-6">Enter your email and we'll send you a reset link.</p>
        <form onSubmit={onSubmit} className="space-y-4">
          <input
            type="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none"
          />
          <button disabled={loading} className="w-full px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold disabled:opacity-50">{loading ? 'Sending…' : 'Send reset link'}</button>
        </form>
      </div>
    </main>
  );
}
