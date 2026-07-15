import { createContext, useContext, useEffect, useState, ReactNode, createElement } from 'react';
import { supabase } from '../lib/supabase';
import {
  User, PaymentOrder, Course, SurveyResponse, Alert,
  OrderHistoryEntry, OrderStatus
} from '../types';

// ── Mappers DB row → TypeScript type ──────────────────────────

function mapUser(r: Record<string, unknown>): User {
  return {
    id: r.id as string,
    name: r.name as string,
    email: r.email as string,
    role: r.role as User['role'],
    department: r.department as string,
  };
}

function mapHistory(r: Record<string, unknown>): OrderHistoryEntry {
  return {
    id: r.id as string,
    orderId: r.order_id as string,
    status: r.status as OrderStatus,
    comment: (r.comment as string) ?? '',
    changedBy: r.changed_by as string,
    changedAt: r.changed_at as string,
  };
}

function mapOrder(r: Record<string, unknown>, history: OrderHistoryEntry[]): PaymentOrder {
  return {
    id: r.id as string,
    code: r.code as string,
    title: r.title as string,
    description: (r.description as string) ?? '',
    amount: Number(r.amount),
    currency: (r.currency as string) ?? 'COP',
    status: r.status as OrderStatus,
    priority: r.priority as PaymentOrder['priority'],
    category: (r.category as string) ?? '',
    requestedBy: r.requested_by as string,
    assignedTo: r.assigned_to as string,
    dueDate: r.due_date as string,
    createdAt: r.created_at as string,
    updatedAt: r.updated_at as string,
    observations: (r.observations as string) ?? '',
    attachments: (r.attachments as string[]) ?? [],
    history: history.filter(h => h.orderId === (r.id as string)),
  };
}

function mapCourse(r: Record<string, unknown>): Course {
  return {
    id: r.id as string,
    name: r.name as string,
    facilitator: r.facilitator as string,
    date: r.date as string,
    department: (r.department as string) ?? '',
    participants: Number(r.participants),
  };
}

function mapSurveyResponse(r: Record<string, unknown>): SurveyResponse {
  return {
    id: r.id as string,
    courseId: r.course_id as string,
    respondentName: r.respondent_name as string | undefined,
    responses: (r.responses as Record<string, string | number>) ?? {},
    npsScore: Number(r.nps_score),
    overallRating: Number(r.overall_rating),
    comments: (r.comments as string) ?? '',
    submittedAt: r.submitted_at as string,
  };
}

function mapAlert(r: Record<string, unknown>): Alert {
  return {
    id: r.id as string,
    type: r.type as Alert['type'],
    title: r.title as string,
    message: r.message as string,
    relatedId: r.related_id as string | undefined,
    isRead: r.is_read as boolean,
    createdAt: r.created_at as string,
  };
}

// ── Context ────────────────────────────────────────────────────

interface AppContextType {
  currentUser: User | null;
  orders: PaymentOrder[];
  courses: Course[];
  surveyResponses: SurveyResponse[];
  alerts: Alert[];
  users: User[];
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  addOrder: (order: PaymentOrder) => Promise<void>;
  updateOrder: (order: PaymentOrder) => Promise<void>;
  addSurveyResponse: (response: SurveyResponse) => Promise<void>;
  addCourse: (course: Course) => Promise<void>;
  markAlertRead: (id: string) => Promise<void>;
  addUser: (user: User) => Promise<void>;
}

const AppContext = createContext<AppContextType>({} as AppContextType);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = sessionStorage.getItem('pf_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [orders, setOrders] = useState<PaymentOrder[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [surveyResponses, setSurveyResponses] = useState<SurveyResponse[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    setLoading(true);
    const [usersRes, ordersRes, historyRes, coursesRes, responsesRes, alertsRes] = await Promise.all([
      supabase.from('users').select('*'),
      supabase.from('payment_orders').select('*'),
      supabase.from('order_history').select('*'),
      supabase.from('courses').select('*'),
      supabase.from('survey_responses').select('*'),
      supabase.from('alerts').select('*'),
    ]);

    const historyRows = ((historyRes.data ?? []) as Record<string, unknown>[]).map(mapHistory);
    const mappedOrders = ((ordersRes.data ?? []) as Record<string, unknown>[]).map(r => mapOrder(r, historyRows));

    setUsers(((usersRes.data ?? []) as Record<string, unknown>[]).map(mapUser));
    setOrders(mappedOrders);
    setCourses(((coursesRes.data ?? []) as Record<string, unknown>[]).map(mapCourse));
    setSurveyResponses(((responsesRes.data ?? []) as Record<string, unknown>[]).map(mapSurveyResponse));
    setAlerts(((alertsRes.data ?? []) as Record<string, unknown>[]).map(mapAlert));
    setLoading(false);
  }

  async function login(email: string, password: string): Promise<boolean> {
    if (password !== 'payflow2024') return false;
    const { data } = await supabase.from('users').select('*').eq('email', email).single();
    if (!data) return false;
    const user = mapUser(data as Record<string, unknown>);
    setCurrentUser(user);
    sessionStorage.setItem('pf_user', JSON.stringify(user));
    return true;
  }

  function logout() {
    setCurrentUser(null);
    sessionStorage.removeItem('pf_user');
  }

  async function addOrder(order: PaymentOrder): Promise<void> {
    const { history, ...rest } = order;
    await supabase.from('payment_orders').insert({
      id: rest.id, code: rest.code, title: rest.title, description: rest.description,
      amount: rest.amount, currency: rest.currency, status: rest.status,
      priority: rest.priority, category: rest.category, requested_by: rest.requestedBy,
      assigned_to: rest.assignedTo, due_date: rest.dueDate, created_at: rest.createdAt,
      updated_at: rest.updatedAt, observations: rest.observations, attachments: rest.attachments,
    });
    for (const h of history) {
      await supabase.from('order_history').insert({
        id: h.id, order_id: h.orderId, status: h.status,
        comment: h.comment, changed_by: h.changedBy, changed_at: h.changedAt,
      });
    }
    await loadAll();
  }

  async function updateOrder(order: PaymentOrder): Promise<void> {
    const { history, ...rest } = order;
    await supabase.from('payment_orders').update({
      title: rest.title, description: rest.description, amount: rest.amount,
      status: rest.status, priority: rest.priority, category: rest.category,
      requested_by: rest.requestedBy, assigned_to: rest.assignedTo,
      due_date: rest.dueDate, updated_at: rest.updatedAt,
      observations: rest.observations, attachments: rest.attachments,
    }).eq('id', rest.id);

    const existing = orders.find(o => o.id === order.id);
    const newEntries = history.filter(h => !existing?.history.find(e => e.id === h.id));
    for (const h of newEntries) {
      await supabase.from('order_history').insert({
        id: h.id, order_id: h.orderId, status: h.status,
        comment: h.comment, changed_by: h.changedBy, changed_at: h.changedAt,
      });
    }
    await loadAll();
  }

  async function addSurveyResponse(response: SurveyResponse): Promise<void> {
    await supabase.from('survey_responses').insert({
      id: response.id, course_id: response.courseId,
      respondent_name: response.respondentName ?? null,
      responses: response.responses, nps_score: response.npsScore,
      overall_rating: response.overallRating, comments: response.comments,
      submitted_at: response.submittedAt,
    });
    await loadAll();
  }

  async function addCourse(course: Course): Promise<void> {
    await supabase.from('courses').insert({
      id: course.id, name: course.name, facilitator: course.facilitator,
      date: course.date, department: course.department, participants: course.participants,
    });
    await loadAll();
  }

  async function markAlertRead(id: string): Promise<void> {
    await supabase.from('alerts').update({ is_read: true }).eq('id', id);
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, isRead: true } : a));
  }

  async function addUser(user: User): Promise<void> {
    await supabase.from('users').insert({
      id: user.id, name: user.name, email: user.email,
      role: user.role, department: user.department,
    });
    await loadAll();
  }

  return createElement(
    AppContext.Provider,
    {
      value: {
        currentUser, orders, courses, surveyResponses, alerts, users, loading,
        login, logout, addOrder, updateOrder, addSurveyResponse,
        addCourse, markAlertRead, addUser,
      },
    },
    children
  );
}

export function useStore() {
  return useContext(AppContext);
}
