/**
 * EditDepartmentModal.jsx — Edit Department Modal
 */
import styles from '../../styles/control_center.module.css';

export default function EditDepartmentModal({
  isOpen,
  editingDept,
  onClose,
  onSubmit,
  deptNameInput,
  setDeptNameInput,
  deptEmojiInput,
  setDeptEmojiInput,
  deptStatusInput,
  setDeptStatusInput,
  deptDescInput,
  setDeptDescInput,
}) {
  if (!isOpen || !editingDept) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Edit Department Details</h2>
          <button className={styles.modalClose} onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={onSubmit} id="edit-dept-form">
          <div className={styles.modalBody}>
            <div className={styles.field}>
              <label>Department Key ID</label>
              <input
                type="text"
                value={editingDept.id}
                disabled
                style={{ background: '#1e293b', cursor: 'not-allowed', color: '#94a3b8' }}
              />
            </div>

            <div className={styles.fieldRow}>
              <div className={styles.field} style={{ flex: 1 }}>
                <label htmlFor="edit-dept-emoji">Icon / Image URL</label>
                <input
                  id="edit-dept-emoji"
                  type="text"
                  value={deptEmojiInput}
                  onChange={(e) => setDeptEmojiInput(e.target.value)}
                  required
                />
              </div>

              <div className={styles.field} style={{ flex: 1 }}>
                <label htmlFor="edit-dept-status">Status</label>
                <select
                  id="edit-dept-status"
                  value={deptStatusInput}
                  onChange={(e) => setDeptStatusInput(e.target.value)}
                  style={{ height: '42px' }}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className={styles.field} style={{ flex: 2 }}>
                <label htmlFor="edit-dept-name">Department Name</label>
                <input
                  id="edit-dept-name"
                  type="text"
                  value={deptNameInput}
                  onChange={(e) => setDeptNameInput(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className={styles.field}>
              <label htmlFor="edit-dept-desc">Description</label>
              <textarea
                id="edit-dept-desc"
                value={deptDescInput}
                onChange={(e) => setDeptDescInput(e.target.value)}
                rows={3}
                className={styles.modalTextarea}
                required
              />
            </div>
          </div>

          <div className={styles.modalFooter}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={styles.confirmBtn} id="submit-edit-dept">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
