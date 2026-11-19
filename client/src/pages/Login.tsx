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
    <div className="min-h-screen min-h-[100dvh] w-full relative flex flex-col items-center justify-center p-3 sm:p-5 md:p-8 lg:p-10 overflow-x-hidden bg-[#FAFCFF] select-none">
      {/* Background Subtle Geometric Diagonal Bands (Vector SVG) */}
      <div className="absolute inset-0 pointer-events-none select-none z-0 overflow-hidden">
        <svg
          className="w-full h-full object-cover opacity-60"
          viewBox="0 0 1920 1080"
          preserveAspectRatio="none"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Base ambient gradient */}
          <rect width="1920" height="1080" fill="url(#bg-ambient-grad)" />

          {/* Large soft diagonal band 1 */}
          <polygon
            points="0,680 880,0 1140,0 0,880"
            fill="url(#band-grad-1)"
          />
          <line x1="880" y1="0" x2="0" y2="680" stroke="#FFFFFF" strokeWidth="3" opacity="0.8" />
          <line x1="1140" y1="0" x2="0" y2="880" stroke="#FFFFFF" strokeWidth="3" opacity="0.8" />

          {/* Large soft diagonal band 2 (across center-right) */}
          <polygon
            points="580,1080 1820,120 1920,200 820,1080"
            fill="url(#band-grad-2)"
          />
          <line x1="1820" y1="120" x2="580" y2="1080" stroke="#FFFFFF" strokeWidth="3" opacity="0.8" />
          <line x1="1920" y1="200" x2="820" y2="1080" stroke="#FFFFFF" strokeWidth="3" opacity="0.8" />

          {/* Diagonal band 3 (lower right corner) */}
          <polygon
            points="1260,1080 1920,560 1920,680 1420,1080"
            fill="url(#band-grad-1)"
          />

          <defs>
            <linearGradient id="bg-ambient-grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="50%" stopColor="#F8FAFC" />
              <stop offset="100%" stopColor="#EFF4FA" />
            </linearGradient>
            <linearGradient id="band-grad-1" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#EEF4F9" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#E4ECF4" stopOpacity="0.4" />
            </linearGradient>
            <linearGradient id="band-grad-2" x1="1" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F1F6FB" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#E8F0F7" stopOpacity="0.5" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Top-Left Sharp Geometric Red & White Corner Graphics */}
      <div className="absolute top-0 left-0 pointer-events-none select-none z-0">
        <svg
          className="w-[160px] sm:w-[240px] md:w-[320px] lg:w-[400px] xl:w-[460px] h-auto drop-shadow-xs"
          viewBox="0 0 480 380"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Deep Crimson Outer Triangle */}
          <path d="M 0 0 L 360 0 L 0 280 Z" fill="#991B1B" />
          {/* Crisp White Separator Line */}
          <line x1="360" y1="0" x2="0" y2="280" stroke="#FFFFFF" strokeWidth="5" />
          {/* Main Vibrant MSK Red Diagonal Ribbon */}
          <polygon points="360,0 440,0 0,345 0,280" fill="#DC2626" />
          {/* Crisp White Separator Line */}
          <line x1="440" y1="0" x2="0" y2="345" stroke="#FFFFFF" strokeWidth="5" />
          {/* Thin Deep-Red Inner Accent Ribbon */}
          <polygon points="440,0 470,0 0,370 0,345" fill="#7F1D1D" />
        </svg>
      </div>

      {/* Bottom-Right Sharp Geometric Red & White Corner Graphics */}
      <div className="absolute bottom-0 right-0 pointer-events-none select-none z-0">
        <svg
          className="w-[160px] sm:w-[240px] md:w-[320px] lg:w-[400px] xl:w-[460px] h-auto drop-shadow-xs"
          viewBox="0 0 480 380"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Deep Crimson Corner Triangle */}
          <path d="M 480 380 L 120 380 L 480 100 Z" fill="#991B1B" />
          {/* Crisp White Separator Line */}
          <line x1="120" y1="380" x2="480" y2="100" stroke="#FFFFFF" strokeWidth="5" />
          {/* Main Vibrant MSK Red Diagonal Ribbon */}
          <polygon points="120,380 40,380 480,35 480,100" fill="#DC2626" />
          {/* Crisp White Separator Line */}
          <line x1="40" y1="380" x2="480" y2="35" stroke="#FFFFFF" strokeWidth="5" />
          {/* Thin Deep-Red Inner Accent Ribbon */}
          <polygon points="40,380 10,380 480,10 480,35" fill="#7F1D1D" />
        </svg>
      </div>

      {/* Main Centered Column Container */}
      <div className="w-full max-w-[1020px] flex flex-col items-center justify-center relative z-10 my-auto py-2 sm:py-5 box-border px-3 sm:px-6">
        {/* Top Branding Section: Centered Horizontally */}
        <div className="flex flex-col items-center justify-center max-w-full">
          <div className="flex items-center justify-center gap-2.5 sm:gap-4 md:gap-5 flex-wrap">
            {/* ISO 9001:2015 Certification Badge */}
            <img
              src="/images/iso-logo.png"
              alt="ISO 9001:2015 Certified"
              className="h-9 sm:h-12 md:h-14 lg:h-16 w-auto object-contain shrink-0 drop-shadow-xs"
            />

            {/* Vertical Separator */}
            <div className="h-8 sm:h-11 md:h-13 w-[1.5px] bg-[#0D254C]/30 shrink-0" />

            {/* MSK Logistic Solution Logo */}
            <img
              src="/images/msk-logo.png"
              alt="MSK Logistic Solution"
              className="h-8 sm:h-10 md:h-12 lg:h-14 w-auto object-contain shrink-0 drop-shadow-xs"
            />
          </div>

          {/* Company Tagline with Red Decorative Lines */}
          <div className="flex items-center justify-center gap-2 sm:gap-3 mt-2 sm:mt-2.5 max-w-full">
            <div className="w-4 sm:w-8 md:w-10 h-[2px] bg-[#E11D2A] rounded-full shrink-0" />
            <p className="text-[11px] sm:text-[13px] md:text-sm font-bold text-[#0D254C] tracking-wide select-text text-center">
              Beyond logistics we <span className="text-[#E11D2A]">Deliver Trust™</span>
            </p>
            <div className="w-4 sm:w-8 md:w-10 h-[2px] bg-[#E11D2A] rounded-full shrink-0" />
          </div>
        </div>

        {/* Main ERP Heading Section (Centered) */}
        <div className="mt-3.5 sm:mt-5 md:mt-6 text-center max-w-full px-1">
          {/* Main Heading: Single line on Desktop with bold Navy and bold italic Red, wrapping cleanly on mobile */}
          <h1 className="text-xl sm:text-2xl md:text-[34px] lg:text-[38px] xl:text-[41px] font-black tracking-tight leading-snug sm:leading-[1.15] select-text md:whitespace-nowrap">
            <span className="block md:inline text-[#0D254C]">Integrated Logistics </span>{' '}
            <span className="block md:inline text-[#E11D2A] italic">Management ERP</span>
          </h1>

          {/* Supporting Subtitle */}
          <p className="text-slate-600 font-semibold text-[11px] sm:text-sm md:text-base lg:text-[17px] mt-1 sm:mt-1.5 tracking-tight select-text">
            Management, Invoicing &amp; Container Operations
          </p>
        </div>

        {/* Centered White Login Card */}
        <div className="w-full max-w-[340px] xs:max-w-[380px] sm:max-w-[440px] md:max-w-[480px] bg-white rounded-2xl sm:rounded-[32px] md:rounded-[36px] shadow-[0_20px_50px_rgba(0,0,0,0.06)] border border-slate-200/70 p-5 sm:p-8 md:p-10 relative overflow-hidden flex flex-col justify-between box-border mt-4 sm:mt-6 mx-auto">
          {/* Card Header */}
          <div className="text-center pt-0.5">
            <p className="text-xs sm:text-sm font-semibold text-slate-700">
              Welcome to
            </p>
            <h2 className="text-xl sm:text-[28px] md:text-[30px] font-black text-[#0D254C] tracking-tight mt-0.5">
              MSK Logistic Solution
            </h2>
            <div className="w-12 sm:w-16 h-1 bg-[#E11D2A] rounded-full mx-auto my-2 sm:my-3" />
            <p className="text-xs sm:text-[13px] text-slate-500 font-medium">
              Sign in to access your ERP account
            </p>
          </div>

          {/* Session / Logout Status Notice */}
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
          <form onSubmit={handleLogin} className="mt-4 sm:mt-5 space-y-3.5 sm:space-y-4">
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
