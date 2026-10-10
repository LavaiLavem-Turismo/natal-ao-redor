// Eventos exibidos no mapa.
// `sample: true` mostra o selo "Exemplo" — são eventos de demonstração.
// Troque pelos reais e remova `sample` para o selo sumir.
//
// Formatos:
//   recorrente: { days: [0..6] (0 = domingo), start: 'HH:mm', durationMin }
//   data única: { date: 'AAAA-MM-DD', start: 'HH:mm', durationMin }

export const EVENTS = [
  {
    id: 'por-do-sol-ponta-negra',
    title: 'Pôr do sol em Ponta Negra',
    lat: -5.8795,
    lng: -35.1757,
    place: 'Orla de Ponta Negra',
    days: [0, 1, 2, 3, 4, 5, 6],
    start: '17:00',
    durationMin: 90,
    description: 'Fim de tarde no calçadão, com o Morro do Careca ao fundo.',
    sample: true,
  },
  {
    id: 'musica-ao-vivo-orla',
    title: 'Música ao vivo na orla',
    lat: -5.8782,
    lng: -35.1752,
    place: 'Orla de Ponta Negra',
    days: [5, 6],
    start: '19:30',
    durationMin: 180,
    description: 'Apresentações de artistas locais nos quiosques da orla.',
    sample: true,
  },
  {
    id: 'feira-artesanato-centro-turismo',
    title: 'Feira de artesanato',
    lat: -5.7893,
    lng: -35.2018,
    place: 'Centro de Turismo',
    days: [1, 2, 3, 4, 5, 6],
    start: '09:00',
    durationMin: 540,
    description: 'Artesanato potiguar e produtos regionais.',
    sample: true,
  },
  {
    id: 'visita-forte',
    title: 'Visita ao Forte dos Reis Magos',
    lat: -5.7554,
    lng: -35.1962,
    place: 'Praia do Forte',
    days: [0, 2, 3, 4, 5, 6],
    start: '08:00',
    durationMin: 480,
    description: 'Visitação com vista da foz do Rio Potengi.',
    sample: true,
  },
];
