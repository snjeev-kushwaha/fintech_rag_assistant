/**
 * ControlCenterSidebar.jsx — Master Root Admin Sidebar with URL Navigation & Theme Controls
 * Uses clean SVG iconography (no emojis)
 */
import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../../../../context/ThemeContext';
import {
  IconUsers,
  IconBuilding,
  IconLogOut,
  IconSun,
  IconMoon,
  IconPalette,
  IconCheck,
  IconSparkles,
} from '../../../../shared/components/Icons';
import styles from '../../styles/control_center.module.css';

export default function ControlCenterSidebar({
  sidebarOpen,
  toggleSidebar,
  mobileOpen,
  setMobileOpen,
  auth,
  logout,
  onOpenProfile,
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, setMode, colorTheme, setColorTheme, COLOR_THEMES } = useTheme();
  const [showThemePopover, setShowThemePopover] = useState(false);
  const popoverRef = useRef(null);

  const isUsersActive = location.pathname.startsWith('/admin/users');
  const isDeptsActive =
    location.pathname.startsWith('/admin/departments') ||
    location.pathname === '/admin' ||
    location.pathname === '/admin/';

  useEffect(() => {
    function handleClickOutside(event) {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setShowThemePopover(false);
      }
    }
    if (showThemePopover) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showThemePopover]);

  const userInitials = (auth.displayName || auth.username || 'SA')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <aside
      className={`${styles.sidebar} ${
        sidebarOpen ? styles.sidebarExpanded : styles.sidebarCollapsed
      } ${mobileOpen ? styles.mobileOpen : ''}`}
    >
      {/* Sidebar Header */}
      <div className={styles.sidebarHeader}>
        <div className={styles.brandRow}>
          <div className={styles.logoIconTile}>
            <IconSparkles size={18} />
          </div>
          {sidebarOpen && (
            <div className={styles.brandText}>
              <span className={styles.brandTitle}>FinSolve Admin</span>
              <span className={styles.brandSubtitle}>Control Center</span>
            </div>
          )}
        </div>
        <button
          className={styles.sidebarToggle}
          onClick={toggleSidebar}
          title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          id="admin-sidebar-toggle"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <line x1="9" y1="3" x2="9" y2="21" />
          </svg>
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className={styles.navMenu}>
        <button
          className={`${styles.navItem} ${isUsersActive ? styles.activeNav : ''}`}
          onClick={() => {
            navigate('/admin/users');
            setMobileOpen(false);
          }}
          id="nav-users-tab"
          data-tooltip={!sidebarOpen ? 'User Accounts' : undefined}
          title={!sidebarOpen ? 'User Accounts' : undefined}
        >
          <span className={styles.navIcon}>
            <IconUsers size={18} />
          </span>
          {sidebarOpen && <span className={styles.navLabel}>User Accounts</span>}
        </button>
        <button
          className={`${styles.navItem} ${isDeptsActive ? styles.activeNav : ''}`}
          onClick={() => {
            navigate('/admin/departments');
            setMobileOpen(false);
          }}
          id="nav-departments-tab"
          data-tooltip={!sidebarOpen ? 'Department Tracker' : undefined}
          title={!sidebarOpen ? 'Department Tracker' : undefined}
        >
          <span className={styles.navIcon}>
            <IconBuilding size={18} />
          </span>
          {sidebarOpen && <span className={styles.navLabel}>Department Tracker</span>}
        </button>
      </nav>

      {/* Admin Profile & Theme Controls Footer */}
      <div className={styles.sidebarFooter} ref={popoverRef}>
        {/* Floating Color Theme Popover */}
        {showThemePopover && sidebarOpen && (
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
                      <span
                        className={styles.themeSwatch}
                        style={{ background: item.primary }}
                      />
                      <div className={styles.themeItemText}>
                        <span className={styles.themeName}>{item.name}</span>
                        <span className={styles.themeDesc}>{item.description}</span>
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

        {/* 1. Admin User Card (Click to open Centered Profile Details Modal) */}
        <div
          className={styles.userCard}
          onClick={onOpenProfile}
          title={!sidebarOpen ? `Administrator (${auth.username})` : 'Click to view administrator profile'}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onOpenProfile()}
        >
          <div className={styles.userInfoLeft}>
            <div className={styles.userAvatar}>
              {userInitials}
            </div>
            {sidebarOpen && (
              <div className={styles.userText}>
                <span className={styles.userName}>{auth.displayName || 'System Admin'}</span>
                <span className={styles.userRoleRow}>
                  <span className={styles.statusDot} />
                  <span>@{auth.username}</span>
                </span>
              </div>
            )}
          </div>
          {sidebarOpen && (
            <button
              className={styles.miniLogoutBtn}
              onClick={(e) => {
                e.stopPropagation();
                logout();
              }}
              title="Log out of Control Center"
              aria-label="Log out"
              id="admin-logout-btn"
            >
              <IconLogOut size={16} />
            </button>
          )}
        </div>

        {/* 2. Toolbar: Light/Dark Mode + Palette Selector (Below Profile) */}
        {sidebarOpen && (
          <div className={styles.themeToolbar}>
            <div className={styles.themeModeGroup}>
              <button
                type="button"
                className={`${styles.themeModeBtn} ${theme === 'dark' ? styles.activeThemeMode : ''}`}
                onClick={() => setMode('dark')}
                title="Switch to Dark Mode"
                aria-label="Dark Mode"
              >
                <IconMoon size={14} />
                <span>Dark</span>
              </button>
              <button
                type="button"
                className={`${styles.themeModeBtn} ${theme === 'light' ? styles.activeThemeMode : ''}`}
                onClick={() => setMode('light')}
                title="Switch to Light Mode"
                aria-label="Light Mode"
              >
                <IconSun size={14} />
                <span>Light</span>
              </button>
            </div>

            <button
              type="button"
              className={`${styles.paletteBtn} ${showThemePopover ? styles.activePaletteBtn : ''}`}
              onClick={() => setShowThemePopover((prev) => !prev)}
              title="Change Accent Color Theme"
              aria-label="Change Accent Color Theme"
            >
              <IconPalette size={15} />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
