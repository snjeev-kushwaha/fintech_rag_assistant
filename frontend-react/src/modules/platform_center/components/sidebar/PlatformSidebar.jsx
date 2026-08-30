import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ROLE_CONFIG } from '../../../../constants';
import { useTheme } from '../../../../context/ThemeContext';
import {
  IconMessageSquare,
  IconUsers,
  IconPlus,
  IconEdit,
  IconTrash,
  IconLogOut,
  IconSun,
  IconMoon,
  IconPalette,
  IconCheck,
  IconSparkles,
  IconX,
} from '../../../../shared/components/Icons';
import styles from '../../styles/platform_center.module.css';

export default function PlatformSidebar({
  sidebarOpen,
  toggleSidebar,
  mobileOpen,
  setMobileOpen,
  auth,
  logout,
  sessions,
  activeSessionId,
  onSelectSession,
  onDeleteSession,
  onRenameSession,
  onNewChat,
  onOpenProfile,
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, setMode, colorTheme, setColorTheme, COLOR_THEMES } = useTheme();
  const [showThemePopover, setShowThemePopover] = useState(false);
  const [activeMenuSessionId, setActiveMenuSessionId] = useState(null);
  const [editingSessionId, setEditingSessionId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const popoverRef = useRef(null);
  const editInputRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setShowThemePopover(false);
      }
      // Close active triple dot dropdown when clicking outside
      if (!event.target.closest(`.${styles.recentMenuDropdown}`) && !event.target.closest(`.${styles.recentOptionsBtn}`)) {
        setActiveMenuSessionId(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (editingSessionId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingSessionId]);

  function startRename(session, e) {
    e?.stopPropagation();
    const sId = session.session_id || session.id;
    setEditingSessionId(sId);
    setEditTitle(session.title || '');
    setActiveMenuSessionId(null);
  }

  function handleSaveRename(sId, e) {
    e?.preventDefault();
    e?.stopPropagation();
    if (editTitle.trim() && onRenameSession) {
      onRenameSession(sId, editTitle.trim());
    }
    setEditingSessionId(null);
  }

  function handleCancelRename(e) {
    e?.stopPropagation();
    setEditingSessionId(null);
  }

  const roleConf = ROLE_CONFIG[auth.role] || {
    color: '#10a37f',
    label: auth.displayName || auth.role,
    suggestions: [],
  };

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
          <div className={styles.logoIcon}>
            <IconSparkles size={16} />
          </div>
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
            <IconPlus size={16} />
            <span>New chat</span>
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.6 }}>
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
            className={`${styles.navItem} ${!location.pathname.startsWith('/team') ? styles.activeNav : ''}`}
            onClick={() => {
              navigate('/chat');
              setMobileOpen(false);
            }}
            id="nav-chat-tab"
            title="RAG Assistant"
          >
            <span className={styles.navIcon}>
              <IconMessageSquare size={17} />
            </span>
            {sidebarOpen && <span className={styles.navLabel}>RAG Assistant</span>}
          </button>

          <button
            className={`${styles.navItem} ${location.pathname.startsWith('/team') ? styles.activeNav : ''}`}
            onClick={() => {
              navigate('/team');
              setMobileOpen(false);
            }}
            id="nav-team-tab"
            title="Department Team"
          >
            <span className={styles.navIcon}>
              <IconUsers size={17} />
            </span>
            {sidebarOpen && <span className={styles.navLabel}>Department Team</span>}
          </button>
        </nav>

        {/* Recent Chat Sessions with Triple Dot Options */}
        {sidebarOpen && !location.pathname.startsWith('/team') && sessions && sessions.length > 0 && (
          <div className={styles.sidebarSection}>
            <div className={styles.sidebarSectionTitle}>Recents</div>
            <div className={styles.suggestionsList}>
              {sessions.map((session) => {
                const sId = session.session_id || session.id;
                const isActive = sId === activeSessionId;
                const isMenuOpen = activeMenuSessionId === sId;
                const isEditing = editingSessionId === sId;

                if (isEditing) {
                  return (
                    <div key={sId} className={`${styles.recentItemRow} ${styles.activeRecentRow}`}>
                      <form
                        className={styles.renameForm}
                        onSubmit={(e) => handleSaveRename(sId, e)}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          ref={editInputRef}
                          type="text"
                          className={styles.renameInput}
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Escape') handleCancelRename(e);
                          }}
                        />
                        <button
                          type="submit"
                          className={`${styles.renameActionBtn} ${styles.renameSaveBtn}`}
                          title="Save Title"
                        >
                          <IconCheck size={14} />
                        </button>
                        <button
                          type="button"
                          className={styles.renameActionBtn}
                          onClick={handleCancelRename}
                          title="Cancel"
                        >
                          <IconX size={14} />
                        </button>
                      </form>
                    </div>
                  );
                }

                return (
                  <div
                    key={sId}
                    className={`${styles.recentItemRow} ${isActive ? styles.activeRecentRow : ''} ${
                      isMenuOpen ? styles.activeMenuOpen : ''
                    }`}
                  >
                    <button
                      className={`${styles.suggestionItem} ${isActive ? styles.activeSuggestionItem : ''}`}
                      onClick={() => onSelectSession(sId)}
                      title={session.title}
                    >
                      <IconMessageSquare size={14} style={{ opacity: 0.75, flexShrink: 0 }} />
                      <span className={styles.suggestionText}>{session.title}</span>
                    </button>

                    {/* Triple Dot Options Button */}
                    <button
                      className={styles.recentOptionsBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuSessionId((prev) => (prev === sId ? null : sId));
                      }}
                      title="Chat options"
                      aria-label={`Options for ${session.title}`}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="1.5" />
                        <circle cx="19" cy="12" r="1.5" />
                        <circle cx="5" cy="12" r="1.5" />
                      </svg>
                    </button>

                    {/* Floating Dropdown Menu for Rename & Delete */}
                    {isMenuOpen && (
                      <div
                        className={styles.recentMenuDropdown}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          className={styles.recentMenuItem}
                          onClick={(e) => startRename(session, e)}
                        >
                          <IconEdit size={13} />
                          <span>Rename</span>
                        </button>
                        <button
                          className={`${styles.recentMenuItem} ${styles.recentMenuItemDelete}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuSessionId(null);
                            if (onDeleteSession) onDeleteSession(sId);
                          }}
                        >
                          <IconTrash size={13} />
                          <span>Delete</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* User Profile & Theme Controls Footer */}
      {sidebarOpen && (
        <div className={styles.sidebarFooter} ref={popoverRef}>
          {/* Floating Color Theme Popover */}
          {showThemePopover && (
            <div className={styles.themePopover}>
              <div className={styles.themePopoverHeader}>
                <div className={styles.themePopoverTitle}>Color theme</div>
                <div className={styles.themePopoverSubtitle}>Independent from light and dark mode</div>
              </div>
              <div className={styles.themePopoverList}>
                {COLOR_THEMES.map((item) => {
                  const isSelected = item.id === colorTheme;
                  return (
                    <button
                      key={item.id}
                      className={`${styles.themePopoverItem} ${isSelected ? styles.activeThemePopoverItem : ''}`}
                      onClick={() => {
                        setColorTheme(item.id);
                        setShowThemePopover(false);
                      }}
                    >
                      <div className={styles.themeItemLeft}>
                        <div
                          className={styles.themeSwatch}
                          style={{ backgroundColor: item.color }}
                        />
                        <div className={styles.themeItemText}>
                          <span className={styles.themeName}>{item.name}</span>
                          <span className={styles.themeDesc}>{item.desc}</span>
                        </div>
                      </div>
                      {isSelected && (
                        <span className={styles.themeCheckmark}>
                          <IconCheck size={14} />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* User Profile Card - Click to Open Centered Profile Details Modal */}
          <div
            className={styles.userCard}
            onClick={() => {
              setShowThemePopover(false);
              if (onOpenProfile) onOpenProfile();
              setMobileOpen(false);
            }}
            title="Click to view Profile Details"
            role="button"
            tabIndex={0}
          >
            <div className={styles.userInfoLeft}>
              <div className={styles.userAvatar}>{userInitials}</div>
              <div className={styles.userText}>
                <span className={styles.userName}>{auth.displayName || auth.username}</span>
                <div className={styles.userRoleRow}>
                  <span>{roleConf.label}</span>
                  <span className={styles.statusDot}></span>
                </div>
              </div>
            </div>
            <button
              className={styles.miniLogoutBtn}
              onClick={(e) => {
                e.stopPropagation();
                logout();
              }}
              title="Sign Out"
              aria-label="Sign Out"
            >
              <IconLogOut size={14} />
            </button>
          </div>

          {/* Light / Dark Mode & Theme Palette Toolbar */}
          <div className={styles.themeToolbar}>
            <div className={styles.themeModeGroup}>
              <button
                className={`${styles.themeModeBtn} ${theme === 'light' ? styles.activeThemeMode : ''}`}
                onClick={() => setMode('light')}
                title="Light Mode"
              >
                <IconSun size={14} />
                <span>Light</span>
              </button>
              <button
                className={`${styles.themeModeBtn} ${theme === 'dark' ? styles.activeThemeMode : ''}`}
                onClick={() => setMode('dark')}
                title="Dark Mode"
              >
                <IconMoon size={14} />
                <span>Dark</span>
              </button>
            </div>
            <button
              className={`${styles.paletteBtn} ${showThemePopover ? styles.activePaletteBtn : ''}`}
              onClick={() => setShowThemePopover((prev) => !prev)}
              title="Color Themes"
              aria-label="Select Color Theme"
            >
              <IconPalette size={15} />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
