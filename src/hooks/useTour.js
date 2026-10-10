import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { tourById } from '../data/tours';
import { buildPlan, initialEngineState, positionAt, scheduleInfo, step } from '../lib/tourEngine';

const KEY = 'natal-ao-redor:tour:v1';

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
function save(value) {
  try {
    if (value) localStorage.setItem(KEY, JSON.stringify(value));
    else localStorage.removeItem(KEY);
  } catch {
    /* sem armazenamento: o passeio só não sobrevive a recarregar a página */
  }
}

export function useTour(gpsPos) {
  const [session, setSession] = useState(() => {
    const s = load();
    return s && tourById(s.tourId) ? s : null;
  });
  const [info, setInfo] = useState(null);

  const gpsRef = useRef(gpsPos);
  gpsRef.current = gpsPos;
  const engineRef = useRef(session?.engine ?? initialEngineState());

  const plan = useMemo(
    () => (session ? buildPlan(tourById(session.tourId)) : null),
    [session?.tourId] // eslint-disable-line react-hooks/exhaustive-deps
  );

  useEffect(() => {
    if (!session || !plan) {
      setInfo(null);
      return undefined;
    }
    let lastSave = 0;

    const compute = () => {
      const real = Date.now();
      const now = session.sim
        ? session.startedAt + (session.simBase ?? 0) + (real - session.simAnchor) * session.speed
        : real;
      const pos = session.sim ? positionAt(plan, (now - session.startedAt) / 60000) : gpsRef.current;

      let result;
      if (pos) {
        const r = step(plan, engineRef.current, pos, now);
        engineRef.current = r.state;
        result = r.info;
      } else {
        result = scheduleInfo(plan, session.startedAt, now);
      }
      setInfo({ ...result, now });

      if (real - lastSave > 5000) {
        lastSave = real;
        save({ ...session, engine: engineRef.current });
      }
    };

    compute();
    const id = setInterval(compute, session.sim ? 400 : 1000);
    return () => clearInterval(id);
  }, [session, plan]);

  const start = useCallback((tourId, { sim = false } = {}) => {
    const real = Date.now();
    const s = { tourId, sim, startedAt: real, simAnchor: real, simBase: 0, speed: 60 };
    engineRef.current = initialEngineState();
    save(s);
    setSession(s);
  }, []);

  const stop = useCallback(() => {
    save(null);
    setSession(null);
    setInfo(null);
  }, []);

  const setSpeed = useCallback((speed) => {
    const real = Date.now();
    setSession((s) => {
      if (!s?.sim) return s;
      const next = { ...s, simBase: (s.simBase ?? 0) + (real - s.simAnchor) * s.speed, simAnchor: real, speed };
      save({ ...next, engine: engineRef.current });
      return next;
    });
  }, []);

  return { session, plan, info, start, stop, setSpeed };
}
