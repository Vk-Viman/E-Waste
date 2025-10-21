"use client";

import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-teal-50">
      {/* Header */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6 animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <div className="text-lg font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">EcoCollect</div>
            <div className="text-xs text-gray-600 font-medium">Smart Waste Management</div>
          </div>
        </div>
        <nav className="hidden gap-6 text-sm text-gray-700 md:flex font-medium">
          <a className="hover:text-emerald-600 transition-colors" href="#how">How it works</a>
          <a className="hover:text-emerald-600 transition-colors" href="#features">Features</a>
          <a className="hover:text-emerald-600 transition-colors" href="#residents">For Residents</a>
          <a className="hover:text-emerald-600 transition-colors" href="#authorities">For Authorities</a>
          <a className="hover:text-emerald-600 transition-colors" href="#docs">Docs</a>
        </nav>
        
        {/* Desktop Navigation */}
        <div className="hidden items-center gap-3 md:flex">
          <Link href="/scan" className="inline-flex items-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105">
            <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
            Scan QR
          </Link>
          <Link href="/login" className="text-sm font-medium text-gray-700 hover:text-emerald-600 transition-colors">Sign in</Link>
          <Link href="/dashboard" className="inline-flex items-center rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2.5 text-sm font-semibold text-white hover:from-emerald-700 hover:to-teal-700 shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105">Get Started</Link>
        </div>

        {/* Mobile Navigation */}
        <div className="flex items-center gap-2 md:hidden">
          <Link href="/scan" className="inline-flex items-center justify-center rounded-xl bg-blue-600 p-2.5 text-white hover:bg-blue-700 shadow-md transition-all" title="Scan QR">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
          </Link>
          <Link href="/dashboard" className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 p-2.5 text-white hover:from-emerald-700 hover:to-teal-700 shadow-md transition-all" title="Dashboard">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-6 py-10 md:grid-cols-2 md:py-16 animate-fade-in-up">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-1.5 text-sm font-medium text-emerald-700 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Now Live
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight md:text-6xl bg-gradient-to-r from-gray-900 via-emerald-800 to-teal-800 bg-clip-text text-transparent">EcoCollect — Smart waste made simple.</h1>
          <p className="text-lg text-gray-700 leading-relaxed">Monitor bins in real time, optimize collection routes, and reward recycling. EcoCollect brings sensor‑driven insights to cities so authorities and residents can work together for cleaner, healthier urban life.</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-3.5 text-base font-semibold text-white hover:from-emerald-700 hover:to-teal-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Get Started
            </Link>
            <Link href="/routes" className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-base font-semibold text-gray-900 hover:bg-gray-50 shadow-md hover:shadow-lg transition-all duration-200 border-2 border-gray-200">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              View Demo
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 pt-4">
            <Feature 
              icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>}
              title="Real-time monitoring" 
              desc="Sensor & tag based bin status" 
            />
            <Feature 
              icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>}
              title="Route optimization" 
              desc="Smarter, faster collections" 
            />
            <Feature 
              icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>}
              title="Rewards" 
              desc="Incentives for recycling" 
            />
          </div>
        </div>

        {/* Live Overview card */}
        <div className="rounded-2xl border-2 border-gray-200 bg-white p-8 shadow-xl hover:shadow-2xl transition-shadow duration-300">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-6">
            <div className="flex items-center gap-2 font-semibold text-gray-900">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              Live Overview
            </div>
            <div>Areas online <span className="ml-1 font-bold text-emerald-600">42</span></div>
          </div>
          <div className="mb-6">
            <div className="text-4xl font-bold text-gray-900">12,482 <span className="text-base font-medium text-gray-500">kg</span></div>
            <div className="text-sm text-gray-600 mt-1">Total collected today</div>
          </div>
          <div className="grid grid-cols-3 gap-3 text-sm mb-6">
            <OverviewPill title="Route A" subtitle="18 bins • 4 stops" />
            <OverviewPill title="Route B" subtitle="18 bins • 4 stops" />
            <OverviewPill title="Route C" subtitle="18 bins • 4 stops" />
          </div>
          <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 p-8 text-center border-2 border-emerald-200">
            <svg className="w-16 h-16 mx-auto text-emerald-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            <p className="text-emerald-700 font-medium">Interactive Map</p>
            <p className="text-xs text-emerald-600 mt-1">Click to explore routes</p>
          </div>
        </div>
      </section>

      {/* Quick links to role pages */}
      <section className="mx-auto max-w-6xl px-6 pb-20 animate-fade-in">
        <h2 id="features" className="mb-6 text-2xl font-bold text-gray-900">Explore Roles</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
          <Link href="/settings" className="group p-6 rounded-xl bg-white border-2 border-gray-200 hover:border-emerald-500 shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-400 to-purple-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors">Admin Settings</h3>
            <p className="text-sm text-gray-600 mt-1">Configure system</p>
          </Link>
          <Link href="/routes" className="group p-6 rounded-xl bg-white border-2 border-gray-200 hover:border-emerald-500 shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-400 to-cyan-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors">Manager Routes</h3>
            <p className="text-sm text-gray-600 mt-1">Optimize collections</p>
          </Link>
          <Link href="/dashboard" className="group p-6 rounded-xl bg-white border-2 border-gray-200 hover:border-emerald-500 shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors">Resident Dashboard</h3>
            <p className="text-sm text-gray-600 mt-1">Track your impact</p>
          </Link>
          <Link href="/scan" className="group p-6 rounded-xl bg-white border-2 border-gray-200 hover:border-emerald-500 shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors">Staff Scan</h3>
            <p className="text-sm text-gray-600 mt-1">QR collection tool</p>
          </Link>
        </div>
      </section>

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
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.7s ease-out;
        }
      `}</style>
    </main>
  );
}

function Feature({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="group p-5 rounded-xl bg-white border-2 border-gray-200 hover:border-emerald-400 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:scale-105">
      <div className="flex items-center gap-3 mb-2">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-teal-600 text-white shadow-md group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <div className="text-base font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors">{title}</div>
      </div>
      <div className="text-sm text-gray-600 pl-13">{desc}</div>
    </div>
  );
}

function OverviewPill({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="rounded-xl border-2 border-gray-200 bg-gradient-to-br from-white to-gray-50 p-3 hover:border-emerald-400 hover:shadow-md transition-all duration-200 cursor-pointer">
      <div className="font-semibold text-gray-900">{title}</div>
      <div className="text-xs text-gray-600 mt-1">{subtitle}</div>
    </div>
  );
}
