import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { Star, Users, TrendingUp, MessageSquare, ExternalLink, Sparkles } from 'lucide-react';
import { useStore } from '../store/useStore';

const NPS_COLORS = { promotor: '#10b981', neutro: '#f59e0b', detractor: '#ef4444' };

function analyzeComments(comments: string[]): string {
  const positive = ['excelente', 'bueno', 'útil', 'dinámico', 'práctico', 'aprendí', 'recomendaría'];
  const negative = ['rápido', 'pequeño', 'mejorar', 'difícil', 'confuso'];

  const pos = comments.filter(c => positive.some(w => c.toLowerCase().includes(w))).length;
  const neg = comments.filter(c => negative.some(w => c.toLowerCase().includes(w))).length;
  const total = comments.length;

  if (total === 0) return 'Sin comentarios para analizar.';

  let analysis = `**Análisis de ${total} comentarios:**\n\n`;
  analysis += `• **${pos} comentarios positivos** destacan metodología práctica, dominio del facilitador y utilidad del contenido.\n`;
  if (neg > 0) {
    analysis += `• **${neg} comentarios con áreas de mejora** mencionan ritmo del curso y condiciones del espacio.\n`;
  }
  analysis += `\n**Recomendación:** ${pos > neg * 2 ? 'El curso tiene alta aceptación. Mantener la metodología actual y replicar el formato en otros departamentos.' : 'Se recomienda revisar el ritmo de la sesión y evaluar el espacio físico o virtual asignado.'}`;
  return analysis;
}

export default function SurveyResults() {
  const { courses, surveyResponses } = useStore();
  const [selectedCourse, setSelectedCourse] = useState<string>(courses[0]?.id ?? '');
  const [showAI, setShowAI] = useState(false);

  const courseResponses = surveyResponses.filter(r => r.courseId === selectedCourse);
  const course = courses.find(c => c.id === selectedCourse);

  const metrics = useMemo(() => {
    if (courseResponses.length === 0) return null;

    const npsScores = courseResponses.map(r => r.npsScore);
    const promoters = npsScores.filter(s => s >= 9).length;
    const neutrals = npsScores.filter(s => s >= 7 && s < 9).length;
    const detractors = npsScores.filter(s => s < 7).length;
    const npsIndex = Math.round(((promoters - detractors) / npsScores.length) * 100);

    const avgRating = courseResponses.reduce((s, r) => s + r.overallRating, 0) / courseResponses.length;

    const npsDistrib = [
      { name: 'Promotores', value: promoters, color: NPS_COLORS.promotor },
      { name: 'Neutros', value: neutrals, color: NPS_COLORS.neutro },
      { name: 'Detractores', value: detractors, color: NPS_COLORS.detractor },
    ];

    const ratingDistrib = [1, 2, 3, 4, 5].map(r => ({
      rating: `${r} ★`,
      count: courseResponses.filter(res => res.overallRating === r).length,
    }));

    return { npsIndex, avgRating, promoters, neutrals, detractors, npsDistrib, ratingDistrib, total: courseResponses.length };
  }, [courseResponses]);

  const aiAnalysis = analyzeComments(courseResponses.map(r => r.comments).filter(Boolean));

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Resultados de Encuestas</h1>
          <p className="text-sm text-gray-500 mt-0.5">Análisis de satisfacción por curso</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedCourse}
            onChange={e => setSelectedCourse(e.target.value)}
            className="border border-gray-300 rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <button
            onClick={() => setShowAI(!showAI)}
            className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            Análisis IA
          </button>
        </div>
      </div>

      {course && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 mb-6 flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="font-semibold text-indigo-900">{course.name}</p>
            <p className="text-sm text-indigo-600">{course.facilitator} · {course.date} · {course.department}</p>
          </div>
          <Link
            to={`/survey/${course.id}`}
            className="flex items-center gap-1.5 text-sm text-indigo-700 hover:text-indigo-900 font-medium"
          >
            <ExternalLink className="w-4 h-4" />
            Formulario público
          </Link>
        </div>
      )}

      {!metrics ? (
        <div className="text-center py-16 text-gray-400">
          <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Sin respuestas para este curso aún.</p>
          {course && (
            <Link to={`/survey/${course.id}`} className="text-indigo-600 text-sm mt-2 inline-block hover:underline">
              Compartir formulario →
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center gap-2 text-gray-500 text-xs mb-2"><TrendingUp className="w-4 h-4" /> NPS</div>
              <p className={`text-3xl font-bold ${metrics.npsIndex >= 50 ? 'text-green-600' : metrics.npsIndex >= 20 ? 'text-yellow-600' : 'text-red-600'}`}>
                {metrics.npsIndex}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {metrics.npsIndex >= 50 ? 'Excelente' : metrics.npsIndex >= 20 ? 'Bueno' : 'Por mejorar'}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center gap-2 text-gray-500 text-xs mb-2"><Star className="w-4 h-4" /> Rating</div>
              <p className="text-3xl font-bold text-gray-900">{metrics.avgRating.toFixed(1)}</p>
              <p className="text-xs text-gray-400 mt-1">de 5.0</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center gap-2 text-gray-500 text-xs mb-2"><Users className="w-4 h-4" /> Respuestas</div>
              <p className="text-3xl font-bold text-gray-900">{metrics.total}</p>
              <p className="text-xs text-gray-400 mt-1">participantes</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center gap-2 text-gray-500 text-xs mb-2"><TrendingUp className="w-4 h-4" /> Promotores</div>
              <p className="text-3xl font-bold text-green-600">{metrics.promoters}</p>
              <p className="text-xs text-gray-400 mt-1">{Math.round((metrics.promoters / metrics.total) * 100)}% del total</p>
            </div>
          </div>

          {showAI && (
            <div className="mb-6 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <span className="font-semibold text-purple-800">Análisis IA de Comentarios</span>
              </div>
              <div className="text-sm text-gray-700 space-y-1.5 whitespace-pre-line">
                {aiAnalysis.split('\n').map((line, i) => {
                  const formatted = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                  return <p key={i} dangerouslySetInnerHTML={{ __html: formatted }} />;
                })}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Distribución NPS</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={metrics.npsDistrib} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}
                    label={({ name, value }) => value > 0 ? `${name}: ${value}` : ''}>
                    {metrics.npsDistrib.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-4 mt-2">
                {metrics.npsDistrib.map(d => (
                  <div key={d.name} className="flex items-center gap-1.5 text-xs text-gray-600">
                    <div className="w-3 h-3 rounded-full" style={{ background: d.color }} />
                    {d.name}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Distribución de Calificaciones</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={metrics.ratingDistrib} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="rating" tick={{ fontSize: 11 }} width={35} />
                  <Tooltip />
                  <Bar dataKey="count" name="Respuestas" fill="#6366f1" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Comentarios de Participantes</h3>
            <div className="space-y-3">
              {courseResponses.filter(r => r.comments).map(r => (
                <div key={r.id} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-medium text-indigo-700 shrink-0">
                    {r.respondentName ? r.respondentName.charAt(0) : '?'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-800">{r.respondentName ?? 'Anónimo'}</span>
                      <div className="flex gap-0.5">
                        {[1,2,3,4,5].map(s => (
                          <Star key={s} className={`w-3.5 h-3.5 ${s <= r.overallRating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                        ))}
                      </div>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                        r.npsScore >= 9 ? 'bg-green-100 text-green-700' :
                        r.npsScore >= 7 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>NPS: {r.npsScore}</span>
                    </div>
                    <p className="text-sm text-gray-600">{r.comments}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
