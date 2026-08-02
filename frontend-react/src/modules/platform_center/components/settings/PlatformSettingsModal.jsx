/**
 * PlatformSettingsModal.jsx — Platform Center Settings Popup with Theme Selection
 */
import { useTheme } from '../../../../context/ThemeContext';
import styles from '../../styles/platform_center.module.css';

export default function PlatformSettingsModal({ isOpen, onClose, roleConf }) {
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
            <h2>Platform Settings</h2>
          </div>
          <button className={styles.modalClose} onClick={onClose} title="Close Settings">
            ×
          </button>
        </div>

        <div className={styles.modalBody}>
          {/* Appearance & Theme Section */}
          <div className={styles.field}>
            <label style={{ fontSize: '0.85rem', marginBottom: '0.5rem', display: 'block', fontWeight: '600' }}>
              Appearance & Theme
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
              {/* Light Theme Card */}
              <div
                onClick={() => setTheme('light')}
                style={{
                  padding: '1rem',
                  borderRadius: '12px',
                  border: theme === 'light' ? '2px solid #10a37f' : '1px solid rgba(255,255,255,0.12)',
                  background: theme === 'light' ? 'rgba(16, 163, 127, 0.08)' : 'rgba(255,255,255,0.03)',
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
                    <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#10a37f', textTransform: 'uppercase' }}>
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
                  border: theme === 'dark' ? '2px solid #10a37f' : '1px solid rgba(255,255,255,0.12)',
                  background: theme === 'dark' ? 'rgba(16, 163, 127, 0.08)' : 'rgba(255,255,255,0.03)',
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
                    <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#10a37f', textTransform: 'uppercase' }}>
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

          {/* System & RAG Info */}
          <div className={styles.field} style={{ marginTop: '0.5rem' }}>
            <label style={{ fontSize: '0.85rem', marginBottom: '0.5rem', display: 'block', fontWeight: '600' }}>
              RAG Engine & Knowledge Scope
            </label>
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
                <span style={{ opacity: 0.75 }}>Active Role Scope:</span>
                <span style={{ fontWeight: '600', color: '#10a37f' }}>{roleConf?.label || 'Scoped User'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ opacity: 0.75 }}>Model Engine:</span>
                <span style={{ fontWeight: '600' }}>Local LLaMA 3.2 (Ollama Docker)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ opacity: 0.75 }}>Vector Database:</span>
                <span style={{ fontWeight: '600' }}>ChromaDB (`backend/chroma_db`)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ opacity: 0.75 }}>Chat Threads Storage:</span>
                <span style={{ fontWeight: '600' }}>MongoDB (`finsolve_db`)</span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.confirmBtn} onClick={onClose} style={{ background: '#10a37f' }}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
