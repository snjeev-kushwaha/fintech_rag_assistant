/**
 * App.jsx — Modular application shell with declarative URL Routing & Auth Guards
 */
import './App.css';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import ControlCenterLayout from './modules/control_center/ControlCenterLayout';
import PlatformCenterLayout from './modules/platform_center/PlatformCenterLayout';
import LoadingSpinner from './shared/components/LoadingSpinner';

export default function App() {
  const { auth, sessionLoading } = useAuth();

  if (sessionLoading) {
    return (
      <div
        style={{
          height: '100vh',
          width: '100vw',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0f172a',
        }}
      >
        <LoadingSpinner message="Authenticating session..." />
      </div>
    );
  }

  // Determine home landing page based on authenticated role
  const homeRedirect = auth.role === 'root' ? '/admin/departments' : '/chat';

  return (
    <Routes>
      {/* Public Login Route */}
      <Route
        path="/login"
        element={
          auth.authenticated ? <Navigate to={homeRedirect} replace /> : <LoginPage />
        }
      />

      {/* Root Admin Routes (Protected) */}
      <Route
        path="/admin/*"
        element={
          !auth.authenticated ? (
            <Navigate to="/login" replace />
          ) : auth.role === 'root' ? (
            <ControlCenterLayout />
          ) : (
            <Navigate to="/chat" replace />
          )
        }
      />

      {/* Scoped User Routes (Protected) */}
      <Route
        path="/chat"
        element={
          !auth.authenticated ? (
            <Navigate to="/login" replace />
          ) : auth.role === 'root' ? (
            <Navigate to="/admin/departments" replace />
          ) : (
            <PlatformCenterLayout />
          )
        }
      />

      <Route
        path="/team"
        element={
          !auth.authenticated ? (
            <Navigate to="/login" replace />
          ) : auth.role === 'root' ? (
            <Navigate to="/admin/departments" replace />
          ) : (
            <PlatformCenterLayout />
          )
        }
      />

      {/* Root Index & Fallback Redirects */}
      <Route
        path="/"
        element={
          auth.authenticated ? (
            <Navigate to={homeRedirect} replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="*"
        element={
          auth.authenticated ? (
            <Navigate to={homeRedirect} replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  );
}
