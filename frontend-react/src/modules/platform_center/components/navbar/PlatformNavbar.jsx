/**
 * PlatformNavbar.jsx — Header Navigation Bar for Department Users
 */
import { ROLE_CONFIG } from '../../../../constants';
import styles from '../../styles/platform_center.module.css';

export default function PlatformNavbar({ auth, activeTab, setActiveTab, logout }) {
  const roleConf = ROLE_CONFIG[auth.role] || {
    color: '#3b82f6',
    emoji: auth.roleEmoji || '🏢',
    label: auth.displayName || auth.role,
  };

  return (
    <header className={styles.navbar}>
      <div className={styles.navBrand}>
        <div className={styles.navLogo}>⚡</div>
        <div className={styles.navTitleWrap}>
          <span className={styles.navTitle}>FinSolve Portal</span>
          <span
            className={styles.navRoleBadge}
            style={{
              color: roleConf.color,
              borderColor: `${roleConf.color}55`,
              background: `${roleConf.color}15`,
            }}
          >
            {roleConf.emoji} {roleConf.label}
          </span>
        </div>
      </div>

      <nav className={styles.navLinks}>
        <button
          className={`${styles.navBtn} ${activeTab === 'chat' ? styles.activeNavBtn : ''}`}
          onClick={() => setActiveTab('chat')}
          id="nav-platform-chat"
        >
          🤖 RAG AI Assistant
        </button>
        <button
          className={`${styles.navBtn} ${activeTab === 'team' ? styles.activeNavBtn : ''}`}
          onClick={() => setActiveTab('team')}
          id="nav-platform-team"
        >
          👥 Department Team
        </button>
        <button
          className={`${styles.navBtn} ${activeTab === 'profile' ? styles.activeNavBtn : ''}`}
          onClick={() => setActiveTab('profile')}
          id="nav-platform-profile"
        >
          👤 My Profile
        </button>
      </nav>

      <div className={styles.navUser}>
        <div className={styles.userInfo}>
          <span className={styles.userName}>{auth.displayName || auth.username}</span>
          <span className={styles.userRole}>@{auth.username}</span>
        </div>
        <button className={styles.logoutBtn} onClick={logout} id="platform-logout-btn">
          Sign Out 🚪
        </button>
      </div>
    </header>
  );
}
