import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Package,
  FileText,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { authApi } from '../../api/auth.api';
import { tokenStore } from '../../lib/axios';
import { cn } from '../../lib/utils';

const navItems = [
  { to: '/dashboard', key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/invoices', key: 'invoices', label: 'Invoices', icon: FileText, badge: 8 },
  { to: '/customers', key: 'customers', label: 'Customers', icon: Users },
  { to: '/items', key: 'items', label: 'Items', icon: Package },
  { to: '/payments', key: 'payments', label: 'Payments', icon: Package },
  { to: '/settings', key: 'settings', label: 'Settings', icon: Package },
];

export const AppLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = async () => {
    try {
      const refreshToken = tokenStore.getRefreshToken();
      if (refreshToken) await authApi.logout(refreshToken);
    } catch {
      // proceed with logout even if the API call fails
    } finally {
      logout();
      navigate('/login', { replace: true });
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside
        className={cn(
          "w-[230px] bg-white flex flex-col shrink-0",
          "border-r border-gray-200"
        )}
      >
        {/* Logo */}
        <div className="px-6 py-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white font-bold">
              F
            </div>
            <div>
              <div className="font-extrabold text-sm text-gray-900 tracking-tight">
                Fatoorah
              </div>
              <div className="text-[10px] text-gray-400">فاتورة</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ to,label, icon: Icon, badge }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all",
                  isActive
                    ? "bg-blue-50 text-blue-600 font-semibold"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                )
              }
            >
              <Icon className="w-4 h-4 opacity-80 shrink-0" />

              <span className="flex-1">{label}</span>

              {/* Badge like old dashboard */}
              {badge && (
                <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-[1px] rounded-full">
                  {badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div className="px-4 py-4 border-t border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-200 to-indigo-400 flex items-center justify-center text-indigo-800 text-xs font-bold">
              {user?.email?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {user?.email}
              </p>
              <p className="text-xs text-gray-400">
                Org #{user?.organizationId}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
