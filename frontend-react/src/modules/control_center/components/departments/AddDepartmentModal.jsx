/**
 * AddDepartmentModal.jsx — Register New Corporate Department Modal
 */
import styles from '../../styles/control_center.module.css';

export default function AddDepartmentModal({
  isOpen,
  onClose,
  onSubmit,
  deptNameInput,
  setDeptNameInput,
  deptEmojiInput,
  setDeptEmojiInput,
  deptStatusInput,
  setDeptStatusInput,
  deptKeyInput,
  setDeptKeyInput,
  deptDescInput,
  setDeptDescInput,
}) {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Register New Department</h2>
          <button className={styles.modalClose} onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={onSubmit} id="create-dept-form">
          <div className={styles.modalBody}>
            <div className={styles.field}>
              <label htmlFor="create-dept-name">Department Name</label>
              <input
                id="create-dept-name"
                type="text"
                placeholder="e.g. Compliance & Legal"
                value={deptNameInput}
                onChange={(e) => setDeptNameInput(e.target.value)}
                required
              />
            </div>

            <div className={styles.fieldRow}>
              <div className={styles.field} style={{ flex: 1 }}>
                <label htmlFor="create-dept-emoji">Icon / Image URL</label>
                <input
                  id="create-dept-emoji"
                  type="text"
                  placeholder="e.g. 🔒 or https://..."
                  value={deptEmojiInput}
                  onChange={(e) => setDeptEmojiInput(e.target.value)}
                  required
                />
              </div>

              <div className={styles.field} style={{ flex: 1 }}>
                <label htmlFor="create-dept-status">Status</label>
                <select
                  id="create-dept-status"
                  value={deptStatusInput}
                  onChange={(e) => setDeptStatusInput(e.target.value)}
                  style={{ height: '42px' }}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className={styles.field} style={{ flex: 1.5 }}>
                <label htmlFor="create-dept-key">Role Key / ID</label>
                <input
                  id="create-dept-key"
                  type="text"
                  placeholder="e.g. compliance"
                  value={deptKeyInput}
                  onChange={(e) => setDeptKeyInput(e.target.value)}
                />
              </div>
            </div>

            <div className={styles.field}>
              <label htmlFor="create-dept-desc">Description</label>
              <textarea
                id="create-dept-desc"
                placeholder="Describe department scope and responsibilities..."
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
            <button type="submit" className={styles.confirmBtn} id="submit-create-dept">
              Create Department
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
