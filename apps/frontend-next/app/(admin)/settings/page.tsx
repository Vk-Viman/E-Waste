"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@ecocollect/ui';
import config from '@ecocollect/config';
import toast from 'react-hot-toast';
import Navigation from '../../components/Navigation';
const { API_BASE } = config;

type SystemConfig = {
  activeBillingModel?: string;
  billingModels?: Array<{ name?: string; rate?: number }>;
  wasteCategories?: Array<{ key?: string; label?: string }>;
  collectionRules?: {
    frequency?: string;
    timeSlot?: string;
    maxBinsPerCollection?: number;
  };
};

type NotificationResult = {
  success: boolean;
  notifications?: Array<{
    module: string;
    status: string;
    message: string;
  }>;
};

export default function AdminSettingsPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string>('');
  const [loading, setLoading] = useState(true);
  // Active billing model
  const [activeBillingModel, setActiveBillingModel] = useState<string>('Flat Fee');
  // Billing models list + add form inputs
  const [billingModels, setBillingModels] = useState<Array<{ name: string; rate: number }>>([]);
  const [bmName, setBmName] = useState('');
  const [bmRate, setBmRate] = useState('');
  // Waste categories list + add form inputs
  const [wasteCategories, setWasteCategories] = useState<Array<{ key: string; label: string }>>([]);
  const [catKey, setCatKey] = useState('');
  const [catLabel, setCatLabel] = useState('');
  // Collection rules
  const [frequency, setFrequency] = useState<string>('weekly');
  const [timeSlot, setTimeSlot] = useState<string>('08:00-12:00');
  const [maxBins, setMaxBins] = useState<number>(1);
  // Notifications
  const [notifications, setNotifications] = useState<NotificationResult | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  // Reset modal
  const [confirmReset, setConfirmReset] = useState(false);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    // verify session is ADMIN
    (async () => {
      try {
        const me = await fetch(`${API_BASE}/auth/session`, { credentials: 'include' });
        if (!me.ok) { router.replace('/login' as any); return; }
        const data = await me.json();
        if (String(data?.role).toUpperCase() !== 'ADMIN') { router.replace('/login' as any); return; }
        setEmail(data?.email || '');
      } catch { router.replace('/login' as any); return; }
      await fetchConfig();
    })();
  }, [router]);

  async function fetchConfig() {
    try {
      const res = await fetch(`${API_BASE}/configuration`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to load configuration');
      const data: SystemConfig = await res.json();
      
      // Set active billing model
      setActiveBillingModel(data.activeBillingModel || 'Flat Fee');
      
      // Set billing models
      const bms = (data.billingModels || [])
        .map((b) => ({ name: String(b?.name || ''), rate: Number(b?.rate || 0) }))
        .filter((b) => b.name.trim().length > 0);
      setBillingModels(bms);
      
      // Set waste categories
      setWasteCategories((data.wasteCategories || []).map((c) => ({ key: String(c?.key || ''), label: String(c?.label || '') })).filter((c) => c.key.trim().length > 0));
      
      // Set collection rules
      if (data.collectionRules) {
        setFrequency(data.collectionRules.frequency || 'weekly');
        setTimeSlot(data.collectionRules.timeSlot || '08:00-12:00');
        setMaxBins(data.collectionRules.maxBinsPerCollection || 1);
      }
    } catch (e: any) {
      setError(e.message || 'Failed to load configuration');
    } finally {
      setLoading(false);
    }
  }

  async function onSave() {
    setSaving(true);
    setError(null);
    setMessage(null);
    setNotifications(null);
    try {
      const payload: SystemConfig = {
        activeBillingModel,
        billingModels: billingModels.map(b => ({ name: b.name, rate: b.rate })),
        wasteCategories: wasteCategories.map(c => ({ key: c.key, label: c.label })),
        collectionRules: {
          frequency,
          timeSlot,
          maxBinsPerCollection: maxBins,
        },
      };
      const csrf = await (await fetch(`${API_BASE}/csrf-token`, { credentials: 'include' })).json();
      const res = await fetch(`${API_BASE}/configuration`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrf?.csrfToken || '',
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || 'Failed to save settings');
      }
      const result = await res.json();
      setNotifications(result.notifications || null);
      setMessage(result.message || 'Settings saved');
      toast.success('Settings updated successfully!', { duration: 3000, icon: '✅' });
      await fetchConfig();
    } catch (e: any) {
      setError(e.message || 'Failed to save');
      toast.error(e.message || 'Failed to save', { duration: 4000 });
    } finally {
      setSaving(false);
    }
  }

  function removeBilling(index: number) {
    const modelToRemove = billingModels[index];
    // If removing the active model, reset to first remaining model or empty
    if (modelToRemove.name === activeBillingModel) {
      const remaining = billingModels.filter((_, i) => i !== index);
      setActiveBillingModel(remaining.length > 0 ? remaining[0].name : 'Flat Fee');
    }
    setBillingModels((prev) => prev.filter((_, i) => i !== index));
  }

  function addBilling() {
    const name = bmName.trim();
    const rateNum = Number(bmRate);
    if (!name) { toast.error('Billing model name is required'); return; }
    if (!Number.isFinite(rateNum) || rateNum < 0) { toast.error('Rate must be a non-negative number'); return; }
    if (billingModels.some(bm => bm.name.toLowerCase() === name.toLowerCase())) {
      toast.error('Billing model name already exists'); 
      return;
    }
    setBillingModels((prev) => [...prev, { name, rate: rateNum }]);
    // Auto-select newly added model if it's the first one
    if (billingModels.length === 0) {
      setActiveBillingModel(name);
    }
    setBmName('');
    setBmRate('');
  }

  function removeCategory(index: number) {
    setWasteCategories((prev) => prev.filter((_, i) => i !== index));
  }

  function addCategory() {
    const key = catKey.trim();
    const label = catLabel.trim();
    if (!key) { toast.error('Category key is required'); return; }
    if (!label) { toast.error('Category label is required'); return; }
    if (wasteCategories.some((c) => c.key.toLowerCase() === key.toLowerCase())) {
      toast.error('Category key already exists');
      return;
    }
    setWasteCategories((prev) => [...prev, { key, label }]);
    setCatKey('');
    setCatLabel('');
  }

  async function onResetDefaults() {
    setResetting(true);
    try {
      const csrf = await (await fetch(`${API_BASE}/csrf-token`, { credentials: 'include' })).json();
      const res = await fetch(`${API_BASE}/configuration`, {
        method: 'DELETE',
        headers: { 'X-CSRF-Token': csrf?.csrfToken || '' },
        credentials: 'include',
      });
      if (!res.ok && res.status !== 204) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || 'Failed to reset');
      }
      toast.success('Settings reset to defaults');
      setConfirmReset(false);
      setMessage(null);
      setError(null);
      setLoading(true);
      await fetchConfig();
    } catch (e: any) {
      toast.error(e.message || 'Failed to reset');
    } finally {
      setResetting(false);
    }
  }

  return (
    <>
      <Navigation email={email} role="ADMIN" currentPage="/settings" />
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header with icon */}
          <div className="mb-8 animate-fade-in">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Settings</h1>
              <p className="text-sm text-gray-600 mt-1">Configure billing models and waste categories</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 animate-pulse">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
              <p className="text-gray-500 font-medium">Loading configuration...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-fade-in-up">
            {/* Active Billing Model Card */}
            <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 transition-all duration-300 hover:shadow-2xl border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Active Billing Model</h2>
                  <p className="text-xs text-gray-500 mt-1">Select which billing model to use system-wide</p>
                </div>
              </div>
              
              {billingModels.length === 0 ? (
                <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4 text-center">
                  <p className="text-sm text-amber-800 font-medium">⚠️ No billing models defined yet</p>
                  <p className="text-xs text-amber-600 mt-1">Add billing models below to activate one</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {billingModels.map((model) => {
                      const isActive = activeBillingModel === model.name;
                      const activeModel = billingModels.find(bm => bm.name === activeBillingModel);
                      
                      return (
                        <button
                          key={model.name}
                          onClick={() => setActiveBillingModel(model.name)}
                          className={`rounded-xl p-4 border-2 transition-all text-left ${
                            isActive
                              ? 'border-indigo-500 bg-indigo-50 ring-4 ring-indigo-100'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                                isActive ? 'border-indigo-500' : 'border-gray-300'
                              }`}>
                                {isActive && (
                                  <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                                )}
                              </div>
                              <div>
                                <span className="font-semibold text-gray-900 block">{model.name}</span>
                                <span className="text-sm text-emerald-700 font-semibold">${model.rate.toFixed(2)}{model.name.toLowerCase().includes('weight') ? '/kg' : ''}</span>
                              </div>
                            </div>
                            {isActive && (
                              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-indigo-100 text-indigo-800">
                                Active
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  
                  {/* Show active model details */}
                  {(() => {
                    const activeModel = billingModels.find(bm => bm.name === activeBillingModel);
                    if (activeModel) {
                      return (
                        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-3 flex items-center gap-2">
                          <svg className="w-5 h-5 text-blue-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                          <p className="text-sm text-blue-900">
                            <span className="font-semibold">{activeModel.name}</span> at <span className="font-semibold">${activeModel.rate}</span> is currently active system-wide
                          </p>
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>
              )}
            </div>

            {/* Billing Models Card */}
            <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 transition-all duration-300 hover:shadow-2xl border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Billing Models</h2>
                  <p className="text-xs text-gray-500 mt-1">Define available billing rates</p>
                </div>
              </div>
              <div className="space-y-5">
                {/* Existing models list */}
                {billingModels.length === 0 ? (
                  <p className="text-sm text-gray-600">No billing models yet. Add one below.</p>
                ) : (
                  <ul className="space-y-2">
                    {billingModels.map((bm, idx) => {
                      const isActive = bm.name === activeBillingModel;
                      return (
                        <li key={`${bm.name}-${idx}`} className={`flex items-center justify-between rounded-lg border-2 px-4 py-2 ${
                          isActive ? 'border-indigo-300 bg-indigo-50' : 'border-gray-200'
                        }`}>
                          <div className="flex items-center gap-2">
                            <div className="text-sm font-medium text-gray-900">
                              {bm.name} <span className="text-gray-500">·</span> <span className="text-emerald-700 font-semibold">${bm.rate}</span>
                            </div>
                            {isActive && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                                ✓ Active
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => removeBilling(idx)}
                            disabled={isActive && billingModels.length === 1}
                            className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium border-2 transition-colors ${
                              isActive && billingModels.length === 1
                                ? 'text-gray-400 border-gray-200 cursor-not-allowed opacity-50'
                                : 'text-red-700 hover:text-white hover:bg-red-600 border-red-200'
                            }`}
                            title={isActive && billingModels.length === 1 ? "Cannot remove the only active model" : "Remove billing model"}
                          >
                            Remove
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}

                {/* Add new model */}
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-end">
                  <div className="sm:col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Model Name</label>
                    <input
                      className="w-full rounded-xl border-2 border-gray-200 px-4 py-2.5 transition-all duration-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 focus:outline-none hover:border-gray-300"
                      placeholder="e.g., Flat Fee, Weight-Based"
                      value={bmName}
                      onChange={(e) => setBmName(e.target.value)}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rate</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        className="w-full rounded-xl border-2 border-gray-200 pl-7 pr-3 py-2.5 transition-all duration-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 focus:outline-none hover:border-gray-300"
                        placeholder="0.00"
                        value={bmRate}
                        onChange={(e) => setBmRate(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="sm:col-span-5">
                    <button
                      onClick={addBilling}
                      className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2.5 text-sm font-semibold text-white hover:from-emerald-700 hover:to-teal-700 shadow-md hover:shadow-lg transition-all"
                    >
                      Add Billing Model
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Waste Categories Card */}
            <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 transition-all duration-300 hover:shadow-2xl border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900">Waste Categories</h2>
                  <p className="text-xs text-gray-500 mt-1">Manage category key/label pairs</p>
                </div>
              </div>
              {/* Existing categories list */}
              {wasteCategories.length === 0 ? (
                <p className="text-sm text-gray-600">No categories yet. Add one below.</p>
              ) : (
                <ul className="space-y-2 mb-4">
                  {wasteCategories.map((c, idx) => (
                    <li key={`${c.key}-${idx}`} className="flex items-center justify-between rounded-lg border-2 border-gray-200 px-4 py-2">
                      <div className="text-sm font-medium text-gray-900">
                        <span className="text-gray-500">{c.key}</span> <span className="text-gray-400">→</span> {c.label}
                      </div>
                      <button
                        onClick={() => removeCategory(idx)}
                        className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-red-700 hover:text-white hover:bg-red-600 border-2 border-red-200 transition-colors"
                        title="Remove category"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {/* Add new category */}
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-end">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Key</label>
                  <input
                    className="w-full rounded-xl border-2 border-gray-200 px-4 py-2.5 transition-all duration-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 focus:outline-none hover:border-gray-300"
                    placeholder="e.g., plastic"
                    value={catKey}
                    onChange={(e) => setCatKey(e.target.value)}
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
                  <input
                    className="w-full rounded-xl border-2 border-gray-200 px-4 py-2.5 transition-all duration-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 focus:outline-none hover:border-gray-300"
                    placeholder="e.g., Plastic"
                    value={catLabel}
                    onChange={(e) => setCatLabel(e.target.value)}
                  />
                </div>
                <div className="sm:col-span-5">
                  <button
                    onClick={addCategory}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-5 py-2.5 text-sm font-semibold text-white hover:from-amber-600 hover:to-orange-700 shadow-md hover:shadow-lg transition-all"
                  >
                    Add Category
                  </button>
                </div>
              </div>
            </div>

            {/* Collection Rules Card */}
            <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 transition-all duration-300 hover:shadow-2xl border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-400 to-pink-600 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Collection Rules</h2>
                  <p className="text-xs text-gray-500 mt-1">Configure collection frequency and scheduling</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Frequency</label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                    className="w-full rounded-xl border-2 border-gray-200 px-4 py-2.5 transition-all duration-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 focus:outline-none hover:border-gray-300"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="biweekly">Bi-weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Time Slot</label>
                  <input
                    type="text"
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    placeholder="e.g., 08:00-12:00"
                    className="w-full rounded-xl border-2 border-gray-200 px-4 py-2.5 transition-all duration-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 focus:outline-none hover:border-gray-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Bins/Collection</label>
                  <input
                    type="number"
                    min="1"
                    value={maxBins}
                    onChange={(e) => setMaxBins(Number(e.target.value))}
                    className="w-full rounded-xl border-2 border-gray-200 px-4 py-2.5 transition-all duration-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 focus:outline-none hover:border-gray-300"
                  />
                </div>
              </div>
            </div>

            {/* Notifications Display */}
            {notifications && notifications.success && notifications.notifications && (
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 animate-fade-in">
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                  </svg>
                  <h3 className="font-semibold text-blue-900">Module Notifications</h3>
                </div>
                <ul className="space-y-2">
                  {notifications.notifications.map((notif, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></span>
                      <div>
                        <span className="font-medium text-blue-900">{notif.module}:</span>{' '}
                        <span className="text-blue-700">{notif.message}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Messages */}
            {message && (
              <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-4 flex items-center gap-3 animate-fade-in">
                <svg className="w-5 h-5 text-emerald-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <p className="text-sm font-medium text-emerald-800">{message}</p>
              </div>
            )}
            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-center gap-3 animate-fade-in">
                <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between gap-3 pt-4">
              <button
                onClick={() => setConfirmReset(true)}
                className="inline-flex items-center gap-2 rounded-xl border-2 border-red-200 text-red-700 hover:text-white hover:bg-red-600 px-5 py-2.5 text-sm font-semibold transition-all"
              >
                Reset to Defaults
              </button>
              <button
                onClick={onSave}
                disabled={saving}
                className="group relative px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 active:scale-95"
              >
                {saving ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Save Settings
                  </span>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Confirm Reset Modal */}
      {confirmReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => !resetting && setConfirmReset(false)} />
          <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-red-100 text-red-700 flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Reset to Defaults</h3>
            </div>
            <p className="text-sm text-gray-700 mb-4">Are you sure you want to reset all settings? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmReset(false)}
                disabled={resetting}
                className="rounded-xl border-2 border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={onResetDefaults}
                disabled={resetting}
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {resetting && (
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out;
        }
      `}</style>
      </main>
    </>
  );
}
