import { PaymentOrder, SurveyResponse, Course } from '../types';

export function generateWeeklySummary(
  orders: PaymentOrder[],
  responses: SurveyResponse[],
  courses: Course[]
): string {
  const pending = orders.filter(o => o.status === 'pendiente').length;
  const overdue = orders.filter(o => {
    const due = new Date(o.dueDate);
    const now = new Date();
    return due < now && o.status !== 'ejecutado' && o.status !== 'rechazado';
  }).length;
  const executed = orders.filter(o => o.status === 'ejecutado').length;

  const npsScores = responses.map(r => r.npsScore);
  const avgNPS = npsScores.length > 0
    ? Math.round(npsScores.reduce((a, b) => a + b, 0) / npsScores.length * 10) / 10
    : 0;

  const promoters = npsScores.filter(s => s >= 9).length;
  const detractors = npsScores.filter(s => s <= 6).length;
  const npsIndex = npsScores.length > 0
    ? Math.round(((promoters - detractors) / npsScores.length) * 100)
    : 0;

  const recentCourse = courses.length > 0 ? courses[courses.length - 1] : null;

  let summary = `**Resumen ejecutivo semanal — Semana del 8 al 14 de julio 2024**\n\n`;

  summary += `**Órdenes de Pago:** Esta semana se gestionaron ${orders.length} órdenes en total. `;
  summary += `${pending} permanecen en estado pendiente`;
  if (overdue > 0) {
    summary += `, de las cuales ${overdue} superan su fecha límite — se recomienda acción inmediata`;
  }
  summary += `. ${executed} órdenes fueron ejecutadas exitosamente este período.\n\n`;

  summary += `**Capacitación y Encuestas:** El índice NPS promedio de los cursos recientes se ubica en **${npsIndex}** `;
  if (npsIndex >= 50) {
    summary += `(excelente), reflejando alta satisfacción de los participantes. `;
  } else if (npsIndex >= 20) {
    summary += `(bueno), con oportunidades de mejora identificadas en metodología y logística. `;
  } else {
    summary += `(requiere atención), se detectaron comentarios sobre ritmo del curso y condiciones del espacio. `;
  }
  summary += `Se recopilaron ${responses.length} respuestas en ${courses.length} cursos activos.`;

  if (recentCourse) {
    summary += ` El curso más reciente, **"${recentCourse.name}"** facilitado por ${recentCourse.facilitator}, contó con ${recentCourse.participants} participantes.\n\n`;
  } else {
    summary += `\n\n`;
  }

  summary += `**Recomendación IA:** `;
  if (overdue > 0 && npsIndex < 30) {
    summary += `Prioridad alta en dos frentes: resolver las órdenes vencidas esta semana y revisar la metodología de los facilitadores con calificaciones bajas. Se sugiere reunión de seguimiento con gerencia.`;
  } else if (overdue > 0) {
    summary += `Atender las órdenes retrasadas es la prioridad inmediata. Los indicadores de capacitación son positivos — mantener el ritmo.`;
  } else if (npsIndex < 30) {
    summary += `Las órdenes de pago están al día. Focalizar esfuerzos en mejorar la experiencia de capacitación: revisar facilitadores y condiciones logísticas.`;
  } else {
    summary += `Los indicadores están dentro de rangos óptimos. Continuar el seguimiento rutinario y preparar el informe mensual para la próxima semana.`;
  }

  return summary;
}
