import React, { useState } from 'react';
import {
  Search,
  Sparkles,
  Repeat,
  ShieldCheck,
  Cpu,
  BarChart3,
  Layers,
  ArrowRight,
  CheckCircle2,
  Users,
  Building2,
  Clock,
  Wrench,
  Camera,
  Activity,
} from 'lucide-react';
import { formatCurrencyINR } from '../lib/formatters';
import { DEMO_RESOURCES } from '../data/seedData';

interface LandingPageProps {
  onNavigate: (path: string) => void;
  onSearch?: (query: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate, onSearch }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      if (onSearch) onSearch(searchQuery);
      onNavigate('/resources');
    } else {
      onNavigate('/resources');
    }
  };

  const categories = [
    { name: 'Electronics', count: '45+ Units', icon: Cpu },
    { name: 'Laboratory', count: '30+ Instruments', icon: Activity },
    { name: 'Computing & GPUs', count: '12 Workstations', icon: Layers },
    { name: 'Fabrication & 3D', count: '18 Stations', icon: Wrench },
    { name: 'Audio & Video', count: '24 Kits', icon: Camera },
    { name: 'Robotics', count: '15 Systems', icon: Sparkles },
  ];

  return (
    <div className="flex flex-col space-y-16 py-4">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-900 text-white p-8 md:p-14 shadow-xl border border-slate-800">
        <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            <span>AI-Assisted Inter-Collegiate Equipment Network</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Find the Resources You Need. <br />
            <span className="text-teal-400">Share What You Have.</span>
          </h1>

          <p className="mt-4 text-base md:text-lg text-slate-300 leading-relaxed max-w-2xl">
            Discover equipment, request hard-to-find instruments, and access shared academic resources through one trusted institutional platform.
          </p>

          {/* Natural Language Hero Search Bar */}
          <form onSubmit={handleSearchSubmit} className="mt-8 flex flex-col sm:flex-row gap-2 max-w-2xl bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/20">
            <div className="relative flex-1 flex items-center">
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Try: 'thermal camera for 3 days' or 'digital oscilloscope under ₹800'..."
                className="w-full pl-11 pr-4 py-3 bg-transparent text-white placeholder-slate-400 text-sm focus:outline-hidden"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 shrink-0"
            >
              Search Resources
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick CTA Buttons */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('/resources')}
              className="px-5 py-2.5 bg-white text-slate-900 font-semibold text-xs rounded-xl hover:bg-slate-100 transition-colors shadow-sm"
            >
              Explore Catalog
            </button>
            <button
              onClick={() => onNavigate('/smartfind')}
              className="px-5 py-2.5 bg-slate-800 text-teal-300 border border-teal-500/30 font-semibold text-xs rounded-xl hover:bg-slate-700/80 transition-colors"
            >
              Request Missing Equipment (SmartFind)
            </button>
            <button
              onClick={() => onNavigate('/ai-assistant')}
              className="px-5 py-2.5 bg-teal-950/60 text-teal-300 border border-teal-500/40 font-semibold text-xs rounded-xl hover:bg-teal-900/60 transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-teal-400" />
              Try AI Matcher
            </button>
          </div>
        </div>

        {/* Live Metrics Counter Bar */}
        <div className="relative z-10 mt-12 pt-8 border-t border-slate-800 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-2xl font-bold text-white">20+</p>
            <p className="text-xs text-slate-400">Verified Instruments</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-teal-400">3</p>
            <p className="text-xs text-slate-400">Colleges in Consortium</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-emerald-400">₹3.8L+</p>
            <p className="text-xs text-slate-400">Capital Expenditure Avoided</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">96.4%</p>
            <p className="text-xs text-slate-400">On-Time Return Rate</p>
          </div>
        </div>
      </section>

      {/* Featured Resources Spotlight */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900">Featured Campus Equipment</h2>
            <p className="text-sm text-slate-500 mt-1">
              High-value instruments available for student project teams and faculty researchers.
            </p>
          </div>
          <button
            onClick={() => onNavigate('/resources')}
            className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1 self-start sm:self-auto"
          >
            View All 20 Resources <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {DEMO_RESOURCES.slice(0, 4).map((resource) => (
            <div
              key={resource.id}
              onClick={() => onNavigate('/resources')}
              className="group cursor-pointer rounded-xl bg-white border border-slate-200 p-3 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="aspect-16/10 rounded-lg overflow-hidden bg-slate-100 mb-3 relative">
                <img
                  src={resource.imageUrl}
                  alt={resource.name}
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                />
                <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-900/80 text-white">
                  {resource.category}
                </span>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 text-sm line-clamp-1 group-hover:text-teal-700 transition-colors">
                  {resource.name}
                </h4>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{resource.description}</p>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900">
                  {formatCurrencyINR(resource.rentalPricePerDay)}/day
                </span>
                <span className="text-teal-600 font-semibold group-hover:underline flex items-center gap-0.5">
                  Book <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works - The 4-Step Loop */}
      <section className="rounded-2xl bg-slate-100/70 border border-slate-200/80 p-8 md:p-12">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl font-bold text-slate-900">How ResourceLoop Works</h2>
          <p className="text-sm text-slate-500 mt-2">
            An end-to-end governed cycle that ensures fair access, condition accountability, and asset protection.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            {
              step: '01',
              title: 'Discover or Request',
              desc: 'Search our multi-college catalog or broadcast a missing equipment request via SmartFind with your project specifications and budget.',
            },
            {
              step: '02',
              title: 'Trust & FairShare Check',
              desc: 'The platform checks equipment-specific safety training certifications, verified college affiliation, and FairShare duration limits.',
            },
            {
              step: '03',
              title: 'Condition Documentation',
              desc: 'Inspect the item at collection, review bundled accessories, and submit a digital check-in condition report with optional photos.',
            },
            {
              step: '04',
              title: 'Accountable Return',
              desc: 'Return the equipment, verify components, release security deposits, and log utilization data for institutional grant planning.',
            },
          ].map((item, idx) => (
            <div key={idx} className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs relative">
              <span className="text-3xl font-extrabold text-teal-600/20 absolute top-4 right-4">{item.step}</span>
              <h4 className="font-bold text-slate-900 text-sm mb-2">{item.title}</h4>
              <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Core Differentiators Grid */}
      <section className="space-y-6">
        <div className="text-center max-w-xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-900">Built for Real Institutional Sharing</h2>
          <p className="text-xs text-slate-500 mt-1">
            Engineered specifically to solve the friction points of college laboratories and makerspaces.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">SmartFind Unmet Demand</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              When equipment is missing or unlisted, student demands are aggregated so labs understand what to acquire or rent from sister institutions.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Digital Trust Passport</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              No generic vanity ratings. Eligibility is verified per resource based on documented safety certifications, faculty sign-off, and return reliability.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">FairShare Allocation</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Prevents hoarding during exam or capstone crunch periods by enforcing configurable duration limits and concurrency-safe waitlists.
            </p>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="rounded-2xl bg-teal-700 text-white p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
        <div>
          <h3 className="text-xl md:text-2xl font-bold">Ready to access campus instruments?</h3>
          <p className="text-xs md:text-sm text-teal-100 mt-1 max-w-xl">
            Join the Pune College Consortium today. Book high-end equipment or submit demand for hard-to-find components.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onNavigate('/resources')}
            className="px-5 py-2.5 bg-white text-teal-900 font-bold text-xs rounded-xl hover:bg-teal-50 transition-colors shadow-sm"
          >
            Explore Resources
          </button>
          <button
            onClick={() => onNavigate('/smartfind')}
            className="px-5 py-2.5 bg-teal-800 text-white border border-teal-600 font-semibold text-xs rounded-xl hover:bg-teal-900 transition-colors"
          >
            Submit Demand
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="pt-8 border-t border-slate-200 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Repeat className="w-4 h-4 text-teal-600" />
          <span className="font-bold text-slate-700">ResourceLoop</span>
          <span>• 48-Hour National Hackathon Edition</span>
        </div>
        <div className="flex items-center gap-4 text-slate-500">
          <span>COEP Tech</span>
          <span>MIT-WPU</span>
          <span>PCCOE Makerspace</span>
          <span>Firebase & Gemini AI Powered</span>
        </div>
      </footer>
    </div>
  );
};
