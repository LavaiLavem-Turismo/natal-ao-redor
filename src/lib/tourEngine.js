// Motor do passeio: calcula "quanto falta" a partir da localização do turista.
//
// Modelo: embarque → parada 1 → … → parada N → volta ao embarque.
// Cada trecho tem distância (reta × fator de curvas) e velocidade média; cada parada tem
// um tempo de permanência. O tempo restante é:
//   (trecho até o próximo ponto, pela posição atual) + (paradas e trechos seguintes).
// Sem GPS, cai para o horário planejado desde o início do passeio.

import { haversineKm, lerp, clamp } from './geo.js';
import { BASE } from '../data/tours.js';

const DEFAULT_FACTOR = 1.3;
const DEFAULT_RADIUS_KM = 0.6;

export function buildPlan(tour) {
  const raw = [
    ...tour.stops,
    {
      name: 'Volta ao embarque',
      lat: BASE.lat,
      lng: BASE.lng,
      dwell: 0,
      kmh: tour.returnKmh,
      isReturn: true,
    },
  ];

  let prev = BASE;
  const points = raw.map((p, index) => {
    const factor = p.factor ?? DEFAULT_FACTOR;
    const legKm = haversineKm(prev, p) * factor;
    const legMin = (legKm / p.kmh) * 60;
    const point = {
      ...p,
      index,
      factor,
      radius: p.radius ?? DEFAULT_RADIUS_KM,
      dwell: p.dwell ?? 0,
      legKm,
      legMin,
      from: { lat: prev.lat, lng: prev.lng },
    };
    prev = p;
    return point;
  });

  const timeline = [];
  let t = 0;
  for (const p of points) {
    timeline.push({ type: 'drive', idx: p.index, startMin: t, endMin: t + p.legMin, from: p.from, to: p });
    t += p.legMin;
    if (p.dwell > 0) {
      timeline.push({ type: 'dwell', idx: p.index, startMin: t, endMin: t + p.dwell, at: p });
      t += p.dwell;
    }
  }

  return { tour, points, timeline, totalMin: t, stopCount: tour.stops.length, base: BASE };
}

// Posição esperada no minuto `min` do passeio (usada na simulação e no modo sem GPS).
export function positionAt(plan, min) {
  if (min <= 0) return { lat: BASE.lat, lng: BASE.lng };
  for (const seg of plan.timeline) {
    if (min < seg.endMin) {
      if (seg.type === 'dwell') return { lat: seg.at.lat, lng: seg.at.lng };
      const span = seg.endMin - seg.startMin;
      const t = span > 0 ? (min - seg.startMin) / span : 1;
      return lerp(seg.from, seg.to, t);
    }
  }
  return { lat: BASE.lat, lng: BASE.lng };
}

const restAfter = (plan, i) =>
  plan.points.slice(i + 1).reduce((sum, p) => sum + p.legMin + p.dwell, 0);

export const initialEngineState = () => ({ target: 0, arrivedAt: null, done: false });

function buildInfo(plan, now, fields) {
  const target = plan.points[fields.targetIndex];
  const remainingMin = Math.max(0, fields.remainingMin);
  return {
    ...fields,
    target,
    next: plan.points[fields.targetIndex + 1] ?? null,
    remainingMin,
    etaMs: now + remainingMin * 60000,
    progress: fields.status === 'done' ? 1 : clamp(1 - remainingMin / plan.totalMin, 0, 1),
  };
}

// Um passo do motor com posição real (ou simulada).
export function step(plan, state, pos, now) {
  const pts = plan.points;
  const last = pts.length - 1;
  let { target, arrivedAt, done } = state;

  if (!done) {
    // Saiu do raio da parada em que estava, ou já entrou no raio da seguinte
    // (paradas muito próximas) → segue adiante.
    if (arrivedAt != null && target < last) {
      const p = pts[target];
      const upcoming = target + 1 <= last - 1 ? pts[target + 1] : null;
      const left = haversineKm(pos, p) > p.radius * 1.5 + 0.2;
      const reachedNext = upcoming && haversineKm(pos, upcoming) <= upcoming.radius;
      if (left || reachedNext) {
        target += 1;
        arrivedAt = null;
      }
    }

    // Chegou a alguma parada à frente (permite pular uma parada).
    if (arrivedAt == null) {
      const maxJ = target === last ? last : last - 1; // a volta só vale depois da última parada
      for (let j = target; j <= maxJ; j++) {
        if (haversineKm(pos, pts[j]) <= pts[j].radius) {
          target = j;
          arrivedAt = now;
          if (j === last) done = true;
          break;
        }
      }
    }
  }

  const next = { target, arrivedAt, done };

  if (done) {
    return {
      state: next,
      info: buildInfo(plan, now, {
        status: 'done',
        source: 'gps',
        targetIndex: last,
        remainingMin: 0,
        distanceKm: 0,
        dwellLeftMin: 0,
        pos,
      }),
    };
  }

  const p = pts[target];
  if (arrivedAt != null) {
    const dwellLeft = Math.max(0, p.dwell - (now - arrivedAt) / 60000);
    return {
      state: next,
      info: buildInfo(plan, now, {
        status: 'stop',
        source: 'gps',
        targetIndex: target,
        remainingMin: dwellLeft + restAfter(plan, target),
        distanceKm: haversineKm(pos, p),
        dwellLeftMin: dwellLeft,
        pos,
      }),
    };
  }

  const distanceKm = haversineKm(pos, p);
  const legMin = ((distanceKm * p.factor) / p.kmh) * 60;
  return {
    state: next,
    info: buildInfo(plan, now, {
      status: 'travel',
      source: 'gps',
      targetIndex: target,
      remainingMin: legMin + p.dwell + restAfter(plan, target),
      distanceKm,
      dwellLeftMin: p.dwell,
      pos,
    }),
  };
}

// Sem localização: segue o horário planejado desde o início.
export function scheduleInfo(plan, startedAt, now) {
  const elapsed = Math.max(0, (now - startedAt) / 60000);
  const pos = positionAt(plan, elapsed);

  if (elapsed >= plan.totalMin) {
    return buildInfo(plan, now, {
      status: 'done',
      source: 'schedule',
      targetIndex: plan.points.length - 1,
      remainingMin: 0,
      distanceKm: 0,
      dwellLeftMin: 0,
      pos,
    });
  }

  const seg = plan.timeline.find((s) => elapsed < s.endMin);
  const point = plan.points[seg.idx];
  const frac = (elapsed - seg.startMin) / Math.max(seg.endMin - seg.startMin, 1e-9);
  return buildInfo(plan, now, {
    status: seg.type === 'drive' ? 'travel' : 'stop',
    source: 'schedule',
    targetIndex: seg.idx,
    remainingMin: plan.totalMin - elapsed,
    distanceKm: seg.type === 'drive' ? point.legKm * (1 - frac) : 0,
    dwellLeftMin: seg.type === 'dwell' ? seg.endMin - elapsed : point.dwell,
    pos,
  });
}
