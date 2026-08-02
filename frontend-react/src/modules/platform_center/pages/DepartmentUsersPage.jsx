/**
 * DepartmentUsersPage.jsx — View Department Colleagues & Team Members
 */
import { useState, useEffect } from 'react';
import { apiGetUsers } from '../../../services/userService';
import { apiGetDepartments } from '../../../services/departmentService';
import LoadingSpinner from '../../../shared/components/LoadingSpinner';
import ErrorBanner from '../../../shared/components/ErrorBanner';
import styles from '../styles/platform_center.module.css';

export default function DepartmentUsersPage({ auth, logout }) {
  const [users, setUsers] = useState([]);
  const [departmentInfo, setDepartmentInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [allUsers, depts] = await Promise.all([
          apiGetUsers(auth.token),
          apiGetDepartments(auth.token),
        ]);
        const dept = depts.find((d) => d.id === auth.role) || { name: auth.displayName || auth.role, id: auth.role };
        setDepartmentInfo(dept);

        const myTeam = allUsers.filter((u) => u.role === auth.role || u.departmentId === auth.role);
        setUsers(myTeam);
      } catch (err) {
        if (err.message === 'SESSION_EXPIRED') logout();
        else setError(err.message || 'Failed to load department team.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [auth, logout]);

  return (
    <div className={styles.pageContainer}>
      <ErrorBanner error={error} onClose={() => setError('')} className={styles.errorBanner} closeClassName={styles.closeError} />

      <header className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>
            {departmentInfo?.image && !departmentInfo.image.startsWith('http') ? departmentInfo.image + ' ' : '👥 '}
            {departmentInfo?.name || 'Department Team'}
          </h1>
          <p className={styles.pageSubtitle}>
            Colleagues and team members registered in the {departmentInfo?.name || auth.role} department
          </p>
        </div>
      </header>

      {loading ? (
        <LoadingSpinner message="Loading team members..." boxClass={styles.loadingBox} spinnerClass={styles.spinner} />
      ) : (
        <div className={styles.teamGrid}>
          {users.map((member) => (
            <div key={member.username} className={styles.teamCard}>
              <div className={styles.teamAvatar}>👤</div>
              <div className={styles.teamInfo}>
                <h3 className={styles.teamName}>{member.full_name}</h3>
                <span className={styles.teamUsername}>@{member.username}</span>
                <div className={styles.teamStatus}>
                  <span className={member.is_active ? styles.dotActive : styles.dotInactive} />
                  {member.is_active ? 'Active' : 'Disabled'}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
