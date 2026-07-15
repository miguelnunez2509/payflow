import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Plus, ChevronRight, AlertCircle } from 'lucide-react';
import { useStore } from '../store/useStore';
import StatusBadge from '../components/StatusBadge';
import type { OrderStatus } from '../types';

const STATUSES: { value: string; label: string }[] = [
  { value: '', label: 'Todos' },
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'en_revision', label: 'En Revisión' },
  { value: 'aprobado', label: 'Aprobado' },
  { value: 'ejecutado', label: 'Ejecutado' },
  { value: 'rechazado', label: 'Rechazado' },
];

export default function OrdersInbox() {
  const { orders } = useStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const today = new Date('2024-07-15');

  const filtered = orders.filter(o => {
    const matchSearch =
      o.title.toLowerCase().includes(search.toLowerCase()) ||
      o.code.toLowerCase().includes(search.toLowerCase()) ||
      o.requestedBy.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === '' || o.status === statusFilter;
    const matchDate = !dateFilter || o.createdAt >= dateFilter;
    return matchSearch && matchStatus && matchDate;
  });

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(amount);

  const isOverdue = (o: typeof orders[0]) => {
    const due = new Date(o.dueDate);
    return due < today && o.status !== 'ejecutado' && o.status !== 'rechazado';
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Órdenes de Pago</h1>
          <p className="text-sm text-gray-500 mt-0.5">{filtered.length} órdenes encontradas</p>
        </div>
        <Link
          to="/orders/new"
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nueva Orden
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por código, título o solicitante..."
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
            <input
              type="date"
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value)}
              className="border border-gray-300 rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Código</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Título</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3 hidden md:table-cell">Monto</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3 hidden lg:table-cell">Solicitante</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3 hidden lg:table-cell">Vencimiento</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Estado</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center text-sm text-gray-400 py-12">
                  No se encontraron órdenes con los filtros aplicados.
                </td>
              </tr>
            ) : (
              filtered.map(order => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      {isOverdue(order) && <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />}
                      <span className="text-sm font-mono text-gray-700">{order.code}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-gray-900">{order.title}</p>
                    <p className="text-xs text-gray-400 capitalize">{order.category}</p>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-sm text-gray-700">{formatCurrency(order.amount)}</span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className="text-sm text-gray-700">{order.requestedBy}</span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className={`text-sm ${isOverdue(order) ? 'text-red-600 font-medium' : 'text-gray-700'}`}>
                      {order.dueDate}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={order.status as OrderStatus} />
                  </td>
                  <td className="px-4 py-3">
                    <Link to={`/orders/${order.id}`} className="text-indigo-600 hover:text-indigo-800">
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
