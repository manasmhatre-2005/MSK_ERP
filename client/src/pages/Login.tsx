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
 * Custom High-Precision SVG Icons matching the reference design:
 * 1. Container Depot / Port Crane Icon
 * 2. Invoicing & Billing Document with Rupee (₹) Icon
 * 3. 3-Bar Analytics / Chart Icon
 */
const ContainerCraneIcon: React.FC<{ className?: string }> = ({ className = 'w-7 h-7 sm:w-8 sm:h-8' }) => (
  <svg
    className={className}
    viewBox="0 0 32 32"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {/* Crane Apex and Top Rigging */}
    <line x1="16" y1="3" x2="16" y2="6" />
    <path d="M7 6h18" />
    <path d="M11 6L6 14h20l-5-8" />
    <line x1="16" y1="14" x2="16" y2="18" />
    {/* Suspended Shipping Container with Vertical Ribs */}
    <rect x="5" y="18" width="22" height="10" rx="1.5" strokeWidth="2" fill="none" />
    <line x1="10" y1="18" x2="10" y2="28" />
    <line x1="16" y1="18" x2="16" y2="28" />
    <line x1="22" y1="18" x2="22" y2="28" />
  </svg>
);

const InvoicingRupeeIcon: React.FC<{ className?: string }> = ({ className = 'w-7 h-7 sm:w-8 sm:h-8' }) => (
  <svg
    className={className}
    viewBox="0 0 32 32"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {/* Invoice Paper Document with Folded Dog-Ear Corner */}
    <path d="M19 3H8a2 2 0 0 0-2 2v22a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V10z" />
    <polyline points="19 3 19 10 26 10" />
    <line x1="10" y1="14" x2="15" y2="14" />
    <line x1="10" y1="18" x2="14" y2="18" />
    {/* Currency Badge with Indian Rupee (₹) */}
    <circle cx="21" cy="22" r="4.5" fill="#E11D2A" stroke="#E11D2A" />
    <text
      x="21"
      y="25"
      fontSize="7.5"
      fontWeight="900"
      fontFamily="system-ui, -apple-system, sans-serif"
      textAnchor="middle"
      fill="#FFFFFF"
      stroke="none"
    >
      ₹
    </text>
  </svg>
);

const AnalyticsBarsIcon: React.FC<{ className?: string }> = ({ className = 'w-7 h-7 sm:w-8 sm:h-8' }) => (
  <svg
    className={className}
    viewBox="0 0 32 32"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {/* 3 Ascending Rounded Vertical Bars */}
    <rect x="5" y="17" width="5.5" height="11" rx="1.5" fill="currentColor" stroke="none" />
    <rect x="13.25" y="11" width="5.5" height="17" rx="1.5" fill="currentColor" stroke="none" />
    <rect x="21.5" y="5" width="5.5" height="23" rx="1.5" fill="currentColor" stroke="none" />
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
    <div className="min-h-screen min-h-[100dvh] w-full relative flex items-center justify-center p-3 sm:p-5 md:p-8 lg:p-10 xl:p-12 overflow-x-hidden bg-gradient-to-br from-[#FFFFFF] via-[#F8FBFE] to-[#EBF3FB] select-none">
      {/* Top-Left Dynamic Red & Navy/Grey Decorative Waves */}
      <div className="absolute top-0 left-0 pointer-events-none select-none z-0">
        <svg
          className="w-[180px] sm:w-[260px] md:w-[360px] lg:w-[440px] xl:w-[460px] h-auto drop-shadow-xs"
          viewBox="0 0 460 360"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Subtle light-grey shadow swoosh */}
          <path
            d="M 0 0 L 460 0 C 350 45 230 130 130 230 C 70 290 25 330 0 360 Z"
            fill="url(#tl-grey-grad)"
            opacity="0.35"
          />
          {/* Dark crimson ribbon */}
          <path
            d="M 0 0 L 380 0 C 270 50 170 145 90 245 C 45 295 18 328 0 350 Z"
            fill="url(#tl-darkred-grad)"
          />
          {/* Vibrant MSK red ribbon */}
          <path
            d="M 0 0 L 290 0 C 195 45 115 135 55 225 C 22 268 6 298 0 322 Z"
            fill="url(#tl-red-grad)"
          />
          <defs>
            <linearGradient id="tl-red-grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#DC2626" />
              <stop offset="100%" stopColor="#B91C1C" />
            </linearGradient>
            <linearGradient id="tl-darkred-grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#991B1B" />
              <stop offset="100%" stopColor="#7F1D1D" />
            </linearGradient>
            <linearGradient id="tl-grey-grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#94A3B8" />
              <stop offset="100%" stopColor="#CBD5E1" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Bottom-Right Dynamic Red & Dark Ribbon Waves */}
      <div className="absolute bottom-0 right-0 pointer-events-none select-none z-0">
        <svg
          className="w-[200px] sm:w-[280px] md:w-[380px] lg:w-[460px] xl:w-[480px] h-auto drop-shadow-xs"
          viewBox="0 0 480 340"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Subtle light-grey outer contour */}
          <path
            d="M 480 340 L 0 340 C 130 310 250 240 345 150 C 405 90 445 40 480 0 Z"
            fill="url(#br-grey-grad)"
            opacity="0.35"
          />
          {/* Dark crimson ribbon */}
          <path
            d="M 480 340 L 90 340 C 195 300 295 230 380 150 C 430 100 460 50 480 0 Z"
            fill="url(#br-darkred-grad)"
          />
          {/* Vibrant MSK red ribbon */}
          <path
            d="M 480 340 L 180 340 C 265 290 350 220 415 150 C 452 100 472 55 480 20 Z"
            fill="url(#br-red-grad)"
          />
          <defs>
            <linearGradient id="br-red-grad" x1="1" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="#DC2626" />
              <stop offset="100%" stopColor="#EF4444" />
            </linearGradient>
            <linearGradient id="br-darkred-grad" x1="1" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="#7F1D1D" />
              <stop offset="100%" stopColor="#991B1B" />
            </linearGradient>
            <linearGradient id="br-grey-grad" x1="1" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="#94A3B8" />
              <stop offset="100%" stopColor="#E2E8F0" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Main Container: Split ~52% Left / ~48% Right on Desktop */}
      <div className="w-full max-w-[1340px] xl:max-w-[1400px] min-h-[calc(100vh-2.5rem)] flex flex-col lg:flex-row items-center lg:items-stretch justify-between relative z-10 gap-6 sm:gap-8 lg:gap-12 xl:gap-16 my-auto py-2 sm:py-4 box-border">
        {/* Left Section — Company Branding (~52% Desktop Width) */}
        <div className="w-full max-w-full lg:w-[52%] flex flex-col justify-center py-2 sm:py-4 shrink-0 lg:shrink">
          {/* Top Branding Row */}
          <div className="flex flex-col items-start relative z-10">
            <div className="flex items-center gap-2.5 sm:gap-4 md:gap-5 flex-wrap">
              {/* ISO 9001:2015 Certification Badge */}
              <img
                src="/images/iso-logo.png"
                alt="ISO 9001:2015 Certified"
                className="h-9 sm:h-12 md:h-14 lg:h-16 w-auto object-contain shrink-0 drop-shadow-xs"
              />

              {/* Vertical Separator */}
              <div className="h-8 sm:h-11 md:h-13 w-[1.5px] bg-slate-300 shrink-0" />

              {/* Existing MSK Logistic Solution Logo */}
              <img
                src="/images/msk-logo.png"
                alt="MSK Logistic Solution"
                className="h-7 sm:h-10 md:h-12 lg:h-14 w-auto object-contain object-left shrink-0 drop-shadow-xs"
              />
            </div>

            {/* Tagline */}
            <p className="text-[10px] sm:text-xs md:text-sm font-bold text-slate-800 tracking-wide mt-2 select-text max-w-full leading-tight">
              — Beyond logistics we <span className="text-[#E11D2A]">Deliver Trust™</span> —
            </p>
          </div>

          {/* Main Heading */}
          <div className="mt-5 sm:mt-8 md:mt-10 lg:mt-12 xl:mt-14 max-w-full">
            <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-[46px] xl:text-[52px] font-black italic tracking-tight leading-[1.08] select-text">
              <span className="block text-[#0D254C]">Integrated Logistics</span>
              <span className="block text-[#E11D2A] mt-0.5 sm:mt-1">Management ERP</span>
            </h1>

            {/* Short Red Underline */}
            <div className="w-16 sm:w-24 md:w-28 h-1.5 sm:h-2 bg-[#E11D2A] rounded-full mt-2.5 sm:mt-4 shadow-xs" />

            {/* Subheading */}
            <p className="text-[#0D254C] font-bold text-xs sm:text-base md:text-lg lg:text-[21px] mt-2 sm:mt-4 tracking-tight leading-snug select-text max-w-full">
              Management, Invoicing &amp; Container Operations
            </p>

            {/* Three Feature Cards in a Horizontal Row */}
            <div className="mt-4 sm:mt-7 flex flex-row items-center justify-start gap-2 sm:gap-4 md:gap-5 w-full max-w-full">
              {/* Card 1: Container Operations */}
              <div className="flex-1 min-w-0 max-w-[105px] sm:max-w-[145px] md:max-w-[160px] bg-white rounded-xl sm:rounded-2xl border border-slate-200/90 shadow-[0_4px_16px_rgba(0,0,0,0.04)] hover:shadow-md hover:border-red-200 transition-all p-2 sm:p-4 md:p-5 flex flex-col items-center justify-center text-center">
                <div className="w-7 h-7 sm:w-11 sm:h-11 flex items-center justify-center text-[#E11D2A] shrink-0">
                  <ContainerCraneIcon className="w-5 h-5 sm:w-8 sm:h-8" />
                </div>
                <span className="text-[10px] sm:text-[13px] font-black text-[#0D254C] leading-tight mt-1.5 sm:mt-3 block truncate sm:overflow-visible">
                  Container<br />Operations
                </span>
              </div>

              {/* Card 2: Invoicing & Billing */}
              <div className="flex-1 min-w-0 max-w-[105px] sm:max-w-[145px] md:max-w-[160px] bg-white rounded-xl sm:rounded-2xl border border-slate-200/90 shadow-[0_4px_16px_rgba(0,0,0,0.04)] hover:shadow-md hover:border-red-200 transition-all p-2 sm:p-4 md:p-5 flex flex-col items-center justify-center text-center">
                <div className="w-7 h-7 sm:w-11 sm:h-11 flex items-center justify-center text-[#E11D2A] shrink-0">
                  <InvoicingRupeeIcon className="w-5 h-5 sm:w-8 sm:h-8" />
                </div>
                <span className="text-[10px] sm:text-[13px] font-black text-[#0D254C] leading-tight mt-1.5 sm:mt-3 block truncate sm:overflow-visible">
                  Invoicing &amp;<br />Billing
                </span>
              </div>

              {/* Card 3: Reports & Analytics */}
              <div className="flex-1 min-w-0 max-w-[105px] sm:max-w-[145px] md:max-w-[160px] bg-white rounded-xl sm:rounded-2xl border border-slate-200/90 shadow-[0_4px_16px_rgba(0,0,0,0.04)] hover:shadow-md hover:border-red-200 transition-all p-2 sm:p-4 md:p-5 flex flex-col items-center justify-center text-center">
                <div className="w-7 h-7 sm:w-11 sm:h-11 flex items-center justify-center text-[#E11D2A] shrink-0">
                  <AnalyticsBarsIcon className="w-5 h-5 sm:w-8 sm:h-8" />
                </div>
                <span className="text-[10px] sm:text-[13px] font-black text-[#0D254C] leading-tight mt-1.5 sm:mt-3 block truncate sm:overflow-visible">
                  Reports &amp;<br />Analytics
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section — Login Card (~48% Desktop Width) */}
        <div className="w-full max-w-full lg:w-[48%] flex items-center justify-center lg:justify-end my-auto py-2 sm:py-4">
          <div className="w-full max-w-[350px] sm:max-w-[420px] lg:max-w-[460px] bg-white rounded-2xl sm:rounded-3xl lg:rounded-[36px] shadow-[0_20px_50px_rgba(0,0,0,0.06)] border border-slate-200/60 p-4 sm:p-7 lg:p-11 relative overflow-hidden flex flex-col justify-between box-border">
            {/* Card Header */}
            <div className="text-center pt-1">
              <p className="text-xs sm:text-sm font-semibold text-slate-700">
                Welcome to
              </p>
              <h2 className="text-xl sm:text-2xl lg:text-[28px] font-black text-[#0D254C] tracking-tight mt-0.5">
                MSK Logistic Solution
              </h2>
              <div className="w-12 sm:w-16 h-1 bg-[#E11D2A] rounded-full mx-auto my-2.5 sm:my-3" />
              <p className="text-xs sm:text-[13px] text-slate-500 font-medium">
                Sign in to access your ERP account
              </p>
            </div>

            {/* Logout / Session Notice */}
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

            {/* Error Banner */}
            {error && (
              <div className="mt-3.5 flex items-center gap-2 p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl animate-fadeIn">
                <AlertCircle className="w-4 h-4 shrink-0 text-[#E11D2A]" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            {/* Interactive Sign-In Form */}
            <form onSubmit={handleLogin} className="mt-4 sm:mt-5 space-y-3 sm:space-y-4">
              {/* Email / Username Field */}
              <div>
                <div className="flex items-center gap-1.5 text-xs sm:text-[13px] font-bold text-[#0D254C] mb-1 sm:mb-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#0D254C]" />
                  <span>Email / Username</span>
                  <span className="text-[#E11D2A]">*</span>
                </div>
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
                    className="w-full h-11 sm:h-12 pl-10 pr-3.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 bg-transparent rounded-xl outline-none box-border"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <div className="flex items-center gap-1.5 text-xs sm:text-[13px] font-bold text-[#0D254C] mb-1 sm:mb-1.5">
                  <Lock className="w-3.5 h-3.5 text-[#0D254C]" />
                  <span>Password</span>
                  <span className="text-[#E11D2A]">*</span>
                </div>
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
                    className="w-full h-11 sm:h-12 pl-10 pr-10 text-xs sm:text-sm text-slate-800 placeholder-slate-400 bg-transparent rounded-xl outline-none box-border"
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
                  className="text-xs sm:text-[13px] font-bold text-[#1E6091] hover:text-[#0D47A1] hover:underline transition-colors cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Large Red Sign In Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-11.5 sm:h-12.5 mt-2 flex items-center justify-center gap-2.5 rounded-xl sm:rounded-2xl bg-[#DC2626] hover:bg-[#B91C1C] active:bg-[#991B1B] text-white font-bold text-sm sm:text-base shadow-lg shadow-red-500/25 disabled:opacity-60 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <ArrowRight className="w-5 h-5 stroke-[2.5]" />
                    <span>Sign In</span>
                  </>
                )}
              </button>
            </form>
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
