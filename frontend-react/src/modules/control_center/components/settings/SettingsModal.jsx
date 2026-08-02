/**
 * SettingsModal.jsx — Control Center Settings Popup with Theme Selection
 */
import { useTheme } from '../../../../context/ThemeContext';
import styles from '../../styles/control_center.module.css';

export default function SettingsModal({ isOpen, onClose }) {
  const { theme, setTheme } = useTheme();

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        style={{ width: '520px', maxWidth: '95%' }}
      >
        <div className={styles.modalHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <span style={{ fontSize: '1.25rem' }}>⚙️</span>
            <h2>Control Center Settings</h2>
          </div>
          <button className={styles.modalClose} onClick={onClose} title="Close Settings">
            ×
          </button>
        </div>

        <div className={styles.modalBody}>
          {/* Appearance Section */}
          <div className={styles.field}>
            <label style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>Appearance & Theme</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
              {/* Light Theme Card */}
              <div
                onClick={() => setTheme('light')}
                style={{
                  padding: '1rem',
                  borderRadius: '12px',
                  border: theme === 'light' ? '2px solid #ef4444' : '1px solid rgba(255,255,255,0.12)',
                  background: theme === 'light' ? 'rgba(239, 68, 68, 0.08)' : 'rgba(255,255,255,0.03)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '1.35rem' }}>☀️</span>
                  {theme === 'light' && (
                    <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#ef4444', textTransform: 'uppercase' }}>
                      Active
                    </span>
                  )}
                </div>
                <div>
                  <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>Light Theme</div>
                  <div style={{ fontSize: '0.78rem', opacity: 0.75 }}>Clean, bright workspace style</div>
                </div>
              </div>

              {/* Dark Theme Card */}
              <div
                onClick={() => setTheme('dark')}
                style={{
                  padding: '1rem',
                  borderRadius: '12px',
                  border: theme === 'dark' ? '2px solid #ef4444' : '1px solid rgba(255,255,255,0.12)',
                  background: theme === 'dark' ? 'rgba(239, 68, 68, 0.08)' : 'rgba(255,255,255,0.03)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '1.35rem' }}>🌙</span>
                  {theme === 'dark' && (
                    <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#ef4444', textTransform: 'uppercase' }}>
                      Active
                    </span>
                  )}
                </div>
                <div>
                  <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>Dark Theme</div>
                  <div style={{ fontSize: '0.78rem', opacity: 0.75 }}>Sleek ChatGPT dark UI style</div>
                </div>
              </div>
            </div>
          </div>

          {/* System Info Overview */}
          <div className={styles.field} style={{ marginTop: '0.5rem' }}>
            <label style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>System Information</label>
            <div
              style={{
                padding: '0.85rem 1rem',
                borderRadius: '8px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.4rem',
                fontSize: '0.85rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ opacity: 0.75 }}>RAG Model Engine:</span>
                <span style={{ fontWeight: '600' }}>Local LLaMA 3.2 (Ollama Docker)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ opacity: 0.75 }}>Vector Database:</span>
                <span style={{ fontWeight: '600' }}>ChromaDB (`backend/chroma_db`)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ opacity: 0.75 }}>Database Storage:</span>
                <span style={{ fontWeight: '600' }}>MongoDB (`finsolve_db`)</span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.confirmBtn} onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
