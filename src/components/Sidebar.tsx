import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, FileText, ClipboardList, BarChart2,
  Settings, LogOut, Bell, ChevronRight
} from 'lucide-react';
import { useStore } from '../store/useStore';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/orders', icon: ClipboardList, label: 'Órdenes de Pago' },
  { to: '/surveys/results', icon: BarChart2, label: 'Encuestas' },
  { to: '/settings', icon: Settings, label: 'Configuración' },
];

export default function Sidebar() {
  const { currentUser, logout, alerts } = useStore();
  const unread = alerts.filter(a => !a.isRead).length;

  return (
    <aside className="w-64 min-h-screen bg-indigo-900 text-white flex flex-col">
      <div className="px-6 py-5 border-b border-indigo-700">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-500 flex items-center justify-center font-bold text-lg">
            P
          </div>
          <div>
            <h1 className="text-lg font-bold leading-none">PayFlow</h1>
            <p className="text-xs text-indigo-300 mt-0.5">Talento Humano</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-indigo-600 text-white'
                  : 'text-indigo-200 hover:bg-indigo-800 hover:text-white'
              }`
            }
          >
            <Icon className="w-4 h-4 shrink-0" />
            {label}
            {label === 'Dashboard' && unread > 0 && (
              <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {unread}
              </span>
            )}
          </NavLink>
        ))}

        <div className="pt-4 mt-4 border-t border-indigo-700">
          <NavLink
            to="/orders/new"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-indigo-200 hover:bg-indigo-800 hover:text-white transition-colors"
          >
            <FileText className="w-4 h-4 shrink-0" />
            Nueva Orden
            <ChevronRight className="w-3 h-3 ml-auto" />
          </NavLink>
        </div>
      </nav>

      <div className="px-4 py-4 border-t border-indigo-700">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-sm font-semibold">
            {currentUser?.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{currentUser?.name}</p>
            <p className="text-xs text-indigo-300 capitalize">{currentUser?.role}</p>
          </div>
          <button onClick={logout} title="Cerrar sesión" className="text-indigo-300 hover:text-white transition-colors">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
