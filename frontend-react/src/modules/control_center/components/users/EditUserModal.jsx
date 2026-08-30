/**
 * EditUserModal.jsx — Edit User Account Details Modal
 * Clean, balanced 2-column grid layout with SVG icons & consistent SaaS design
 */
import { IconUsers, IconX } from '../../../../shared/components/Icons';
import styles from '../../styles/control_center.module.css';

export default function EditUserModal({
  isOpen,
  selectedUser,
  onClose,
  onSubmit,
  fullNameInput,
  setFullNameInput,
  passwordInput,
  setPasswordInput,
  roleInput,
  setRoleInput,
  isActiveInput,
  setIsActiveInput,
  departmentsList,
}) {
  if (!isOpen || !selectedUser) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className={styles.modalHeader}>
          <div className={styles.modalHeaderLeft}>
            <div className={styles.modalHeaderIcon}>
              <IconUsers size={20} />
            </div>
            <div>
              <h2 className={styles.modalTitle}>Edit Account Details</h2>
              <p className={styles.modalSubtitle}>Modify user credentials, permissions & activation state</p>
            </div>
          </div>
          <button className={styles.modalClose} onClick={onClose} aria-label="Close modal">
            <IconX size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={onSubmit} id="edit-user-form">
          <div className={styles.modalBody}>
            {/* Row 1: Full Name & Username */}
            <div className={styles.fieldGrid2}>
              <div className={styles.field}>
                <label htmlFor="edit-fullname">Full Name</label>
                <input
                  id="edit-fullname"
                  type="text"
                  placeholder="Update employee's name"
                  value={fullNameInput}
                  onChange={(e) => setFullNameInput(e.target.value)}
                  required
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="edit-username">Username</label>
                <input
                  id="edit-username"
                  type="text"
                  value={selectedUser.username}
                  disabled
                  className={styles.disabledInput}
                />
              </div>
            </div>

            {/* Row 2: Password Override & Department Scope */}
            <div className={styles.fieldGrid2}>
              <div className={styles.field}>
                <label htmlFor="edit-password">New Password</label>
                <input
                  id="edit-password"
                  type="password"
                  placeholder="Leave empty to keep current"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                />
              </div>

              {selectedUser.username !== 'root' ? (
                <div className={styles.field}>
                  <label htmlFor="edit-role">Assigned Department</label>
                  <select
                    id="edit-role"
                    value={roleInput}
                    onChange={(e) => setRoleInput(e.target.value)}
                  >
                    {departmentsList.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name} ({dept.id})
                      </option>
                    ))}
                    <option value="root">System Administrator (Root)</option>
                  </select>
                </div>
              ) : (
                <div className={styles.field}>
                  <label>Assigned Department</label>
                  <input
                    type="text"
                    value="System Administrator (Root)"
                    disabled
                    className={styles.disabledInput}
                  />
                </div>
              )}
            </div>

            {/* Row 3: Account Active Switch */}
            {selectedUser.username !== 'root' && (
              <div className={styles.fieldCheckbox}>
                <input
                  id="edit-active"
                  type="checkbox"
                  checked={isActiveInput}
                  onChange={(e) => setIsActiveInput(e.target.checked)}
                />
                <label htmlFor="edit-active">
                  <strong>Account Active</strong> — Grant access to platform and assigned vector scopes
                </label>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className={styles.modalFooter}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={styles.confirmBtn} id="edit-user-submit-btn">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
