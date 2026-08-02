/**
 * ControlCenterSidebar.jsx — ChatGPT-style Collapsible Admin Sidebar with Settings Popup Trigger
 */
import styles from '../../styles/control_center.module.css';

export default function ControlCenterSidebar({
  sidebarOpen,
  toggleSidebar,
  mobileOpen,
  setMobileOpen,
  activeTab,
  setActiveTab,
  auth,
  logout,
  onOpenSettings,
}) {
  return (
    <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarExpanded : styles.sidebarCollapsed} ${mobileOpen ? styles.mobileOpen : ''}`}>
      {/* Sidebar Header */}
      <div className={styles.sidebarHeader}>
        <div className={styles.brandRow}>
          <div className={styles.logoIcon}>⚡</div>
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

      {/* Admin User Card */}
      <div
        className={styles.adminCard}
        data-tooltip={!sidebarOpen ? `${auth.username} (Superuser)` : undefined}
        title={!sidebarOpen ? `${auth.username} (Superuser)` : undefined}
      >
        <div className={styles.avatar}>👑</div>
        {sidebarOpen && (
          <div className={styles.adminInfo}>
            <div className={styles.adminUsername}>{auth.username}</div>
            <span className={styles.adminBadge}>Superuser</span>
          </div>
        )}
      </div>

      {/* Navigation Menu */}
      <nav className={styles.navMenu}>
        <button
          className={`${styles.navItem} ${activeTab === 'users' ? styles.activeNav : ''}`}
          onClick={() => {
            setActiveTab('users');
            setMobileOpen(false);
          }}
          id="nav-users-tab"
          data-tooltip={!sidebarOpen ? 'User Accounts' : undefined}
          title={!sidebarOpen ? 'User Accounts' : undefined}
        >
          <span className={styles.navIcon}>👤</span>
          {sidebarOpen && <span className={styles.navLabel}>User Accounts</span>}
        </button>
        <button
          className={`${styles.navItem} ${activeTab === 'departments' || activeTab === 'dept-detail' ? styles.activeNav : ''}`}
          onClick={() => {
            setActiveTab('departments');
            setMobileOpen(false);
          }}
          id="nav-departments-tab"
          data-tooltip={!sidebarOpen ? 'Department Tracker' : undefined}
          title={!sidebarOpen ? 'Department Tracker' : undefined}
        >
          <span className={styles.navIcon}>📊</span>
          {sidebarOpen && <span className={styles.navLabel}>Department Tracker</span>}
        </button>

        {/* Settings Popup Nav Item */}
        <button
          className={styles.navItem}
          onClick={() => {
            if (onOpenSettings) onOpenSettings();
            setMobileOpen(false);
          }}
          id="nav-settings-tab"
          data-tooltip={!sidebarOpen ? 'Settings' : undefined}
          title={!sidebarOpen ? 'Settings' : undefined}
        >
          <span className={styles.navIcon}>⚙️</span>
          {sidebarOpen && <span className={styles.navLabel}>Settings</span>}
        </button>
      </nav>

      {/* Sign Out Button */}
      <div className={styles.sidebarFooter}>
        <button
          className={styles.logoutBtn}
          onClick={logout}
          id="logout-btn"
          data-tooltip={!sidebarOpen ? 'Sign Out' : undefined}
          title={!sidebarOpen ? 'Sign Out' : undefined}
        >
          <span className={styles.logoutIcon}>🚪</span>
          {sidebarOpen && <span className={styles.logoutLabel}>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
