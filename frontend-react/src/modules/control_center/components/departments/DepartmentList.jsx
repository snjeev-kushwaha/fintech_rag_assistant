/**
 * DepartmentList.jsx — Interactive Grid of Enterprise Department Cards with Real-Time Filter, Stat Counters & Pagination
 * Optimized for butter-smooth 60fps scrolling & instant O(1) headcount lookups
 */
import { useState, useMemo, useEffect } from 'react';
import DepartmentCard from './DepartmentCard';
import { IconSearch, IconPlus, IconBuilding, IconUsers } from '../../../../shared/components/Icons';
import styles from '../../styles/control_center.module.css';

export default function DepartmentList({
  departmentsList,
  users,
  onViewDetails,
  onEdit,
  onDelete,
  onOpenCreateModal,
  setMobileOpen,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  // Filter departments by keyword
  const filteredDepts = useMemo(() => {
    if (!searchTerm.trim()) return departmentsList;
    const query = searchTerm.toLowerCase();
    return departmentsList.filter(
      (dept) =>
        dept.name?.toLowerCase().includes(query) ||
        dept.id?.toLowerCase().includes(query) ||
        dept.description?.toLowerCase().includes(query)
    );
  }, [departmentsList, searchTerm]);

  // Reset page to 1 when searching or changing page size
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, pageSize]);

  // Pre-calculate user counts map once for O(1) card lookups
  const userCountsByDept = useMemo(() => {
    const counts = {};
    for (let i = 0; i < users.length; i++) {
      const u = users[i];
      const role = (u.role || '').toLowerCase();
      const deptId = (u.departmentId || '').toLowerCase();
      if (role) counts[role] = (counts[role] || 0) + 1;
      if (deptId && deptId !== role) counts[deptId] = (counts[deptId] || 0) + 1;
    }
    return counts;
  }, [users]);

  // Active departments count
  const activeDeptsCount = useMemo(
    () => departmentsList.filter((d) => d.status !== 'Inactive').length,
    [departmentsList]
  );

  // Pagination calculation
  const totalPages = Math.ceil(filteredDepts.length / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, filteredDepts.length);
  const paginatedDepts = filteredDepts.slice(startIndex, startIndex + pageSize);

  return (
    <section className={styles.section}>
      {/* Top Header */}
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
            <h1 className={styles.title}>Corporate Department Directory</h1>
            <p className={styles.subtitle}>
              Manage enterprise departments, assign RBAC access, & track team headcount
            </p>
          </div>
        </div>
        <button
          className={styles.createBtn}
          onClick={onOpenCreateModal}
          id="create-dept-btn"
        >
          <IconPlus size={16} />
          <span>Register New Department</span>
        </button>
      </header>

      {/* Interactive Controls & Stats Strip */}
      <div className={styles.controlsRow}>
        <div className={styles.searchWrap}>
          <IconSearch size={16} className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search departments by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            id="search-departments-input"
          />
        </div>

        <div className={styles.deptStatsStrip}>
          <div className={styles.deptStatBadge}>
            <IconBuilding size={14} />
            <span>
              Departments: <strong>{departmentsList.length}</strong>
            </span>
          </div>
          <div className={styles.deptStatBadge}>
            <span className={styles.statusDot} />
            <span>
              Active: <strong>{activeDeptsCount}</strong>
            </span>
          </div>
          <div className={styles.deptStatBadge}>
            <IconUsers size={14} />
            <span>
              Staff Members: <strong>{users.length}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      {filteredDepts.length > 0 ? (
        <>
          <div className={styles.deptCardsGrid}>
            {paginatedDepts.map((dept) => {
              const targetKey = (dept.id || '').toLowerCase();
              const count = userCountsByDept[targetKey] || 0;

              return (
                <DepartmentCard
                  key={dept.id}
                  dept={dept}
                  count={count}
                  onViewDetails={onViewDetails}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              );
            })}
          </div>

          {/* Pagination Navigation Strip */}
          <div className={styles.paginationContainer}>
            <div className={styles.paginationInfo}>
              Showing <strong>{filteredDepts.length === 0 ? 0 : startIndex + 1}–{endIndex}</strong> of{' '}
              <strong>{filteredDepts.length}</strong> departments
            </div>

            <div className={styles.paginationActions}>
              <div className={styles.pageSizeWrapper}>
                <label htmlFor="dept-page-size" className={styles.pageSizeLabel}>Per page:</label>
                <select
                  id="dept-page-size"
                  className={styles.pageSizeSelect}
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                >
                  <option value={6}>6</option>
                  <option value={9}>9</option>
                  <option value={12}>12</option>
                  <option value={24}>24</option>
                </select>
              </div>

              <button
                type="button"
                className={styles.pageBtn}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                id="dept-prev-page-btn"
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
                id="dept-next-page-btn"
              >
                Next ›
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className={styles.emptyBox}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🔍</div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'inherit', marginBottom: '0.25rem' }}>
            No departments match your search
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
            Try searching for another keyword or clear the search field.
          </p>
        </div>
      )}
    </section>
  );
}
