/**
 * PlatformDashboardPage.jsx — ChatGPT-Style Department RAG Chat Workspace
 */
import { useState, useEffect } from 'react';
import { ROLE_CONFIG } from '../../../constants';
import { apiChat, apiUploadAttachment } from '../../../services/chatService';
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

  const [messages, setMessages] = useState(() => {
    return activeSession && activeSession.messages && activeSession.messages.length > 0
      ? activeSession.messages
      : [defaultWelcomeMessage];
  });

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Sync messages when activeSession changes
  useEffect(() => {
    if (activeSession && activeSession.messages) {
      setMessages(activeSession.messages);
    } else {
      setMessages([defaultWelcomeMessage]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSession?.id]);

  // Execute selected prompt suggestion from hero grid
  useEffect(() => {
    if (selectedSuggestion) {
      sendQuery(selectedSuggestion);
      if (onClearSelectedSuggestion) onClearSelectedSuggestion();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSuggestion]);

  async function sendQuery(text) {
    if (!text || !text.trim() || loading) return;

    const userText = text.trim();
    setInput('');
    setError('');

    const userMsg = { role: 'user', content: userText, timestamp: timestamp() };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setLoading(true);

    try {
      const data = await apiChat(userText, auth.token, activeSessionId);
      const botMsg = {
        role: 'bot',
        content: data.answer || 'No response returned.',
        sources: data.sources || [],
        timestamp: timestamp(),
      };
      const finalMessages = [...updatedMessages, botMsg];
      setMessages(finalMessages);

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
    } catch (err) {
      if (err.message === 'SESSION_EXPIRED') {
        logout();
      } else {
        setError(err.message || 'File upload failed.');
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
          <button
            className={styles.mobileHamburgerBtn}
            onClick={() => setMobileOpen((open) => !open)}
            title="Open navigation menu"
            aria-label="Open navigation menu"
          >
            ☰
          </button>

          {!sidebarOpen && (
            <button
              className={styles.headerToggleBtn}
              onClick={toggleSidebar}
              title="Open sidebar"
              aria-label="Open sidebar"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
