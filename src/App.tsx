import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store/useStore';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import OrdersInbox from './pages/OrdersInbox';
import OrderDetail from './pages/OrderDetail';
import SurveyForm from './pages/SurveyForm';
import SurveyResults from './pages/SurveyResults';
import Settings from './pages/Settings';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { currentUser } = useStore();
  return currentUser ? <>{children}</> : <Navigate to="/" replace />;
}

export default function App() {
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
