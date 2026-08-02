/**
 * AddUserModal.jsx — Register New User Account Modal
 */
import styles from '../../styles/control_center.module.css';

export default function AddUserModal({
  isOpen,
  onClose,
  onSubmit,
  fullNameInput,
  setFullNameInput,
  usernameInput,
  setUsernameInput,
  passwordInput,
  setPasswordInput,
  roleInput,
  setRoleInput,
  departmentsList,
}) {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Register New Account</h2>
          <button className={styles.modalClose} onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={onSubmit} id="create-user-form">
          <div className={styles.modalBody}>
            <div className={styles.field}>
              <label htmlFor="create-fullname">Full Name</label>
              <input
                id="create-fullname"
                type="text"
                placeholder="Enter employee's name"
                value={fullNameInput}
                onChange={(e) => setFullNameInput(e.target.value)}
                required
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="create-username">Username</label>
              <input
                id="create-username"
                type="text"
                placeholder="Enter unique username"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                required
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="create-password">Password</label>
              <input
                id="create-password"
                type="password"
                placeholder="Enter secure password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                required
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="create-role">Assigned Department</label>
              <select
                id="create-role"
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
          </div>
          <div className={styles.modalFooter}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={styles.confirmBtn} id="create-user-submit-btn">
              Create User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
