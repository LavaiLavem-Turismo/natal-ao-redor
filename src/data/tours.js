// Passeios da LavaiLavem Turismo e suas paradas.
//
// Cada parada: { name, lat, lng, dwell (min parado), kmh (velocidade média do trecho
// ATÉ essa parada), factor (curvas da estrada: distância real ≈ reta × factor),
// radius (km para considerar "cheguei") }.
//
// ATENÇÃO: coordenadas, tempos de parada e velocidades são ESTIMATIVAS iniciais.
// Ajuste com os dados reais de cada roteiro — o ETA do passeio depende deles.

export const BASE = { name: 'Embarque', lat: -5.8795, lng: -35.1785 };

const PONTE = { name: 'Ponte Newton Navarro', lat: -5.764, lng: -35.2125, dwell: 10, kmh: 45 };

const NORTE_BUGGY = [
  PONTE,
  { name: 'Lagoa de Genipabu', lat: -5.709, lng: -35.204, dwell: 45, kmh: 45 },
  { name: 'Dunas de Genipabu', lat: -5.7, lng: -35.209, dwell: 90, kmh: 25 },
];

const NORTE_VAN = [
  { ...PONTE, kmh: 50 },
  { name: 'Mirante das Dunas de Genipabu', lat: -5.7, lng: -35.209, dwell: 120, kmh: 50 },
];

const SUL = [
  { name: 'Cajueiro de Pirangi', lat: -5.97, lng: -35.113, dwell: 20, kmh: 50 },
  { name: 'Praia de Tabatinga', lat: -6.039, lng: -35.078, dwell: 45, kmh: 45 },
  { name: 'Praia de Búzios', lat: -6.087, lng: -35.059, dwell: 90, kmh: 30 },
];

const PIPA = [
  { name: 'Cajueiro de Pirangi', lat: -5.97, lng: -35.113, dwell: 15, kmh: 50 },
  { name: 'Chapadão de Pipa', lat: -6.239, lng: -35.049, dwell: 30, kmh: 55 },
  { name: 'Praia do Amor', lat: -6.2395, lng: -35.0405, dwell: 60, kmh: 25 },
  { name: 'Baía dos Golfinhos', lat: -6.249, lng: -35.0355, dwell: 60, kmh: 25 },
];

const MARACAJAU = [
  { name: 'Maracajaú (marina)', lat: -5.3885, lng: -35.267, dwell: 30, kmh: 60 },
  { name: 'Parrachos de Maracajaú', lat: -5.393, lng: -35.2, dwell: 150, kmh: 22, factor: 1, radius: 1.8 },
  { name: 'Volta à marina', lat: -5.3885, lng: -35.267, dwell: 15, kmh: 22, factor: 1 },
];

const RIO_DO_FOGO = [
  { name: 'Rio do Fogo', lat: -5.2715, lng: -35.381, dwell: 30, kmh: 60 },
  { name: 'Parrachos de Rio do Fogo', lat: -5.266, lng: -35.345, dwell: 150, kmh: 22, factor: 1, radius: 1.8 },
  { name: 'Volta a Rio do Fogo', lat: -5.2715, lng: -35.381, dwell: 15, kmh: 22, factor: 1 },
];

export const TOURS = [
  { id: 'rota-do-sol', emoji: '🌴', name: 'Passeio 4x4 Rota do Sol – Litoral Sul', tag: '4x4', area: 'Litoral Sul', stops: SUL, returnKmh: 55 },
  { id: 'litoral-norte-van', emoji: '🚐', name: 'Litoral Norte – Van', tag: 'Van', area: 'Litoral Norte', stops: NORTE_VAN, returnKmh: 50 },
  { id: 'litoral-norte-genipabu', emoji: '✨', name: 'Litoral Norte – Genipabu', tag: 'Buggy', area: 'Litoral Norte', stops: NORTE_BUGGY, returnKmh: 45 },
  { id: 'buggy-litoral-norte', emoji: '🚙', name: 'Buggy Litoral Norte', tag: 'Buggy', area: 'Litoral Norte', stops: NORTE_BUGGY, returnKmh: 45 },
  { id: 'maracajau', emoji: '🚤', name: 'Maracajaú', tag: 'Barco', area: 'Litoral Norte', stops: MARACAJAU, returnKmh: 60 },
  { id: 'super-pipa-4x4', emoji: '🛻', name: 'Super Pipa 4x4', tag: '4x4', area: 'Litoral Sul', stops: PIPA, returnKmh: 60 },
  { id: 'buggy-dunas-genipabu', emoji: '🏝️', name: 'Passeio de Buggy nas Dunas de Genipabu', tag: 'Buggy', area: 'Litoral Norte', stops: NORTE_BUGGY, returnKmh: 45 },
  { id: 'litoral-norte-van-sem-buggy', emoji: '⛵', name: 'Litoral Norte (Van sem buggy)', tag: 'Van', area: 'Litoral Norte', stops: NORTE_VAN, returnKmh: 50 },
  { id: 'buggy-litoral-norte-2', emoji: '🐬', name: 'Buggy Litoral Norte (opção 2)', tag: 'Buggy', area: 'Litoral Norte', stops: NORTE_BUGGY, returnKmh: 45 },
  { id: 'parrachos-rio-do-fogo', emoji: '🌊', name: 'Parrachos de Rio do Fogo', tag: 'Barco', area: 'Litoral Norte', stops: RIO_DO_FOGO, returnKmh: 60 },
];

export const tourById = (id) => TOURS.find((t) => t.id === id) ?? null;
