// Medidas do painel deslizante (celular). Em telas largas o painel é fixo na lateral.
export const DESKTOP_QUERY = '(min-width: 900px)';
export const DESKTOP_PANEL_WIDTH = 420; // largura + margem, usado para centralizar o mapa

export function sheetMetrics(vh, hasTour) {
  const sheetH = Math.round(vh * 0.9);
  const visible = {
    peek: hasTour ? 236 : 176,
    half: Math.round(vh * 0.52),
    full: sheetH,
  };
  const offsets = {
    peek: sheetH - visible.peek,
    half: sheetH - visible.half,
    full: 0,
  };
  return { sheetH, visible, offsets };
}
