import { useState, FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import { Star, CheckCircle2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import { SurveyResponse } from '../types';

export default function SurveyForm() {
  const { courseId } = useParams<{ courseId: string }>();
  const { courses, addSurveyResponse } = useStore();

  const course = courses.find(c => c.id === courseId) ?? courses[0];

  const [nps, setNps] = useState<number | null>(null);
  const [rating, setRating] = useState<number | null>(null);
  const [comments, setComments] = useState('');
  const [name, setName] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const npsLabels: Record<number, string> = {
    0: 'Muy improbable', 5: 'Neutro', 10: 'Muy probable'
  };

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (nps === null || rating === null) return;

    const response: SurveyResponse = {
      id: `sr${Date.now()}`,
      courseId: course?.id ?? 'c1',
      respondentName: name || undefined,
      responses: { q1: nps, q2: rating, q3: comments },
      npsScore: nps,
      overallRating: rating,
      comments,
      submittedAt: new Date().toISOString().split('T')[0],
    };
    addSurveyResponse(response);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Gracias por tu respuesta!</h2>
          <p className="text-gray-600">Tu opinión nos ayuda a mejorar continuamente la experiencia de capacitación.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg max-w-lg w-full overflow-hidden">
        <div className="bg-indigo-700 px-8 py-6 text-white">
          <div className="text-sm font-medium text-indigo-200 mb-1">Encuesta de satisfacción</div>
          <h1 className="text-xl font-bold">{course?.name ?? 'Curso de Capacitación'}</h1>
          {course && (
            <p className="text-indigo-200 text-sm mt-1">Facilitador: {course.facilitator} · {course.date}</p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="px-8 py-6 space-y-7">
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1">
              Tu nombre <span className="font-normal text-gray-400">(opcional)</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Ej: María García"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-3">
              ¿Qué tan probable es que recomiendes este curso? (NPS) *
            </label>
            <div className="flex gap-1 flex-wrap">
              {Array.from({ length: 11 }, (_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setNps(i)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium border transition-colors ${
                    nps === i
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : i <= 6
                      ? 'border-red-200 text-red-600 hover:bg-red-50'
                      : i <= 8
                      ? 'border-yellow-200 text-yellow-600 hover:bg-yellow-50'
                      : 'border-green-200 text-green-600 hover:bg-green-50'
                  }`}
                >
                  {i}
                </button>
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-1 px-1">
              <span>No recomendaría</span>
              <span>Definitivamente sí</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-3">
              Calificación general del curso *
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(null)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 transition-colors ${
                      star <= (hoverRating ?? rating ?? 0)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
              {rating && (
                <span className="text-sm text-gray-500 self-center ml-2">
                  {['', 'Malo', 'Regular', 'Bueno', 'Muy bueno', 'Excelente'][rating]}
                </span>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Comentarios y sugerencias
            </label>
            <textarea
              value={comments}
              onChange={e => setComments(e.target.value)}
              rows={4}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              placeholder="¿Qué fue lo que más te gustó? ¿Qué mejorarías?"
            />
          </div>

          <button
            type="submit"
            disabled={nps === null || rating === null}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Enviar encuesta
          </button>
        </form>
      </div>
    </div>
  );
}
