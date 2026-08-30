/**
 * ToastContext.jsx — Enterprise Toast Notification Manager
 * Provides global toast alerts for Create, Update, Delete, and Upload actions with auto-dismiss
 */
import { createContext, useContext, useState, useCallback } from 'react';
import { IconCheck, IconTrash, IconSparkles, IconX } from '../shared/components/Icons';
import styles from '../shared/components/Toast.module.css';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    ({ type = 'success', title, message, duration = 3800 }) => {
      const id = Date.now() + Math.random().toString(36).substring(2, 9);
      const newToast = { id, type, title, message, duration };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }

      return id;
    },
    [removeToast]
  );

  const toast = {
    success: (message, title = 'Success') => addToast({ type: 'success', title, message }),
    error: (message, title = 'Error') => addToast({ type: 'error', title, message }),
    info: (message, title = 'Information') => addToast({ type: 'info', title, message }),
    warning: (message, title = 'Warning') => addToast({ type: 'warning', title, message }),
    delete: (message, title = 'Deleted') => addToast({ type: 'error', title, message }),
  };

  return (
    <ToastContext.Provider value={{ addToast, removeToast, toast }}>
      {children}
      {/* Global Floating Toast Container */}
      <div className={styles.toastContainer} aria-live="polite" aria-atomic="true">
        {toasts.map((t) => {
          const typeClass =
            t.type === 'success'
              ? styles.toastSuccess
              : t.type === 'error'
              ? styles.toastError
              : t.type === 'warning'
              ? styles.toastWarning
              : styles.toastInfo;

          return (
            <div key={t.id} className={`${styles.toast} ${typeClass}`} role="status">
              <div className={styles.toastIcon}>
                {t.type === 'success' && <IconCheck size={17} />}
                {t.type === 'error' && <IconTrash size={16} />}
                {t.type === 'info' && <IconSparkles size={16} />}
                {t.type === 'warning' && <IconSparkles size={16} />}
              </div>

              <div className={styles.toastContent}>
                {t.title && <h4 className={styles.toastTitle}>{t.title}</h4>}
                <p className={styles.toastMessage}>{t.message}</p>
              </div>

              <button
                type="button"
                className={styles.toastClose}
                onClick={() => removeToast(t.id)}
                aria-label="Dismiss notification"
              >
                <IconX size={14} />
              </button>

              {t.duration > 0 && (
                <div
                  className={styles.toastProgress}
                  style={{ animationDuration: `${t.duration}ms` }}
                />
              )}
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
