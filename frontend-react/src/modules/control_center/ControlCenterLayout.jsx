/**
 * ControlCenterLayout.jsx — Master Root Admin Module Layout
 */
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  apiGetUsers,
  apiCreateUser,
  apiUpdateUser,
  apiDeleteUser,
} from '../../services/userService';
import {
  apiGetDepartments,
  apiCreateDepartment,
  apiUpdateDepartment,
  apiDeleteDepartment,
} from '../../services/departmentService';
import ErrorBanner from '../../shared/components/ErrorBanner';

import ControlCenterSidebar from './components/sidebar/ControlCenterSidebar';
import DepartmentList from './components/departments/DepartmentList';
import DepartmentDetails from './components/departments/DepartmentDetails';
import AddDepartmentModal from './components/departments/AddDepartmentModal';
import EditDepartmentModal from './components/departments/EditDepartmentModal';

import UserList from './components/users/UserList';
import AddUserModal from './components/users/AddUserModal';
import EditUserModal from './components/users/EditUserModal';

import styles from './styles/control_center.module.css';

export default function ControlCenterLayout() {
  const { auth, logout } = useAuth();

  // Persistent Sidebar State
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    try {
      const saved = localStorage.getItem('adminSidebarOpen');
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });
  const [mobileOpen, setMobileOpen] = useState(false);

  function toggleSidebar() {
    setSidebarOpen((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('adminSidebarOpen', JSON.stringify(next));
      } catch (err) {
        console.error('LocalStorage write error:', err);
      }
      return next;
    });
  }

  const [activeTab, setActiveTab] = useState('departments'); // 'departments' | 'users' | 'dept-detail'

  // Data State
  const [departmentsList, setDepartmentsList] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Department Selection & Details
  const [selectedDeptDetail, setSelectedDeptDetail] = useState(null);
  const [deptUserSearchTerm, setDeptUserSearchTerm] = useState('');
  const [deptUserPage, setDeptUserPage] = useState(1);
  const DEPT_PAGE_SIZE = 5;

  // Modals State
  const [showCreateDeptModal, setShowCreateDeptModal] = useState(false);
  const [showEditDeptModal, setShowEditDeptModal] = useState(false);
  const [editingDept, setEditingDept] = useState(null);

  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Form Inputs — Department
  const [deptNameInput, setDeptNameInput] = useState('');
  const [deptEmojiInput, setDeptEmojiInput] = useState('🏢');
  const [deptKeyInput, setDeptKeyInput] = useState('');
  const [deptDescInput, setDeptDescInput] = useState('');
  const [deptStatusInput, setDeptStatusInput] = useState('Active');

  // Form Inputs — User
  const [usernameInput, setUsernameInput] = useState('');
  const [fullNameInput, setFullNameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [roleInput, setRoleInput] = useState('employee');
  const [isActiveInput, setIsActiveInput] = useState(true);

  // Filter State — Users
  const [userSearchTerm, setUserSearchTerm] = useState('');

  // Load API Data
  async function fetchUsers() {
    try {
      const data = await apiGetUsers(auth.token);
      setUsers(data);
    } catch (err) {
      if (err.message === 'SESSION_EXPIRED') logout();
      else setError(err.message || 'Failed to load user accounts.');
    }
  }

  async function fetchDepartments() {
    setLoading(true);
    setError('');
    try {
      const data = await apiGetDepartments(auth.token);
      setDepartmentsList(data);
    } catch (err) {
      if (err.message === 'SESSION_EXPIRED') logout();
      else setError(err.message || 'Failed to load departments.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
    fetchDepartments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handlers — Department
  async function handleCreateDepartment(e) {
    e.preventDefault();
    setError('');
    if (!deptNameInput.trim() || !deptDescInput.trim()) {
      setError('Department Name and Description are required.');
      return;
    }
    try {
      const payload = {
        name: deptNameInput.trim(),
        description: deptDescInput.trim(),
        image: deptEmojiInput.trim() || '🏢',
        status: deptStatusInput,
        id: deptKeyInput.trim() || undefined,
      };
      await apiCreateDepartment(payload, auth.token);

      setDeptNameInput('');
      setDeptKeyInput('');
      setDeptDescInput('');
      setDeptEmojiInput('🏢');
      setDeptStatusInput('Active');
      setShowCreateDeptModal(false);
      await fetchDepartments();
    } catch (err) {
      setError(err.message || 'Error creating department.');
    }
  }

  function openEditDeptModal(dept) {
    setEditingDept(dept);
    setDeptNameInput(dept.name);
    setDeptEmojiInput(dept.image || '🏢');
    setDeptDescInput(dept.description);
    setDeptStatusInput(dept.status || 'Active');
    setShowEditDeptModal(true);
    setError('');
  }

  async function handleUpdateDepartment(e) {
    e.preventDefault();
    setError('');
    if (!deptNameInput.trim() || !deptDescInput.trim()) {
      setError('Department Name and Description are required.');
      return;
    }
    try {
      const payload = {
        name: deptNameInput.trim(),
        description: deptDescInput.trim(),
        image: deptEmojiInput.trim() || '🏢',
        status: deptStatusInput,
      };
      await apiUpdateDepartment(editingDept.id, payload, auth.token);

      setShowEditDeptModal(false);
      setEditingDept(null);
      await fetchDepartments();
    } catch (err) {
      setError(err.message || 'Error updating department.');
    }
  }

  async function handleDeleteDepartment(dept) {
    if (!window.confirm(`Are you sure you want to delete department: ${dept.name}?`)) return;
    setError('');
    try {
      await apiDeleteDepartment(dept.id, auth.token);
      if (selectedDeptDetail?.id === dept.id) {
        setActiveTab('departments');
        setSelectedDeptDetail(null);
      }
      await fetchDepartments();
    } catch (err) {
      setError(err.message || `Failed to delete department '${dept.name}'.`);
    }
  }

  function viewDeptDetails(dept) {
    setSelectedDeptDetail(dept);
    setDeptUserSearchTerm('');
    setDeptUserPage(1);
    setActiveTab('dept-detail');
  }

  // Handlers — User
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
        full_name: fullNameInput.trim(),
        departmentId: roleInput,
      };
      await apiCreateUser(payload, auth.token);

      setUsernameInput('');
      setFullNameInput('');
      setPasswordInput('');
      setRoleInput(departmentsList[0]?.id || 'employee');
      setShowCreateUserModal(false);

      await fetchUsers();
      await fetchDepartments();
    } catch (err) {
      setError(err.message || 'Error creating user account.');
    }
  }

  function openEditUserModal(user) {
    setSelectedUser(user);
    setFullNameInput(user.full_name);
    setRoleInput(user.role);
    setIsActiveInput(user.is_active);
    setPasswordInput('');
    setShowEditUserModal(true);
    setError('');
  }

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
        is_active: isActiveInput,
        departmentId: roleInput,
      };
      if (passwordInput.trim()) payload.password = passwordInput;

      await apiUpdateUser(selectedUser.username, payload, auth.token);

      setShowEditUserModal(false);
      setSelectedUser(null);
      setFullNameInput('');
      setPasswordInput('');
      setIsActiveInput(true);

      await fetchUsers();
      await fetchDepartments();
    } catch (err) {
      setError(err.message || 'Error updating user.');
    }
  }

  async function handleDeleteUser(username) {
    if (username === 'root') {
      alert('System Administrator cannot be deleted.');
      return;
    }
    if (!window.confirm(`Are you sure you want to delete user account: ${username}?`)) return;
    setError('');
    try {
      await apiDeleteUser(username, auth.token);
      await fetchUsers();
      await fetchDepartments();
    } catch (err) {
      setError(err.message || 'Error deleting user.');
    }
  }

  // Filter Computations
  const filteredUsers = users.filter((u) => {
    const search = userSearchTerm.toLowerCase();
    return (
      u.username.toLowerCase().includes(search) ||
      u.full_name.toLowerCase().includes(search) ||
      u.role.toLowerCase().includes(search)
    );
  });

  const deptUsersList = selectedDeptDetail
    ? users.filter((u) => {
        const targetId = (selectedDeptDetail.id || '').toLowerCase();
        const userRole = (u.role || '').toLowerCase();
        const userDept = (u.departmentId || '').toLowerCase();
        return userRole === targetId || userDept === targetId;
      })
    : [];

  const filteredDeptUsers = deptUsersList.filter((u) => {
    const search = deptUserSearchTerm.toLowerCase();
    return (
      u.username.toLowerCase().includes(search) ||
      u.full_name.toLowerCase().includes(search)
    );
  });

  const totalDeptUserPages = Math.ceil(filteredDeptUsers.length / DEPT_PAGE_SIZE) || 1;
  const paginatedDeptUsers = filteredDeptUsers.slice(
    (deptUserPage - 1) * DEPT_PAGE_SIZE,
    deptUserPage * DEPT_PAGE_SIZE
  );

  return (
    <div className={styles.layout}>
      <div className={styles.blobLeft} aria-hidden="true" />
      <div className={styles.blobRight} aria-hidden="true" />

      {mobileOpen && (
        <div
          className={styles.mobileBackdrop}
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Control Center Sidebar */}
      <ControlCenterSidebar
        sidebarOpen={sidebarOpen}
        toggleSidebar={toggleSidebar}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        auth={auth}
        logout={logout}
      />

      {/* Main Board */}
      <main className={styles.main}>
        <ErrorBanner
          error={error}
          onClose={() => setError('')}
          className={styles.errorBanner}
          closeClassName={styles.closeError}
        />

        {activeTab === 'departments' && (
          <DepartmentList
            departmentsList={departmentsList}
            users={users}
            onViewDetails={viewDeptDetails}
            onEdit={openEditDeptModal}
            onDelete={handleDeleteDepartment}
            onOpenCreateModal={() => {
              setError('');
              setShowCreateDeptModal(true);
            }}
            setMobileOpen={setMobileOpen}
          />
        )}

        {activeTab === 'dept-detail' && (
          <DepartmentDetails
            selectedDeptDetail={selectedDeptDetail}
            departmentsList={departmentsList}
            onBack={() => setActiveTab('departments')}
            deptUserSearchTerm={deptUserSearchTerm}
            setDeptUserSearchTerm={setDeptUserSearchTerm}
            deptUserPage={deptUserPage}
            setDeptUserPage={setDeptUserPage}
            filteredDeptUsers={filteredDeptUsers}
            paginatedDeptUsers={paginatedDeptUsers}
            totalDeptUserPages={totalDeptUserPages}
            openEditUserModal={openEditUserModal}
            handleDeleteUser={handleDeleteUser}
          />
        )}

        {activeTab === 'users' && (
          <UserList
            users={users}
            filteredUsers={filteredUsers}
            departmentsList={departmentsList}
            loading={loading}
            searchTerm={userSearchTerm}
            setSearchTerm={setUserSearchTerm}
            onOpenCreateModal={() => {
              setError('');
              setShowCreateUserModal(true);
            }}
            onEditUser={openEditUserModal}
            onDeleteUser={handleDeleteUser}
            setMobileOpen={setMobileOpen}
          />
        )}
      </main>

      {/* Modals */}
      <AddDepartmentModal
        isOpen={showCreateDeptModal}
        onClose={() => setShowCreateDeptModal(false)}
        onSubmit={handleCreateDepartment}
        deptNameInput={deptNameInput}
        setDeptNameInput={setDeptNameInput}
        deptEmojiInput={deptEmojiInput}
        setDeptEmojiInput={setDeptEmojiInput}
        deptStatusInput={deptStatusInput}
        setDeptStatusInput={setDeptStatusInput}
        deptKeyInput={deptKeyInput}
        setDeptKeyInput={setDeptKeyInput}
        deptDescInput={deptDescInput}
        setDeptDescInput={setDeptDescInput}
      />

      <EditDepartmentModal
        isOpen={showEditDeptModal}
        editingDept={editingDept}
        onClose={() => setShowEditDeptModal(false)}
        onSubmit={handleUpdateDepartment}
        deptNameInput={deptNameInput}
        setDeptNameInput={setDeptNameInput}
        deptEmojiInput={deptEmojiInput}
        setDeptEmojiInput={setDeptEmojiInput}
        deptStatusInput={deptStatusInput}
        setDeptStatusInput={setDeptStatusInput}
        deptDescInput={deptDescInput}
        setDeptDescInput={setDeptDescInput}
      />

      <AddUserModal
        isOpen={showCreateUserModal}
        onClose={() => setShowCreateUserModal(false)}
        onSubmit={handleCreateUser}
        fullNameInput={fullNameInput}
        setFullNameInput={setFullNameInput}
        usernameInput={usernameInput}
        setUsernameInput={setUsernameInput}
        passwordInput={passwordInput}
        setPasswordInput={setPasswordInput}
        roleInput={roleInput}
        setRoleInput={setRoleInput}
        departmentsList={departmentsList}
      />

      <EditUserModal
        isOpen={showEditUserModal}
        selectedUser={selectedUser}
        onClose={() => setShowEditUserModal(false)}
        onSubmit={handleUpdateUser}
        fullNameInput={fullNameInput}
        setFullNameInput={setFullNameInput}
        passwordInput={passwordInput}
        setPasswordInput={setPasswordInput}
        roleInput={roleInput}
        setRoleInput={setRoleInput}
        isActiveInput={isActiveInput}
        setIsActiveInput={setIsActiveInput}
        departmentsList={departmentsList}
      />
    </div>
  );
}
