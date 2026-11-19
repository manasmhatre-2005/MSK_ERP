import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  ArrowRight,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
  Lock,
  Mail,
  CheckCircle2,
  X,
  HelpCircle,
} from 'lucide-react';
import { UserRole } from '../types/index';

interface LoginProps {
  onSuccess?: (role: UserRole) => void;
  logoutMessage?: string | null;
  onClearLogoutMessage?: () => void;
}

/**
 * Custom SVG Icons matching the reference design:
 * 1. Container Depot / Port Terminal Icon
 * 2. Invoice Document with Rupee (₹) Badge Icon
 * 3. 3-Bar Analytics / Chart Icon
 */
const ContainerTerminalIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M2 6h20" />
    <path d="M4 6V4a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v2" />
    <path d="M3 20h18" />
    <rect x="4" y="9" width="4" height="11" rx="0.5" />
    <rect x="10" y="9" width="4" height="11" rx="0.5" />
    <rect x="16" y="9" width="4" height="11" rx="0.5" />
  </svg>
);

const InvoicingBillingIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="8" y1="12" x2="13" y2="12" />
    <line x1="8" y1="16" x2="11" y2="16" />
    <circle cx="16.5" cy="16.5" r="3.75" fill="#E11D2A" stroke="#E11D2A" />
    <text
      x="16.5"
      y="19"
      fontSize="6.5"
      fontWeight="900"
      fontFamily="sans-serif"
      textAnchor="middle"
      fill="#FFFFFF"
      stroke="none"
    >
      ₹
    </text>
  </svg>
);

const ReportsAnalyticsIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="4" y="13" width="3.5" height="7" rx="0.75" fill="currentColor" stroke="none" />
    <rect x="10.25" y="9" width="3.5" height="11" rx="0.75" fill="currentColor" stroke="none" />
    <rect x="16.5" y="4" width="3.5" height="16" rx="0.75" fill="currentColor" stroke="none" />
    <line x1="3" y1="21" x2="21" y2="21" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

export const Login: React.FC<LoginProps> = ({ onSuccess, logoutMessage, onClearLogoutMessage }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForgotModal, setShowForgotModal] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      setError('Please provide both username/email and password.');
      return;
    }

    if (onClearLogoutMessage) onClearLogoutMessage();
    setLoading(true);
    setError(null);
    try {
      const user = await login(cleanEmail, password);
      if (onSuccess) {
        onSuccess(user.role);
      }
    } catch (err: any) {
      setError(err.message || 'Invalid username or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen min-h-[100dvh] w-full relative flex items-center justify-center p-3 sm:p-5 md:p-6 lg:p-8 xl:p-12 overflow-x-hidden bg-[#EDF4FA] bg-cover bg-center select-none"
      style={{
        backgroundImage: "url('/images/login-backdrop-hires.png')",
      }}
    >
      {/* Fallback Corner Wave Curves for extreme aspect ratios */}
      <div className="absolute top-0 left-0 pointer-events-none z-0 max-w-[200px] sm:max-w-[260px] md:max-w-[320px] select-none opacity-90">
        <img
          src="/images/login-wave-tl.png"
          alt=""
          aria-hidden="true"
          className="w-full h-auto object-contain object-top-left"
        />
      </div>
      <div className="absolute bottom-0 right-0 pointer-events-none z-0 max-w-[240px] sm:max-w-[320px] md:max-w-[380px] select-none opacity-90">
        <img
          src="/images/login-wave-br.png"
          alt=""
          aria-hidden="true"
          className="w-full h-auto object-contain object-bottom-right"
        />
      </div>

      {/* Main Content Layout Container */}
      <div className="w-full max-w-[1480px] min-h-[calc(100vh-2rem)] sm:min-h-[calc(100vh-3rem)] flex flex-col lg:flex-row items-stretch justify-between relative z-10 gap-6 lg:gap-8 my-auto">
        {/* Left Section — Logistics Branding & Feature Highlights (~68% desktop width) */}
        <div className="w-full lg:w-[65%] xl:w-[68%] flex flex-col justify-between py-2 sm:py-4 lg:py-6 xl:py-8 pr-0 lg:pr-6">
          {/* Top Branding Row */}
          <div className="flex items-center gap-3 sm:gap-4 md:gap-5">
            {/* ISO 9001:2015 Certification Badge */}
            <div className="shrink-0 p-1 bg-white/70 backdrop-blur-xs rounded-xl shadow-2xs border border-white/80">
              <img
                src="/images/iso-logo.png"
                alt="EAS RJSK ISO 9001:2015 Certified"
                className="h-10 sm:h-12 md:h-14 lg:h-16 w-auto object-contain drop-shadow-xs"
              />
            </div>

            {/* Vertical Divider */}
            <div className="h-10 sm:h-12 md:h-14 w-[1.5px] bg-slate-300/80 shrink-0" />

            {/* MSK Logo + Deliver Trust Tagline */}
            <div className="flex flex-col justify-center">
              <img
                src="/images/msk-logo.png"
                alt="MSK Logistic Solution"
                className="h-8 sm:h-9 md:h-11 lg:h-12 w-auto object-contain object-left drop-shadow-xs"
              />
              <p className="text-[11px] sm:text-xs md:text-[13px] font-semibold text-slate-700 tracking-wide mt-0.5 whitespace-nowrap">
                — Beyond logistics we <span className="text-[#E11D2A] font-bold">Deliver Trust™</span> —
              </p>
            </div>
          </div>

          {/* Center Branding & Feature Highlights Block */}
          <div className="mt-6 sm:mt-8 md:mt-10 lg:mt-12 xl:mt-14 max-w-2xl">
            {/* Main Heading: Navy Line 1, MSK Red Line 2 */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[46px] xl:text-[54px] font-black italic tracking-tight leading-[1.08] select-text">
              <span className="block text-[#0D254C]">Integrated Logistics</span>
              <span className="block text-[#E11D2A] mt-0.5 sm:mt-1">Management ERP</span>
            </h1>

            {/* Red Accent Underline Bar */}
            <div className="w-16 sm:w-20 md:w-24 h-1.5 sm:h-2 bg-[#E11D2A] rounded-full mt-3 sm:mt-4 shadow-xs" />

            {/* Subheading */}
            <p className="text-slate-700 font-semibold text-sm sm:text-base md:text-lg lg:text-xl mt-3 sm:mt-4 tracking-wide select-text">
              Management, Invoicing &amp; Container Operations
            </p>

            {/* 3 Floating Feature Cards */}
            <div className="mt-5 sm:mt-7 flex flex-wrap gap-3 sm:gap-4 items-stretch">
              {/* Feature 1: Container Operations */}
              <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-[0_4px_16px_-4px_rgba(15,23,42,0.08)] px-3.5 sm:px-4.5 py-2.5 sm:py-3 flex items-center gap-3 hover:border-red-200 hover:shadow-md transition-all">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-red-50/80 border border-red-100 flex items-center justify-center text-[#E11D2A] shrink-0">
                  <ContainerTerminalIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <span className="text-xs sm:text-[13px] font-bold text-slate-800 leading-tight">
                  Container<br />Operations
                </span>
              </div>

              {/* Feature 2: Invoicing & Billing */}
              <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-[0_4px_16px_-4px_rgba(15,23,42,0.08)] px-3.5 sm:px-4.5 py-2.5 sm:py-3 flex items-center gap-3 hover:border-red-200 hover:shadow-md transition-all">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-red-50/80 border border-red-100 flex items-center justify-center text-[#E11D2A] shrink-0">
                  <InvoicingBillingIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <span className="text-xs sm:text-[13px] font-bold text-slate-800 leading-tight">
                  Invoicing &amp;<br />Billing
                </span>
              </div>

              {/* Feature 3: Reports & Analytics */}
              <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-[0_4px_16px_-4px_rgba(15,23,42,0.08)] px-3.5 sm:px-4.5 py-2.5 sm:py-3 flex items-center gap-3 hover:border-red-200 hover:shadow-md transition-all">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-red-50/80 border border-red-100 flex items-center justify-center text-[#E11D2A] shrink-0">
                  <ReportsAnalyticsIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <span className="text-xs sm:text-[13px] font-bold text-slate-800 leading-tight">
                  Reports &amp;<br />Analytics
                </span>
              </div>
            </div>
          </div>

          {/* Lower Spacing Spacer to display background fleet artwork (truck, ship, port) cleanly */}
          <div className="hidden lg:block min-h-[140px] xl:min-h-[180px]" />
        </div>

        {/* Right Section — Sign-In Card (~32% desktop width) */}
        <div className="w-full lg:w-[35%] xl:w-[32%] flex items-center justify-center lg:justify-end my-auto py-2 sm:py-4">
          <div className="w-full max-w-[420px] sm:max-w-[440px] bg-white rounded-3xl lg:rounded-[32px] shadow-[0_20px_60px_-10px_rgba(15,23,42,0.18)] border border-slate-100 p-6 sm:p-7 xl:p-8 relative overflow-hidden flex flex-col justify-between">
            {/* Top-Left Red Curved Accent Ribbon */}
            <div className="absolute top-0 left-0 w-24 h-24 pointer-events-none select-none">
              <svg viewBox="0 0 96 96" fill="none" className="w-full h-full">
                <path
                  d="M 0 60 C 0 26.86 26.86 0 60 0 L 72 0 C 32.23 0 0 32.23 0 72 Z"
                  fill="#E11D2A"
                />
              </svg>
            </div>

            {/* Card Header */}
            <div className="text-center pt-1 sm:pt-2">
              <p className="text-xs sm:text-sm font-medium text-slate-500">
                Welcome to
              </p>
              <h2 className="text-2xl sm:text-[26px] lg:text-[28px] font-black text-[#0D254C] tracking-tight mt-0.5">
                MSK Logistic Solution
              </h2>
              <div className="w-12 h-1 bg-[#E11D2A] rounded-full mx-auto my-2.5" />
              <p className="text-xs sm:text-[13px] text-slate-400 font-medium">
                Sign in to access your ERP account
              </p>
            </div>

            {/* Sign Out / Status Notification */}
            {logoutMessage && !error && (
              <div className="mt-3.5 flex items-center justify-between gap-2 p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl animate-fadeIn">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span className="font-semibold">{logoutMessage}</span>
                </div>
                {onClearLogoutMessage && (
                  <button
                    type="button"
                    onClick={onClearLogoutMessage}
                    className="text-emerald-700 hover:text-emerald-900 p-0.5 rounded cursor-pointer"
                    title="Dismiss notification"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}

            {/* Error Alert */}
            {error && (
              <div className="mt-3.5 flex items-center gap-2 p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl animate-fadeIn">
                <AlertCircle className="w-4 h-4 shrink-0 text-[#E11D2A]" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            {/* Interactive Sign-In Form */}
            <form onSubmit={handleLogin} className="mt-4 space-y-3 sm:space-y-3.5">
              {/* Email / Username Field */}
              <div>
                <label className="block text-xs sm:text-[13px] font-semibold text-slate-700 mb-1">
                  Email / Username <span className="text-[#E11D2A]">*</span>
                </label>
                <div className="relative rounded-xl border border-slate-200 focus-within:border-[#E11D2A] focus-within:ring-2 focus-within:ring-red-100 transition-all bg-white shadow-2xs">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    autoComplete="username"
                    placeholder="Enter your email or username"
                    value={email}
                    onChange={(e) => {
                      if (onClearLogoutMessage) onClearLogoutMessage();
                      setEmail(e.target.value);
                    }}
                    className="w-full h-11 sm:h-11.5 pl-10 pr-3.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 bg-transparent rounded-xl outline-none"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-xs sm:text-[13px] font-semibold text-slate-700 mb-1">
                  Password <span className="text-[#E11D2A]">*</span>
                </label>
                <div className="relative rounded-xl border border-slate-200 focus-within:border-[#E11D2A] focus-within:ring-2 focus-within:ring-red-100 transition-all bg-white shadow-2xs">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => {
                      if (onClearLogoutMessage) onClearLogoutMessage();
                      setPassword(e.target.value);
                    }}
                    className="w-full h-11 sm:h-11.5 pl-10 pr-10 text-xs sm:text-sm text-slate-800 placeholder-slate-400 bg-transparent rounded-xl outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1 cursor-pointer"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Forgot Password Link */}
              <div className="text-right pt-0.5">
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-xs sm:text-[13px] font-semibold text-[#1D4ED8] hover:text-[#1E40AF] hover:underline transition-colors cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Red Sign In Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-11.5 sm:h-12 mt-1 sm:mt-1.5 flex items-center justify-center gap-2 rounded-xl bg-[#DC2626] hover:bg-[#b91c1c] active:bg-[#991b1b] text-white font-bold text-sm sm:text-base shadow-md shadow-red-500/30 disabled:opacity-60 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                    <span>Sign In</span>
                  </>
                )}
              </button>
            </form>

            {/* Bottom 3 Feature Highlights Columns */}
            <div className="pt-4 sm:pt-5 mt-4 sm:mt-5 border-t border-slate-100 grid grid-cols-3 divide-x divide-slate-100">
              <div className="flex flex-col items-center text-center px-1">
                <ContainerTerminalIcon className="w-4 sm:w-5 h-4 sm:h-5 text-slate-700" />
                <span className="text-[10px] sm:text-[11px] font-bold text-slate-700 leading-tight mt-1.5 block">
                  Container<br />Operations
                </span>
              </div>
              <div className="flex flex-col items-center text-center px-1">
                <InvoicingBillingIcon className="w-4 sm:w-5 h-4 sm:h-5 text-slate-700" />
                <span className="text-[10px] sm:text-[11px] font-bold text-slate-700 leading-tight mt-1.5 block">
                  Invoicing &amp;<br />Billing
                </span>
              </div>
              <div className="flex flex-col items-center text-center px-1">
                <ReportsAnalyticsIcon className="w-4 sm:w-5 h-4 sm:h-5 text-slate-700" />
                <span className="text-[10px] sm:text-[11px] font-bold text-slate-700 leading-tight mt-1.5 block">
                  Reports &amp;<br />Analytics
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn"
        >
          <div className="bg-white rounded-2xl max-w-sm sm:max-w-md w-full p-6 shadow-2xl border border-slate-100 relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-slate-800 font-bold">
                <HelpCircle className="w-5 h-5 text-[#E11D2A]" />
                <span className="text-base">Password Assistance</span>
              </div>
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                title="Close dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="mt-4 text-xs sm:text-sm text-slate-600 space-y-3">
              <p>
                For security and regulatory compliance, MSK Logistic Solution ERP account credentials are authenticated and managed by the Systems Administrator.
              </p>
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 text-slate-700 space-y-1">
                <strong className="block text-slate-900 font-semibold">ERP System Administration:</strong>
                <p>Support Desk: <span className="font-medium text-slate-900">IT Department / Admin Office</span></p>
                <p>Email: <a href="mailto:admin@msklogistic.com" className="text-[#1D4ED8] font-semibold hover:underline">admin@msklogistic.com</a></p>
              </div>
              <p className="text-slate-500 text-[11px]">
                Please request password reset assistance from your supervisor or administrator.
              </p>
            </div>
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 font-semibold text-xs sm:text-sm rounded-xl transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
