import { useCallback, useEffect, useMemo, useState } from 'react';
import MapView from './components/MapView';
import Sheet from './components/Sheet';
import TourPanel from './components/TourPanel';
import TourPicker from './components/TourPicker';
import { EventCard, PlaceCard } from './components/Cards';
import { LocateIcon, Logo, RouteIcon } from './components/Icons';
import { CATEGORIES, PLACES } from './data/places';
import { EVENTS } from './data/events';
import { tourById } from './data/tours';
import { nextOccurrence } from './lib/events';
import { haversineKm } from './lib/geo';
import { buildPlan } from './lib/tourEngine';
import { DESKTOP_PANEL_WIDTH, DESKTOP_QUERY, sheetMetrics } from './lib/sheet';
import { useGeolocation } from './hooks/useGeolocation';
import { useTour } from './hooks/useTour';

function useMediaQuery(query) {
  const [match, setMatch] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setMatch(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, [query]);
  return match;
}

function useNow(ms) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(id);
  }, [ms]);
  return now;
}

function LocationBanner({ status, onRequest }) {
  if (status === 'granted') return null;
  const copy = {
    idle: ['Veja o que está perto de você', 'Ative a localização para ordenar os lugares por distância.', 'Usar minha localização'],
    asking: ['Aguardando permissão', 'Confirme o acesso à localização no aviso do navegador.', null],
    denied: [
      'Localização bloqueada',
      'Libere o acesso à localização nas configurações do navegador para ver distâncias e acompanhar o passeio.',
      null,
    ],
    unavailable: ['Localização indisponível', 'Este aparelho ou navegador não oferece localização.', null],
    error: ['Sem sinal de localização', 'Tente novamente em um lugar aberto.', 'Tentar de novo'],
  }[status] ?? [];
  const [title, text, action] = copy;
  return (
    <div className="banner">
      <strong>{title}</strong>
      <p>{text}</p>
      {action && (
        <button className="btn btn--primary" onClick={onRequest}>
          <LocateIcon /> {action}
        </button>
      )}
    </div>
  );
}

export default function App() {
  const geo = useGeolocation();
  const tour = useTour(geo.pos);
  const now = useNow(30000);
  const isDesktop = useMediaQuery(DESKTOP_QUERY);

  const [tab, setTab] = useState('perto');
  const [cat, setCat] = useState('todos');
  const [selected, setSelected] = useState(null); // { kind, id }
  const [snap, setSnap] = useState('half');
  const [previewId, setPreviewId] = useState(null);
  const [focus, setFocus] = useState(null);
  const [fit, setFit] = useState(null);

  const hasTour = Boolean(tour.session && tour.plan);
  const userPos = tour.session?.sim ? null : geo.pos;

  const places = useMemo(
    () =>
      PLACES.filter((p) => cat === 'todos' || p.category === cat)
        .map((p) => ({ ...p, km: userPos ? haversineKm(userPos, p) : null }))
        .sort((a, b) => (a.km != null && b.km != null ? a.km - b.km : a.name.localeCompare(b.name))),
    [cat, userPos]
  );

  const events = useMemo(
    () =>
      EVENTS.map((ev) => ({ ev, occ: nextOccurrence(ev, now), km: userPos ? haversineKm(userPos, ev) : null }))
        .filter((e) => e.occ)
        .sort((a, b) => Number(b.occ.live) - Number(a.occ.live) || a.occ.startMs - b.occ.startMs),
    [now, userPos]
  );

  const previewPlan = useMemo(
    () => (previewId && !hasTour && tourById(previewId) ? buildPlan(tourById(previewId)) : null),
    [previewId, hasTour]
  );

  const inset = useMemo(() => {
    if (isDesktop) return { left: DESKTOP_PANEL_WIDTH, bottom: 0 };
    const { visible } = sheetMetrics(window.innerHeight, hasTour);
    return { left: 0, bottom: visible[snap] };
  }, [isDesktop, snap, hasTour]);

  const focusOn = useCallback((p, zoom = 15) => setFocus({ lat: p.lat, lng: p.lng, zoom, nonce: Date.now() }), []);

  const select = useCallback(
    (kind, id, fromMap = false) => {
      const item = kind === 'event' ? EVENTS.find((e) => e.id === id) : PLACES.find((p) => p.id === id);
      if (!item) return;
      setSelected({ kind, id });
      if (fromMap) setTab(kind === 'event' ? 'eventos' : 'perto');
      if (!isDesktop) setSnap('half');
      focusOn(item);
    },
    [focusOn, isDesktop]
  );

  const fitPlan = useCallback((plan) => {
    setFit({ points: [plan.base, ...plan.points], nonce: Date.now() });
  }, []);

  const startTour = useCallback(
    (id, opts) => {
      tour.start(id, opts);
      setPreviewId(null);
      setSelected(null);
      setTab('perto');
      if (!isDesktop) setSnap('half');
      fitPlan(buildPlan(tourById(id)));
    },
    [tour, isDesktop, fitPlan]
  );

  const previewTour = useCallback(
    (id) => {
      setPreviewId(id);
      if (id) {
        fitPlan(buildPlan(tourById(id)));
        if (!isDesktop) setSnap('half');
      }
    },
    [fitPlan, isDesktop]
  );

  const locateMe = useCallback(() => {
    geo.request();
    if (geo.pos) focusOn(geo.pos, 15);
  }, [geo, focusOn]);

  // Centraliza assim que a primeira localização chega.
  const [centered, setCentered] = useState(false);
  useEffect(() => {
    if (geo.pos && !centered && !hasTour) {
      setCentered(true);
      focusOn(geo.pos, 14);
    }
  }, [geo.pos, centered, hasTour, focusOn]);

  const selectedKey = selected ? `${selected.kind}:${selected.id}` : null;
  const tabs = hasTour
    ? [['perto', 'Perto de você'], ['eventos', 'Eventos']]
    : [['perto', 'Perto de você'], ['eventos', 'Eventos'], ['passeios', 'Passeios']];

  return (
    <div className="app">
      <MapView
        places={places}
        events={events}
        selectedKey={selectedKey}
        onSelect={(kind, id) => select(kind, id, true)}
        user={userPos}
        plan={hasTour ? tour.plan : null}
        info={hasTour ? tour.info : null}
        simMode={Boolean(tour.session?.sim)}
        preview={previewPlan}
        focus={focus}
        fit={fit}
        inset={inset}
      />

      <div className="chip-brand">
        <Logo size={24} /> <span>Natal ao redor</span>
      </div>

      <div className="fabs">
        <button className="fab" onClick={locateMe} aria-label="Ir para minha localização">
          <LocateIcon />
        </button>
        {(hasTour || previewPlan) && (
          <button
            className="fab"
            onClick={() => fitPlan(hasTour ? tour.plan : previewPlan)}
            aria-label="Ver o roteiro inteiro"
          >
            <RouteIcon />
          </button>
        )}
      </div>

      <Sheet snap={snap} onSnap={setSnap} hasTour={hasTour} scrollKey={tab}>
        <header className="brand">
          <Logo />
          <div>
            <strong>Natal ao redor</strong>
            <small>por LavaiLavem Turismo</small>
          </div>
        </header>

        {hasTour && tour.info && (
          <TourPanel
            plan={tour.plan}
            info={tour.info}
            session={tour.session}
            onStop={tour.stop}
            onSpeed={tour.setSpeed}
            onAskLocation={geo.request}
            locationStatus={geo.status}
          />
        )}

        <nav className="tabs" role="tablist" aria-label="Seções">
          {tabs.map(([id, label]) => (
            <button
              key={id}
              role="tab"
              aria-selected={tab === id}
              className={tab === id ? 'is-on' : ''}
              onClick={() => {
                setTab(id);
                if (id !== 'passeios') setPreviewId(null);
              }}
            >
              {label}
            </button>
          ))}
        </nav>

        {tab === 'perto' && (
          <>
            {!userPos && !tour.session?.sim && <LocationBanner status={geo.status} onRequest={geo.request} />}
            <div className="chips" role="group" aria-label="Filtrar por tipo">
              {[{ id: 'todos', label: 'Todos' }, ...CATEGORIES].map((c) => (
                <button key={c.id} className={cat === c.id ? 'is-on' : ''} onClick={() => setCat(c.id)}>
                  {c.label}
                </button>
              ))}
            </div>
            <div className="list">
              {places.map((p) => (
                <PlaceCard
                  key={p.id}
                  place={p}
                  km={p.km}
                  selected={selectedKey === `place:${p.id}`}
                  onSelect={() => (selectedKey === `place:${p.id}` ? setSelected(null) : select('place', p.id))}
                />
              ))}
            </div>
          </>
        )}

        {tab === 'eventos' && (
          <div className="list">
            {!userPos && !tour.session?.sim && <LocationBanner status={geo.status} onRequest={geo.request} />}
            {events.length === 0 && <p className="empty">Nenhum evento nos próximos dias.</p>}
            {events.map(({ ev, occ, km }) => (
              <EventCard
                key={ev.id}
                ev={ev}
                occ={occ}
                now={now}
                km={km}
                selected={selectedKey === `event:${ev.id}`}
                onSelect={() => (selectedKey === `event:${ev.id}` ? setSelected(null) : select('event', ev.id))}
              />
            ))}
          </div>
        )}

        {tab === 'passeios' && !hasTour && (
          <TourPicker selectedId={previewId} onSelect={previewTour} onStart={startTour} />
        )}
      </Sheet>
    </div>
  );
}
