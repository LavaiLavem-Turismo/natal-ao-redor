import { useCallback, useEffect, useRef, useState } from 'react';

// status: idle | asking | granted | denied | unavailable | error
export function useGeolocation() {
  const [state, setState] = useState({ status: 'idle', pos: null, accuracy: null });
  const watchId = useRef(null);

  const request = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setState((s) => ({ ...s, status: 'unavailable' }));
      return;
    }
    if (watchId.current != null) return;
    setState((s) => ({ ...s, status: s.pos ? 'granted' : 'asking' }));
    watchId.current = navigator.geolocation.watchPosition(
      (p) =>
        setState({
          status: 'granted',
          pos: { lat: p.coords.latitude, lng: p.coords.longitude },
          accuracy: p.coords.accuracy,
        }),
      (err) => {
        if (err.code === 1) {
          navigator.geolocation.clearWatch(watchId.current);
          watchId.current = null;
          setState((s) => ({ ...s, status: 'denied' }));
        } else {
          // sinal fraco/timeout: mantém a última posição conhecida
          setState((s) => (s.pos ? s : { ...s, status: 'error' }));
        }
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 }
    );
  }, []);

  useEffect(() => {
    // Se o turista já deu permissão antes, começa sozinho; senão espera o toque no botão.
    let cancelled = false;
    navigator.permissions
      ?.query({ name: 'geolocation' })
      .then((res) => {
        if (!cancelled && res.state === 'granted') request();
      })
      .catch(() => {});
    return () => {
      cancelled = true;
      if (watchId.current != null && 'geolocation' in navigator) {
        navigator.geolocation.clearWatch(watchId.current);
        watchId.current = null;
      }
    };
  }, [request]);

  return { ...state, request };
}
