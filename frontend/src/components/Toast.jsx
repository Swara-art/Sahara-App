/**
 * Toast — renders a floating notification.
 * Props: message (string), type ('success'|'error'|'info')
 */
export default function Toast({ message, type = 'info' }) {
  if (!message) return null;
  return (
    <div className={`toast toast-${type}`}>
      {type === 'success' && '✅ '}
      {type === 'error'   && '❌ '}
      {type === 'info'    && 'ℹ️ '}
      {message}
    </div>
  );
}
