/**
 * UserProfileModal.jsx — Clean Centered Modal Dialog for User Profile & Department Details
 * Uses clean SVG iconography (No childish emojis)
 */
import { ROLE_CONFIG, ACCESS_MAP } from '../../../../constants';
import { getDepartmentIcon, IconUsers, IconShield, IconLogOut } from '../../../../shared/components/Icons';
import styles from '../../styles/platform_center.module.css';

export default function UserProfileModal({ isOpen, onClose, auth, logout }) {
  if (!isOpen || !auth) return null;

  const roleConf = ROLE_CONFIG[auth.role] || {
    color: '#10a37f',
    label: auth.displayName || auth.role,
  };

  const rawMap = ACCESS_MAP[auth.role] || {};
  const accessScope = Array.isArray(rawMap)
    ? rawMap
    : Object.entries(rawMap)
        .filter(([, allowed]) => allowed)
        .map(([dept]) => `${dept.charAt(0).toUpperCase() + dept.slice(1)} Data`);

  if (accessScope.length === 0) {
    accessScope.push('General Company Info');
  }

  const userInitials = (auth.displayName || auth.username || 'U')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        style={{ width: '520px', maxWidth: '92vw' }}
      >
        {/* Modal Header */}
        <div className={styles.modalHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <IconUsers size={20} style={{ color: 'var(--theme-accent, #10a37f)' }} />
            <h2>User Profile Details</h2>
          </div>
          <button className={styles.modalClose} onClick={onClose} title="Close Profile">
            &times;
          </button>
        </div>

        {/* Modal Body */}
        <div className={styles.modalBody} style={{ gap: '1rem' }}>
          {/* Top User Summary Card */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              padding: '0.9rem 1rem',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'var(--theme-accent, #10a37f)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.15rem',
                fontWeight: '700',
                flexShrink: 0,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
              }}
            >
              {userInitials}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', minWidth: 0 }}>
              <div style={{ fontSize: '1.05rem', fontWeight: '700', color: 'inherit', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {auth.displayName || auth.username}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.8rem', color: '#8e8e8e' }}>@{auth.username}</span>
                <span
                  style={{
                    fontSize: '0.72rem',
                    padding: '0.15rem 0.55rem',
                    borderRadius: '9999px',
                    fontWeight: '600',
                    color: roleConf.color,
                    background: `${roleConf.color}18`,
                    border: `1px solid ${roleConf.color}40`,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                  }}
                >
                  {getDepartmentIcon(auth.role, 12)}
                  <span>{roleConf.label}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Account Details Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.75rem',
            }}
          >
            <div
              style={{
                padding: '0.75rem 0.9rem',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.25rem',
              }}
            >
              <span style={{ fontSize: '0.7rem', color: '#8e8e8e', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.03em' }}>
                Department Role
              </span>
              <span style={{ fontSize: '0.88rem', fontWeight: '600', color: 'inherit', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                {getDepartmentIcon(auth.role, 14)}
                <span>{roleConf.label}</span>
              </span>
            </div>

            <div
              style={{
                padding: '0.75rem 0.9rem',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.25rem',
              }}
            >
              <span style={{ fontSize: '0.7rem', color: '#8e8e8e', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.03em' }}>
                Account Status
              </span>
              <span style={{ fontSize: '0.88rem', fontWeight: '600', color: '#22c55e', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e' }}></span>
                Active & Authorized
              </span>
            </div>
          </div>

          {/* Authorized Knowledge Scopes */}
          <div>
            <label style={{ fontSize: '0.75rem', color: '#8e8e8e', textTransform: 'uppercase', fontWeight: '600', marginBottom: '0.45rem', display: 'block', letterSpacing: '0.03em' }}>
              Authorized Knowledge Scopes
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {accessScope.map((scope, idx) => (
                <span
                  key={idx}
                  style={{
                    fontSize: '0.78rem',
                    padding: '0.35rem 0.65rem',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: 'inherit',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                  }}
                >
                  <IconShield size={13} style={{ color: 'var(--theme-accent, #10a37f)' }} />
                  <span>{scope}</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className={styles.modalFooter} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {logout && (
            <button
              onClick={logout}
              style={{
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                color: '#f87171',
                padding: '0.45rem 0.9rem',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                transition: 'all 0.15s ease',
              }}
              title="Sign Out"
            >
              <IconLogOut size={14} />
              <span>Sign Out</span>
            </button>
          )}
          <button
            className={styles.confirmBtn}
            onClick={onClose}
            style={{ background: 'var(--theme-accent, #10a37f)', marginLeft: 'auto' }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
