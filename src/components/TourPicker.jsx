import { useMemo } from 'react';
import { TOURS } from '../data/tours';
import { fmtDuration } from '../lib/geo';
import { buildPlan } from '../lib/tourEngine';

export default function TourPicker({ selectedId, onSelect, onStart }) {
  const plans = useMemo(() => Object.fromEntries(TOURS.map((t) => [t.id, buildPlan(t)])), []);

  return (
    <div className="tours">
      <p className="hint">
        Está em um passeio com a LavaiLavem? Escolha o seu e acompanhe quanto falta para terminar,
        pela sua localização.
      </p>
      {TOURS.map((t) => {
        const plan = plans[t.id];
        const open = selectedId === t.id;
        return (
          <article key={t.id} className={`card${open ? ' card--sel' : ''}`}>
            <button className="card__main" onClick={() => onSelect(open ? null : t.id)} aria-expanded={open}>
              <span className="card__badge card__badge--tour">{t.emoji}</span>
              <span className="card__text">
                <strong>{t.name}</strong>
                <small>
                  {t.tag}, {t.area}
                </small>
              </span>
              <span className="card__km">{fmtDuration(plan.totalMin)}</span>
            </button>
            {open && (
              <div className="card__more">
                <ol className="stops">
                  {plan.points
                    .filter((p) => !p.isReturn)
                    .map((p) => (
                      <li key={p.name}>
                        <span>{p.name}</span>
                        <small>{p.dwell} min</small>
                      </li>
                    ))}
                </ol>
                <p className="note">
                  Duração total estimada: {fmtDuration(plan.totalMin)}, com paradas e volta ao embarque.
                </p>
                <div className="btn-row">
                  <button className="btn btn--primary" onClick={() => onStart(t.id, { sim: false })}>
                    Estou neste passeio
                  </button>
                  <button className="btn btn--ghost" onClick={() => onStart(t.id, { sim: true })}>
                    Ver demonstração
                  </button>
                </div>
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}
