/**
 * ConfirmDeleteModal.jsx — Reusable Enterprise Confirmation Modal for Delete Actions
 * Replaces crude browser window.confirm / alert with a sleek, themed dialog
 */
import { IconTrash, IconX } from './Icons';
import styles from './ConfirmDeleteModal.module.css';

export default function ConfirmDeleteModal({
  isOpen,
  title = 'Delete Item',
  itemName = '',
  itemType = 'item',
  description,
  onCancel,
  onConfirm,
  loading = false,
}) {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onCancel}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-delete-title"
      >
        {/* Modal Header */}
        <div className={styles.modalHeader}>
          <div className={styles.modalHeaderLeft}>
            <div className={styles.dangerIconTile}>
              <IconTrash size={18} />
            </div>
            <div>
              <h2 id="confirm-delete-title" className={styles.modalTitle}>
                {title}
              </h2>
              <p className={styles.modalSubtitle}>Permanent Removal Confirmation</p>
            </div>
          </div>
          <button
            type="button"
            className={styles.modalClose}
            onClick={onCancel}
            aria-label="Close dialog"
          >
            <IconX size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div className={styles.modalBody}>
          <p className={styles.messageText}>
            Are you sure you want to delete this {itemType}?
          </p>
          {itemName && (
            <div className={styles.itemBadge}>
              <code>{itemName}</code>
            </div>
          )}
          <p className={styles.warningText}>
            {description ||
              'This action is irreversible and will permanently remove this record from the database.'}
          </p>
        </div>

        {/* Modal Footer */}
        <div className={styles.modalFooter}>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="button"
            className={styles.deleteConfirmBtn}
            onClick={onConfirm}
            disabled={loading}
            id="confirm-delete-action-btn"
          >
            <IconTrash size={14} />
            <span>{loading ? 'Deleting...' : 'Yes, Delete'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
