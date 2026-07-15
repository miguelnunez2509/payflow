-- ============================================================
-- PayFlow — Schema + Seed Data
-- Ejecutar completo en Supabase → SQL Editor → Run
-- ============================================================

-- 1. USUARIOS
CREATE TABLE IF NOT EXISTS public.users (
  id          text PRIMARY KEY,
  name        text NOT NULL,
  email       text UNIQUE NOT NULL,
  role        text NOT NULL CHECK (role IN ('analista', 'gerencia')),
  department  text NOT NULL DEFAULT ''
);

-- 2. ÓRDENES DE PAGO
CREATE TABLE IF NOT EXISTS public.payment_orders (
  id           text PRIMARY KEY,
  code         text UNIQUE NOT NULL,
  title        text NOT NULL,
  description  text DEFAULT '',
  amount       numeric NOT NULL DEFAULT 0,
  currency     text NOT NULL DEFAULT 'COP',
  status       text NOT NULL DEFAULT 'pendiente',
  priority     text NOT NULL DEFAULT 'media',
  category     text NOT NULL DEFAULT '',
  requested_by text NOT NULL,
  assigned_to  text NOT NULL,
  due_date     text NOT NULL,
  created_at   text NOT NULL,
  updated_at   text NOT NULL,
  observations text DEFAULT '',
  attachments  text[] DEFAULT '{}'
);

-- 3. HISTORIAL DE ÓRDENES
CREATE TABLE IF NOT EXISTS public.order_history (
  id          text PRIMARY KEY,
  order_id    text NOT NULL REFERENCES public.payment_orders(id) ON DELETE CASCADE,
  status      text NOT NULL,
  comment     text DEFAULT '',
  changed_by  text NOT NULL,
  changed_at  text NOT NULL
);

-- 4. CURSOS
CREATE TABLE IF NOT EXISTS public.courses (
  id           text PRIMARY KEY,
  name         text NOT NULL,
  facilitator  text NOT NULL,
  date         text NOT NULL,
  department   text NOT NULL DEFAULT '',
  participants integer NOT NULL DEFAULT 0
);

-- 5. RESPUESTAS DE ENCUESTA
CREATE TABLE IF NOT EXISTS public.survey_responses (
  id               text PRIMARY KEY,
  course_id        text NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  respondent_name  text,
  responses        jsonb DEFAULT '{}',
  nps_score        integer NOT NULL CHECK (nps_score >= 0 AND nps_score <= 10),
  overall_rating   integer NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),
  comments         text DEFAULT '',
  submitted_at     text NOT NULL
);

-- 6. ALERTAS
CREATE TABLE IF NOT EXISTS public.alerts (
  id          text PRIMARY KEY,
  type        text NOT NULL,
  title       text NOT NULL,
  message     text NOT NULL,
  related_id  text,
  is_read     boolean NOT NULL DEFAULT false,
  created_at  text NOT NULL
);

-- ============================================================
-- SEED DATA — Datos de demostración
-- ============================================================

INSERT INTO public.users (id, name, email, role, department) VALUES
  ('u1', 'Laura Mendoza',   'laura.mendoza@empresa.com',   'analista',  'Talento Humano'),
  ('u2', 'Carlos Ramírez',  'carlos.ramirez@empresa.com',  'gerencia',  'Gerencia General'),
  ('u3', 'Ana Torres',      'ana.torres@empresa.com',      'analista',  'Talento Humano')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.courses (id, name, facilitator, date, department, participants) VALUES
  ('c1', 'Liderazgo Transformacional', 'Dr. Andrés Vega',       '2024-06-15', 'Gerencia',         18),
  ('c2', 'Excel Avanzado para RRHH',   'Ing. Patricia Soto',    '2024-06-22', 'Talento Humano',   12),
  ('c3', 'Comunicación Asertiva',      'Lic. Jorge Ruiz',       '2024-07-05', 'Todos',            35),
  ('c4', 'Seguridad Industrial Básica','Ing. Roberto Flores',   '2024-07-10', 'Operaciones',      42)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.payment_orders
  (id, code, title, description, amount, currency, status, priority, category,
   requested_by, assigned_to, due_date, created_at, updated_at, observations, attachments)
VALUES
  ('ord-001','OP-2024-001','Capacitación Liderazgo Q2',
   'Pago a proveedor externo por taller de liderazgo para jefaturas.',
   4500000,'COP','aprobado','alta','Capacitación',
   'Laura Mendoza','Carlos Ramírez','2024-07-20','2024-07-01','2024-07-10',
   'Verificar factura antes del pago.',ARRAY['factura_liderazgo.pdf']),

  ('ord-002','OP-2024-002','Dotación Uniformes Semestre II',
   'Compra de uniformes para personal operativo.',
   8200000,'COP','pendiente','media','Dotación',
   'Ana Torres','Carlos Ramírez','2024-07-25','2024-07-08','2024-07-08',
   '',ARRAY[]::text[]),

  ('ord-003','OP-2024-003','Bienestar — Día de la Familia',
   'Logística y catering para evento corporativo.',
   3100000,'COP','ejecutado','baja','Bienestar',
   'Laura Mendoza','Carlos Ramírez','2024-06-30','2024-06-15','2024-07-01',
   'Evento exitoso. Todas las facturas canceladas.',ARRAY['factura_catering.pdf','informe_evento.pdf']),

  ('ord-004','OP-2024-004','Software HRIS Licencia Anual',
   'Renovación licencia anual sistema de gestión de RRHH.',
   12000000,'COP','en_revision','alta','Tecnología',
   'Laura Mendoza','Carlos Ramírez','2024-07-15','2024-07-03','2024-07-11',
   'Pendiente validación presupuestal con finanzas.',ARRAY['cotizacion_hris.pdf']),

  ('ord-005','OP-2024-005','Selección — Avisos Empleo',
   'Publicación de vacantes en portales de empleo.',
   850000,'COP','rechazado','baja','Selección',
   'Ana Torres','Carlos Ramírez','2024-07-10','2024-07-05','2024-07-09',
   'Usar portales gratuitos disponibles.',ARRAY[]::text[]),

  ('ord-006','OP-2024-006','Medicina Preventiva — Exámenes',
   'Exámenes médicos periódicos para colaboradores.',
   5600000,'COP','pendiente','media','Salud',
   'Laura Mendoza','Carlos Ramírez','2024-07-30','2024-07-12','2024-07-12',
   '',ARRAY[]::text[])
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.order_history (id, order_id, status, comment, changed_by, changed_at) VALUES
  ('h1','ord-001','pendiente',   'Orden creada',                            'Laura Mendoza',  '2024-07-01'),
  ('h2','ord-001','en_revision', 'En revisión por gerencia',                'Carlos Ramírez', '2024-07-05'),
  ('h3','ord-001','aprobado',    'Aprobado. Proceder con pago.',            'Carlos Ramírez', '2024-07-10'),
  ('h4','ord-002','pendiente',   'Orden creada',                            'Ana Torres',     '2024-07-08'),
  ('h5','ord-003','pendiente',   'Orden creada',                            'Laura Mendoza',  '2024-06-15'),
  ('h6','ord-003','aprobado',    'Aprobado',                                'Carlos Ramírez', '2024-06-18'),
  ('h7','ord-003','ejecutado',   'Pago realizado exitosamente',             'Laura Mendoza',  '2024-07-01'),
  ('h8','ord-004','pendiente',   'Orden creada',                            'Laura Mendoza',  '2024-07-03'),
  ('h9','ord-004','en_revision', 'Solicitando validación presupuestal',     'Carlos Ramírez', '2024-07-11'),
  ('h10','ord-005','pendiente',  'Orden creada',                            'Ana Torres',     '2024-07-05'),
  ('h11','ord-005','rechazado',  'Existen portales gratuitos disponibles.', 'Carlos Ramírez', '2024-07-09'),
  ('h12','ord-006','pendiente',  'Orden creada',                            'Laura Mendoza',  '2024-07-12')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.survey_responses
  (id, course_id, respondent_name, responses, nps_score, overall_rating, comments, submitted_at)
VALUES
  ('sr1','c1','María G.',     '{"q1":9,"q2":5,"q3":"Excelente metodología, muy práctico."}',9,5,'Excelente metodología, muy práctico.','2024-06-16'),
  ('sr2','c1','Pedro L.',     '{"q1":8,"q2":4,"q3":"Buen contenido, los ejercicios fueron útiles."}',8,4,'Buen contenido, los ejercicios fueron útiles.','2024-06-16'),
  ('sr3','c1','Sofía M.',     '{"q1":10,"q2":5,"q3":"El facilitador domina el tema a profundidad."}',10,5,'El facilitador domina el tema a profundidad.','2024-06-17'),
  ('sr4','c2','Luis T.',      '{"q1":7,"q2":4,"q3":"Útil pero muy rápido el ritmo."}',7,4,'Útil pero muy rápido el ritmo.','2024-06-23'),
  ('sr5','c2','Carmen R.',    '{"q1":9,"q2":5,"q3":"Aprendí muchas funciones nuevas."}',9,5,'Aprendí muchas funciones nuevas.','2024-06-23'),
  ('sr6','c3','José A.',      '{"q1":6,"q2":3,"q3":"El espacio era pequeño para el grupo."}',6,3,'El espacio era pequeño para el grupo.','2024-07-06'),
  ('sr7','c3','Valeria N.',   '{"q1":8,"q2":4,"q3":"Dinámicas muy interesantes."}',8,4,'Dinámicas muy interesantes.','2024-07-06'),
  ('sr8','c4','Miguel F.',    '{"q1":9,"q2":5,"q3":"Indispensable para el trabajo en campo."}',9,5,'Indispensable para el trabajo en campo.','2024-07-11'),
  ('sr9','c4','Elena P.',     '{"q1":7,"q2":4,"q3":"Buen curso, lo recomendaría."}',7,4,'Buen curso, lo recomendaría.','2024-07-11')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.alerts (id, type, title, message, related_id, is_read, created_at) VALUES
  ('a1','orden_retrasada',    'Orden vencida',          'OP-2024-004 supera su fecha límite sin ejecutarse.',         'ord-004', false, '2024-07-12'),
  ('a2','aprobacion_pendiente','Aprobación pendiente',  'OP-2024-002 lleva 4 días sin aprobación.',                   'ord-002', false, '2024-07-12'),
  ('a3','encuesta_completada','Encuesta completada',    'Curso "Seguridad Industrial Básica" recibió 9 respuestas.',  'c4',      true,  '2024-07-11')
ON CONFLICT (id) DO NOTHING;
