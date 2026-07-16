import { useMemo, useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { TrendingUp, Clock, CheckCircle2, Star, Bell, Sparkles } from 'lucide-react';
import { useStore } from '../store/useStore';
import { generateWeeklySummary } from '../utils/aiSummary';

const STATUS_COLORS: Record<string, string> = {
  pendiente: '#f59e0b',
  en_revision: '#3b82f6',
  aprobado: '#10b981',
  ejecutado: '#6366f1',
  rechazado: '#ef4444',
};

const STATUS_LABELS: Record<string, string> = {
  pendiente: 'Pendiente',
  en_revision: 'En Revisión',
  aprobado: 'Aprobado',
  ejecutado: 'Ejecutado',
  rechazado: 'Rechazado',
};

const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul'];

export default function Dashboard() {
  const { orders, surveyResponses, courses, alerts, markAppAlertRead } = useStore();
  const [showAI, setShowAI] = useState(false);

  const metrics = useMemo(() => {
    const pending = orders.filter(o => o.status === 'pendiente').length;
    const approved = orders.filter(o => o.status === 'aprobado').length;
    const executed = orders.filter(o => o.status === 'ejecutado').length;
    const rejected = orders.filter(o => o.status === 'rechazado').length;
    const overdue = orders.filter(o => {
      const due = new Date(o.dueDate);
      const now = new Date('2024-07-15');
      return due < now && o.status !== 'ejecutado' && o.status !== 'rechazado';
    }).length;

    const npsScores = surveyResponses.map(r => r.npsScore);
    const promoters = npsScores.filter(s => s >= 9).length;
    const detractors = npsScores.filter(s => s <= 6).length;
    const npsIndex = npsScores.length > 0
      ? Math.round(((promoters - detractors) / npsScores.length) * 100)
      : 0;

    const avgRating = surveyResponses.length > 0
      ? surveyResponses.reduce((s, r) => s + r.overallRating, 0) / surveyResponses.length
      : 0;

    const byStatus = ['pendiente', 'en_revision', 'aprobado', 'ejecutado', 'rechazado'].map(s => ({
      name: STATUS_LABELS[s],
      value: orders.filter(o => o.status === s).length,
      color: STATUS_COLORS[s],
    }));

    const weeklyTrend = [
      { week: 'S1 Jun', ordenes: 2, ejecutadas: 1 },
      { week: 'S2 Jun', ordenes: 3, ejecutadas: 2 },
      { week: 'S3 Jun', ordenes: 1, ejecutadas: 1 },
      { week: 'S4 Jun', ordenes: 4, ejecutadas: 2 },
      { week: 'S1 Jul', ordenes: 3, ejecutadas: 1 },
      { week: 'S2 Jul', ordenes: orders.length, ejecutadas: executed },
    ];

    const npsHistory = MONTHS.map((m, i) => ({
      mes: m,
      nps: [30, 42, 38, 55, 60, 58, npsIndex][i] ?? npsIndex,
    }));

    const ratingByFacilitator = courses.map(c => {
      const cResponses = surveyResponses.filter(r => r.courseId === c.id);
      const avg = cResponses.length > 0
        ? cResponses.reduce((s, r) => s + r.overallRating, 0) / cResponses.length
        : 0;
      return { facilitador: c.facilitator.split(' ').slice(1).join(' '), rating: Math.round(avg * 10) / 10, respuestas: cResponses.length };
    }).filter(f => f.respuestas > 0);

    return { pending, approved, executed, rejected, overdue, npsIndex, avgRating, byStatus, weeklyTrend, npsHistory, ratingByFacilitator };
  }, [orders, surveyResponses, courses]);

  const unreadAlerts = alerts.filter(a => !a.isRead);
  const aiSummary = generateWeeklySummary(orders, surveyResponses, courses);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Ejecutivo</h1>
          <p className="text-sm text-gray-500 mt-0.5">Semana del 8 al 14 de julio 2024</p>
        </div>
        <button
          onClick={() => setShowAI(!showAI)}
          className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
        >
          <Sparkles className="w-4 h-4" />
          Resumen IA
        </button>
      </div>

      {showAI && (
        <div className="mb-6 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <span className="font-semibold text-purple-800">Análisis IA — Generado automáticamente</span>
          </div>
          <div className="text-sm text-gray-700 space-y-2 whitespace-pre-line">
            {aiSummary.split('\n').map((line, i) => {
              const formatted = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
              return <p key={i} dangerouslySetInnerHTML={{ __html: formatted }} />;
            })}
          </div>
        </div>
      )}

      {unreadAlerts.length > 0 && (
        <div className="mb-6 space-y-2">
          {unreadAlerts.map(alert => (
            <div key={alert.id} className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
              <Bell className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-amber-800">{alert.title}</p>
                <p className="text-xs text-amber-700 mt-0.5">{alert.message}</p>
              </div>
              <button onClick={() => markAppAlertRead(alert.id)} className="text-xs text-amber-600 hover:text-amber-800 shrink-0">
                Marcar leída
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard icon={<Clock className="w-5 h-5 text-yellow-600" />} label="Pendientes" value={metrics.pending} bg="bg-yellow-50" />
        <MetricCard icon={<CheckCircle2 className="w-5 h-5 text-green-600" />} label="Ejecutadas" value={metrics.executed} bg="bg-green-50" />
        <MetricCard icon={<TrendingUp className="w-5 h-5 text-indigo-600" />} label="NPS Cursos" value={`${metrics.npsIndex}`} bg="bg-indigo-50" suffix="pts" />
        <MetricCard icon={<Star className="w-5 h-5 text-purple-600" />} label="Rating Promedio" value={metrics.avgRating.toFixed(1)} bg="bg-purple-50" suffix="/ 5" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Tendencia de Órdenes por Semana</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={metrics.weeklyTrend}>
              <defs>
                <linearGradient id="gOrdenes" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="week" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="ordenes" name="Creadas" stroke="#6366f1" fill="url(#gOrdenes)" strokeWidth={2} />
              <Area type="monotone" dataKey="ejecutadas" name="Ejecutadas" stroke="#10b981" fill="none" strokeWidth={2} strokeDasharray="4 2" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Estado de Órdenes</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={metrics.byStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => value > 0 ? `${name}: ${value}` : ''} labelLine={false}>
                {metrics.byStatus.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Evolución NPS Mensual</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={metrics.npsHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="nps" name="NPS" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Rating por Facilitador</h3>
          <div className="space-y-3">
            {metrics.ratingByFacilitator.map((f, i) => (
              <div key={i}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-700 truncate max-w-[180px]">{f.facilitador}</span>
                  <span className="font-semibold text-gray-900 flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                    {f.rating}
                    <span className="text-gray-400 font-normal text-xs">({f.respuestas})</span>
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-500 rounded-full"
                    style={{ width: `${(f.rating / 5) * 100}%` }}
                  />
                </div>
              </div>
            ))}
            {metrics.ratingByFacilitator.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-6">Sin datos aún</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ icon, label, value, bg, suffix }: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  bg: string;
  suffix?: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className={`inline-flex w-10 h-10 rounded-lg ${bg} items-center justify-center mb-3`}>
        {icon}
      </div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mt-0.5">
        {value}{suffix && <span className="text-sm font-normal text-gray-500 ml-1">{suffix}</span>}
      </p>
    </div>
  );
}
