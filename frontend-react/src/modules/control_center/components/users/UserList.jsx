/**
 * UserList.jsx — User Accounts Section View
 */
import SearchInput from '../../../../shared/components/SearchInput';
import LoadingSpinner from '../../../../shared/components/LoadingSpinner';
import UserTable from './UserTable';
import styles from '../../styles/control_center.module.css';

export default function UserList({
  users,
  filteredUsers,
  departmentsList,
  loading,
  searchTerm,
  setSearchTerm,
  onOpenCreateModal,
  onEditUser,
  onDeleteUser,
  setMobileOpen,
}) {
  return (
    <section className={styles.section}>
      <header className={styles.header}>
        <div className={styles.headerTitleGroup}>
          <button
            className={styles.mobileHamburgerBtn}
            onClick={() => setMobileOpen((open) => !open)}
            title="Open navigation menu"
            aria-label="Open navigation menu"
          >
            ☰
          </button>
          <div>
            <h1 className={styles.title}>User Account Management</h1>
            <p className={styles.subtitle}>Create, update, and manage role-based credentials for chatbot access</p>
          </div>
        </div>
        <button
          className={styles.createBtn}
          onClick={onOpenCreateModal}
          id="create-user-btn"
        >
          + Register New Account
        </button>
      </header>

      {/* Filter Controls */}
      <div className={styles.controlsRow}>
        <SearchInput
          id="user-search-input"
          placeholder="Search by name, username, or role..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          wrapClass={styles.searchWrap}
          iconClass={styles.searchIcon}
          inputClass={styles.searchInput}
        />
        <div className={styles.statsSummary}>
          Total Registered: <strong>{users.length}</strong>
        </div>
      </div>

      {/* User List Table Card */}
      <div className={styles.tableCard}>
        {loading ? (
          <LoadingSpinner
            message="Loading registry database..."
            boxClass={styles.loadingBox}
            spinnerClass={styles.spinner}
          />
        ) : filteredUsers.length === 0 ? (
          <div className={styles.emptyBox}>
            <p>No user accounts found matching criteria.</p>
          </div>
        ) : (
          <UserTable
            users={filteredUsers}
            departmentsList={departmentsList}
            onEditUser={onEditUser}
            onDeleteUser={onDeleteUser}
          />
        )}
      </div>
    </section>
  );
}
