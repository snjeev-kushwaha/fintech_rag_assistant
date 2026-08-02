/**
 * ErrorBanner.jsx — Reusable error alert component
 */
export default function ErrorBanner({ error, onClose, className, closeClassName }) {
  if (!error) return null;
  return (
    <div className={className} role="alert">
      <span>⚠️</span> {error}
      {onClose && (
        <button className={closeClassName} onClick={onClose} aria-label="Dismiss error">
          &times;
        </button>
      )}
    </div>
  );
}
