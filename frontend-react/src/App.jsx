/**
 * App.jsx — Root component with auth-based routing
 */
import './App.css';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import ChatPage from './pages/ChatPage';
import ControlCenterPage from './pages/ControlCenterPage';

export default function App() {
  const { auth } = useAuth();
  
  if (!auth.authenticated) {
    return <LoginPage />;
  }
  
  return auth.role === 'root' ? <ControlCenterPage /> : <ChatPage />;
}

