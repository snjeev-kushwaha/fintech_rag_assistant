/**
 * UserProfilePage.jsx — User Profile & Role Overview View
 */
import { ROLE_CONFIG, ACCESS_MAP } from '../../../constants';
import styles from '../styles/platform_center.module.css';

export default function UserProfilePage({ auth }) {
  const roleConf = ROLE_CONFIG[auth.role] || {
    color: '#3b82f6',
    emoji: auth.roleEmoji || '🏢',
    label: auth.displayName || auth.role,
  };
  
  const rawMap = ACCESS_MAP[auth.role] || {};
  const accessScope = Array.isArray(rawMap)
    ? rawMap
    : Object.entries(rawMap)
        .filter(([, allowed]) => allowed)
        .map(([dept]) => `${dept.charAt(0).toUpperCase() + dept.slice(1)} Knowledge Base`);

  if (accessScope.length === 0) {
    accessScope.push('General Knowledge Base');
  }

  return (
    <div className={styles.pageContainer}>
      <header className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>My User Profile</h1>
          <p className={styles.pageSubtitle}>Overview of credentials, role assignments, and data access scopes</p>
        </div>
      </header>

      <div className={styles.profileCard}>
        <div className={styles.profileHeader}>
          <div className={styles.profileAvatar} style={{ borderColor: roleConf.color }}>
            {roleConf.emoji}
          </div>
          <div>
            <h2 className={styles.profileName}>{auth.displayName || auth.username}</h2>
            <span className={styles.profileUsername}>@{auth.username}</span>
          </div>
        </div>

        <div className={styles.profileDetailsGrid}>
          <div className={styles.detailItem}>
            <label>Assigned Department</label>
            <div
              className={styles.profileBadge}
              style={{
                color: roleConf.color,
                borderColor: `${roleConf.color}55`,
                background: `${roleConf.color}15`,
              }}
            >
              {roleConf.emoji} {roleConf.label}
            </div>
          </div>

          <div className={styles.detailItem}>
            <label>Account Status</label>
            <span className={styles.statusActive}>● Active & Authorized</span>
          </div>

          <div className={styles.detailItem} style={{ gridColumn: '1 / -1' }}>
            <label>RAG Vector Search Access Scopes</label>
            <div className={styles.scopeTags}>
              {accessScope.map((scope, idx) => (
                <span key={idx} className={styles.scopeTag}>
                  🔒 {scope}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
