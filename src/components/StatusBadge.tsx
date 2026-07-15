import { OrderStatus } from '../types';

const config: Record<OrderStatus, { label: string; classes: string }> = {
  pendiente: { label: 'Pendiente', classes: 'bg-yellow-100 text-yellow-800' },
  en_revision: { label: 'En Revisión', classes: 'bg-blue-100 text-blue-800' },
  aprobado: { label: 'Aprobado', classes: 'bg-green-100 text-green-800' },
  ejecutado: { label: 'Ejecutado', classes: 'bg-indigo-100 text-indigo-800' },
  rechazado: { label: 'Rechazado', classes: 'bg-red-100 text-red-800' },
};

export default function StatusBadge({ status }: { status: OrderStatus }) {
  const { label, classes } = config[status];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${classes}`}>
      {label}
    </span>
  );
}
