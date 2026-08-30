/**
 * ControlCenterLayout.jsx — Master Root Admin Module Layout with Confirmation Modals, Toast Alerts & Theme Toolbar
 */
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
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
  apiUploadDepartmentFile,
} from '../../services/departmentService';
import ErrorBanner from '../../shared/components/ErrorBanner';
import ConfirmDeleteModal from '../../shared/components/ConfirmDeleteModal';

import ControlCenterSidebar from './components/sidebar/ControlCenterSidebar';
import DepartmentList from './components/departments/DepartmentList';
import DepartmentDetails from './components/departments/DepartmentDetails';
import AddDepartmentModal from './components/departments/AddDepartmentModal';
import EditDepartmentModal from './components/departments/EditDepartmentModal';

import UserList from './components/users/UserList';
import AddUserModal from './components/users/AddUserModal';
import EditUserModal from './components/users/EditUserModal';
import SettingsModal from './components/settings/SettingsModal';
import UserProfileModal from '../platform_center/components/profile/UserProfileModal';

import styles from './styles/control_center.module.css';

export default function ControlCenterLayout() {
  const { auth, logout } = useAuth();
  const { toast } = useToast();

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
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Reusable Delete Confirmation Modal State
  const [deleteModalState, setDeleteModalState] = useState({
    isOpen: false,
    title: '',
    itemName: '',
    itemType: '',
    description: '',
    onConfirm: null,
    loading: false,
  });

  // Form Inputs — Department
  const [deptNameInput, setDeptNameInput] = useState('');
  const [deptEmojiInput, setDeptEmojiInput] = useState('');
  const [deptKeyInput, setDeptKeyInput] = useState('');
  const [deptDescInput, setDeptDescInput] = useState('');
  const [deptStatusInput, setDeptStatusInput] = useState('Active');
  const [deptFilesInput, setDeptFilesInput] = useState([]);

  // Form Inputs — User
  const [usernameInput, setUsernameInput] = useState('');
  const [fullNameInput, setFullNameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [roleInput, setRoleInput] = useState('');
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

  // Open Create Modals with clean empty inputs
  function openCreateDeptModal() {
    setError('');
    setDeptNameInput('');
    setDeptKeyInput('');
    setDeptEmojiInput('');
    setDeptDescInput('');
    setDeptFilesInput([]);
    setDeptStatusInput('Active');
    setShowCreateDeptModal(true);
  }

  function openCreateUserModal() {
    setError('');
    setUsernameInput('');
    setFullNameInput('');
    setPasswordInput('');
    setRoleInput('');
    setIsActiveInput(true);
    setShowCreateUserModal(true);
  }

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
        image: deptEmojiInput.trim() || undefined,
        status: deptStatusInput,
        id: deptKeyInput.trim() || undefined,
      };
      const created = await apiCreateDepartment(payload, auth.token);

      // If initial knowledge documents were provided, upload them
      if (deptFilesInput && deptFilesInput.length > 0) {
        for (const f of deptFilesInput) {
          try {
            await apiUploadDepartmentFile(created.id, f, auth.token);
          } catch (uploadErr) {
            console.error(`Failed to auto-upload file '${f.name}':`, uploadErr);
          }
        }
      }

      setDeptNameInput('');
      setDeptKeyInput('');
      setDeptDescInput('');
      setDeptEmojiInput('');
      setDeptFilesInput([]);
      setDeptStatusInput('Active');
      setShowCreateDeptModal(false);
      await fetchDepartments();

      toast.success(
        `Department "${payload.name}" (${created.id}) created and knowledge base initialized.`,
        'Department Registered'
      );
    } catch (err) {
      setError(err.message || 'Error creating department.');
      toast.error(err.message || 'Failed to create department.', 'Creation Failed');
    }
  }

  function openEditDeptModal(dept) {
    setEditingDept(dept);
    setDeptNameInput(dept.name || '');
    setDeptEmojiInput(dept.image || '');
    setDeptDescInput(dept.description || '');
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
        image: deptEmojiInput.trim() || undefined,
        status: deptStatusInput,
      };
      await apiUpdateDepartment(editingDept.id, payload, auth.token);

      setShowEditDeptModal(false);
      setEditingDept(null);
      await fetchDepartments();

      toast.success(
        `Department "${payload.name}" details updated successfully.`,
        'Department Updated'
      );
    } catch (err) {
      setError(err.message || 'Error updating department.');
      toast.error(err.message || 'Failed to update department.', 'Update Failed');
    }
  }

  // Department Deletion Trigger Modal
  function requestDeleteDepartment(dept) {
    setDeleteModalState({
      isOpen: true,
      title: 'Delete Department',
      itemName: `${dept.name} (${dept.id})`,
      itemType: 'department',
      description:
        `Deleting this department will permanently delete its knowledge data folder (backend/data/${dept.id}/), clear its ChromaDB vector store, and remove access for assigned users.`,
      loading: false,
      onConfirm: async () => {
        setDeleteModalState((prev) => ({ ...prev, loading: true }));
        try {
          await apiDeleteDepartment(dept.id, auth.token);
          if (selectedDeptDetail?.id === dept.id) {
            setActiveTab('departments');
            setSelectedDeptDetail(null);
          }
          await fetchDepartments();
          setDeleteModalState({ isOpen: false, onConfirm: null, loading: false });

          toast.delete(
            `Department "${dept.name}" and its data folder have been permanently deleted.`,
            'Department Deleted'
          );
        } catch (err) {
          setError(err.message || `Failed to delete department '${dept.name}'.`);
          setDeleteModalState({ isOpen: false, onConfirm: null, loading: false });
          toast.error(err.message || 'Failed to delete department.', 'Deletion Error');
        }
      },
    });
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
    if (!roleInput) {
      setError('Please select an assigned department.');
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
      setRoleInput('');
      setShowCreateUserModal(false);

      await fetchUsers();
      await fetchDepartments();

      toast.success(
        `User account "${payload.full_name}" (@${payload.username}) created successfully.`,
        'User Registered'
      );
    } catch (err) {
      setError(err.message || 'Error creating user account.');
      toast.error(err.message || 'Failed to create user account.', 'Registration Failed');
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

      toast.success(
        `User account "${payload.full_name}" (@${selectedUser.username}) updated successfully.`,
        'Account Updated'
      );
    } catch (err) {
      setError(err.message || 'Error updating user.');
      toast.error(err.message || 'Failed to update user account.', 'Update Failed');
    }
  }

  // User Deletion Trigger Modal
  function requestDeleteUser(username) {
    if (username === 'root') {
      setError('System Administrator (root) is a protected system account and cannot be deleted.');
      toast.warning('System Administrator (root) is protected and cannot be deleted.', 'Action Blocked');
      return;
    }

    const userObj = users.find((u) => u.username === username);
    const displayName = userObj ? `${userObj.full_name} (@${username})` : `@${username}`;

    setDeleteModalState({
      isOpen: true,
      title: 'Delete User Account',
      itemName: displayName,
      itemType: 'user account',
      description:
        'This employee credentials will be permanently erased. They will no longer be able to log in or access FinSolve chat.',
      loading: false,
      onConfirm: async () => {
        setDeleteModalState((prev) => ({ ...prev, loading: true }));
        try {
          await apiDeleteUser(username, auth.token);
          await fetchUsers();
          await fetchDepartments();
          setDeleteModalState({ isOpen: false, onConfirm: null, loading: false });

          toast.delete(
            `User account "${displayName}" has been permanently deleted.`,
            'User Deleted'
          );
        } catch (err) {
          setError(err.message || 'Error deleting user.');
          setDeleteModalState({ isOpen: false, onConfirm: null, loading: false });
          toast.error(err.message || 'Failed to delete user account.', 'Deletion Error');
        }
      },
    });
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
      u.full_name.toLowerCase().includes(search) ||
      u.role.toLowerCase().includes(search)
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

      {/* Sidebar with Navigation, Profile & Theme Controls */}
      <ControlCenterSidebar
        sidebarOpen={sidebarOpen}
        toggleSidebar={toggleSidebar}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        auth={auth}
        logout={logout}
        onOpenProfile={() => setShowProfileModal(true)}
        onOpenSettings={() => setShowSettingsModal(true)}
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
            onDelete={requestDeleteDepartment}
            onOpenCreateModal={openCreateDeptModal}
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
            handleDeleteUser={requestDeleteUser}
            authToken={auth.token}
            onError={(msg) => {
              setError(msg);
              toast.error(msg, 'Error');
            }}
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
            onOpenCreateModal={openCreateUserModal}
            onEditUser={openEditUserModal}
            onDeleteUser={requestDeleteUser}
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
        deptFilesInput={deptFilesInput}
        setDeptFilesInput={setDeptFilesInput}
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

      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
      />

      {/* Centered Profile Details Modal */}
      <UserProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />

      {/* Reusable Delete Confirmation Dialog */}
      <ConfirmDeleteModal
        isOpen={deleteModalState.isOpen}
        title={deleteModalState.title}
        itemName={deleteModalState.itemName}
        itemType={deleteModalState.itemType}
        description={deleteModalState.description}
        onCancel={() => setDeleteModalState({ isOpen: false, onConfirm: null, loading: false })}
        onConfirm={deleteModalState.onConfirm}
        loading={deleteModalState.loading}
      />
    </div>
  );
}
