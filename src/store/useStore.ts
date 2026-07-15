import { useState, useEffect } from 'react';
import { User, PaymentOrder, SurveyResponse, Course, Alert } from '../types';
import { mockOrders, mockCourses, mockSurveyResponses, mockAlerts, mockUsers } from '../data/mockData';

const STORAGE_KEY = 'payflow_data';

interface AppState {
  currentUser: User | null;
  orders: PaymentOrder[];
  courses: Course[];
  surveyResponses: SurveyResponse[];
  alerts: Alert[];
  users: User[];
}

function loadState(): AppState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return {
    currentUser: null,
    orders: mockOrders,
    courses: mockCourses,
    surveyResponses: mockSurveyResponses,
    alerts: mockAlerts,
    users: mockUsers,
  };
}

function saveState(state: AppState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

let globalState = loadState();
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach(fn => fn());
}

export function getState(): AppState {
  return globalState;
}

export function setState(partial: Partial<AppState>) {
  globalState = { ...globalState, ...partial };
  saveState(globalState);
  notify();
}

export function useStore() {
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const listener = () => forceUpdate(n => n + 1);
    listeners.add(listener);
    return () => { listeners.delete(listener); };
  }, []);

  return {
    ...globalState,
    login: (email: string, password: string): boolean => {
      const user = globalState.users.find(u => u.email === email);
      if (user && password === 'payflow2024') {
        setState({ currentUser: user });
        return true;
      }
      return false;
    },
    logout: () => setState({ currentUser: null }),
    addOrder: (order: PaymentOrder) => {
      setState({ orders: [...globalState.orders, order] });
    },
    updateOrder: (updated: PaymentOrder) => {
      setState({
        orders: globalState.orders.map(o => o.id === updated.id ? updated : o),
      });
    },
    addSurveyResponse: (response: SurveyResponse) => {
      setState({ surveyResponses: [...globalState.surveyResponses, response] });
    },
    addCourse: (course: Course) => {
      setState({ courses: [...globalState.courses, course] });
    },
    markAlertRead: (id: string) => {
      setState({
        alerts: globalState.alerts.map(a => a.id === id ? { ...a, isRead: true } : a),
      });
    },
    addUser: (user: User) => {
      setState({ users: [...globalState.users, user] });
    },
  };
}
