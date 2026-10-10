import { useEffect, useRef } from 'react';
import { catById } from '../data/places';
import { fmtKm } from '../lib/geo';
import { fmtWhen } from '../lib/events';
import { DirectionsIcon } from './Icons';

const directionsUrl = (p) =>
  `https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}&travelmode=driving`;

// Rola só a lista do painel (nunca a página inteira) para mostrar o card selecionado.
function useScrollIntoView(selected) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    const box = el?.closest('.sheet__body');
    if (!selected || !el || !box) return;
    const top = el.offsetTop - box.offsetTop;
    const bottom = top + el.offsetHeight;
    if (top < box.scrollTop) box.scrollTo({ top: top - 8, behavior: 'smooth' });
    else if (bottom > box.scrollTop + box.clientHeight) {
      box.scrollTo({ top: bottom - box.clientHeight + 16, behavior: 'smooth' });
    }
  }, [selected]);
  return ref;
}

export function PlaceCard({ place, km, selected, onSelect }) {
  const cat = catById(place.category);
  const ref = useScrollIntoView(selected);
  return (
    <article ref={ref} className={`card${selected ? ' card--sel' : ''}`}>
      <button className="card__main" onClick={onSelect} aria-expanded={selected}>
        <span className="card__badge" style={{ '--c': cat.color }}>{cat.emoji}</span>
        <span className="card__text">
          <strong>{place.name}</strong>
          <small>{place.area}</small>
        </span>
        {km != null && <span className="card__km">{fmtKm(km)}</span>}
      </button>
      {selected && (
        <div className="card__more">
          <p>{place.description}</p>
          <a className="btn btn--primary" href={directionsUrl(place)} target="_blank" rel="noreferrer">
            <DirectionsIcon /> Como chegar
          </a>
        </div>
      )}
    </article>
  );
}

export function EventCard({ ev, occ, now, km, selected, onSelect }) {
  const cat = catById('evento');
  const ref = useScrollIntoView(selected);
  return (
    <article ref={ref} className={`card${selected ? ' card--sel' : ''}`}>
      <button className="card__main" onClick={onSelect} aria-expanded={selected}>
        <span className="card__badge" style={{ '--c': cat.color }}>{cat.emoji}</span>
        <span className="card__text">
          <strong>{ev.title}</strong>
          <small className={occ.live ? 'live' : ''}>{fmtWhen(occ, now)}</small>
        </span>
        {km != null && <span className="card__km">{fmtKm(km)}</span>}
      </button>
      {selected && (
        <div className="card__more">
          <p>
            <b>{ev.place}.</b> {ev.description}
          </p>
          {ev.sample && <p className="note">Evento de exemplo: troque pelos eventos reais em src/data/events.js.</p>}
          <a className="btn btn--primary" href={directionsUrl(ev)} target="_blank" rel="noreferrer">
            <DirectionsIcon /> Como chegar
          </a>
        </div>
      )}
    </article>
  );
}
