/**
 * ControlCenterPage.jsx — System Administrator Dashboard (CRUD operations + Department tracking)
 */
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiGetUsers, apiCreateUser, apiUpdateUser, apiDeleteUser } from '../api';
import { ROLE_CONFIG } from '../constants';
import styles from './ControlCenterPage.module.css';

export default function ControlCenterPage() {
  const { auth, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'tracker'
  
  // Data State
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Search / Filter State
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Form State
  const [usernameInput, setUsernameInput] = useState('');
  const [fullNameInput, setFullNameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [roleInput, setRoleInput] = useState('employee');
  const [isActiveInput, setIsActiveInput] = useState(true);

  // Load Users from Backend
  async function fetchUsers() {
    setLoading(true);
    setError('');
    try {
      const data = await apiGetUsers(auth.token);
      setUsers(data);
    } catch (err) {
      if (err.message === 'SESSION_EXPIRED') {
        logout();
      } else {
        setError(err.message || 'Failed to load user accounts.');
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle Create User Submit
  async function handleCreateUser(e) {
    e.preventDefault();
    setError('');
    if (!usernameInput.trim() || !passwordInput.trim() || !fullNameInput.trim()) {
      setError('Please fill in all required fields.');
      return;
    }
    
    try {
      const payload = {
        username: usernameInput.trim(),
        password: passwordInput,
        role: roleInput,
        full_name: fullNameInput.trim()
      };
      await apiCreateUser(payload, auth.token);
      
      // Reset Form and Modal
      setUsernameInput('');
      setFullNameInput('');
      setPasswordInput('');
      setRoleInput('employee');
      setShowCreateModal(false);
      
      // Refresh Data
      fetchUsers();
    } catch (err) {
      setError(err.message || 'Error creating user account.');
    }
  }

  // Open Edit Modal
  function openEditModal(user) {
    setSelectedUser(user);
    setFullNameInput(user.full_name);
    setRoleInput(user.role);
    setIsActiveInput(user.is_active);
    setPasswordInput(''); // Clear password field for security
    setShowEditModal(true);
    setError('');
  }

  // Handle Update User Submit
  async function handleUpdateUser(e) {
    e.preventDefault();
    setError('');
    if (!fullNameInput.trim()) {
      setError('Full Name is required.');
      return;
    }

    try {
      const payload = {
        full_name: fullNameInput.trim(),
        role: roleInput,
        is_active: isActiveInput
      };
      // Password is only sent if provided
      if (passwordInput.trim()) {
        payload.password = passwordInput;
      }
      
      await apiUpdateUser(selectedUser.username, payload, auth.token);
      
      // Reset
      setShowEditModal(false);
      setSelectedUser(null);
      setFullNameInput('');
      setPasswordInput('');
      setIsActiveInput(true);
      
      fetchUsers();
    } catch (err) {
      setError(err.message || 'Error updating user.');
    }
  }

  // Handle Delete User
  async function handleDeleteUser(username) {
    if (username === 'root') {
      alert('System Administrator cannot be deleted.');
      return;
    }
    if (!window.confirm(`Are you sure you want to delete user account: ${username}?`)) {
      return;
    }
    setError('');
    try {
      await apiDeleteUser(username, auth.token);
      fetchUsers();
    } catch (err) {
      setError(err.message || 'Error deleting user.');
    }
  }

  // Filtered Users List
  const filteredUsers = users.filter((u) => {
    const search = searchTerm.toLowerCase();
    return (
      u.username.toLowerCase().includes(search) ||
      u.full_name.toLowerCase().includes(search) ||
      u.role.toLowerCase().includes(search)
    );
  });

  // Department groupings for Tracker Tab
  const departments = {
    executive: { label: 'Executive Board', members: [] },
    finance: { label: 'Finance', members: [] },
    hr: { label: 'Human Resources', members: [] },
    engineering: { label: 'Engineering', members: [] },
    marketing: { label: 'Marketing & Sales', members: [] },
    employee: { label: 'General / Operations', members: [] },
  };

  users.forEach((u) => {
    if (departments[u.role]) {
      departments[u.role].members.push(u);
    }
  });

  return (
    <div className={styles.layout}>
      {/* Background blobs for premium glass feel */}
      <div className={styles.blobLeft} aria-hidden="true" />
      <div className={styles.blobRight} aria-hidden="true" />

      {/* Sidebar Navigation */}
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <span className={styles.brandLogo} role="img" aria-label="admin">🔑</span>
          <div>
            <div className={styles.brandName}>FinSolve Admin</div>
            <div className={styles.brandTagline}>Control Center</div>
          </div>
        </div>

        <div className={styles.adminCard}>
          <div className={styles.avatar}>👑</div>
          <div className={styles.adminInfo}>
            <div className={styles.adminUsername}>{auth.username}</div>
            <span className={styles.adminBadge}>Superuser</span>
          </div>
        </div>

        <nav className={styles.navMenu}>
          <button
            className={`${styles.navItem} ${activeTab === 'users' ? styles.activeNav : ''}`}
            onClick={() => setActiveTab('users')}
            id="nav-users-tab"
          >
            👤 User Accounts
          </button>
          <button
            className={`${styles.navItem} ${activeTab === 'tracker' ? styles.activeNav : ''}`}
            onClick={() => setActiveTab('tracker')}
            id="nav-tracker-tab"
          >
            📊 Department Tracker
          </button>
        </nav>

        <div className={styles.sidebarFooter}>
          <button className={styles.logoutBtn} onClick={logout} id="logout-btn">
            🚪 Sign Out
          </button>
        </div>
      </aside>

      {/* Main Board */}
      <main className={styles.main}>
        {error && (
          <div className={styles.errorBanner} role="alert">
            <span>⚠️</span> {error}
            <button className={styles.closeError} onClick={() => setError('')}>&times;</button>
          </div>
        )}

        {/* Tab content: User Management */}
        {activeTab === 'users' && (
          <section className={styles.section}>
            <header className={styles.header}>
              <div>
                <h1 className={styles.title}>User Account Management</h1>
                <p className={styles.subtitle}>Create, update, and manage role-based credentials for chatbot access</p>
              </div>
              <button 
                className={styles.createBtn}
                onClick={() => {
                  setError('');
                  setShowCreateModal(true);
                }}
                id="create-user-btn"
              >
                + Register New Account
              </button>
            </header>

            {/* Filter controls */}
            <div className={styles.controlsRow}>
              <div className={styles.searchWrap}>
                <span className={styles.searchIcon}>🔍</span>
                <input
                  type="text"
                  placeholder="Search by name, username, or role..."
                  className={styles.searchInput}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  id="user-search-input"
                />
              </div>
              <div className={styles.statsSummary}>
                Total Registered: <strong>{users.length}</strong>
              </div>
            </div>

            {/* User List Table */}
            <div className={styles.tableCard}>
              {loading ? (
                <div className={styles.loadingBox}>
                  <div className={styles.spinner} />
                  <p>Loading registry database...</p>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className={styles.emptyBox}>
                  <p>No user accounts found matching criteria.</p>
                </div>
              ) : (
                <div className={styles.tableResponsive}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Full Name</th>
                        <th>Username</th>
                        <th>Department (Role)</th>
                        <th>Account Status</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((u) => {
                        const conf = ROLE_CONFIG[u.role] || { color: '#94a3b8', emoji: '👤', label: u.role };
                        return (
                          <tr key={u.username}>
                            <td className={styles.fullNameCell}>{u.full_name}</td>
                            <td className={styles.usernameCell}><code>{u.username}</code></td>
                            <td>
                              <span 
                                className={styles.badge}
                                style={{
                                  color: conf.color,
                                  borderColor: `${conf.color}55`,
                                  background: `${conf.color}15`
                                }}
                              >
                                {conf.emoji} {conf.label}
                              </span>
                            </td>
                            <td>
                              <span className={u.is_active ? styles.statusActive : styles.statusInactive}>
                                {u.is_active ? 'Active' : 'Disabled'}
                              </span>
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <div className={styles.actionsCell}>
                                <button
                                  className={styles.editBtn}
                                  onClick={() => openEditModal(u)}
                                  id={`edit-user-${u.username}`}
                                >
                                  ✏️ Edit
                                </button>
                                {u.username !== 'root' && (
                                  <button
                                    className={styles.deleteBtn}
                                    onClick={() => handleDeleteUser(u.username)}
                                    id={`delete-user-${u.username}`}
                                  >
                                    🗑️ Delete
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Tab content: Department Tracker */}
        {activeTab === 'tracker' && (
          <section className={styles.section}>
            <header className={styles.header}>
              <div>
                <h1 className={styles.title}>Department & Employee Tracker</h1>
                <p className={styles.subtitle}>Monitor staff count and access scopes across organizational divisions</p>
              </div>
            </header>

            {/* Department stats grids */}
            <div className={styles.trackerGrid}>
              {Object.entries(departments).map(([role, dept]) => {
                const conf = ROLE_CONFIG[role] || { color: '#94a3b8', emoji: '👤' };
                return (
                  <div key={role} className={styles.trackerCard} style={{ borderTop: `4px solid ${conf.color}` }}>
                    <div className={styles.trackerHeader}>
                      <span className={styles.trackerEmoji}>{conf.emoji}</span>
                      <div>
                        <h3 className={styles.trackerTitle}>{dept.label}</h3>
                        <span className={styles.trackerCount}>
                          {dept.members.length} Staff Member{dept.members.length === 1 ? '' : 's'}
                        </span>
                      </div>
                    </div>

                    <div className={styles.trackerList}>
                      {dept.members.length === 0 ? (
                        <p className={styles.noMembers}>No accounts registered to this department.</p>
                      ) : (
                        dept.members.map((m) => (
                          <div key={m.username} className={styles.trackerMember}>
                            <div>
                              <div className={styles.memberName}>{m.full_name}</div>
                              <div className={styles.memberUser}>@{m.username}</div>
                            </div>
                            <span className={m.is_active ? styles.memberDotActive : styles.memberDotInactive} title={m.is_active ? 'Active' : 'Disabled'} />
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </main>

      {/* Modal: Create User Account */}
      {showCreateModal && (
        <div className={styles.modalOverlay} onClick={() => setShowCreateModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Register New Account</h2>
              <button className={styles.modalClose} onClick={() => setShowCreateModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleCreateUser} id="create-user-form">
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
                  <label htmlFor="create-role">Departmental Access Role</label>
                  <select
                    id="create-role"
                    value={roleInput}
                    onChange={(e) => setRoleInput(e.target.value)}
                  >
                    <option value="employee">Employee (General Info Only)</option>
                    <option value="finance">Finance Team</option>
                    <option value="marketing">Marketing Team</option>
                    <option value="hr">HR Team</option>
                    <option value="engineering">Engineering Department</option>
                    <option value="executive">C-Level Executive</option>
                    <option value="root">System Administrator (Root)</option>
                  </select>
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button type="button" className={styles.cancelBtn} onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className={styles.confirmBtn} id="create-user-submit-btn">
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit User Account */}
      {showEditModal && (
        <div className={styles.modalOverlay} onClick={() => setShowEditModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Edit Account Details</h2>
              <button className={styles.modalClose} onClick={() => setShowEditModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleUpdateUser} id="edit-user-form">
              <div className={styles.modalBody}>
                <div className={styles.field}>
                  <label>Username</label>
                  <input
                    type="text"
                    value={selectedUser?.username}
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

                {selectedUser?.username !== 'root' && (
                  <div className={styles.field}>
                    <label htmlFor="edit-role">Departmental Access Role</label>
                    <select
                      id="edit-role"
                      value={roleInput}
                      onChange={(e) => setRoleInput(e.target.value)}
                    >
                      <option value="employee">Employee (General Info Only)</option>
                      <option value="finance">Finance Team</option>
                      <option value="marketing">Marketing Team</option>
                      <option value="hr">HR Team</option>
                      <option value="engineering">Engineering Department</option>
                      <option value="executive">C-Level Executive</option>
                      <option value="root">System Administrator (Root)</option>
                    </select>
                  </div>
                )}

                {selectedUser?.username !== 'root' && (
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
                <button type="button" className={styles.cancelBtn} onClick={() => setShowEditModal(false)}>
                  Cancel
                </button>
                <button type="submit" className={styles.confirmBtn} id="edit-user-submit-btn">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
