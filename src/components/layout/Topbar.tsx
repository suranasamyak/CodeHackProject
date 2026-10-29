import React, { useState } from 'react';
import {
  Sparkles,
  Database,
  LogIn,
  LogOut,
  UserCheck,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { NotificationCenter } from '../notifications/NotificationCenter';
import { UserRole } from '../../types';

interface TopbarProps {
  onMenuToggle?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onMenuToggle }) => {
  const { currentUser, loginWithGoogle, logout, switchDemoRole, firebaseUser } = useAuth();
  const { resetToDemoData } = useData();
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleReset = async () => {
    await resetToDemoData();
    setResetSuccess(true);
    setTimeout(() => setResetSuccess(false), 2500);
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/90 px-4 md:px-6 backdrop-blur-md">
      {/* Left section: mobile hamburger & status */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg"
          aria-label="Toggle menu"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="hidden sm:flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Cloud Firestore Live
          </span>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-teal-50 text-teal-700 border border-teal-200">
            <Sparkles className="w-3 h-3 text-teal-600" />
            Gemini AI Ready
          </span>
        </div>
      </div>

      {/* Right section: Demo role switcher, Seed Button, Notifications, User */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Hackathon Role Switcher */}
        <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200 text-xs">
          <span className="px-2 py-1 text-slate-500 font-medium hidden lg:inline-flex items-center gap-1">
            <UserCheck className="w-3.5 h-3.5" /> Role:
          </span>
          {(['student', 'owner', 'manager', 'admin'] as UserRole[]).map((role) => {
            const isActive = currentUser?.role === role;
            return (
              <button
                key={role}
                onClick={() => switchDemoRole(role)}
                className={`px-2.5 py-1 rounded-md capitalize font-medium transition-all ${
                  isActive
                    ? 'bg-white text-teal-700 shadow-xs border border-slate-200/60 font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title={`Switch active persona to ${role}`}
              >
                {role}
              </button>
            );
          })}
        </div>

        {/* Demo reset button */}
        <button
          onClick={handleReset}
          className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors shadow-2xs"
          title="Reset catalog with 20 demo resources, sample bookings & incidents"
        >
          {resetSuccess ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-600">Hydrated</span>
            </>
          ) : (
            <>
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span>Demo Seed</span>
            </>
          )}
        </button>

        {/* In-app notifications */}
        <NotificationCenter />

        {/* User Profile / Auth */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-semibold text-slate-900 line-clamp-1">{currentUser?.displayName}</p>
            <p className="text-[10px] text-slate-500 capitalize">{currentUser?.role} • {currentUser?.institutionName?.split(' ')[0]}</p>
          </div>
          <div className="h-8 w-8 rounded-full bg-teal-700 text-white flex items-center justify-center font-bold text-xs ring-2 ring-teal-100">
            {currentUser?.displayName?.charAt(0) || 'U'}
          </div>

          {firebaseUser ? (
            <button
              onClick={logout}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              title="Sign out of Firebase"
            >
              <LogOut className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={loginWithGoogle}
              className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-teal-700 hover:bg-teal-50 border border-teal-200 rounded-md transition-colors"
              title="Sign in with Google Account"
            >
              <LogIn className="w-3.5 h-3.5" />
              Google Sign-In
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
