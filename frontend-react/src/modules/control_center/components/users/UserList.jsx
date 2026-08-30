/**
 * UserList.jsx — Enterprise User Accounts Section View with Role Filtering, Metrics & Pagination
 */
import { useState, useMemo, useEffect } from 'react';
import { IconSearch, IconPlus, IconUsers, IconFilter } from '../../../../shared/components/Icons';
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
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  const displayedUsers = useMemo(() => {
    let result = filteredUsers;
    if (roleFilter !== 'ALL') {
      result = result.filter(
        (u) =>
          (u.role || '').toLowerCase() === roleFilter.toLowerCase() ||
          (u.departmentId || '').toLowerCase() === roleFilter.toLowerCase()
      );
    }
    return result;
  }, [filteredUsers, roleFilter]);

  // Reset page when filtering or searching
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, roleFilter, pageSize]);

  const activeUsersCount = useMemo(
    () => users.filter((u) => u.is_active).length,
    [users]
  );

  // Pagination calculations
  const totalPages = Math.ceil(displayedUsers.length / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, displayedUsers.length);
  const paginatedUsers = displayedUsers.slice(startIndex, startIndex + pageSize);

  return (
    <section className={styles.section}>
      {/* Top Section Header */}
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
            <p className={styles.subtitle}>
              Create, update, and manage role-based credentials for enterprise chatbot access
            </p>
          </div>
        </div>
        <button
          className={styles.createBtn}
          onClick={onOpenCreateModal}
          id="create-user-btn"
        >
          <IconPlus size={16} />
          <span>Register New Account</span>
        </button>
      </header>

      {/* Filter Controls & Summary Strip */}
      <div className={styles.controlsRow}>
        <div className={styles.searchAndFilterGroup}>
          {/* Search Input with SVG Icon */}
          <div className={styles.searchWrap}>
            <IconSearch size={16} className={styles.searchIcon} />
            <input
              id="user-search-input"
              type="text"
              className={styles.searchInput}
              placeholder="Search by name, username, or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Role Filter Dropdown */}
          <div className={styles.filterWrap}>
            <IconFilter size={14} className={styles.filterIcon} />
            <select
              className={styles.filterSelect}
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              id="user-role-filter"
            >
              <option value="ALL">All Departments</option>
              {departmentsList.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
              <option value="root">System Administrator</option>
            </select>
          </div>
        </div>

        {/* Metric Badges Strip */}
        <div className={styles.deptStatsStrip}>
          <div className={styles.deptStatBadge}>
            <IconUsers size={14} />
            <span>
              Total Registered: <strong>{users.length}</strong>
            </span>
          </div>
          <div className={styles.deptStatBadge}>
            <span className={styles.statusDot} />
            <span>
              Active: <strong>{activeUsersCount}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* User Accounts Table Card */}
      <div className={styles.tableCard}>
        {loading ? (
          <LoadingSpinner
            message="Loading registry database..."
            boxClass={styles.loadingBox}
            spinnerClass={styles.spinner}
          />
        ) : displayedUsers.length === 0 ? (
          <div className={styles.emptyBox}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🔍</div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'inherit', marginBottom: '0.25rem' }}>
              No user accounts found
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
              Try adjusting your search query or department filter.
            </p>
          </div>
        ) : (
          <>
            <UserTable
              users={paginatedUsers}
              departmentsList={departmentsList}
              onEditUser={onEditUser}
              onDeleteUser={onDeleteUser}
            />

            {/* Pagination Controls */}
            <div className={styles.paginationContainer}>
              <div className={styles.paginationInfo}>
                Showing <strong>{displayedUsers.length === 0 ? 0 : startIndex + 1}–{endIndex}</strong> of{' '}
                <strong>{displayedUsers.length}</strong> user accounts
              </div>

              <div className={styles.paginationActions}>
                <div className={styles.pageSizeWrapper}>
                  <label htmlFor="user-page-size" className={styles.pageSizeLabel}>Per page:</label>
                  <select
                    id="user-page-size"
                    className={styles.pageSizeSelect}
                    value={pageSize}
                    onChange={(e) => setPageSize(Number(e.target.value))}
                  >
                    <option value={8}>8</option>
                    <option value={16}>16</option>
                    <option value={24}>24</option>
                    <option value={50}>50</option>
                  </select>
                </div>

                <button
                  type="button"
                  className={styles.pageBtn}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  id="user-prev-page-btn"
                >
                  ‹ Prev
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                  if (
                    totalPages > 7 &&
                    pageNum !== 1 &&
                    pageNum !== totalPages &&
                    Math.abs(pageNum - currentPage) > 1
                  ) {
                    if (pageNum === 2 || pageNum === totalPages - 1) {
                      return <span key={pageNum} className={styles.pageEllipsis}>…</span>;
                    }
                    return null;
                  }

                  return (
                    <button
                      key={pageNum}
                      type="button"
                      className={`${styles.pageNumberBtn} ${
                        currentPage === pageNum ? styles.activePageBtn : ''
                      }`}
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  type="button"
                  className={styles.pageBtn}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  id="user-next-page-btn"
                >
                  Next ›
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
