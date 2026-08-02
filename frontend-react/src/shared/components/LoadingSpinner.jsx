/**
 * LoadingSpinner.jsx — Reusable loading spinner component
 */
export default function LoadingSpinner({ message = 'Loading...', boxClass, spinnerClass }) {
  return (
    <div className={boxClass}>
      <div className={spinnerClass} />
      <p>{message}</p>
    </div>
  );
}
