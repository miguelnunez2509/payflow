import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useStore } from './store/useStore';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import OrdersInbox from './pages/OrdersInbox';
import OrderDetail from './pages/OrderDetail';
import SurveyForm from './pages/SurveyForm';
import SurveyResults from './pages/SurveyResults';
import Settings from './pages/Settings';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { currentUser, loading } = useStore();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center mx-auto mb-3 animate-pulse">
            <span className="text-2xl font-black text-white">P</span>
          </div>
          <p className="text-sm text-gray-500">Cargando PayFlow...</p>
        </div>
      </div>
    );
  }
  return currentUser ? <>{children}</> : <Navigate to="/" replace />;
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/survey/:courseId" element={<SurveyForm />} />
        <Route
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="orders" element={<OrdersInbox />} />
          <Route path="orders/:id" element={<OrderDetail />} />
          <Route path="surveys/results" element={<SurveyResults />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppRoutes />
    </AppProvider>
  );
}
