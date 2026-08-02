/**
 * PlatformSidebar.jsx — Authentic ChatGPT Left Sidebar with Multi-Session Chat History
 */
import { ROLE_CONFIG, ACCESS_MAP } from '../../../../constants';
import styles from '../../styles/platform_center.module.css';

export default function PlatformSidebar({
  sidebarOpen,
  toggleSidebar,
  mobileOpen,
  setMobileOpen,
  activeTab,
  setActiveTab,
  auth,
  logout,
  sessions,
  activeSessionId,
  onSelectSession,
  onDeleteSession,
  onNewChat,
  onSelectSuggestion,
}) {
  const roleConf = ROLE_CONFIG[auth.role] || {
    color: '#10a37f',
    emoji: auth.roleEmoji || '🏢',
    label: auth.displayName || auth.role,
    suggestions: [],
  };
  const accessMap = ACCESS_MAP[auth.role] || {};
  const accessibleDepts = Object.entries(accessMap)
    .filter(([, allowed]) => allowed)
    .map(([dept]) => dept);

  const userInitials = (auth.displayName || auth.username || 'U')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <aside
      className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarExpanded : styles.sidebarCollapsed} ${
        mobileOpen ? styles.mobileOpen : ''
      }`}
    >
      {/* Sidebar Header */}
      <div className={styles.sidebarHeader}>
        <div className={styles.brandRow}>
          <div className={styles.logoIcon}>⚡</div>
          {sidebarOpen && (
            <div className={styles.brandText}>
              <span className={styles.brandTitle}>FinSolve Portal</span>
              <span className={styles.brandSubtitle}>RAG Assistant</span>
            </div>
          )}
        </div>
        <button
          className={styles.sidebarToggle}
          onClick={toggleSidebar}
          title={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          id="platform-sidebar-toggle"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <line x1="9" y1="3" x2="9" y2="21" />
          </svg>
        </button>
      </div>

      {/* New Chat Button */}
      {sidebarOpen && (
        <button
          className={styles.newChatBtn}
          onClick={onNewChat}
          id="clear-conversation-btn"
          title="New Chat"
        >
          <div className={styles.newChatLeft}>
            <span>⚡</span>
            <span>New chat</span>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      )}

      {/* Scrollable Body */}
      <div className={styles.sidebarScrollBody}>
        {/* Navigation Tabs */}
        <nav className={styles.navMenu}>
          <button
            className={`${styles.navItem} ${activeTab === 'chat' ? styles.activeNav : ''}`}
            onClick={() => {
              setActiveTab('chat');
              setMobileOpen(false);
            }}
            id="nav-chat-tab"
            title="RAG Assistant"
          >
            <span className={styles.navIcon}>💬</span>
            {sidebarOpen && <span className={styles.navLabel}>RAG Assistant</span>}
          </button>

          <button
            className={`${styles.navItem} ${activeTab === 'team' ? styles.activeNav : ''}`}
            onClick={() => {
              setActiveTab('team');
              setMobileOpen(false);
            }}
            id="nav-team-tab"
            title="Department Team"
          >
            <span className={styles.navIcon}>👥</span>
            {sidebarOpen && <span className={styles.navLabel}>Department Team</span>}
          </button>

          <button
            className={`${styles.navItem} ${activeTab === 'profile' ? styles.activeNav : ''}`}
            onClick={() => {
              setActiveTab('profile');
              setMobileOpen(false);
            }}
            id="nav-profile-tab"
            title="My Profile"
          >
            <span className={styles.navIcon}>👤</span>
            {sidebarOpen && <span className={styles.navLabel}>My Profile</span>}
          </button>
        </nav>

        {/* Recent Chat Sessions */}
        {sidebarOpen && activeTab === 'chat' && sessions && sessions.length > 0 && (
          <div className={styles.sidebarSection}>
            <div className={styles.sidebarSectionTitle}>Recents</div>
            <div className={styles.suggestionsList}>
              {sessions.map((session) => {
                const sId = session.session_id || session.id;
                const isActive = sId === activeSessionId;
                return (
                  <div
                    key={sId}
                    className={`${styles.recentItemRow} ${isActive ? styles.activeRecentRow : ''}`}
                  >
                    <button
                      className={`${styles.suggestionItem} ${isActive ? styles.activeSuggestionItem : ''}`}
                      onClick={() => onSelectSession(sId)}
                      title={session.title}
                    >
                      <span>💬</span>
                      <span className={styles.suggestionText}>{session.title}</span>
                    </button>
                    {onDeleteSession && (
                      <button
                        className={styles.deleteRecentBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteSession(sId);
                        }}
                        title="Delete chat session"
                        aria-label={`Delete ${session.title}`}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Suggested Queries */}
        {sidebarOpen && activeTab === 'chat' && roleConf.suggestions && roleConf.suggestions.length > 0 && (
          <div className={styles.sidebarSection}>
            <div className={styles.sidebarSectionTitle}>Suggested Queries</div>
            <div className={styles.suggestionsList}>
              {roleConf.suggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  className={styles.suggestionItem}
                  onClick={() => onSelectSuggestion(suggestion)}
                  title={suggestion}
                >
                  <span>💡</span>
                  <span className={styles.suggestionText}>{suggestion}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Vector Access Scopes */}
        {sidebarOpen && accessibleDepts.length > 0 && (
          <div className={styles.sidebarSection}>
            <div className={styles.sidebarSectionTitle}>Vector Scope</div>
            <div className={styles.scopeBadgesList}>
              {accessibleDepts.map((dept) => (
                <span key={dept} className={styles.scopeBadge}>
                  • {dept} Data
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* User Profile & Sign Out Footer */}
      {sidebarOpen && (
        <div className={styles.sidebarFooter}>
          <div className={styles.userCard}>
            <div className={styles.userInfoLeft}>
              <div className={styles.userAvatar}>{userInitials}</div>
              <div className={styles.userText}>
                <span className={styles.userName}>{auth.displayName || auth.username}</span>
                <span className={styles.userRole}>{roleConf.label}</span>
              </div>
            </div>
          </div>

          <button
            className={styles.logoutBtn}
            onClick={logout}
            id="platform-logout-btn"
            title="Sign Out"
          >
            <span>🚪</span>
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </aside>
  );
}
