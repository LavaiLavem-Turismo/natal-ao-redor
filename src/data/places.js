// Lugares exibidos no mapa.
// ATENÇÃO: as coordenadas são aproximadas — confira cada uma no Google Maps
// (botão direito no ponto → copiar latitude/longitude) antes de publicar.

export const CATEGORIES = [
  { id: 'praia', label: 'Praias', color: '#0E8FA6', emoji: '🏖️' },
  { id: 'natureza', label: 'Natureza', color: '#2E8B57', emoji: '🌿' },
  { id: 'cultura', label: 'Cultura', color: '#6B4FC8', emoji: '🏛️' },
  { id: 'compras', label: 'Compras', color: '#D9731F', emoji: '🛍️' },
];

export const EVENT_CATEGORY = { id: 'evento', label: 'Eventos', color: '#F2552C', emoji: '🎶' };

export const catById = (id) =>
  id === 'evento' ? EVENT_CATEGORY : CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[0];

export const PLACES = [
  {
    id: 'ponta-negra',
    name: 'Praia de Ponta Negra',
    category: 'praia',
    lat: -5.88,
    lng: -35.1755,
    area: 'Ponta Negra',
    description:
      'A praia urbana mais movimentada de Natal, com calçadão, quiosques e vista para o Morro do Careca.',
  },
  {
    id: 'morro-do-careca',
    name: 'Morro do Careca',
    category: 'natureza',
    lat: -5.8725,
    lng: -35.1745,
    area: 'Ponta Negra',
    description:
      'Duna de cerca de 100 m que virou cartão-postal da cidade. Subir na duna é proibido, mas a vista da praia é livre.',
  },
  {
    id: 'feirinha-ponta-negra',
    name: 'Feirinha de Ponta Negra',
    category: 'compras',
    lat: -5.8775,
    lng: -35.1748,
    area: 'Ponta Negra',
    description: 'Artesanato, redes, lembrancinhas e roupas de praia a poucos passos da orla.',
  },
  {
    id: 'parque-das-dunas',
    name: 'Parque das Dunas',
    category: 'natureza',
    lat: -5.813,
    lng: -35.195,
    area: 'Via Costeira',
    description:
      'Reserva de Mata Atlântica e dunas dentro da cidade, com trilhas guiadas. Verifique horários e agendamento antes de ir.',
  },
  {
    id: 'arena-das-dunas',
    name: 'Arena das Dunas',
    category: 'cultura',
    lat: -5.8273,
    lng: -35.2128,
    area: 'Lagoa Nova',
    description: 'Estádio construído para a Copa do Mundo de 2014, sede de jogos e shows na cidade.',
  },
  {
    id: 'museu-camara-cascudo',
    name: 'Museu Câmara Cascudo',
    category: 'cultura',
    lat: -5.8,
    lng: -35.208,
    area: 'Tirol',
    description:
      'Museu de história natural, arqueologia e cultura popular, em homenagem ao folclorista potiguar Luís da Câmara Cascudo.',
  },
  {
    id: 'centro-de-turismo',
    name: 'Centro de Turismo',
    category: 'compras',
    lat: -5.7893,
    lng: -35.2018,
    area: 'Petrópolis',
    description:
      'Antiga casa de detenção transformada em centro de artesanato, com lojas e gastronomia regional.',
  },
  {
    id: 'praia-do-meio',
    name: 'Praia do Meio',
    category: 'praia',
    lat: -5.7745,
    lng: -35.1925,
    area: 'Praia do Meio',
    description: 'Praia da orla central, boa para caminhar no fim da tarde e ver a cidade de frente para o mar.',
  },
  {
    id: 'forte-dos-reis-magos',
    name: 'Forte dos Reis Magos',
    category: 'cultura',
    lat: -5.7554,
    lng: -35.1962,
    area: 'Praia do Forte',
    description:
      'Fortaleza em formato de estrela, cuja construção começou em 1598 e deu origem à cidade de Natal.',
  },
  {
    id: 'ponte-newton-navarro',
    name: 'Ponte Newton Navarro',
    category: 'cultura',
    lat: -5.764,
    lng: -35.2125,
    area: 'Redinha',
    description: 'Ponte estaiada sobre o Rio Potengi, ponto de passagem para o litoral norte e ótimo lugar para fotos.',
  },
  {
    id: 'cajueiro-de-pirangi',
    name: 'Cajueiro de Pirangi',
    category: 'natureza',
    lat: -5.97,
    lng: -35.113,
    area: 'Pirangi do Norte',
    description: 'Um dos maiores cajueiros do mundo, com copa que cobre uma área do tamanho de um quarteirão.',
  },
  {
    id: 'dunas-de-genipabu',
    name: 'Dunas de Genipabu',
    category: 'natureza',
    lat: -5.7,
    lng: -35.209,
    area: 'Litoral Norte',
    description: 'Dunas móveis e lagoa, famosas pelos passeios de buggy e pelo esquibunda.',
  },
];
