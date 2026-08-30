/**
 * AddUserModal.jsx — Register New User Account Modal
 * Clean, balanced 2-column grid layout with SVG icons & zero pre-filled default data
 */
import { IconUsers, IconX } from '../../../../shared/components/Icons';
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
        {/* Modal Header */}
        <div className={styles.modalHeader}>
          <div className={styles.modalHeaderLeft}>
            <div className={styles.modalHeaderIcon}>
              <IconUsers size={20} />
            </div>
            <div>
              <h2 className={styles.modalTitle}>Register New Account</h2>
              <p className={styles.modalSubtitle}>Create role-based credentials for enterprise chatbot access</p>
            </div>
          </div>
          <button className={styles.modalClose} onClick={onClose} aria-label="Close modal">
            <IconX size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={onSubmit} id="create-user-form" autoComplete="off">
          <div className={styles.modalBody}>
            {/* Row 1: Full Name & Username */}
            <div className={styles.fieldGrid2}>
              <div className={styles.field}>
                <label htmlFor="create-fullname">Full Name</label>
                <input
                  id="create-fullname"
                  type="text"
                  placeholder="e.g. Eleanor Vance"
                  value={fullNameInput}
                  onChange={(e) => setFullNameInput(e.target.value)}
                  autoComplete="off"
                  required
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="create-username">Username</label>
                <input
                  id="create-username"
                  type="text"
                  placeholder="e.g. eleanor_compliance"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  autoComplete="off"
                  required
                />
              </div>
            </div>

            {/* Row 2: Password & Department Scope */}
            <div className={styles.fieldGrid2}>
              <div className={styles.field}>
                <label htmlFor="create-password">Password</label>
                <input
                  id="create-password"
                  type="password"
                  placeholder="Enter secure password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  autoComplete="new-password"
                  required
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="create-role">Assigned Department</label>
                <select
                  id="create-role"
                  value={roleInput}
                  onChange={(e) => setRoleInput(e.target.value)}
                  required
                >
                  <option value="" disabled>Select department scope...</option>
                  {departmentsList.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name} ({dept.id})
                    </option>
                  ))}
                  <option value="root">System Administrator (Root)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
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
