/**
 * DepartmentList.jsx — Grid of Department Cards
 */
import DepartmentCard from './DepartmentCard';
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
            <h1 className={styles.title}>Corporate Department Directory</h1>
            <p className={styles.subtitle}>Manage enterprise departments, assign roles, & track headcount metrics</p>
          </div>
        </div>
        <button
          className={styles.createBtn}
          onClick={onOpenCreateModal}
          id="create-dept-btn"
        >
          + Register New Department
        </button>
      </header>

      <div className={styles.deptCardsGrid}>
        {departmentsList.map((dept) => {
          const targetId = (dept.id || '').toLowerCase();
          const count = users.filter((u) => {
            const userRole = (u.role || '').toLowerCase();
            const userDept = (u.departmentId || '').toLowerCase();
            return userRole === targetId || userDept === targetId;
          }).length;

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
    </section>
  );
}
