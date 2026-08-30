/**
 * DepartmentCard.jsx — High-Performance Enterprise Department Card
 * Optimized with React.memo, GPU layer caching, and lazy image decoding for smooth 60fps scrolling
 */
import { memo } from 'react';
import { ROLE_CONFIG } from '../../../../constants';
import { getDepartmentIcon, IconEdit, IconTrash, IconUsers, IconShield } from '../../../../shared/components/Icons';
import styles from '../../styles/control_center.module.css';

function DepartmentCard({ dept, count = 0, onViewDetails, onEdit, onDelete }) {
  const isImageSvgOrUrl = dept.image && (dept.image.startsWith('http') || dept.image.startsWith('/'));
  const deptKey = (dept.id || '').toLowerCase();
  const roleConfig = ROLE_CONFIG[deptKey] || {};
  const deptColor = roleConfig.color || (dept.status === 'Inactive' ? '#64748b' : '#3b82f6');
  const isActive = dept.status !== 'Inactive';

  return (
    <div
      className={styles.deptCard}
      onClick={() => onViewDetails(dept)}
      style={{ '--card-accent': deptColor }}
    >
      {/* Top Accent Indicator */}
      <div
        className={styles.deptCardTopBar}
        style={{
          background: `linear-gradient(90deg, ${deptColor}, ${deptColor}44, transparent)`,
        }}
      />

      {/* Card Header */}
      <div className={styles.deptCardHeader}>
        <div
          className={styles.deptCardEmojiTile}
          style={{
            background: `radial-gradient(circle, ${deptColor}25 0%, ${deptColor}0d 100%)`,
            borderColor: `${deptColor}40`,
            color: deptColor,
            boxShadow: `0 4px 16px ${deptColor}20`,
          }}
        >
          {isImageSvgOrUrl ? (
            <img
              src={dept.image}
              alt={dept.name}
              className={styles.deptCardImg}
              loading="lazy"
              decoding="async"
            />
          ) : (
            getDepartmentIcon(deptKey, 22)
          )}
        </div>

        <div className={styles.deptCardTitleWrap}>
          <div className={styles.deptCardNameRow}>
            <h3 className={styles.deptCardName}>{dept.name}</h3>
          </div>
          <div className={styles.deptCardMetaRow}>
            <span className={styles.deptCardKey}>
              <code>{dept.id}</code>
            </span>
            <span
              className={`${styles.deptStatusPill} ${
                isActive ? styles.statusActivePill : styles.statusInactivePill
              }`}
            >
              <span className={styles.statusPulseDot} />
              {isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>

        {/* Quick Action Buttons on Top-Right */}
        <div className={styles.deptCardQuickActions} onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            className={styles.deptIconBtn}
            onClick={() => onEdit(dept)}
            title="Edit department"
            aria-label={`Edit ${dept.name}`}
            id={`edit-dept-${dept.id}`}
          >
            <IconEdit size={14} />
          </button>
          <button
            type="button"
            className={`${styles.deptIconBtn} ${styles.deptDeleteBtn}`}
            onClick={() => onDelete(dept)}
            title="Delete department"
            aria-label={`Delete ${dept.name}`}
            id={`delete-dept-${dept.id}`}
          >
            <IconTrash size={14} />
          </button>
        </div>
      </div>

      {/* Card Description */}
      <p className={styles.deptCardDesc} title={dept.description}>
        {dept.description || 'Enterprise department knowledge domain and dedicated RAG vector scope.'}
      </p>

      {/* Interactive Stat Metrics */}
      <div className={styles.deptMetricsRow}>
        <div className={styles.deptMetricChip}>
          <IconUsers size={14} />
          <span>
            <strong>{count}</strong> {count === 1 ? 'Member' : 'Members'}
          </span>
        </div>

        <div className={styles.deptMetricChip}>
          <IconShield size={14} />
          <span>RAG Scope</span>
        </div>
      </div>

      {/* Card Footer Button */}
      <div className={styles.deptCardFooter}>
        <button
          type="button"
          className={styles.viewDeptActionBtn}
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails(dept);
          }}
          id={`view-dept-${dept.id}`}
        >
          <span>Explore Department</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={styles.arrowIcon}>
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default memo(DepartmentCard);
