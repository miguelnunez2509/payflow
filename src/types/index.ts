export type UserRole = 'analista' | 'gerencia';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  avatar?: string;
}

export type OrderStatus = 'pendiente' | 'en_revision' | 'aprobado' | 'ejecutado' | 'rechazado';

export interface OrderHistoryEntry {
  id: string;
  orderId: string;
  status: OrderStatus;
  comment: string;
  changedBy: string;
  changedAt: string;
}

export interface PaymentOrder {
  id: string;
  code: string;
  title: string;
  description: string;
  amount: number;
  currency: string;
  status: OrderStatus;
  priority: 'baja' | 'media' | 'alta';
  category: string;
  requestedBy: string;
  assignedTo: string;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  observations: string;
  attachments: string[];
  history: OrderHistoryEntry[];
}

export interface SurveyQuestion {
  id: string;
  text: string;
  type: 'nps' | 'rating' | 'text' | 'multiple_choice';
  options?: string[];
  required: boolean;
}

export interface Course {
  id: string;
  name: string;
  facilitator: string;
  date: string;
  department: string;
  participants: number;
}

export interface SurveyResponse {
  id: string;
  courseId: string;
  respondentName?: string;
  responses: Record<string, string | number>;
  npsScore: number;
  overallRating: number;
  comments: string;
  submittedAt: string;
}

export interface AppAlert {
  id: string;
  type: 'orden_retrasada' | 'aprobacion_pendiente' | 'nps_bajo' | 'encuesta_completada';
  title: string;
  message: string;
  relatedId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface DashboardMetrics {
  totalOrders: number;
  pendingOrders: number;
  approvedOrders: number;
  executedOrders: number;
  overdueOrders: number;
  totalSurveys: number;
  avgNPS: number;
  avgRating: number;
  weeklyOrdersTrend: { week: string; count: number }[];
  ordersByStatus: { status: string; count: number; color: string }[];
  npsHistory: { month: string; nps: number }[];
  ratingByFacilitator: { name: string; rating: number; responses: number }[];
}
