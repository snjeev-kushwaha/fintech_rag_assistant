/**
 * DepartmentDetails.jsx — Department Drill-Down Member View
 */
import { ROLE_CONFIG } from '../../../../constants';
import SearchInput from '../../../../shared/components/SearchInput';
import styles from '../../styles/control_center.module.css';

export default function DepartmentDetails({
  selectedDeptDetail,
  departmentsList,
  onBack,
  deptUserSearchTerm,
  setDeptUserSearchTerm,
  deptUserPage,
  setDeptUserPage,
  filteredDeptUsers,
  paginatedDeptUsers,
  totalDeptUserPages,
  openEditUserModal,
  handleDeleteUser,
}) {
  if (!selectedDeptDetail) return null;

  return (
    <section className={styles.section}>
      <div className={styles.breadcrumbBar}>
        <button
          className={styles.backBtn}
          onClick={onBack}
          id="back-to-depts-btn"
        >
          ← Back to Departments
        </button>
      </div>

      <header className={styles.header}>
        <div className={styles.headerTitleGroup}>
          <div
            className={styles.deptDetailAvatar}
            style={{
              background: `${selectedDeptDetail.color || '#3b82f6'}20`,
              borderColor: `${selectedDeptDetail.color || '#3b82f6'}55`,
            }}
          >
            {selectedDeptDetail.image && (selectedDeptDetail.image.startsWith('http') || selectedDeptDetail.image.startsWith('/')) ? (
              <img src={selectedDeptDetail.image} alt={selectedDeptDetail.name} style={{ width: '36px', height: '36px', objectFit: 'contain' }} />
            ) : (
              selectedDeptDetail.image || selectedDeptDetail.emoji || '🏢'
            )}
          </div>
          <div>
            <h1 className={styles.title}>{selectedDeptDetail.name}</h1>
            <p className={styles.subtitle}>{selectedDeptDetail.description}</p>
          </div>
        </div>
      </header>

      {/* Filter Controls */}
      <div className={styles.controlsRow}>
        <SearchInput
          id="dept-user-search-input"
          placeholder="Filter users in this department..."
          value={deptUserSearchTerm}
          onChange={(e) => {
            setDeptUserSearchTerm(e.target.value);
            setDeptUserPage(1);
          }}
          wrapClass={styles.searchWrap}
          iconClass={styles.searchIcon}
          inputClass={styles.searchInput}
        />
        <div className={styles.statsSummary}>
          Members in <strong>{selectedDeptDetail.name}</strong>: <strong>{filteredDeptUsers.length}</strong>
        </div>
      </div>

      {/* Department Users Table */}
      <div className={styles.tableCard}>
        {filteredDeptUsers.length === 0 ? (
          <div className={styles.emptyBox}>
            <p>No user accounts registered under this department.</p>
          </div>
        ) : (
          <>
            <div className={styles.tableResponsive}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Full Name</th>
                    <th>Username</th>
                    <th>Department Role</th>
                    <th>Account Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedDeptUsers.map((u) => {
                    const deptObj = departmentsList.find((d) => d.id === u.role || d.id === u.departmentId);
                    const conf = ROLE_CONFIG[u.role] || (deptObj ? {
                      color: deptObj.status === 'Inactive' ? '#64748b' : '#3b82f6',
                      emoji: deptObj.image && !deptObj.image.startsWith('http') ? deptObj.image : '🏢',
                      label: deptObj.name
                    } : { color: '#94a3b8', emoji: '👤', label: u.role });

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
                              background: `${conf.color}15`,
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
                              onClick={() => openEditUserModal(u)}
                              id={`edit-dept-user-${u.username}`}
                            >
                              ✏️ Edit
                            </button>
                            {u.username !== 'root' && (
                              <button
                                className={styles.deleteBtn}
                                onClick={() => handleDeleteUser(u.username)}
                                id={`delete-dept-user-${u.username}`}
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

            {totalDeptUserPages > 1 && (
              <div className={styles.paginationRow}>
                <button
                  className={styles.pageBtn}
                  onClick={() => setDeptUserPage((p) => Math.max(1, p - 1))}
                  disabled={deptUserPage === 1}
                >
                  ← Prev
                </button>
                <span className={styles.pageIndicator}>
                  Page <strong>{deptUserPage}</strong> of <strong>{totalDeptUserPages}</strong>
                </span>
                <button
                  className={styles.pageBtn}
                  onClick={() => setDeptUserPage((p) => Math.min(totalDeptUserPages, p + 1))}
                  disabled={deptUserPage === totalDeptUserPages}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
