import { useEffect, useRef, useState } from 'react';
import { sheetMetrics } from '../lib/sheet';

const ORDER = ['peek', 'half', 'full'];

// Painel que desliza de baixo (celular) e vira coluna lateral fixa no desktop (via CSS).
export default function Sheet({ snap, onSnap, hasTour, scrollKey, children }) {
  const [vh, setVh] = useState(() => window.innerHeight);
  const [dragY, setDragY] = useState(null);
  const gesture = useRef(null);
  const bodyRef = useRef(null);

  // Volta ao topo ao trocar de aba ou ao iniciar/encerrar um passeio.
  useEffect(() => {
    bodyRef.current?.scrollTo({ top: 0 });
  }, [scrollKey, hasTour]);

  useEffect(() => {
    const onResize = () => setVh(window.innerHeight);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const { sheetH, offsets } = sheetMetrics(vh, hasTour);
  const y = dragY ?? offsets[snap];

  const onDown = (e) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    gesture.current = { startY: e.clientY, base: offsets[snap], lastY: e.clientY, lastT: e.timeStamp, v: 0 };
  };
  const onMove = (e) => {
    const g = gesture.current;
    if (!g) return;
    const dt = Math.max(e.timeStamp - g.lastT, 1);
    g.v = (e.clientY - g.lastY) / dt; // px/ms, positivo = descendo
    g.lastY = e.clientY;
    g.lastT = e.timeStamp;
    setDragY(Math.min(offsets.peek, Math.max(0, g.base + (e.clientY - g.startY))));
  };
  const onUp = (e) => {
    const g = gesture.current;
    gesture.current = null;
    if (!g) return;
    const moved = Math.abs(e.clientY - g.startY);
    if (moved < 6) {
      // toque simples: alterna entre fechado e meio
      onSnap(snap === 'peek' ? 'half' : 'peek');
    } else {
      const projected = g.base + (e.clientY - g.startY) + g.v * 180;
      const best = ORDER.reduce((a, b) =>
        Math.abs(offsets[b] - projected) < Math.abs(offsets[a] - projected) ? b : a
      );
      onSnap(best);
    }
    setDragY(null);
  };

  return (
    <section
      className={`sheet${dragY != null ? ' sheet--dragging' : ''}`}
      style={{ '--sheet-h': `${sheetH}px`, '--y': `${y}px` }}
      aria-label="Painel de lugares e passeio"
    >
      <div
        className="sheet__handle"
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        role="button"
        tabIndex={0}
        aria-label={snap === 'peek' ? 'Abrir painel' : 'Recolher painel'}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') onSnap(snap === 'peek' ? 'half' : 'peek');
        }}
      >
        <i />
      </div>
      <div className="sheet__body" ref={bodyRef}>
        {children}
      </div>
    </section>
  );
}
