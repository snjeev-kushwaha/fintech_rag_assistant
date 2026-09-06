/**
 * ErrorBanner.jsx — Reusable error alert component
 */
import { ExclamationCircleFill } from 'react-bootstrap-icons';

export default function ErrorBanner({ error, onClose, className, closeClassName }) {
  if (!error) return null;
  return (
    <div className={className} role="alert">
      <ExclamationCircleFill size={16} style={{ flexShrink: 0, marginRight: '0.5rem', display: 'inline-block', verticalAlign: 'middle' }} />
      <span>{error}</span>
      {onClose && (
        <button className={closeClassName} onClick={onClose} aria-label="Dismiss error">
          &times;
        </button>
      )}
    </div>
  );
}
