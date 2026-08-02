/**
 * App.jsx — Modular application shell with feature-based routing
 */
import './App.css';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import ControlCenterLayout from './modules/control_center/ControlCenterLayout';
import PlatformCenterLayout from './modules/platform_center/PlatformCenterLayout';

export default function App() {
  const { auth } = useAuth();

  if (!auth.authenticated) {
    return <LoginPage />;
  }

  return auth.role === 'root' ? <ControlCenterLayout /> : <PlatformCenterLayout />;
}
