/**
 * DepartmentDetails.jsx — Department Drill-Down Member & Knowledge File Repository View
 * Enterprise UI with Initials Avatar, SVG Badges, and Real-time Data Folder File Management
 */
import { useState, useEffect } from 'react';
import { useToast } from '../../../../context/ToastContext';
import { ROLE_CONFIG } from '../../../../constants';
import {
  getDepartmentIcon,
  IconEdit,
  IconTrash,
  IconKey,
  IconSearch,
  IconPlus,
  IconSparkles,
} from '../../../../shared/components/Icons';
import {
  apiGetDepartmentFiles,
  apiUploadDepartmentFile,
  apiDeleteDepartmentFile,
} from '../../../../services/departmentService';
import ConfirmDeleteModal from '../../../../shared/components/ConfirmDeleteModal';
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
  authToken,
  onError,
}) {
  if (!selectedDeptDetail) return null;

  const { toast } = useToast();
  const deptKey = (selectedDeptDetail.id || '').toLowerCase();
  const roleConf = ROLE_CONFIG[deptKey] || {};
  const deptColor = roleConf.color || selectedDeptDetail.color || '#3b82f6';
  const isImageSvgOrUrl =
    selectedDeptDetail.image &&
    (selectedDeptDetail.image.startsWith('http') || selectedDeptDetail.image.startsWith('/'));

  // Knowledge Base Files State
  const [deptFiles, setDeptFiles] = useState([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);
  const [isDeletingFile, setIsDeletingFile] = useState(false);

  // Load department files from backend/data/<dept_id>/
  async function loadDepartmentFiles() {
    if (!authToken || !selectedDeptDetail?.id) return;
    setLoadingFiles(true);
    try {
      const files = await apiGetDepartmentFiles(selectedDeptDetail.id, authToken);
      setDeptFiles(files || []);
    } catch (err) {
      console.error('Failed to load department knowledge files:', err);
    } finally {
      setLoadingFiles(false);
    }
  }

  useEffect(() => {
    loadDepartmentFiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDeptDetail?.id, authToken]);

  // Upload handler
  async function handleFileUpload(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setUploadingFile(true);
    try {
      for (const file of files) {
        await apiUploadDepartmentFile(selectedDeptDetail.id, file, authToken);
      }
      await loadDepartmentFiles();
      toast.success(
        `Uploaded & indexed ${files.length} document(s) in ${selectedDeptDetail.name} knowledge base.`,
        'Document Uploaded'
      );
    } catch (err) {
      if (onError) onError(err.message || 'Failed to upload document to department.');
      toast.error(err.message || 'Failed to upload document.', 'Upload Error');
    } finally {
      setUploadingFile(false);
      e.target.value = '';
    }
  }

  // Delete file confirmation & handler
  async function confirmDeleteFile() {
    if (!fileToDelete) return;
    setIsDeletingFile(true);
    try {
      await apiDeleteDepartmentFile(selectedDeptDetail.id, fileToDelete.filename, authToken);
      await loadDepartmentFiles();
      toast.delete(
        `File "${fileToDelete.filename}" removed and ChromaDB vector store re-indexed.`,
        'Document Deleted'
      );
      setFileToDelete(null);
    } catch (err) {
      if (onError) onError(err.message || 'Failed to delete file from department.');
      toast.error(err.message || 'Failed to delete document.', 'Deletion Error');
      setFileToDelete(null);
    } finally {
      setIsDeletingFile(false);
    }
  }

  return (
    <section className={styles.section}>
      <div className={styles.breadcrumbBar}>
        <button
          className={styles.backBtn}
          onClick={onBack}
          id="back-to-depts-btn"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          <span>Back to Departments</span>
        </button>
      </div>

      <header className={styles.header}>
        <div className={styles.headerTitleGroup}>
          <div
            className={styles.deptDetailAvatar}
            style={{
              background: `radial-gradient(circle, ${deptColor}25 0%, ${deptColor}0d 100%)`,
              borderColor: `${deptColor}44`,
              color: deptColor,
              boxShadow: `0 4px 20px ${deptColor}25`,
            }}
          >
            {isImageSvgOrUrl ? (
              <img
                src={selectedDeptDetail.image}
                alt={selectedDeptDetail.name}
                style={{ width: '36px', height: '36px', objectFit: 'contain' }}
              />
            ) : (
              getDepartmentIcon(deptKey, 24)
            )}
          </div>
          <div>
            <h1 className={styles.title}>{selectedDeptDetail.name}</h1>
            <p className={styles.subtitle}>{selectedDeptDetail.description}</p>
          </div>
        </div>
      </header>

      {/* ── Section 1: Department Staff Members Table ─────────────────────── */}
      <div className={styles.detailsBlockHeader}>
        <h2 className={styles.blockTitle}>Assigned Staff Accounts</h2>
        <span className={styles.blockBadge}>{filteredDeptUsers.length} Users</span>
      </div>

      {/* Filter Controls */}
      <div className={styles.controlsRow}>
        <div className={styles.searchWrap}>
          <IconSearch size={16} className={styles.searchIcon} />
          <input
            id="dept-user-search-input"
            type="text"
            className={styles.searchInput}
            placeholder="Filter users in this department..."
            value={deptUserSearchTerm}
            onChange={(e) => {
              setDeptUserSearchTerm(e.target.value);
              setDeptUserPage(1);
            }}
          />
        </div>
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
                    <th>User</th>
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
                      label: deptObj.name
                    } : { color: '#94a3b8', label: u.role });

                    const roleColor = conf.color || '#3b82f6';
                    const initials = (u.full_name || u.username || 'U')
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .substring(0, 2)
                      .toUpperCase();

                    const isRoot = u.username === 'root';

                    return (
                      <tr key={u.username} className={styles.tableRow}>
                        {/* User Column */}
                        <td>
                          <div className={styles.userCellWrap}>
                            <div
                              className={styles.userTableAvatar}
                              style={{
                                background: `linear-gradient(135deg, ${roleColor}, ${roleColor}99)`,
                                boxShadow: `0 2px 8px ${roleColor}33`,
                              }}
                            >
                              {initials}
                            </div>
                            <div className={styles.userMeta}>
                              <span className={styles.userFullName}>{u.full_name}</span>
                              <span className={styles.userHandle}>@{u.username}</span>
                            </div>
                          </div>
                        </td>

                        {/* Monospace Username Pill */}
                        <td>
                          <span className={styles.usernamePill}>
                            <IconKey size={12} className={styles.keyIcon} />
                            <code>{u.username}</code>
                          </span>
                        </td>

                        {/* Role Badge */}
                        <td>
                          <span
                            className={styles.roleBadge}
                            style={{
                              color: roleColor,
                              backgroundColor: `${roleColor}12`,
                              borderColor: `${roleColor}33`,
                            }}
                          >
                            <span className={styles.roleIconWrapper}>
                              {getDepartmentIcon(u.role, 13)}
                            </span>
                            <span>{conf.label}</span>
                          </span>
                        </td>

                        {/* Status */}
                        <td>
                          <span
                            className={`${styles.deptStatusPill} ${
                              u.is_active ? styles.statusActivePill : styles.statusInactivePill
                            }`}
                          >
                            <span className={styles.statusPulseDot} />
                            {u.is_active ? 'Active' : 'Disabled'}
                          </span>
                        </td>

                        {/* Icon-Only Actions */}
                        <td style={{ textAlign: 'right' }}>
                          <div className={styles.actionsCell}>
                            <button
                              className={styles.tableIconBtn}
                              onClick={() => openEditUserModal(u)}
                              title={`Edit ${u.full_name} (@${u.username})`}
                              aria-label={`Edit ${u.full_name}`}
                              id={`edit-dept-user-${u.username}`}
                            >
                              <IconEdit size={15} />
                            </button>
                            {!isRoot && (
                              <button
                                className={`${styles.tableIconBtn} ${styles.deleteIconBtn}`}
                                onClick={() => handleDeleteUser(u.username)}
                                title={`Delete @${u.username}`}
                                aria-label={`Delete ${u.username}`}
                                id={`delete-dept-user-${u.username}`}
                              >
                                <IconTrash size={15} />
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

            {/* Pagination Controls */}
            <div className={styles.paginationContainer}>
              <div className={styles.paginationInfo}>
                Showing <strong>{filteredDeptUsers.length === 0 ? 0 : (deptUserPage - 1) * 5 + 1}–{Math.min(deptUserPage * 5, filteredDeptUsers.length)}</strong> of{' '}
                <strong>{filteredDeptUsers.length}</strong> members
              </div>

              <div className={styles.paginationActions}>
                <button
                  type="button"
                  className={styles.pageBtn}
                  onClick={() => setDeptUserPage((p) => Math.max(1, p - 1))}
                  disabled={deptUserPage === 1}
                >
                  ‹ Prev
                </button>

                {Array.from({ length: totalDeptUserPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    type="button"
                    className={`${styles.pageNumberBtn} ${
                      deptUserPage === pageNum ? styles.activePageBtn : ''
                    }`}
                    onClick={() => setDeptUserPage(pageNum)}
                  >
                    {pageNum}
                  </button>
                ))}

                <button
                  type="button"
                  className={styles.pageBtn}
                  onClick={() => setDeptUserPage((p) => Math.min(totalDeptUserPages, p + 1))}
                  disabled={deptUserPage === totalDeptUserPages}
                >
                  Next ›
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Section 2: Department Knowledge Files (backend/data/<dept_id>/) ── */}
      <div className={styles.detailsBlockHeader} style={{ marginTop: '2.5rem' }}>
        <div>
          <h2 className={styles.blockTitle}>Knowledge Base Documents</h2>
          <p className={styles.blockSubtitle}>
            Files located on disk at <code>backend/data/{selectedDeptDetail.id}/</code> and indexed into ChromaDB
          </p>
        </div>
        <div>
          <input
            id="dept-file-upload-input"
            type="file"
            multiple
            accept=".txt,.md,.pdf,.json,.csv,.doc,.docx"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
          <label
            htmlFor="dept-file-upload-input"
            className={styles.uploadDocBtn}
            style={{ cursor: uploadingFile ? 'not-allowed' : 'pointer' }}
          >
            <IconPlus size={15} />
            <span>{uploadingFile ? 'Uploading & Indexing...' : 'Upload Document'}</span>
          </label>
        </div>
      </div>

      <div className={styles.tableCard}>
        {loadingFiles ? (
          <div className={styles.emptyBox}>
            <p>Loading files from <code>backend/data/{selectedDeptDetail.id}</code>...</p>
          </div>
        ) : deptFiles.length === 0 ? (
          <div className={styles.emptyBox}>
            <p>No knowledge files found in this department data folder.</p>
            <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.35rem' }}>
              Click <strong>Upload Document</strong> to add .txt, .pdf, or .md files for AI retrieval.
            </p>
          </div>
        ) : (
          <div className={styles.tableResponsive}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Document Name</th>
                  <th>Format</th>
                  <th>File Size</th>
                  <th>Last Modified</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {deptFiles.map((f) => (
                  <tr key={f.filename} className={styles.tableRow}>
                    <td>
                      <div className={styles.docFileMeta}>
                        <div className={styles.docFileIcon}>
                          <IconSparkles size={14} />
                        </div>
                        <span className={styles.docFileName}>{f.filename}</span>
                      </div>
                    </td>
                    <td>
                      <span className={styles.fileExtBadge}>
                        {(f.extension || 'txt').toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <span className={styles.fileSizeText}>{f.size_formatted}</span>
                    </td>
                    <td>
                      <span className={styles.fileDateText}>
                        {new Date(f.modified_at).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className={`${styles.tableIconBtn} ${styles.deleteIconBtn}`}
                        onClick={() => setFileToDelete(f)}
                        title={`Delete ${f.filename}`}
                        aria-label={`Delete ${f.filename}`}
                      >
                        <IconTrash size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Document Confirmation Dialog */}
      <ConfirmDeleteModal
        isOpen={Boolean(fileToDelete)}
        title="Delete Knowledge Document"
        itemName={fileToDelete?.filename}
        itemType="document file"
        description={`This file will be permanently removed from disk at 'backend/data/${selectedDeptDetail.id}/${fileToDelete?.filename}' and its embeddings cleared from ChromaDB.`}
        onCancel={() => setFileToDelete(null)}
        onConfirm={confirmDeleteFile}
        loading={isDeletingFile}
      />
    </section>
  );
}
