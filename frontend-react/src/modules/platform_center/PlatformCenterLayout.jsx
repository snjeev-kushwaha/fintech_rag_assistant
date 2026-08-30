/**
 * PlatformCenterLayout.jsx — Master Department Platform Center Layout with Confirmation Modals & Multi-Session Chat
 */
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { ROLE_CONFIG } from '../../constants';
import {
  apiGetChatSessions,
  apiGetChatSessionDetail,
  apiDeleteChatSession,
  apiRenameChatSession,
} from '../../services/chatService';
import ConfirmDeleteModal from '../../shared/components/ConfirmDeleteModal';
import PlatformSidebar from './components/sidebar/PlatformSidebar';
import PlatformDashboardPage from './pages/PlatformDashboardPage';
import DepartmentUsersPage from './pages/DepartmentUsersPage';
import PlatformSettingsModal from './components/settings/PlatformSettingsModal';
import UserProfileModal from './components/profile/UserProfileModal';
import styles from './styles/platform_center.module.css';

export default function PlatformCenterLayout() {
  const { auth, logout } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'team'
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
  const [showProfileModal, setShowProfileModal] = useState(false);

  // MongoDB Chat Sessions State
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [activeSession, setActiveSession] = useState(null);

  // Session Deletion Confirmation Modal State
  const [sessionToDelete, setSessionToDelete] = useState(null);
  const [isDeletingSession, setIsDeletingSession] = useState(false);

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

  function requestDeleteSession(sessionId) {
    const sessionObj = sessions.find((s) => (s.session_id || s.id) === sessionId);
    setSessionToDelete({
      id: sessionId,
      title: sessionObj?.title || 'Chat Conversation',
    });
  }

  async function confirmDeleteSession() {
    if (!sessionToDelete) return;
    const sessionId = sessionToDelete.id;
    setIsDeletingSession(true);
    try {
      await apiDeleteChatSession(auth.token, sessionId);
      setSessions((prev) => prev.filter((s) => (s.session_id || s.id) !== sessionId));
      if (activeSessionId === sessionId) {
        handleNewChat();
      }
      toast.delete('Chat conversation deleted successfully.', 'Session Removed');
      setSessionToDelete(null);
    } catch (err) {
      if (err.message === 'SESSION_EXPIRED') logout();
      console.error('Error deleting chat session:', err);
      toast.error('Failed to delete chat session.', 'Error');
      setSessionToDelete(null);
    } finally {
      setIsDeletingSession(false);
    }
  }

  async function handleRenameSession(sessionId, newTitle) {
    if (!newTitle || !newTitle.trim()) return;
    try {
      await apiRenameChatSession(auth.token, sessionId, newTitle.trim());
      setSessions((prev) =>
        prev.map((s) => ((s.session_id || s.id) === sessionId ? { ...s, title: newTitle.trim() } : s))
      );
      if (activeSessionId === sessionId) {
        setActiveSession((prev) => (prev ? { ...prev, title: newTitle.trim() } : prev));
      }
      toast.success(`Conversation title updated to "${newTitle.trim()}".`, 'Session Renamed');
    } catch (err) {
      if (err.message === 'SESSION_EXPIRED') logout();
      console.error('Error renaming chat session:', err);
      toast.error('Failed to rename session.', 'Error');
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
        onDeleteSession={requestDeleteSession}
        onRenameSession={handleRenameSession}
        onNewChat={handleNewChat}
        onOpenProfile={() => setShowProfileModal(true)}
      />

      {/* Main Board */}
      <main className={styles.main}>
        {activeTab === 'chat' && (
          <PlatformDashboardPage
            auth={auth}
            logout={logout}
            roleConf={roleConf}
            selectedSuggestion={selectedSuggestion}
            onSelectSuggestion={handleSelectSuggestion}
            activeSession={activeSession}
            activeSessionId={activeSessionId}
            onQueryCompleted={handleQueryCompleted}
            onNewChat={handleNewChat}
            sidebarOpen={sidebarOpen}
            toggleSidebar={toggleSidebar}
            setMobileOpen={setMobileOpen}
          />
        )}

        {activeTab === 'team' && (
          <DepartmentUsersPage
            auth={auth}
            roleConf={roleConf}
            setMobileOpen={setMobileOpen}
          />
        )}
      </main>

      {/* Profile Modal */}
      <UserProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        auth={auth}
        logout={logout}
      />

      {/* Settings Modal */}
      <PlatformSettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        auth={auth}
        logout={logout}
      />

      {/* Delete Chat Session Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={Boolean(sessionToDelete)}
        title="Delete Chat Session"
        itemName={sessionToDelete?.title}
        itemType="conversation"
        description="This conversation thread and all its prompt history will be permanently erased from your account."
        onCancel={() => setSessionToDelete(null)}
        onConfirm={confirmDeleteSession}
        loading={isDeletingSession}
      />
    </div>
  );
}
