import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://fpajxehotrvhlmmxrjgj.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZwYWp4ZWhvdHJ2aGxtbXhyamdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQxMzc5NDMsImV4cCI6MjA5OTcxMzk0M30.90eMCHtNlADod0CiTwkbU25mtVm7n6uVR_7--yl6vnI'
);

async function seed() {
  console.log('Seeding users...');
  const { error: e1 } = await supabase.from('users').upsert([
    { id: 'u1', name: 'Laura Mendoza',  email: 'laura.mendoza@empresa.com',  role: 'analista', department: 'Talento Humano' },
    { id: 'u2', name: 'Carlos Ramirez', email: 'carlos.ramirez@empresa.com', role: 'gerencia', department: 'Gerencia General' },
    { id: 'u3', name: 'Ana Torres',     email: 'ana.torres@empresa.com',     role: 'analista', department: 'Talento Humano' },
  ]);
  if (e1) console.error('users error:', e1.message); else console.log('users OK');

  console.log('Seeding courses...');
  const { error: e2 } = await supabase.from('courses').upsert([
    { id: 'c1', name: 'Liderazgo Transformacional', facilitator: 'Dr. Andres Vega',      date: '2024-06-15', department: 'Gerencia',       participants: 18 },
    { id: 'c2', name: 'Excel Avanzado para RRHH',   facilitator: 'Ing. Patricia Soto',   date: '2024-06-22', department: 'Talento Humano', participants: 12 },
    { id: 'c3', name: 'Comunicacion Asertiva',      facilitator: 'Lic. Jorge Ruiz',      date: '2024-07-05', department: 'Todos',          participants: 35 },
    { id: 'c4', name: 'Seguridad Industrial Basica',facilitator: 'Ing. Roberto Flores',  date: '2024-07-10', department: 'Operaciones',    participants: 42 },
  ]);
  if (e2) console.error('courses error:', e2.message); else console.log('courses OK');

  console.log('Seeding payment_orders...');
  const { error: e3 } = await supabase.from('payment_orders').upsert([
    { id:'ord-001', code:'OP-2024-001', title:'Capacitacion Liderazgo Q2',       description:'Pago a proveedor externo por taller de liderazgo.',  amount:4500,  currency:'USD', status:'aprobado',    priority:'alta',  category:'Capacitacion', requested_by:'Laura Mendoza',  assigned_to:'Carlos Ramirez', due_date:'2024-07-20', created_at:'2024-07-01', updated_at:'2024-07-10', observations:'Verificar factura antes del pago.', attachments:['factura_liderazgo.pdf'] },
    { id:'ord-002', code:'OP-2024-002', title:'Dotacion Uniformes Semestre II',   description:'Compra de uniformes para personal operativo.',         amount:8200,  currency:'USD', status:'pendiente',   priority:'media', category:'Dotacion',      requested_by:'Ana Torres',     assigned_to:'Carlos Ramirez', due_date:'2024-07-25', created_at:'2024-07-08', updated_at:'2024-07-08', observations:'', attachments:[] },
    { id:'ord-003', code:'OP-2024-003', title:'Bienestar - Dia de la Familia',    description:'Logistica y catering para evento corporativo.',        amount:3100,  currency:'USD', status:'ejecutado',   priority:'baja',  category:'Bienestar',     requested_by:'Laura Mendoza',  assigned_to:'Carlos Ramirez', due_date:'2024-06-30', created_at:'2024-06-15', updated_at:'2024-07-01', observations:'Evento exitoso. Todas las facturas canceladas.', attachments:['factura_catering.pdf','informe_evento.pdf'] },
    { id:'ord-004', code:'OP-2024-004', title:'Software HRIS Licencia Anual',     description:'Renovacion licencia anual sistema RRHH.',              amount:12000, currency:'USD', status:'en_revision', priority:'alta',  category:'Tecnologia',    requested_by:'Laura Mendoza',  assigned_to:'Carlos Ramirez', due_date:'2024-07-15', created_at:'2024-07-03', updated_at:'2024-07-11', observations:'Pendiente validacion presupuestal con finanzas.', attachments:['cotizacion_hris.pdf'] },
    { id:'ord-005', code:'OP-2024-005', title:'Seleccion - Avisos Empleo',        description:'Publicacion de vacantes en portales de empleo.',       amount:850,   currency:'USD', status:'rechazado',   priority:'baja',  category:'Seleccion',     requested_by:'Ana Torres',     assigned_to:'Carlos Ramirez', due_date:'2024-07-10', created_at:'2024-07-05', updated_at:'2024-07-09', observations:'Usar portales gratuitos disponibles.', attachments:[] },
    { id:'ord-006', code:'OP-2024-006', title:'Medicina Preventiva - Examenes',   description:'Examenes medicos periodicos para colaboradores.',      amount:5600,  currency:'USD', status:'pendiente',   priority:'media', category:'Salud',         requested_by:'Laura Mendoza',  assigned_to:'Carlos Ramirez', due_date:'2024-07-30', created_at:'2024-07-12', updated_at:'2024-07-12', observations:'', attachments:[] },
  ]);
  if (e3) console.error('orders error:', e3.message); else console.log('payment_orders OK');

  console.log('Seeding order_history...');
  const { error: e4 } = await supabase.from('order_history').upsert([
    { id:'h1',  order_id:'ord-001', status:'pendiente',   comment:'Orden creada',                            changed_by:'Laura Mendoza',  changed_at:'2024-07-01' },
    { id:'h2',  order_id:'ord-001', status:'en_revision', comment:'En revision por gerencia',                changed_by:'Carlos Ramirez', changed_at:'2024-07-05' },
    { id:'h3',  order_id:'ord-001', status:'aprobado',    comment:'Aprobado. Proceder con pago.',            changed_by:'Carlos Ramirez', changed_at:'2024-07-10' },
    { id:'h4',  order_id:'ord-002', status:'pendiente',   comment:'Orden creada',                            changed_by:'Ana Torres',     changed_at:'2024-07-08' },
    { id:'h5',  order_id:'ord-003', status:'pendiente',   comment:'Orden creada',                            changed_by:'Laura Mendoza',  changed_at:'2024-06-15' },
    { id:'h6',  order_id:'ord-003', status:'aprobado',    comment:'Aprobado',                                changed_by:'Carlos Ramirez', changed_at:'2024-06-18' },
    { id:'h7',  order_id:'ord-003', status:'ejecutado',   comment:'Pago realizado exitosamente',             changed_by:'Laura Mendoza',  changed_at:'2024-07-01' },
    { id:'h8',  order_id:'ord-004', status:'pendiente',   comment:'Orden creada',                            changed_by:'Laura Mendoza',  changed_at:'2024-07-03' },
    { id:'h9',  order_id:'ord-004', status:'en_revision', comment:'Solicitando validacion presupuestal',     changed_by:'Carlos Ramirez', changed_at:'2024-07-11' },
    { id:'h10', order_id:'ord-005', status:'pendiente',   comment:'Orden creada',                            changed_by:'Ana Torres',     changed_at:'2024-07-05' },
    { id:'h11', order_id:'ord-005', status:'rechazado',   comment:'Existen portales gratuitos disponibles.', changed_by:'Carlos Ramirez', changed_at:'2024-07-09' },
    { id:'h12', order_id:'ord-006', status:'pendiente',   comment:'Orden creada',                            changed_by:'Laura Mendoza',  changed_at:'2024-07-12' },
  ]);
  if (e4) console.error('order_history error:', e4.message); else console.log('order_history OK');

  console.log('Seeding survey_responses...');
  const { error: e5 } = await supabase.from('survey_responses').upsert([
    { id:'sr1', course_id:'c1', respondent_name:'Maria G.',  responses:{q1:9, q2:5,  q3:'Excelente metodologia, muy practico.'},          nps_score:9,  overall_rating:5, comments:'Excelente metodologia, muy practico.',          submitted_at:'2024-06-16' },
    { id:'sr2', course_id:'c1', respondent_name:'Pedro L.',  responses:{q1:8, q2:4,  q3:'Buen contenido, los ejercicios fueron utiles.'}, nps_score:8,  overall_rating:4, comments:'Buen contenido, los ejercicios fueron utiles.', submitted_at:'2024-06-16' },
    { id:'sr3', course_id:'c1', respondent_name:'Sofia M.',  responses:{q1:10,q2:5,  q3:'El facilitador domina el tema a profundidad.'},  nps_score:10, overall_rating:5, comments:'El facilitador domina el tema a profundidad.',  submitted_at:'2024-06-17' },
    { id:'sr4', course_id:'c2', respondent_name:'Luis T.',   responses:{q1:7, q2:4,  q3:'Util pero muy rapido el ritmo.'},                nps_score:7,  overall_rating:4, comments:'Util pero muy rapido el ritmo.',                submitted_at:'2024-06-23' },
    { id:'sr5', course_id:'c2', respondent_name:'Carmen R.', responses:{q1:9, q2:5,  q3:'Aprendi muchas funciones nuevas.'},              nps_score:9,  overall_rating:5, comments:'Aprendi muchas funciones nuevas.',              submitted_at:'2024-06-23' },
    { id:'sr6', course_id:'c3', respondent_name:'Jose A.',   responses:{q1:6, q2:3,  q3:'El espacio era pequeno para el grupo.'},         nps_score:6,  overall_rating:3, comments:'El espacio era pequeno para el grupo.',         submitted_at:'2024-07-06' },
    { id:'sr7', course_id:'c3', respondent_name:'Valeria N.',responses:{q1:8, q2:4,  q3:'Dinamicas muy interesantes.'},                  nps_score:8,  overall_rating:4, comments:'Dinamicas muy interesantes.',                  submitted_at:'2024-07-06' },
    { id:'sr8', course_id:'c4', respondent_name:'Miguel F.', responses:{q1:9, q2:5,  q3:'Indispensable para el trabajo en campo.'},      nps_score:9,  overall_rating:5, comments:'Indispensable para el trabajo en campo.',      submitted_at:'2024-07-11' },
    { id:'sr9', course_id:'c4', respondent_name:'Elena P.',  responses:{q1:7, q2:4,  q3:'Buen curso, lo recomendaria.'},                 nps_score:7,  overall_rating:4, comments:'Buen curso, lo recomendaria.',                 submitted_at:'2024-07-11' },
  ]);
  if (e5) console.error('survey_responses error:', e5.message); else console.log('survey_responses OK');

  console.log('Seeding alerts...');
  const { error: e6 } = await supabase.from('alerts').upsert([
    { id:'a1', type:'orden_retrasada',     title:'Orden vencida',         message:'OP-2024-004 supera su fecha limite sin ejecutarse.',          related_id:'ord-004', is_read:false, created_at:'2024-07-12' },
    { id:'a2', type:'aprobacion_pendiente',title:'Aprobacion pendiente',  message:'OP-2024-002 lleva 4 dias sin aprobacion.',                    related_id:'ord-002', is_read:false, created_at:'2024-07-12' },
    { id:'a3', type:'encuesta_completada', title:'Encuesta completada',   message:'Curso Seguridad Industrial Basica recibio 9 respuestas.',     related_id:'c4',      is_read:true,  created_at:'2024-07-11' },
  ]);
  if (e6) console.error('alerts error:', e6.message); else console.log('alerts OK');

  console.log('\nSeed completo!');
}

seed().catch(console.error);
