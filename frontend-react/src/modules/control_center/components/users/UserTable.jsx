/**
 * UserTable.jsx — Enterprise Grade User Accounts Data Table
 * Clean SVG iconography, initials avatar badges, and sleek icon-only actions
 */
import { ROLE_CONFIG } from '../../../../constants';
import { getDepartmentIcon, IconEdit, IconTrash, IconKey } from '../../../../shared/components/Icons';
import styles from '../../styles/control_center.module.css';

export default function UserTable({
  users,
  departmentsList,
  onEditUser,
  onDeleteUser,
}) {
  return (
    <div className={styles.tableResponsive}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>User</th>
            <th>Username</th>
            <th>Department / Role</th>
            <th>Account Status</th>
            <th style={{ textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => {
            const deptObj = departmentsList.find((d) => d.id === u.role || d.id === u.departmentId);
            const conf = ROLE_CONFIG[u.role] || (deptObj ? {
              color: deptObj.status === 'Inactive' ? '#64748b' : '#3b82f6',
              label: deptObj.name
            } : { color: '#94a3b8', label: u.role });

            const roleColor = conf.color || '#3b82f6';
            const initials = (u.full_name || u.username || 'U')
              .split(' ')
              .map((n) => n[0])
              .join('')
              .substring(0, 2)
              .toUpperCase();

            const isRoot = u.username === 'root';

            return (
              <tr key={u.username} className={styles.tableRow}>
                {/* User Info Column */}
                <td>
                  <div className={styles.userCellWrap}>
                    <div
                      className={styles.userTableAvatar}
                      style={{
                        background: `linear-gradient(135deg, ${roleColor}, ${roleColor}99)`,
                        boxShadow: `0 2px 8px ${roleColor}33`,
                      }}
                    >
                      {initials}
                    </div>
                    <div className={styles.userMeta}>
                      <span className={styles.userFullName}>{u.full_name}</span>
                      <span className={styles.userHandle}>@{u.username}</span>
                    </div>
                  </div>
                </td>

                {/* Monospace Username Pill */}
                <td>
                  <span className={styles.usernamePill}>
                    <IconKey size={12} className={styles.keyIcon} />
                    <code>{u.username}</code>
                  </span>
                </td>

                {/* Enterprise Department Role Badge */}
                <td>
                  <span
                    className={styles.roleBadge}
                    style={{
                      color: roleColor,
                      backgroundColor: `${roleColor}12`,
                      borderColor: `${roleColor}33`,
                    }}
                  >
                    <span className={styles.roleIconWrapper}>
                      {getDepartmentIcon(u.role, 13)}
                    </span>
                    <span>{conf.label}</span>
                  </span>
                </td>

                {/* Status Column */}
                <td>
                  <span
                    className={`${styles.deptStatusPill} ${
                      u.is_active ? styles.statusActivePill : styles.statusInactivePill
                    }`}
                  >
                    <span className={styles.statusPulseDot} />
                    {u.is_active ? 'Active' : 'Disabled'}
                  </span>
                </td>

                {/* Icon-Only Actions Column */}
                <td style={{ textAlign: 'right' }}>
                  <div className={styles.actionsCell}>
                    <button
                      className={styles.tableIconBtn}
                      onClick={() => onEditUser(u)}
                      title={`Edit ${u.full_name} (@${u.username})`}
                      aria-label={`Edit ${u.full_name}`}
                      id={`edit-user-${u.username}`}
                    >
                      <IconEdit size={15} />
                    </button>
                    {!isRoot && (
                      <button
                        className={`${styles.tableIconBtn} ${styles.deleteIconBtn}`}
                        onClick={() => onDeleteUser(u.username)}
                        title={`Delete @${u.username}`}
                        aria-label={`Delete ${u.username}`}
                        id={`delete-user-${u.username}`}
                      >
                        <IconTrash size={15} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
