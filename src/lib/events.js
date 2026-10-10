import { fmtClock } from './geo.js';

const [H, M] = [0, 1];
const parse = (hhmm) => hhmm.split(':').map(Number);

// Próxima (ou atual) ocorrência de um evento, ou null se já passou.
export function nextOccurrence(ev, nowMs) {
  const dur = (ev.durationMin ?? 120) * 60000;
  const t = parse(ev.start);

  if (ev.date) {
    const [y, mo, d] = ev.date.split('-').map(Number);
    const startMs = new Date(y, mo - 1, d, t[H], t[M]).getTime();
    return startMs + dur > nowMs ? { startMs, endMs: startMs + dur, live: nowMs >= startMs } : null;
  }

  const base = new Date(nowMs);
  for (let i = 0; i < 8; i++) {
    const day = new Date(base.getFullYear(), base.getMonth(), base.getDate() + i, t[H], t[M]);
    if (!ev.days.includes(day.getDay())) continue;
    const startMs = day.getTime();
    if (startMs + dur > nowMs) return { startMs, endMs: startMs + dur, live: nowMs >= startMs };
  }
  return null;
}

const weekday = new Intl.DateTimeFormat('pt-BR', { weekday: 'short' });

export function fmtWhen(occ, nowMs) {
  if (occ.live) return `Acontecendo agora · até ${fmtClock(occ.endMs)}`;
  const start = new Date(occ.startMs);
  const today = new Date(nowMs);
  const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
  const label =
    start.toDateString() === today.toDateString()
      ? 'Hoje'
      : start.toDateString() === tomorrow.toDateString()
        ? 'Amanhã'
        : weekday.format(start).replace('.', '');
  return `${label} · ${fmtClock(occ.startMs)}`;
}
