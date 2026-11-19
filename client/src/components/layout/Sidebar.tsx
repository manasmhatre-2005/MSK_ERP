import React, { useEffect } from 'react';
import {
  Users,
  Ship,
  Box,
  BadgePercent,
  FileText,
  CreditCard,
  Settings,
  Truck,
  ShieldCheck,
  Landmark,
  ChevronRight,
  Home,
  X,
  ClipboardList,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenInvoiceWizard: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavGroup {
  id: string;
  label: string;
  items: NavItem[];
}

/**
 * Subtle decorative laurel branch vector graphics flanking the ISO 9001:2015 certification
 */
const LaurelLeft: React.FC = () => (
  <svg
    className="w-3.5 h-4.5 text-[#3794DC] shrink-0"
    viewBox="0 0 16 22"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M13 19C9.5 17.5 5 13.5 5 3"
      stroke="#3794DC"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
    <path
      d="M5 3.5C2.5 3.5 1.5 5 2.5 6.5C4 6 4.8 4.5 5 3.5Z"
      fill="#3794DC"
    />
    <path
      d="M5.5 7.5C3 7.5 2 9 3 10.5C4.5 10 5.3 8.5 5.5 7.5Z"
      fill="#3794DC"
    />
    <path
      d="M6.5 11.5C4 11.5 3 13 4 14.5C5.5 14 6.3 12.5 6.5 11.5Z"
      fill="#3794DC"
    />
    <path
      d="M8.5 15.5C6 15.5 5.2 17 6.2 18.2C7.8 17.8 8.4 16.5 8.5 15.5Z"
      fill="#3794DC"
    />
  </svg>
);

const LaurelRight: React.FC = () => (
  <svg
    className="w-3.5 h-4.5 text-[#3794DC] shrink-0"
    viewBox="0 0 16 22"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M3 19C6.5 17.5 11 13.5 11 3"
      stroke="#3794DC"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
    <path
      d="M11 3.5C13.5 3.5 14.5 5 13.5 6.5C12 6 11.2 4.5 11 3.5Z"
      fill="#3794DC"
    />
    <path
      d="M10.5 7.5C13 7.5 14 9 13 10.5C11.5 10 10.7 8.5 10.5 7.5Z"
      fill="#3794DC"
    />
    <path
      d="M9.5 11.5C12 11.5 13 13 12 14.5C10.5 14 9.7 12.5 9.5 11.5Z"
      fill="#3794DC"
    />
    <path
      d="M7.5 15.5C10 15.5 10.8 17 9.8 18.2C8.2 17.8 7.6 16.5 7.5 15.5Z"
      fill="#3794DC"
    />
  </svg>
);

/**
 * Dynamic extraction of initials from user name
 */
const getInitials = (name?: string): string => {
  if (!name) return 'MS';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'MS';
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  isOpen = false,
  onClose,
}) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  // Support Escape key to close navigation drawer on mobile/tablet
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && onClose) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Structured 3-section navigation menu as specified
  const navGroups: NavGroup[] = isAdmin
    ? [
        {
          id: 'operations',
          label: 'OPERATIONS',
          items: [
            { id: 'dashboard', label: 'Dashboard', icon: Home },
            { id: 'parties', label: 'Parties Master', icon: Users },
            { id: 'exporters', label: 'Exporters Master', icon: Truck },
            { id: 'jobs', label: 'Jobs & Shipments', icon: Ship },
            { id: 'containers', label: 'Containers Operations', icon: Box },
            { id: 'carting', label: 'Carting Details', icon: ClipboardList },
          ],
        },
        {
          id: 'financial',
          label: 'FINANCIAL',
          items: [
            { id: 'charges', label: 'Charges & Rates', icon: BadgePercent },
            { id: 'invoices', label: 'Invoices & Billing', icon: FileText },
            { id: 'payments', label: 'Payment Register', icon: CreditCard },
          ],
        },
        {
          id: 'admin',
          label: 'ADMINISTRATION',
          items: [
            { id: 'users', label: 'User Management', icon: Users },
            { id: 'settings', label: 'Company Settings', icon: Settings },
          ],
        },
      ]
    : [
        {
          id: 'operations',
          label: 'OPERATIONS',
          items: [
            { id: 'dashboard', label: 'Dashboard', icon: Home },
            { id: 'parties', label: 'Parties Master', icon: Users },
            { id: 'exporters', label: 'Exporters Master', icon: Truck },
            { id: 'jobs', label: 'Jobs & Shipments', icon: Ship },
            { id: 'containers', label: 'Containers Operations', icon: Box },
            { id: 'carting', label: 'Carting Details', icon: ClipboardList },
          ],
        },
        {
          id: 'financial',
          label: 'FINANCIAL',
          items: [
            { id: 'charges', label: 'Charges & Rates', icon: BadgePercent },
            { id: 'invoices', label: 'Invoices & Billing', icon: FileText },
            { id: 'payments', label: 'Payment Register', icon: CreditCard },
          ],
        },
      ];

  const userInitials = getInitials(user?.name);
  const userRoleDisplay =
    user?.role === 'ACCOUNT_MANAGER'
      ? 'Account Manager'
      : user?.role === 'ADMIN'
      ? 'ADMIN'
      : (user?.role || 'ADMIN');

  return (
    <>
      {/* Mobile/Tablet Backdrop Overlay with Outside Tap to Close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden transition-opacity duration-300"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Drawer: Premium Dark Navy-to-Steel Logistics Navigation Panel */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-[280px] lg:w-[290px] xl:w-[300px] max-w-[85vw] text-[#F7FAFF] border-r border-[rgba(55,148,220,0.30)] flex flex-col h-screen select-none shrink-0 transition-transform duration-300 ease-in-out overflow-hidden shadow-2xl lg:shadow-[4px_0_24px_rgba(3,26,53,0.50)] ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        style={{
          background: 'linear-gradient(180deg, #031A35 0%, #06264A 50%, #031A35 100%)',
        }}
        aria-label="Sidebar Navigation"
      >
        {/* Mobile Close Button (X) */}
        <button
          type="button"
          onClick={onClose}
          className="lg:hidden absolute top-3.5 right-3.5 z-20 w-8 h-8 rounded-lg bg-[#06264A] hover:bg-[#0B3764] text-[#D8E9FF] hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-[rgba(55,148,220,0.40)] shadow-sm"
          aria-label="Close navigation menu"
          title="Close Navigation"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Background Logistics Vector Artwork (Layered at bottom in background) */}
        <svg
          className="absolute bottom-0 left-0 right-0 w-full h-80 pointer-events-none z-0 opacity-14"
          viewBox="0 0 300 260"
          fill="none"
          preserveAspectRatio="xMidYMax slice"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="sidebarShipGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#3794DC" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#0B3764" stopOpacity="0.10" />
            </linearGradient>
            <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#3794DC" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#3794DC" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Dotted Global Shipping Route Paths */}
          <path
            d="M 15 100 Q 100 25 210 65 T 285 45"
            stroke="#3794DC"
            strokeWidth="1.2"
            strokeDasharray="4 4"
          />
          <path
            d="M 45 140 Q 155 75 275 115"
            stroke="#3794DC"
            strokeWidth="1"
            strokeDasharray="3 3"
          />

          {/* Glowing Logistics Route Nodes */}
          <circle cx="210" cy="65" r="5" fill="url(#nodeGlow)" />
          <circle cx="210" cy="65" r="2.5" fill="#D8E9FF" />
          <circle cx="100" cy="50" r="4.5" fill="url(#nodeGlow)" />
          <circle cx="100" cy="50" r="2" fill="#D8E9FF" />
          <circle cx="275" cy="115" r="4.5" fill="url(#nodeGlow)" />
          <circle cx="275" cy="115" r="2" fill="#D8E9FF" />

          {/* Port Terminal Dock Line */}
          <path
            d="M 0 215 L 300 215 L 300 260 L 0 260 Z"
            fill="#06264A"
            fillOpacity="0.4"
          />
          <line x1="0" y1="215" x2="300" y2="215" stroke="#3794DC" strokeWidth="1.5" />

          {/* Container Cargo Ship Hull Outline */}
          <path
            d="M 20 215 L 48 192 L 195 192 L 222 215 Z"
            fill="url(#sidebarShipGrad)"
            stroke="#3794DC"
            strokeWidth="1.3"
          />
          {/* Bridge / Superstructure */}
          <rect x="165" y="165" width="26" height="27" fill="#0B3764" stroke="#3794DC" strokeWidth="1" rx="1" />
          <line x1="165" y1="175" x2="191" y2="175" stroke="#3794DC" strokeWidth="0.8" />
          <line x1="178" y1="154" x2="178" y2="165" stroke="#3794DC" strokeWidth="1.4" />

          {/* Minimal Container-Stack Outline Line Art */}
          <g stroke="#3794DC" strokeWidth="1" fill="#06264A" fillOpacity="0.6">
            <rect x="52" y="179" width="25" height="13" rx="0.5" />
            <rect x="79" y="179" width="25" height="13" rx="0.5" />
            <rect x="106" y="179" width="25" height="13" rx="0.5" />
            <rect x="133" y="179" width="25" height="13" rx="0.5" />
            <rect x="65" y="165" width="25" height="13" rx="0.5" />
            <rect x="92" y="165" width="25" height="13" rx="0.5" />
            <rect x="119" y="165" width="25" height="13" rx="0.5" />
          </g>

          {/* Port STS Gantry Crane (Left) */}
          <g stroke="#3794DC" strokeWidth="1.3" strokeLinecap="round">
            <line x1="25" y1="215" x2="50" y2="115" />
            <line x1="65" y1="215" x2="50" y2="115" />
            <line x1="32" y1="182" x2="59" y2="182" strokeWidth="0.9" />
            <line x1="39" y1="149" x2="54" y2="149" strokeWidth="0.9" />
            <line x1="15" y1="115" x2="98" y2="115" strokeWidth="1.8" />
            <line x1="15" y1="111" x2="98" y2="111" strokeWidth="0.8" strokeDasharray="2 2" />
            <line x1="35" y1="115" x2="50" y2="82" />
            <line x1="65" y1="115" x2="50" y2="82" />
            <line x1="20" y1="115" x2="50" y2="82" strokeWidth="0.8" />
            <line x1="92" y1="115" x2="50" y2="82" strokeWidth="0.8" />
            <line x1="75" y1="115" x2="75" y2="142" strokeWidth="1" strokeDasharray="1 1" />
            <rect x="70" y="142" width="10" height="5" fill="#3794DC" stroke="none" />
          </g>

          {/* Port Gantry Crane (Right) */}
          <g stroke="#3794DC" strokeWidth="1.1" strokeLinecap="round" opacity="0.85">
            <line x1="215" y1="215" x2="238" y2="125" />
            <line x1="255" y1="215" x2="238" y2="125" />
            <line x1="205" y1="125" x2="285" y2="125" strokeWidth="1.5" />
            <line x1="225" y1="125" x2="238" y2="98" />
            <line x1="251" y1="125" x2="238" y2="98" />
          </g>

          {/* Water Surface Lines */}
          <path
            d="M 0 222 Q 35 220 70 222 T 140 222 T 210 222 T 280 222"
            stroke="#3794DC"
            strokeWidth="0.8"
            strokeDasharray="6 4"
          />
        </svg>

        {/* Top Branding Section */}
        <div className="relative z-10 px-3.5 pt-3 pb-2 shrink-0">
          {/* Official MSK Logistic Solution Logo Container */}
          <div className="bg-white rounded-xl p-2 shadow-md shadow-[#031A35]/60 border border-white/30 flex items-center justify-center overflow-hidden h-[72px]">
            <img
              src="/images/msk-logo.png"
              alt="MSK LOGISTIC SOLUTION"
              className="w-full h-full object-contain object-center scale-[1.04] block select-none"
              loading="eager"
            />
          </div>

          {/* Company Tagline: "Beyond logistics we Deliver Trust™" */}
          <p className="text-[10.5px] font-medium tracking-tight text-center mt-2 select-none">
            <span className="text-[#A9C3DF]">Beyond logistics we </span>
            <span className="text-[#ED171F] font-bold">Deliver Trust™</span>
          </p>

          {/* Badges: [ ADMIN PORTAL ] & Laurel-flanked ● ISO 9001:2015 */}
          <div className="flex flex-col items-center justify-center text-center pt-2 space-y-1.5">
            {/* Outlined Badge */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-widest uppercase bg-[#06264A]/80 text-[#D8E9FF] border border-[rgba(55,148,220,0.40)] shadow-xs">
              {isAdmin ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-[#ED171F]" />
                  <span>ADMIN PORTAL</span>
                </>
              ) : (
                <>
                  <Landmark className="w-3.5 h-3.5 text-[#3794DC]" />
                  <span>ACCOUNTS PORTAL</span>
                </>
              )}
            </div>

            {/* ISO 9001:2015 with Green Status Dot and Laurel Branches */}
            <div className="inline-flex items-center justify-center gap-1.5 px-2 select-none">
              <LaurelLeft />
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block shadow-[0_0_8px_#34d399]" />
                <span className="text-[#F7FAFF] font-bold text-[10.5px] tracking-wider uppercase">
                  ISO 9001:2015
                </span>
              </div>
              <LaurelRight />
            </div>
          </div>

          {/* Subtle Separator Below Branding */}
          <div className="mt-2.5 border-b border-[rgba(55,148,220,0.30)]" />
        </div>

        {/* Navigation Menu with 3 Sections, Outlined Icon Boxes, MSK Red Active Highlight, and Chevron */}
        <nav className="relative z-10 flex-1 overflow-y-auto px-3 py-1 space-y-2 custom-dark-scrollbar">
          {navGroups.map((group, groupIdx) => (
            <div key={group.id} className="space-y-0.5">
              {/* Divider between sections */}
              {groupIdx > 0 && (
                <div className="pt-1.5 pb-0.5">
                  <div className="border-t border-[rgba(55,148,220,0.30)] mx-1" />
                </div>
              )}

              {/* Section Header Label */}
              <div className="px-3 pt-1 pb-0.5 text-[9.5px] font-bold tracking-wider text-[#A9C3DF]/75 uppercase select-none">
                {group.label}
              </div>

              {/* Group Nav Items */}
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setCurrentTab(item.id);
                        if (onClose) onClose();
                      }}
                      className={`w-full group relative flex items-center justify-between px-2.5 py-1.5 min-h-[36px] rounded-xl text-[12.5px] transition-all duration-150 cursor-pointer ${
                        isActive
                          ? 'bg-gradient-to-r from-[#F5222D] to-[#C90012] text-[#F7FAFF] font-bold shadow-[0_4px_20px_rgba(245,34,45,0.40)] border border-red-500/30'
                          : 'text-[#F7FAFF]/90 hover:text-white hover:bg-[#06264A]/80 font-medium border border-transparent hover:border-[rgba(55,148,220,0.30)]'
                      }`}
                    >
                      {/* Active State Thin White Indicator Bar on Left */}
                      {isActive && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-4.5 bg-white rounded-r-full shadow-sm" />
                      )}

                      {/* Icon Container & Nav Label */}
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-7.5 h-7.5 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                            isActive
                              ? 'bg-white/20 border border-white/30 text-white'
                              : 'bg-[#06264A] border border-[#0B3764] text-[#D8E9FF] group-hover:bg-[#0B3764] group-hover:border-[rgba(55,148,220,0.40)] group-hover:text-white'
                          }`}
                        >
                          <Icon
                            className={`w-3.5 h-3.5 transition-colors ${
                              isActive ? 'stroke-[2.2]' : 'stroke-[1.8]'
                            }`}
                          />
                        </div>

                        <span className="truncate text-left tracking-tight">
                          {item.label}
                        </span>
                      </div>

                      {/* Right-Facing Chevron */}
                      <ChevronRight
                        className={`w-3.5 h-3.5 shrink-0 transition-all duration-150 ${
                          isActive
                            ? 'text-white stroke-[2.2]'
                            : 'text-[#D8E9FF]/50 group-hover:text-white group-hover:translate-x-0.5 stroke-[1.8]'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom Profile Section */}
        <div className="relative z-10 px-3.5 py-3 border-t border-[rgba(55,148,220,0.30)] bg-[#031A35]/95 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden min-w-0">
              {/* Profile Avatar: Circular red background with dynamic initials */}
              <div
                className="w-8.5 h-8.5 rounded-full bg-[#ED171F] border-2 border-white/20 text-[#F7FAFF] flex items-center justify-center text-xs font-black uppercase shrink-0 shadow-[0_0_12px_rgba(237,23,31,0.50)] tracking-wider"
                title={user?.name || 'Administrator'}
              >
                {userInitials}
              </div>

              {/* User Name & Role Label with Glowing Online Indicator */}
              <div className="truncate min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-[12px] font-bold text-[#F7FAFF] truncate leading-tight">
                    {user?.name || 'Administrator'}
                  </p>
                  <span
                    className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 shadow-[0_0_8px_#34d399] ring-2 ring-[#031A35]"
                    title="Online"
                  />
                </div>
                <p className="text-[9.5px] text-[#A9C3DF] font-bold uppercase tracking-wider truncate mt-0.5">
                  {userRoleDisplay}
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
