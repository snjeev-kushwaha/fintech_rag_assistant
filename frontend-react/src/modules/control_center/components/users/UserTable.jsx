/**
 * UserTable.jsx — Registered User Accounts Table
 */
import { ROLE_CONFIG } from '../../../../constants';
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
            <th>Full Name</th>
            <th>Username</th>
            <th>Department (Role)</th>
            <th>Account Status</th>
            <th style={{ textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => {
            const deptObj = departmentsList.find((d) => d.id === u.role || d.id === u.departmentId);
            const conf = ROLE_CONFIG[u.role] || (deptObj ? {
              color: deptObj.status === 'Inactive' ? '#64748b' : '#3b82f6',
              emoji: deptObj.image && !deptObj.image.startsWith('http') ? deptObj.image : '🏢',
              label: deptObj.name
            } : { color: '#94a3b8', emoji: '👤', label: u.role });

            return (
              <tr key={u.username}>
                <td className={styles.fullNameCell}>{u.full_name}</td>
                <td className={styles.usernameCell}><code>{u.username}</code></td>
                <td>
                  <span
                    className={styles.badge}
                    style={{
                      color: conf.color,
                      borderColor: `${conf.color}55`,
                      background: `${conf.color}15`,
                    }}
                  >
                    {conf.emoji} {conf.label}
                  </span>
                </td>
                <td>
                  <span className={u.is_active ? styles.statusActive : styles.statusInactive}>
                    {u.is_active ? 'Active' : 'Disabled'}
                  </span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div className={styles.actionsCell}>
                    <button
                      className={styles.editBtn}
                      onClick={() => onEditUser(u)}
                      id={`edit-user-${u.username}`}
                    >
                      ✏️ Edit
                    </button>
                    {u.username !== 'root' && (
                      <button
                        className={styles.deleteBtn}
                        onClick={() => onDeleteUser(u.username)}
                        id={`delete-user-${u.username}`}
                      >
                        🗑️ Delete
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
