/**
 * AddDepartmentModal.jsx — Register New Corporate Department Modal
 * Clean, balanced 2-column grid layout with SVG icons & optional initial document upload
 */
import { useState } from 'react';
import { IconBuilding, IconX, IconSparkles } from '../../../../shared/components/Icons';
import styles from '../../styles/control_center.module.css';

export default function AddDepartmentModal({
  isOpen,
  onClose,
  onSubmit,
  deptNameInput,
  setDeptNameInput,
  deptEmojiInput,
  setDeptEmojiInput,
  deptStatusInput,
  setDeptStatusInput,
  deptKeyInput,
  setDeptKeyInput,
  deptDescInput,
  setDeptDescInput,
  deptFilesInput,
  setDeptFilesInput,
}) {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className={styles.modalHeader}>
          <div className={styles.modalHeaderLeft}>
            <div className={styles.modalHeaderIcon}>
              <IconBuilding size={20} />
            </div>
            <div>
              <h2 className={styles.modalTitle}>Register New Department</h2>
              <p className={styles.modalSubtitle}>Configure enterprise knowledge domain & RAG vector scope</p>
            </div>
          </div>
          <button className={styles.modalClose} onClick={onClose} aria-label="Close modal">
            <IconX size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={onSubmit} id="create-dept-form" autoComplete="off">
          <div className={styles.modalBody}>
            {/* Row 1: Name and Key */}
            <div className={styles.fieldGrid2}>
              <div className={styles.field}>
                <label htmlFor="create-dept-name">Department Name</label>
                <input
                  id="create-dept-name"
                  type="text"
                  placeholder="e.g. Compliance & Legal"
                  value={deptNameInput}
                  onChange={(e) => {
                    setDeptNameInput(e.target.value);
                    if (!deptKeyInput) {
                      setDeptKeyInput(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '_'));
                    }
                  }}
                  autoComplete="off"
                  required
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="create-dept-key">Role Key / Identifier</label>
                <input
                  id="create-dept-key"
                  type="text"
                  placeholder="e.g. compliance"
                  value={deptKeyInput}
                  onChange={(e) => setDeptKeyInput(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  autoComplete="off"
                  required
                />
              </div>
            </div>

            {/* Row 2: Status and Icon Scope */}
            <div className={styles.fieldGrid2}>
              <div className={styles.field}>
                <label htmlFor="create-dept-status">Operational Status</label>
                <select
                  id="create-dept-status"
                  value={deptStatusInput}
                  onChange={(e) => setDeptStatusInput(e.target.value)}
                >
                  <option value="Active">Active (RAG Enabled)</option>
                  <option value="Inactive">Inactive (Disabled)</option>
                </select>
              </div>

              <div className={styles.field}>
                <label htmlFor="create-dept-emoji">Category / Icon Tag (Optional)</label>
                <input
                  id="create-dept-emoji"
                  type="text"
                  placeholder="e.g. legal, finance, or image URL"
                  value={deptEmojiInput}
                  onChange={(e) => setDeptEmojiInput(e.target.value)}
                  autoComplete="off"
                />
              </div>
            </div>

            {/* Row 3: Description */}
            <div className={styles.field}>
              <label htmlFor="create-dept-desc">Department Description</label>
              <textarea
                id="create-dept-desc"
                placeholder="Describe the department responsibilities, document types, and knowledge boundaries..."
                value={deptDescInput}
                onChange={(e) => setDeptDescInput(e.target.value)}
                rows={3}
                className={styles.modalTextarea}
                required
              />
            </div>

            {/* Row 4: Optional Knowledge Documents Upload */}
            <div className={styles.field}>
              <label htmlFor="create-dept-files">Knowledge Documents (.txt, .md, .pdf) (Optional)</label>
              <div className={styles.fileDropArea}>
                <input
                  id="create-dept-files"
                  type="file"
                  multiple
                  accept=".txt,.md,.pdf,.json,.csv,.doc,.docx"
                  onChange={(e) => {
                    if (setDeptFilesInput) {
                      setDeptFilesInput(Array.from(e.target.files || []));
                    }
                  }}
                  className={styles.fileInputHidden}
                />
                <label htmlFor="create-dept-files" className={styles.fileDropLabel}>
                  <IconSparkles size={16} />
                  <span>
                    {deptFilesInput?.length
                      ? `${deptFilesInput.length} file(s) selected: ${deptFilesInput.map((f) => f.name).join(', ')}`
                      : 'Choose files to auto-upload to backend/data/<department>/'}
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className={styles.modalFooter}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={styles.confirmBtn} id="submit-create-dept">
              Create Department
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
