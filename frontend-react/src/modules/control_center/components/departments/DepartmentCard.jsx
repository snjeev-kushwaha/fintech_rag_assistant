/**
 * DepartmentCard.jsx — Individual Department Card Component
 */
import styles from '../../styles/control_center.module.css';

export default function DepartmentCard({ dept, count, onViewDetails, onEdit, onDelete }) {
  const isImageSvgOrUrl = dept.image && (dept.image.startsWith('http') || dept.image.startsWith('/'));

  return (
    <div
      key={dept.id}
      className={styles.deptCard}
      style={{
        borderTop: `4px solid ${dept.status === 'Inactive' ? '#64748b' : '#3b82f6'}`,
        cursor: 'pointer',
      }}
      onClick={() => onViewDetails(dept)}
    >
      <div className={styles.deptCardHeader}>
        <div
          className={styles.deptCardEmoji}
          style={{
            background: `${dept.status === 'Inactive' ? '#64748b' : '#3b82f6'}18`,
            borderColor: `${dept.status === 'Inactive' ? '#64748b' : '#3b82f6'}44`,
          }}
        >
          {isImageSvgOrUrl ? (
            <img src={dept.image} alt={dept.name} style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
          ) : (
            dept.image || '🏢'
          )}
        </div>
        <div className={styles.deptCardTitleWrap}>
          <h3 className={styles.deptCardName}>{dept.name}</h3>
          <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
            <span className={styles.deptCardKey}><code>{dept.id}</code></span>
            <span className={dept.status === 'Inactive' ? styles.statusInactive : styles.statusActive}>
              {dept.status || 'Active'}
            </span>
          </div>
        </div>
      </div>

      <p className={styles.deptCardDesc}>{dept.description}</p>

      <div className={styles.deptCardFooter}>
        <div className={styles.deptUserBadge}>
          👥 <strong>{count}</strong> {count === 1 ? 'User' : 'Users'} Assigned
        </div>

        <div className={styles.deptCardActions}>
          <button
            className={styles.viewDeptBtn}
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(dept);
            }}
            title="View assigned department users"
            id={`view-dept-${dept.id}`}
          >
            👁️ Details
          </button>
          <button
            className={styles.editBtn}
            onClick={(e) => {
              e.stopPropagation();
              onEdit(dept);
            }}
            title="Edit department"
            id={`edit-dept-${dept.id}`}
          >
            ✏️ Edit
          </button>
          <button
            className={styles.deleteBtn}
            onClick={(e) => {
              e.stopPropagation();
              onDelete(dept);
            }}
            title="Delete department"
            id={`delete-dept-${dept.id}`}
          >
            🗑️ Delete
          </button>
        </div>
      </div>
    </div>
  );
}
