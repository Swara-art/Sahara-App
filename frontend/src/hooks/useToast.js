import { useState, useCallback } from 'react';

/**
 * useToast — lightweight in-component toast state
 * Returns { toast, showToast }
 * toast: { message, type: 'success'|'error'|'info' } | null
 */
export function useToast() {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'info', duration = 3000) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), duration);
  }, []);

  return { toast, showToast };
}
