import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Clock, User, Calendar, DollarSign, FileText, AlertTriangle } from 'lucide-react';
import { useStore } from '../store/useStore';
import StatusBadge from '../components/StatusBadge';
import { OrderStatus, OrderHistoryEntry, PaymentOrder } from '../types';

const NEXT_STATUSES: Record<OrderStatus, OrderStatus[]> = {
  pendiente: ['en_revision', 'rechazado'],
  en_revision: ['aprobado', 'rechazado'],
  aprobado: ['ejecutado', 'rechazado'],
  ejecutado: [],
  rechazado: [],
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(amount);
}

const STATUS_LABELS: Record<OrderStatus, string> = {
  pendiente: 'Pendiente',
  en_revision: 'Enviar a Revisión',
  aprobado: 'Aprobar',
  ejecutado: 'Marcar Ejecutado',
  rechazado: 'Rechazar',
};

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { orders, updateOrder, addOrder, currentUser } = useStore();

  const isNew = id === 'new';
  const order = isNew ? null : orders.find(o => o.id === id);

  const [comment, setComment] = useState('');
  const [observations, setObservations] = useState(order?.observations ?? '');
  const [newOrderForm, setNewOrderForm] = useState({
    title: '', description: '', amount: '', category: 'Capacitación',
    priority: 'media' as PaymentOrder['priority'], dueDate: '',
  });

  if (!isNew && !order) {
    return (
      <div className="p-6">
        <p className="text-gray-500">Orden no encontrada.</p>
        <Link to="/orders" className="text-indigo-600 text-sm mt-2 inline-block">← Volver</Link>
      </div>
    );
  }

  async function handleStatusChange(newStatus: OrderStatus) {
    if (!order || !currentUser) return;
    const entry: OrderHistoryEntry = {
      id: `h${Date.now()}`,
      orderId: order.id,
      status: newStatus,
      comment: comment || `Estado cambiado a ${newStatus}`,
      changedBy: currentUser.name,
      changedAt: new Date().toISOString().split('T')[0],
    };
    const updated: PaymentOrder = {
      ...order,
      status: newStatus,
      observations,
      updatedAt: new Date().toISOString().split('T')[0],
      history: [...order.history, entry],
    };
    await updateOrder(updated);
    setComment('');
  }

  async function handleSaveObservations() {
    if (!order) return;
    await updateOrder({ ...order, observations, updatedAt: new Date().toISOString().split('T')[0] });
  }

  async function handleCreateOrder() {
    if (!currentUser) return;
    const id = `ord-${Date.now()}`;
    const newOrder: PaymentOrder = {
      id,
      code: `OP-2024-${String(Math.floor(Math.random() * 900) + 100)}`,
      title: newOrderForm.title,
      description: newOrderForm.description,
      amount: parseFloat(newOrderForm.amount) || 0,
      currency: 'COP',
      status: 'pendiente',
      priority: newOrderForm.priority,
      category: newOrderForm.category,
      requestedBy: currentUser.name,
      assignedTo: 'Carlos Ramírez',
      dueDate: newOrderForm.dueDate,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      observations: '',
      attachments: [],
      history: [{
        id: `h${Date.now()}`,
        orderId: id,
        status: 'pendiente',
        comment: 'Orden creada',
        changedBy: currentUser.name,
        changedAt: new Date().toISOString().split('T')[0],
      }],
    };
    await addOrder(newOrder);
    navigate(`/orders/${id}`);
  }

  if (isNew) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/orders" className="text-gray-400 hover:text-gray-600"><ArrowLeft className="w-5 h-5" /></Link>
          <h1 className="text-2xl font-bold text-gray-900">Nueva Orden de Pago</h1>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
            <input value={newOrderForm.title} onChange={e => setNewOrderForm(f => ({ ...f, title: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Ej: Capacitación Liderazgo Q3" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea value={newOrderForm.description} onChange={e => setNewOrderForm(f => ({ ...f, description: e.target.value }))}
              rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Describe el motivo del pago..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Monto (COP) *</label>
              <input type="number" value={newOrderForm.amount} onChange={e => setNewOrderForm(f => ({ ...f, amount: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="0" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha límite *</label>
              <input type="date" value={newOrderForm.dueDate} onChange={e => setNewOrderForm(f => ({ ...f, dueDate: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
              <select value={newOrderForm.category} onChange={e => setNewOrderForm(f => ({ ...f, category: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                {['Capacitación', 'Dotación', 'Bienestar', 'Tecnología', 'Selección', 'Salud', 'Otro'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prioridad</label>
              <select value={newOrderForm.priority} onChange={e => setNewOrderForm(f => ({ ...f, priority: e.target.value as PaymentOrder['priority'] }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="baja">Baja</option>
                <option value="media">Media</option>
                <option value="alta">Alta</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={handleCreateOrder}
              disabled={!newOrderForm.title || !newOrderForm.amount || !newOrderForm.dueDate}
              className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors">
              Crear Orden
            </button>
            <Link to="/orders" className="px-5 py-2 rounded-lg text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors">
              Cancelar
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const nextStatuses = NEXT_STATUSES[order!.status];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/orders" className="text-gray-400 hover:text-gray-600"><ArrowLeft className="w-5 h-5" /></Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-gray-900">{order!.title}</h1>
            <StatusBadge status={order!.status as OrderStatus} />
          </div>
          <p className="text-sm text-gray-500 font-mono mt-0.5">{order!.code}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Información de la Orden</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <InfoItem icon={<DollarSign className="w-4 h-4" />} label="Monto" value={formatCurrency(order!.amount)} />
              <InfoItem icon={<FileText className="w-4 h-4" />} label="Categoría" value={order!.category} />
              <InfoItem icon={<User className="w-4 h-4" />} label="Solicitante" value={order!.requestedBy} />
              <InfoItem icon={<User className="w-4 h-4" />} label="Asignado a" value={order!.assignedTo} />
              <InfoItem icon={<Calendar className="w-4 h-4" />} label="Creado" value={order!.createdAt} />
              <InfoItem icon={<Calendar className="w-4 h-4" />} label="Vencimiento" value={order!.dueDate} />
            </div>
            <div className="mt-4">
              <p className="text-xs font-medium text-gray-500 mb-1">Descripción</p>
              <p className="text-sm text-gray-700">{order!.description || 'Sin descripción.'}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-700">Observaciones</h3>
              <button onClick={handleSaveObservations} className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800">
                <Save className="w-3.5 h-3.5" /> Guardar
              </button>
            </div>
            <textarea
              value={observations}
              onChange={e => setObservations(e.target.value)}
              rows={4}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              placeholder="Agregar observaciones..."
            />
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Historial de Cambios</h3>
            <div className="space-y-3">
              {order!.history.map((h, i) => (
                <div key={h.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                    {i < order!.history.length - 1 && <div className="w-px flex-1 bg-gray-200 mt-1" />}
                  </div>
                  <div className="pb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <StatusBadge status={h.status as OrderStatus} />
                      <span className="text-xs text-gray-400">{h.changedAt} · {h.changedBy}</span>
                    </div>
                    {h.comment && <p className="text-sm text-gray-600 mt-1">{h.comment}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {nextStatuses.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Cambiar Estado</h3>
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                placeholder="Comentario (opcional)..."
              />
              <div className="space-y-2">
                {nextStatuses.map(status => (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(status)}
                    className={`w-full py-2 rounded-lg text-sm font-medium transition-colors ${
                      status === 'rechazado'
                        ? 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                  >
                    {STATUS_LABELS[status]}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Detalles</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Prioridad</span>
                <span className={`font-medium capitalize ${
                  order!.priority === 'alta' ? 'text-red-600' :
                  order!.priority === 'media' ? 'text-yellow-600' : 'text-green-600'
                }`}>{order!.priority}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Adjuntos</span>
                <span className="font-medium text-gray-800">{order!.attachments.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Actualizado</span>
                <span className="font-medium text-gray-800">{order!.updatedAt}</span>
              </div>
            </div>
          </div>

          {order!.attachments.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Adjuntos</h3>
              <ul className="space-y-2">
                {order!.attachments.map((file, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-indigo-600">
                    <FileText className="w-3.5 h-3.5" />
                    {file}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-gray-400 text-xs mb-0.5">
        {icon}
        <span>{label}</span>
      </div>
      <p className="text-sm font-medium text-gray-800">{value}</p>
    </div>
  );
}
