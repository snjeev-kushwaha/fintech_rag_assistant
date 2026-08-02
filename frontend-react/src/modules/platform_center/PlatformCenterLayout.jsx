/**
 * PlatformCenterLayout.jsx — Master Department Platform Center Layout with Settings Popup Modal
 */
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ROLE_CONFIG } from '../../constants';
import { apiGetChatSessions, apiGetChatSessionDetail, apiDeleteChatSession } from '../../services/chatService';
import PlatformSidebar from './components/sidebar/PlatformSidebar';
import PlatformDashboardPage from './pages/PlatformDashboardPage';
import DepartmentUsersPage from './pages/DepartmentUsersPage';
import UserProfilePage from './pages/UserProfilePage';
import PlatformSettingsModal from './components/settings/PlatformSettingsModal';
import styles from './styles/platform_center.module.css';

export default function PlatformCenterLayout() {
  const { auth, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'team' | 'profile'
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    try {
      const saved = localStorage.getItem('platformSidebarOpen');
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // MongoDB Chat Sessions State
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [activeSession, setActiveSession] = useState(null);

  const roleConf = ROLE_CONFIG[auth.role] || {
    label: auth.role || 'Scoped User',
    color: '#10a37f',
    emoji: auth.roleEmoji || '🏢',
  };

  // Load chat session list from MongoDB on mount or user change
  useEffect(() => {
    if (auth && auth.token) {
      loadSessions();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth?.token]);

  async function loadSessions() {
    try {
      const list = await apiGetChatSessions(auth.token);
      setSessions(list || []);
    } catch (err) {
      if (err.message === 'SESSION_EXPIRED') logout();
      console.error('Failed to load chat sessions from database:', err);
    }
  }

  function toggleSidebar() {
    setSidebarOpen((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('platformSidebarOpen', JSON.stringify(next));
      } catch (err) {
        console.error('LocalStorage error:', err);
      }
      return next;
    });
  }

  function handleNewChat() {
    setActiveTab('chat');
    setActiveSessionId(null);
    setActiveSession(null);
    setSelectedSuggestion(null);
  }

  async function handleSelectSession(sessionId) {
    setActiveTab('chat');
    setActiveSessionId(sessionId);
    setSelectedSuggestion(null);
    try {
      const detail = await apiGetChatSessionDetail(auth.token, sessionId);
      if (detail) {
        setActiveSession({
          id: detail.session_id,
          title: detail.title,
          messages: detail.messages || [],
        });
      }
    } catch (err) {
      if (err.message === 'SESSION_EXPIRED') logout();
      console.error('Error fetching chat session details:', err);
    }
  }

  async function handleDeleteSession(sessionId) {
    try {
      await apiDeleteChatSession(auth.token, sessionId);
      setSessions((prev) => prev.filter((s) => (s.session_id || s.id) !== sessionId));
      if (activeSessionId === sessionId) {
        handleNewChat();
      }
    } catch (err) {
      if (err.message === 'SESSION_EXPIRED') logout();
      console.error('Error deleting chat session:', err);
    }
  }

  function handleSelectSuggestion(suggestion) {
    setActiveTab('chat');
    setSelectedSuggestion(suggestion);
  }

  async function handleQueryCompleted(newSessionId) {
    if (newSessionId && newSessionId !== activeSessionId) {
      setActiveSessionId(newSessionId);
    }
    await loadSessions();
    if (newSessionId) {
      try {
        const detail = await apiGetChatSessionDetail(auth.token, newSessionId);
        if (detail) {
          setActiveSession({
            id: detail.session_id,
            title: detail.title,
            messages: detail.messages || [],
          });
        }
      } catch (err) {
        console.error('Error updating active session:', err);
      }
    }
  }

  return (
    <div className={styles.layout}>
      <div className={styles.blobTop} aria-hidden="true" />

      {mobileOpen && (
        <div
          className={styles.mobileBackdrop}
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Department Platform Sidebar */}
      <PlatformSidebar
        sidebarOpen={sidebarOpen}
        toggleSidebar={toggleSidebar}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        auth={auth}
        logout={logout}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        onDeleteSession={handleDeleteSession}
        onNewChat={handleNewChat}
        onSelectSuggestion={handleSelectSuggestion}
        onOpenSettings={() => setShowSettingsModal(true)}
      />

      {/* Main Active Module Screen */}
      <main className={styles.main}>
        {activeTab === 'chat' && (
          <PlatformDashboardPage
            auth={auth}
            logout={logout}
            activeSessionId={activeSessionId}
            activeSession={activeSession}
            onQueryCompleted={handleQueryCompleted}
            onNewChat={handleNewChat}
            selectedSuggestion={selectedSuggestion}
            onClearSelectedSuggestion={() => setSelectedSuggestion(null)}
            sidebarOpen={sidebarOpen}
            toggleSidebar={toggleSidebar}
            setMobileOpen={setMobileOpen}
          />
        )}
        {activeTab === 'team' && <DepartmentUsersPage auth={auth} logout={logout} setMobileOpen={setMobileOpen} />}
        {activeTab === 'profile' && <UserProfilePage auth={auth} setMobileOpen={setMobileOpen} />}
      </main>

      {/* Platform Settings Modal */}
      <PlatformSettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        roleConf={roleConf}
      />
    </div>
  );
}
