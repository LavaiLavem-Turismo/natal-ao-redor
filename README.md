# Natal ao redor · LavaiLavem Turismo

Mapa interativo para turistas em Natal/RN, em React (Vite + Leaflet), pronto para a Vercel.

- **Perto de você:** pega a localização do turista e lista/mostra no mapa os lugares por distância, com filtro por tipo e botão "Como chegar" (abre o Google Maps).
- **Eventos:** o que está acontecendo agora e os próximos dias, com selo "Acontecendo agora".
- **Passeios (estilo Uber):** o turista escolhe o passeio e toca em **Estou neste passeio**. O painel mostra quanto falta para terminar, a hora prevista de chegada, em qual parada ele está, a próxima parada e a distância. O tempo é recalculado pela localização dele. Sem localização, usa o horário planejado do passeio.
- **Ver demonstração:** simula um passeio acelerado (30x, 60x, 180x), bom para mostrar a funcionalidade sem sair de casa.

## Rodar e publicar

```bash
npm install
npm run dev          # desenvolvimento
npm run build        # gera /dist
npm run test:engine  # testa o cálculo de tempo dos 10 passeios
```

**Vercel:** suba a pasta para um repositório no GitHub, importe na Vercel e confirme. Ela detecta o Vite sozinha (Build: `npm run build`, Output: `dist`). A Vercel serve em HTTPS, requisito para o navegador liberar a localização.

## Mapa

Por padrão o app usa o **OpenFreeMap**: gratuito, sem chave e sem cadastro, com uso comercial permitido (estilo "Liberty"; dá para trocar por `bright` ou `positron` em `src/components/Basemap.jsx`). O crédito obrigatório aparece no canto do mapa.

Opcional: se você tiver uma chave gratuita da CARTO (<https://www.carto.com/basemaps/apikey/>), defina `VITE_CARTO_KEY` (em `.env.local` ou na Vercel, em Settings > Environment Variables) e o app passa a usar o estilo Voyager da CARTO.

Não use o servidor público do OpenStreetMap (`tile.openstreetmap.org`) em produção: ele bloqueia apps que não seguem a política de uso de tiles (erro 403 "Access blocked").

## O que você precisa revisar antes de publicar

Os dados abaixo são **estimativas iniciais**; o tempo restante é tão bom quanto eles.

| Arquivo | O que ajustar |
| --- | --- |
| `src/data/tours.js` | Para cada passeio: paradas, coordenadas, `dwell` (minutos parado), `kmh` (velocidade média do trecho) e `BASE` (ponto de embarque). |
| `src/data/places.js` | Lugares do mapa. Confira as coordenadas no Google Maps. |
| `src/data/events.js` | Eventos de exemplo (selo "Exemplo"). Troque pelos reais; aceita eventos recorrentes (`days`) ou de data única (`date`). |

Como o tempo é calculado: distância em linha reta até a próxima parada × fator de curvas (1,3 por padrão) ÷ velocidade do trecho, mais o tempo de cada parada que ainda falta, mais a volta. Em passeios de barco (Maracajaú, Rio do Fogo) o fator é 1 e o raio de chegada é maior, porque os parrachos ficam mar adentro.

## Limitações conhecidas

- A linha do roteiro no mapa liga as paradas em linha reta (não segue as estradas). Dá para trocar por rotas reais com um serviço de roteamento (OSRM, Mapbox, Google Directions).
- O OpenFreeMap vive de doações e não tem garantia de disponibilidade. Se o site crescer, considere um provedor pago (MapTiler, Stadia, Mapbox) trocando o estilo em `src/components/Basemap.jsx`.
- O passeio ativo fica salvo no navegador do turista (localStorage). Não há backend, então a equipe da LavaiLavem não vê onde cada turista está. Se quiserem isso, o próximo passo é um backend (por exemplo Supabase) recebendo a posição.
- Navegadores pausam a localização quando a tela bloqueia ou o app vai para segundo plano; ao voltar, o tempo se recalcula.
