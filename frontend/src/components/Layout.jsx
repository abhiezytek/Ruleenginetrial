import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardCheck,
  History,
  BookOpen,
  FileText,
  Menu,
  X,
  LogOut,
  ChevronDown,
} from 'lucide-react';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/evaluate', label: 'Evaluate', icon: ClipboardCheck },
  { to: '/history', label: 'History', icon: History },
  { to: '/rules', label: 'Rules', icon: BookOpen },
  { to: '/templates', label: 'Templates', icon: FileText },
];

// AccuRule brand — "Accu" red, "Rule" blue
function AccuRuleLogo({ size = 'sm' }) {
  const cls = size === 'md' ? 'text-lg font-extrabold' : 'text-sm font-bold';
  return (
    <span className={cls} style={{ letterSpacing: '-0.01em' }}>
      <span className="text-red-500">Accu</span>
      <span className="text-blue-400">Rule</span>
    </span>
  );
}

export default function Layout({ user, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const displayName = user?.full_name ?? user?.fullName ?? user?.username ?? 'User';
  const initials = displayName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-gradient-to-b from-slate-900 to-slate-800 z-30 flex flex-col transition-transform duration-200
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:z-auto`}
      >
        {/* Brand */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-700">
          {/* AccuRule icon — "A" in split gradient circle */}
          <div
            className="flex items-center justify-center w-9 h-9 rounded-lg text-white font-extrabold text-base shrink-0"
            style={{ background: 'linear-gradient(135deg, #dc2626 0%, #2563eb 100%)' }}
          >
            A
          </div>
          <div>
            <AccuRuleLogo size="md" />
            <div className="text-slate-400 text-xs">Insurance Rule Engine</div>
          </div>
          <button
            className="ml-auto lg:hidden text-slate-400 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${isActive
                  ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/60'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-slate-700">
          <div className="text-slate-500 text-xs">v1.0 · AccuRule</div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top header */}
        <header className="flex items-center gap-4 h-14 px-4 bg-white border-b border-gray-200 shrink-0">
          {/* Red-to-blue top accent bar */}
          <div
            className="absolute top-0 left-0 right-0 h-0.5"
            style={{ background: 'linear-gradient(to right, #dc2626, #2563eb)' }}
          />

          <button
            className="lg:hidden text-gray-500 hover:text-gray-700"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Brand in header */}
          <div className="flex items-center gap-2">
            <div
              className="flex items-center justify-center w-6 h-6 rounded text-white font-extrabold text-xs"
              style={{ background: 'linear-gradient(135deg, #dc2626 0%, #2563eb 100%)' }}
            >
              A
            </div>
            <span className="font-semibold text-sm">
              <span className="text-red-600">Accu</span>
              <span className="text-blue-600">Rule</span>
            </span>
          </div>

          <div className="ml-auto flex items-center gap-3">
            {/* API status */}
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              API Connected
            </span>

            {/* User menu */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen((o) => !o)}
                className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div
                  className="flex items-center justify-center w-7 h-7 rounded-full text-white text-xs font-bold"
                  style={{ background: 'linear-gradient(135deg, #dc2626 0%, #2563eb 100%)' }}
                >
                  {initials}
                </div>
                <span className="hidden sm:block text-sm text-gray-700 font-medium max-w-[120px] truncate">
                  {displayName}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              </button>

              {userMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setUserMenuOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-20">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <div className="text-sm font-medium text-gray-800 truncate">{displayName}</div>
                      <div className="text-xs text-gray-500 truncate">{user?.email ?? ''}</div>
                    </div>
                    <button
                      onClick={() => { setUserMenuOpen(false); onLogout(); }}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
