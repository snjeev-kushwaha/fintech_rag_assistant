/**
 * EditUserModal.jsx — Edit User Account Details Modal
 */
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
        <div className={styles.modalHeader}>
          <h2>Edit Account Details</h2>
          <button className={styles.modalClose} onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={onSubmit} id="edit-user-form">
          <div className={styles.modalBody}>
            <div className={styles.field}>
              <label>Username</label>
              <input
                type="text"
                value={selectedUser.username}
                disabled
                style={{ background: '#1e293b', cursor: 'not-allowed', color: '#94a3b8' }}
              />
            </div>

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
              <label htmlFor="edit-password">New Password (leave blank to keep current)</label>
              <input
                id="edit-password"
                type="password"
                placeholder="Enter new password to override"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
              />
            </div>

            {selectedUser.username !== 'root' && (
              <div className={styles.field}>
                <label htmlFor="edit-role">Assigned Department</label>
                <select
                  id="edit-role"
                  value={roleInput}
                  onChange={(e) => setRoleInput(e.target.value)}
                >
                  {departmentsList.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.image && !dept.image.startsWith('http') ? dept.image + ' ' : ''}{dept.name} ({dept.id})
                    </option>
                  ))}
                  <option value="root">🔑 System Administrator (Root)</option>
                </select>
              </div>
            )}

            {selectedUser.username !== 'root' && (
              <div className={styles.fieldCheckbox}>
                <input
                  id="edit-active"
                  type="checkbox"
                  checked={isActiveInput}
                  onChange={(e) => setIsActiveInput(e.target.checked)}
                />
                <label htmlFor="edit-active">Enable User Account</label>
              </div>
            )}
          </div>
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
