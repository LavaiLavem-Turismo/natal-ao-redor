import { useEffect, useState } from 'react';
import { fmtClock, fmtDuration, fmtKm } from '../lib/geo';

const SPEEDS = [30, 60, 180];

function Ribbon({ plan, info }) {
  const total = plan.totalMin;
  const nodes = plan.timeline
    .filter((s) => s.type === 'drive')
    .map((s) => ({ name: s.to.name, at: s.endMin / total, idx: s.idx, isReturn: s.to.isReturn }));
  const pct = (info.progress * 100).toFixed(2);

  return (
    <div className="ribbon" role="img" aria-label={`Progresso do passeio: ${Math.round(info.progress * 100)}%`}>
      <div className="ribbon__track">
        <div className="ribbon__fill" style={{ width: `${pct}%` }} />
        {nodes.map((n) => (
          <span
            key={n.idx}
            className={`ribbon__node${info.targetIndex > n.idx || info.status === 'done' ? ' is-done' : ''}${
              info.targetIndex === n.idx && info.status !== 'done' ? ' is-current' : ''
            }`}
            style={{ left: `${n.at * 100}%` }}
          />
        ))}
        <span className="ribbon__vehicle" style={{ left: `${pct}%` }}>
          {plan.tour.emoji}
        </span>
      </div>
      <div className="ribbon__ends">
        <span>Embarque</span>
        <span>Volta</span>
      </div>
    </div>
  );
}

export default function TourPanel({ plan, info, session, onStop, onSpeed, onAskLocation, locationStatus }) {
  const [confirming, setConfirming] = useState(false);
  useEffect(() => {
    if (!confirming) return undefined;
    const t = setTimeout(() => setConfirming(false), 4000);
    return () => clearTimeout(t);
  }, [confirming]);

  const { status, target } = info;
  const done = status === 'done';

  let kicker;
  let title;
  let detail;
  if (done) {
    kicker = 'Passeio concluído';
    title = 'Obrigado por viajar com a LavaiLavem';
    detail = null;
  } else if (status === 'stop') {
    kicker = 'Você está em';
    title = target.name;
    detail =
      info.dwellLeftMin > 0.5
        ? `Tempo livre: mais ${fmtDuration(info.dwellLeftMin)}`
        : 'Hora de seguir viagem';
  } else {
    const etaNext = ((info.distanceKm * target.factor) / target.kmh) * 60;
    kicker = target.isReturn ? 'Voltando para' : 'A caminho de';
    title = target.isReturn ? 'o ponto de embarque' : target.name;
    detail = `Faltam ${fmtKm(info.distanceKm)}, cerca de ${fmtDuration(etaNext)}`;
  }

  return (
    <section className="tour" aria-live="polite">
      <header className="tour__head">
        <span className="tour__name">
          {plan.tour.emoji} {plan.tour.name}
        </span>
        {session.sim && <span className="tag">Demonstração</span>}
      </header>

      <div className="tour__eta">
        {done ? (
          <strong className="tour__big">Concluído</strong>
        ) : (
          <>
            <span className="tour__label">Faltam para o fim do passeio</span>
            <strong className="tour__big">{fmtDuration(info.remainingMin)}</strong>
            <span className="tour__sub">Chegada prevista às {fmtClock(info.etaMs)}</span>
          </>
        )}
      </div>

      <Ribbon plan={plan} info={info} />

      <div className="tour__now">
        <small>{kicker}</small>
        <strong>{title}</strong>
        {detail && <span>{detail}</span>}
        {!done && !target.isReturn && info.next && status === 'stop' && (
          <span className="tour__then">Depois: {info.next.isReturn ? 'volta ao embarque' : info.next.name}</span>
        )}
      </div>

      {info.source === 'schedule' && !session.sim && (
        <p className="tour__note">
          {locationStatus === 'denied'
            ? 'Localização bloqueada: usando o horário planejado do passeio.'
            : 'Sem sinal de localização: usando o horário planejado do passeio.'}
          {locationStatus !== 'denied' && (
            <>
              {' '}
              <button className="link" onClick={onAskLocation}>
                Ativar localização
              </button>
            </>
          )}
        </p>
      )}

      {session.sim && (
        <div className="tour__sim">
          <span>Velocidade da demonstração</span>
          <div className="seg">
            {SPEEDS.map((s) => (
              <button key={s} className={session.speed === s ? 'is-on' : ''} onClick={() => onSpeed(s)}>
                {s}x
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        className={`btn btn--end${confirming ? ' is-confirm' : ''}`}
        onClick={() => (confirming || done ? onStop() : setConfirming(true))}
      >
        {done ? 'Fechar' : confirming ? 'Toque de novo para encerrar' : 'Encerrar passeio'}
      </button>
    </section>
  );
}
