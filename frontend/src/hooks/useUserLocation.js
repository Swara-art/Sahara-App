import { useState, useEffect } from 'react';

/**
 * useUserLocation — wraps navigator.geolocation.getCurrentPosition
 * Returns { lat, lng, loading, error }
 */
export function useUserLocation() {
  const [location, setLocation] = useState({ lat: null, lng: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLoading(false);
      },
      (err) => {
        setError('Location access denied. Please enable location to see nearby complaints.');
        setLoading(false);
        console.warn('Geolocation error:', err.message);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }, []);

  return { ...location, loading, error };
}
