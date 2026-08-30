/**
 * PlatformDashboardPage.jsx — ChatGPT-Style Department RAG Chat Workspace
 */
import { useState, useEffect } from 'react';
import { ROLE_CONFIG } from '../../../constants';
import { apiChat, apiUploadAttachment } from '../../../services/chatService';
import { useTheme } from '../../../context/ThemeContext';
import { useToast } from '../../../context/ToastContext';
import ChatMessageList from '../components/chat/ChatMessageList';
import ChatInputForm from '../components/chat/ChatInputForm';
import ErrorBanner from '../../../shared/components/ErrorBanner';
import styles from '../styles/platform_center.module.css';

function timestamp() {
  return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

export default function PlatformDashboardPage({
  auth,
  logout,
  activeSessionId,
  activeSession,
  onQueryCompleted,
  selectedSuggestion,
  onClearSelectedSuggestion,
  sidebarOpen,
  toggleSidebar,
  setMobileOpen,
}) {
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const roleConf = ROLE_CONFIG[auth.role] || {
    color: '#10a37f',
    emoji: auth.roleEmoji || '🏢',
    label: auth.displayName || auth.role,
  };

  const defaultWelcomeMessage = {
    role: 'bot',
    content: `Welcome back ${auth.displayName || auth.username}! I am your ${roleConf.label} RAG Assistant. Ask me questions scoped to your department knowledge base.`,
    timestamp: timestamp(),
    sources: [],
  };

  const [messages, setMessages] = useState([defaultWelcomeMessage]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Sync with selected session
  useEffect(() => {
    if (activeSession && activeSession.messages) {
      setMessages(activeSession.messages.length > 0 ? activeSession.messages : [defaultWelcomeMessage]);
    } else {
      setMessages([defaultWelcomeMessage]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSessionId, activeSession]);

  // Handle suggestion selection
  useEffect(() => {
    if (selectedSuggestion) {
      setInput(selectedSuggestion);
    }
  }, [selectedSuggestion]);

  async function sendQuery(queryText) {
    if (!queryText.trim() || loading) return;

    const userMsg = {
      role: 'user',
      content: queryText,
      timestamp: timestamp(),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    setError('');

    try {
      const data = await apiChat(queryText, auth.token, activeSessionId);
      const botMsg = {
        role: 'bot',
        content: data.answer,
        sources: data.sources || [],
        timestamp: timestamp(),
      };
      setMessages([...newMessages, botMsg]);

      if (onQueryCompleted) {
        onQueryCompleted(data.session_id);
      }
    } catch (err) {
      if (err.message === 'SESSION_EXPIRED') {
        logout();
      } else {
        setError(err.message || 'Failed to communicate with RAG engine.');
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleFileUpload(file) {
    if (!file || loading) return;
    setLoading(true);
    setError('');

    try {
      const result = await apiUploadAttachment(file, auth.token);
      const botMsg = {
        role: 'bot',
        content: `📁 **Attachment Uploaded & Indexed**\n\nDocument **${result.filename}** has been saved to the **${result.department.toUpperCase()}** department data folder (\`backend/data/${result.department}\`) and indexed into the vector store (${result.chunks_ingested} text chunks).\n\nYou can now ask questions about this newly uploaded document!`,
        sources: [],
        timestamp: timestamp(),
      };
      const finalMessages = [...messages, botMsg];
      setMessages(finalMessages);

      if (onQueryCompleted) {
        onQueryCompleted(activeSessionId);
      }

      toast.success(
        `Uploaded "${result.filename}" to ${result.department} folder (${result.chunks_ingested} chunks indexed).`,
        'Document Uploaded'
      );
    } catch (err) {
      if (err.message === 'SESSION_EXPIRED') {
        logout();
      } else {
        setError(err.message || 'File upload failed.');
        toast.error(err.message || 'File upload failed.', 'Upload Error');
      }
    } finally {
      setLoading(false);
    }
  }

  function handleSend(e) {
    e.preventDefault();
    sendQuery(input);
  }

  return (
    <div className={styles.chatPageContainer}>
      <ErrorBanner
        error={error}
        onClose={() => setError('')}
        className={styles.errorBanner}
        closeClassName={styles.closeError}
      />

      {/* ChatGPT Top Navigation Bar */}
      <header className={styles.chatPageHeader}>
        <div className={styles.chatHeaderLeft}>
          {/* Mobile-Only Drawer Toggle */}
          <button
            type="button"
            className={styles.mobileHamburgerBtn}
            onClick={() => setMobileOpen((open) => !open)}
            title="Open navigation menu"
            aria-label="Open navigation menu"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          {/* Desktop-Only Toggle: Rendered ONLY when sidebar is collapsed */}
          {!sidebarOpen && (
            <button
              type="button"
              className={styles.headerToggleBtn}
              onClick={toggleSidebar}
              title="Open sidebar"
              aria-label="Open sidebar"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <line x1="9" y1="3" x2="9" y2="21" />
              </svg>
            </button>
          )}

          <div className={styles.modelSelector}>
            <span>{roleConf.label} RAG Assistant</span>
            <span className={styles.modelChevron}>▾</span>
          </div>
        </div>

        <div className={styles.statusLiveBadge}>
          <span className={styles.pulseDot} />
          <span>Online & Scoped</span>
        </div>
      </header>

      {/* Chat Workspace Area */}
      <div className={styles.chatBox}>
        <ChatMessageList
          messages={messages}
          loading={loading}
          onSelectSuggestion={sendQuery}
          roleConf={roleConf}
        />
        <ChatInputForm
          input={input}
          setInput={setInput}
          onSubmit={handleSend}
          loading={loading}
          onFileUpload={handleFileUpload}
        />
      </div>
    </div>
  );
}
