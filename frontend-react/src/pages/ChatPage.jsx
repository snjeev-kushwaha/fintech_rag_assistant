/**
 * ChatPage.jsx — Full RBAC Chat Interface
 * Mirrors the Python/Streamlit frontend feature-for-feature
 */
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiChat } from '../api';
import { ROLE_CONFIG, ACCESS_MAP } from '../constants';
import styles from './ChatPage.module.css';

/* ── Helpers ───────────────────────────────────────────────────────────────── */
function timestamp() {
  return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

/* ── Source Card ───────────────────────────────────────────────────────────── */
function SourceCard({ src }) {
  return (
    <div className={styles.sourceCard}>
      <div className={styles.sourceCardHeader}>
        <span>📄</span>
        <span className={styles.sourceFile}>{src.source_file || 'Unknown'}</span>
        {src.department && <span className={styles.sourceDept}>— {src.department}</span>}
      </div>
      {src.content_preview && (
        <div className={styles.sourcePreview}>{src.content_preview}</div>
      )}
    </div>
  );
}

/* ── Message Bubble ────────────────────────────────────────────────────────── */
function Message({ msg }) {
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const isUser = msg.role === 'user';

  if (isUser) {
    return (
      <div className={styles.msgUser}>
        <div className={styles.msgUserBubble}>{msg.content}</div>
        <div className={styles.msgTimestamp}>{msg.timestamp}</div>
      </div>
    );
  }

  return (
    <div className={styles.msgBot}>
      <div className={styles.msgBotAvatar}>🤖</div>
      <div className={styles.msgBotContent}>
        <div className={styles.msgBotBubble}>
          {msg.content.split('\n').map((line, i) => (
            <span key={i}>{line}{i < msg.content.split('\n').length - 1 && <br />}</span>
          ))}
        </div>
        <div className={styles.msgTimestamp}>{msg.timestamp}</div>
        {msg.sources && msg.sources.length > 0 && (
          <div className={styles.sourcesWrapper}>
            <button
              className={styles.sourcesToggle}
              onClick={() => setSourcesOpen((o) => !o)}
            >
              <span>📚</span>
              {msg.sources.length} Source{msg.sources.length > 1 ? 's' : ''} Referenced
              <span className={sourcesOpen ? styles.chevronOpen : styles.chevron}>▾</span>
            </button>
            {sourcesOpen && (
              <div className={styles.sourcesList}>
                {msg.sources.map((src, i) => <SourceCard key={i} src={src} />)}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Typing Indicator ──────────────────────────────────────────────────────── */
function TypingIndicator() {
  return (
    <div className={styles.msgBot}>
      <div className={styles.msgBotAvatar}>🤖</div>
      <div className={styles.typingBubble}>
        <span className={styles.dot} />
        <span className={styles.dot} />
        <span className={styles.dot} />
      </div>
    </div>
  );
}

/* ── Sidebar ───────────────────────────────────────────────────────────────── */
function Sidebar({ messages, onClearChat, isOpen }) {
  const { auth, logout } = useAuth();
  const roleConf = ROLE_CONFIG[auth.role] || {};
  const access = ACCESS_MAP[auth.role] || {};
  const queryCount = messages.filter((m) => m.role === 'user').length;

  return (
    <aside className={`${styles.sidebar} ${isOpen ? '' : styles.sidebarCollapsed}`}>
      {/* Brand */}
      <div className={styles.brand}>
        <span className={styles.brandLogo}>🏦</span>
        <div>
          <div className={styles.brandName}>FinSolve AI</div>
          <div className={styles.brandTagline}>RBAC Knowledge Assistant</div>
        </div>
      </div>

      {/* User card */}
      <div className={styles.userCard}>
        <div className={styles.userCardRow}>
          <div
            className={styles.userAvatar}
            style={{ borderColor: `${roleConf.color}66`, background: `${roleConf.color}18` }}
          >
            {roleConf.emoji}
          </div>
          <div>
            <div className={styles.userCardName}>{auth.username}</div>
            <div className={styles.userCardRole}>{auth.displayName}</div>
          </div>
        </div>
        <div
          className={styles.roleBadge}
          style={{ color: roleConf.color, borderColor: `${roleConf.color}55`, background: `${roleConf.color}18` }}
        >
          {roleConf.emoji} {roleConf.label}
        </div>
      </div>

      {/* Access permissions */}
      <div className={styles.accessPanel}>
        <div className={styles.accessPanelTitle}>Data Access Permissions</div>
        {Object.entries(access).map(([dept, allowed]) => (
          <div key={dept} className={styles.accessItem}>
            <span className={allowed ? styles.dotAllowed : styles.dotDenied}>●</span>
            <span style={{ color: allowed ? '#e2e8f0' : '#374151' }}>{dept}</span>
          </div>
        ))}
      </div>

      <hr className={styles.divider} />

      {/* Actions */}
      <div className={styles.sidebarActions}>
        <button className={styles.clearBtn} onClick={onClearChat} id="clear-chat-btn">
          🗑️ Clear Chat
        </button>
        <button className={styles.logoutBtn} onClick={logout} id="logout-btn">
          🚪 Sign Out
        </button>
      </div>

      <hr className={styles.divider} />

      {/* Stats */}
      <div className={styles.statsRow}>
        <div className={styles.statBox}>
          <div className={styles.statNum}>{queryCount}</div>
          <div className={styles.statLabel}>Queries</div>
        </div>
        <div className={styles.statBox}>
          <div className={styles.statNum}>{(roleConf.collections || []).length}</div>
          <div className={styles.statLabel}>Sources</div>
        </div>
      </div>

      <hr className={styles.divider} />

      {/* Info */}
      <div className={styles.sidebarInfo}>
        🔒 Powered by RAG + ChromaDB<br />
        🤖 LLM: Google Gemini 1.5 Flash<br />
        📊 Embeddings: MiniLM-L6-v2
      </div>
    </aside>
  );
}

/* ── Empty State ───────────────────────────────────────────────────────────── */
function EmptyState({ onSuggestion }) {
  const { auth } = useAuth();
  const roleConf = ROLE_CONFIG[auth.role] || {};
  const suggestions = roleConf.suggestions || [];

  return (
    <div className={styles.emptyState}>
      <div className={styles.emptyIcon}>{roleConf.emoji}</div>
      <div className={styles.emptyTitle}>Hello! How can I help you today?</div>
      <div className={styles.emptyText}>
        I have access to your{' '}
        <strong style={{ color: roleConf.color }}>{roleConf.label}</strong> data.<br />
        Ask me anything about your department's information.
      </div>

      {suggestions.length > 0 && (
        <>
          <p className={styles.tryAsking}>Try asking:</p>
          <div className={styles.suggestionsGrid}>
            {suggestions.map((s, i) => (
              <button
                key={i}
                className={styles.suggestionChip}
                onClick={() => onSuggestion(s)}
                id={`suggestion-${i}`}
              >
                💬 {s}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ── Main Chat Page ────────────────────────────────────────────────────────── */
export default function ChatPage() {
  const { auth } = useAuth();
  const roleConf = ROLE_CONFIG[auth.role] || {};

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function sendMessage(text) {
    const query = (text || input).trim();
    if (!query || loading) return;

    setInput('');
    setError('');

    const userMsg = { role: 'user', content: query, timestamp: timestamp() };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const result = await apiChat(query, auth.token);
      const botMsg = {
        role: 'assistant',
        content: result.answer || 'No response received.',
        timestamp: timestamp(),
        sources: result.sources || [],
        collections: result.collections_searched || [],
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      if (err.message === 'SESSION_EXPIRED') {
        setError('Session expired. Please sign in again.');
      } else {
        const errMsg = {
          role: 'assistant',
          content: `Error: ${err.message}`,
          timestamp: timestamp(),
          sources: [],
        };
        setMessages((prev) => [...prev, errMsg]);
      }
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div className={styles.layout}>
      <Sidebar messages={messages} onClearChat={() => setMessages([])} isOpen={sidebarOpen} />

      <div className={styles.main}>
        {/* Chat header */}
        <header className={styles.chatHeader}>
          <div className={styles.headerLeft}>
            <button
              className={styles.toggleSidebarBtn}
              onClick={() => setSidebarOpen((open) => !open)}
              title={sidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
              aria-label="Toggle Sidebar"
            >
              {sidebarOpen ? '◀' : '▶'}
            </button>
            <div>
              <div className={styles.chatTitle}>FinSolve AI Assistant</div>
              <div className={styles.chatSubtitle}>Secure, role-based knowledge retrieval powered by RAG</div>
            </div>
          </div>
          <div
            className={styles.headerBadge}
            style={{ color: roleConf.color, borderColor: `${roleConf.color}55`, background: `${roleConf.color}18` }}
          >
            {roleConf.emoji} {roleConf.label}
          </div>
        </header>

        {/* Messages area */}
        <div className={styles.messagesArea}>
          {messages.length === 0 && !loading ? (
            <EmptyState onSuggestion={(s) => sendMessage(s)} />
          ) : (
            <>
              {messages.map((msg, i) => <Message key={i} msg={msg} />)}
              {loading && <TypingIndicator />}
              <div ref={bottomRef} />
            </>
          )}
        </div>

        {/* Error banner */}
        {error && (
          <div className={styles.errorBanner} role="alert">
            ⚠️ {error}
          </div>
        )}

        {/* Input area */}
        <div className={styles.inputArea}>
          <div className={styles.inputWrap}>
            <textarea
              ref={inputRef}
              id="chat-input"
              className={styles.chatInput}
              placeholder={`Ask FinSolve AI anything (${roleConf.label} access)…`}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              disabled={loading}
            />
            <button
              id="chat-send-btn"
              className={styles.sendBtn}
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              aria-label="Send message"
            >
              {loading ? <span className={styles.sendSpinner} /> : '↑'}
            </button>
          </div>
          <p className={styles.inputHint}>Press Enter to send · Shift+Enter for new line</p>
        </div>
      </div>
    </div>
  );
}
