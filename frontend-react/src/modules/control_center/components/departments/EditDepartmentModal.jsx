/**
 * EditDepartmentModal.jsx — Edit Department Details Modal
 * Clean, balanced 2-column grid layout with SVG icons & consistent SaaS design
 */
import { IconBuilding, IconX } from '../../../../shared/components/Icons';
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
        {/* Modal Header */}
        <div className={styles.modalHeader}>
          <div className={styles.modalHeaderLeft}>
            <div className={styles.modalHeaderIcon}>
              <IconBuilding size={20} />
            </div>
            <div>
              <h2 className={styles.modalTitle}>Edit Department Details</h2>
              <p className={styles.modalSubtitle}>Update knowledge domain settings & access configurations</p>
            </div>
          </div>
          <button className={styles.modalClose} onClick={onClose} aria-label="Close modal">
            <IconX size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={onSubmit} id="edit-dept-form">
          <div className={styles.modalBody}>
            {/* Row 1: Name and Key */}
            <div className={styles.fieldGrid2}>
              <div className={styles.field}>
                <label htmlFor="edit-dept-name">Department Name</label>
                <input
                  id="edit-dept-name"
                  type="text"
                  placeholder="e.g. Compliance & Legal"
                  value={deptNameInput}
                  onChange={(e) => setDeptNameInput(e.target.value)}
                  required
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="edit-dept-key">Role Key / Identifier</label>
                <input
                  id="edit-dept-key"
                  type="text"
                  value={editingDept.id}
                  disabled
                  className={styles.disabledInput}
                />
              </div>
            </div>

            {/* Row 2: Status and Icon Scope */}
            <div className={styles.fieldGrid2}>
              <div className={styles.field}>
                <label htmlFor="edit-dept-status">Operational Status</label>
                <select
                  id="edit-dept-status"
                  value={deptStatusInput}
                  onChange={(e) => setDeptStatusInput(e.target.value)}
                >
                  <option value="Active">Active (RAG Enabled)</option>
                  <option value="Inactive">Inactive (Disabled)</option>
                </select>
              </div>

              <div className={styles.field}>
                <label htmlFor="edit-dept-emoji">Category / Icon Tag (Optional)</label>
                <input
                  id="edit-dept-emoji"
                  type="text"
                  placeholder="e.g. legal, finance, or image URL"
                  value={deptEmojiInput}
                  onChange={(e) => setDeptEmojiInput(e.target.value)}
                />
              </div>
            </div>

            {/* Row 3: Description */}
            <div className={styles.field}>
              <label htmlFor="edit-dept-desc">Department Description</label>
              <textarea
                id="edit-dept-desc"
                placeholder="Describe the department responsibilities, document types, and knowledge boundaries..."
                value={deptDescInput}
                onChange={(e) => setDeptDescInput(e.target.value)}
                rows={3}
                className={styles.modalTextarea}
                required
              />
            </div>
          </div>

          {/* Modal Footer */}
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
