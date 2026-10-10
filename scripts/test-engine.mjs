// Teste do motor de ETA: simula cada passeio minuto a minuto (com ruído de GPS)
// e confere se o "tempo restante" acompanha o planejado e se o passeio termina.
import assert from 'node:assert/strict';
import { TOURS } from '../src/data/tours.js';
import { buildPlan, positionAt, step, scheduleInfo, initialEngineState } from '../src/lib/tourEngine.js';

// PRNG determinístico para o ruído do "GPS"
let seed = 42;
const rand = () => ((seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296) - 0.5;
const jitter = (p, m = 40) => ({
  lat: p.lat + (rand() * 2 * m) / 111320,
  lng: p.lng + (rand() * 2 * m) / 111320,
});

const TOL_MIN = 8; // tolerância: a chegada é detectada ao entrar no raio da parada
let failures = 0;

for (const tour of TOURS) {
  const plan = buildPlan(tour);
  const t0 = Date.UTC(2026, 9, 9, 12, 0, 0);
  let state = initialEngineState();
  let worst = 0;
  let lastTarget = 0;
  let finishedAt = null;

  for (let m = 0; m <= Math.ceil(plan.totalMin) + 5; m++) {
    const now = t0 + m * 60000;
    const r = step(plan, state, jitter(positionAt(plan, m)), now);
    state = r.state;

    if (m === 0) {
      assert.equal(r.info.status, 'travel', `${tour.id}: deveria começar em deslocamento`);
    }
    assert.ok(r.info.targetIndex >= lastTarget, `${tour.id}: parada regrediu no min ${m}`);
    lastTarget = r.info.targetIndex;

    if (r.info.status !== 'done') {
      worst = Math.max(worst, Math.abs(r.info.remainingMin - (plan.totalMin - m)));
    } else if (finishedAt == null) {
      finishedAt = m;
    }

    // modo sem GPS: segue o horário exatamente
    const s = scheduleInfo(plan, t0, now);
    assert.ok(Math.abs(s.remainingMin - Math.max(0, plan.totalMin - m)) < 1e-6, `${tour.id}: schedule`);
  }

  const ok = finishedAt != null && worst <= TOL_MIN;
  if (!ok) failures++;
  console.log(
    `${ok ? 'OK  ' : 'FAIL'} ${tour.id.padEnd(30)} total ${Math.round(plan.totalMin)} min · ` +
      `maior erro ${worst.toFixed(1)} min · terminou no min ${finishedAt ?? '—'}`
  );
}

assert.equal(failures, 0, `${failures} passeio(s) com problema`);
console.log('\nTodos os passeios passaram.');
