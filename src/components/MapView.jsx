import { useEffect, useRef } from 'react';
import L from 'leaflet';
import {
  AttributionControl,
  MapContainer,
  Marker,
  Polyline,
  Tooltip,
  useMap,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import Basemap from './Basemap';
import { catById } from '../data/places';

const NATAL = [-5.82, -35.2];
const iconCache = new Map();
function cached(key, make) {
  if (!iconCache.has(key)) iconCache.set(key, make());
  return iconCache.get(key);
}

const pinIcon = (color, emoji, { selected, live }) =>
  cached(`pin:${color}:${emoji}:${selected}:${live}`, () =>
    L.divIcon({
      className: 'pin-wrap',
      html: `<div class="pin${selected ? ' pin--sel' : ''}${live ? ' pin--live' : ''}" style="--c:${color}"><span>${emoji}</span></div>`,
      iconSize: [36, 36],
      iconAnchor: [0, 36],
    })
  );

const meIcon = cached('me', () =>
  L.divIcon({ className: 'pin-wrap', html: '<div class="me"></div>', iconSize: [20, 20], iconAnchor: [10, 10] })
);

const stopIcon = (n, done) =>
  cached(`stop:${n}:${done}`, () =>
    L.divIcon({
      className: 'pin-wrap',
      html: `<div class="stopdot${done ? ' stopdot--done' : ''}">${n}</div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    })
  );

const baseIcon = cached('base', () =>
  L.divIcon({ className: 'pin-wrap', html: '<div class="basedot">Embarque</div>', iconSize: [0, 0], iconAnchor: [0, 0] })
);

const vehicleIcon = (emoji) =>
  cached(`veh:${emoji}`, () =>
    L.divIcon({
      className: 'pin-wrap',
      html: `<div class="vehicle">${emoji}</div>`,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    })
  );

const ll = (p) => [p.lat, p.lng];

function MapController({ focus, fit, inset }) {
  const map = useMap();
  const insetRef = useRef(inset);
  insetRef.current = inset;

  useEffect(() => {
    if (!focus) return;
    const zoom = focus.zoom ?? Math.max(map.getZoom(), 14);
    const { left, bottom } = insetRef.current;
    // Desloca o centro para que o ponto fique no meio da área visível (fora do painel).
    const px = map.project([focus.lat, focus.lng], zoom).add([-left / 2, bottom / 2]);
    map.flyTo(map.unproject(px, zoom), zoom, { duration: 0.8 });
  }, [focus?.nonce]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!fit || !fit.points.length) return;
    const { left, bottom } = insetRef.current;
    map.fitBounds(L.latLngBounds(fit.points.map(ll)), {
      paddingTopLeft: [left + 28, 70],
      paddingBottomRight: [28, bottom + 28],
      maxZoom: 14,
      duration: 0.8,
    });
  }, [fit?.nonce]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 50);
    return () => clearTimeout(t);
  }, [map]);

  return null;
}

function RouteLayer({ plan, info, simMode }) {
  const pts = plan.points;
  const stops = pts.filter((p) => !p.isReturn);
  const target = info ? info.targetIndex : 0;
  const status = info?.status;

  const doneCount = info ? (status === 'done' ? pts.length : target) : 0;
  const completed = [plan.base, ...pts.slice(0, doneCount)];
  const upcoming = [
    ...(info?.pos && status !== 'done' ? [info.pos] : [completed[completed.length - 1]]),
    ...pts.slice(doneCount),
  ];

  return (
    <>
      <Polyline positions={(info ? upcoming : [plan.base, ...pts]).map(ll)} pathOptions={{ color: '#0E8FA6', weight: 4, opacity: 0.85, dashArray: '2 9', lineCap: 'round' }} />
      {info && completed.length > 1 && (
        <Polyline positions={completed.map(ll)} pathOptions={{ color: '#FFB000', weight: 5, opacity: 0.95, lineCap: 'round' }} />
      )}
      <Marker position={ll(plan.base)} icon={baseIcon} interactive={false} />
      {stops.map((p, i) => (
        <Marker key={p.name + i} position={ll(p)} icon={stopIcon(i + 1, info && i < doneCount)} zIndexOffset={400}>
          <Tooltip direction="top" offset={[0, -10]}>{p.name}</Tooltip>
        </Marker>
      ))}
      {simMode && info?.pos && (
        <Marker position={ll(info.pos)} icon={vehicleIcon(plan.tour.emoji)} zIndexOffset={900} interactive={false} />
      )}
    </>
  );
}

export default function MapView({
  places,
  events,
  selectedKey,
  onSelect,
  user,
  plan,
  info,
  simMode,
  preview,
  focus,
  fit,
  inset,
}) {
  return (
    <MapContainer
      center={NATAL}
      zoom={12}
      minZoom={8}
      zoomControl={false}
      attributionControl={false}
      className="map"
    >
      <AttributionControl position="topright" prefix={false} />
      <Basemap />
      <MapController focus={focus} fit={fit} inset={inset} />

      {places.map((p) => {
        const cat = catById(p.category);
        const key = `place:${p.id}`;
        return (
          <Marker
            key={p.id}
            position={ll(p)}
            icon={pinIcon(cat.color, cat.emoji, { selected: selectedKey === key })}
            zIndexOffset={selectedKey === key ? 1000 : 0}
            eventHandlers={{ click: () => onSelect('place', p.id) }}
          >
            <Tooltip direction="top" offset={[0, -42]}>{p.name}</Tooltip>
          </Marker>
        );
      })}

      {events.map(({ ev, occ }) => {
        const cat = catById('evento');
        const key = `event:${ev.id}`;
        return (
          <Marker
            key={ev.id}
            position={ll(ev)}
            icon={pinIcon(cat.color, cat.emoji, { selected: selectedKey === key, live: occ.live })}
            zIndexOffset={selectedKey === key ? 1000 : 200}
            eventHandlers={{ click: () => onSelect('event', ev.id) }}
          >
            <Tooltip direction="top" offset={[0, -42]}>{ev.title}</Tooltip>
          </Marker>
        );
      })}

      {(plan || preview) && <RouteLayer plan={plan ?? preview} info={plan ? info : null} simMode={simMode} />}

      {user && !simMode && <Marker position={ll(user)} icon={meIcon} zIndexOffset={800} interactive={false} />}
    </MapContainer>
  );
}
