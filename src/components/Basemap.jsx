import { useEffect } from 'react';
import { TileLayer, useMap } from 'react-leaflet';
import { maplibreGL } from '@maplibre/maplibre-gl-leaflet';
import { setWorkerUrl } from 'maplibre-gl';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import 'maplibre-gl/dist/maplibre-gl.css';

setWorkerUrl(workerUrl);

// Mapa base. Por padrão usa o OpenFreeMap (gratuito, sem chave, uso comercial permitido).
// Se VITE_CARTO_KEY estiver definida, usa o estilo Voyager da CARTO.
const CARTO_KEY = import.meta.env.VITE_CARTO_KEY;
const STYLE = 'https://tiles.openfreemap.org/styles/liberty'; // outras: bright, positron

const OFM_ATTRIBUTION =
  '<a href="https://openfreemap.org" target="_blank" rel="noreferrer">OpenFreeMap</a> ' +
  '&copy; <a href="https://www.openmaptiles.org/" target="_blank" rel="noreferrer">OpenMapTiles</a> ' +
  'Data from <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>';

function VectorLayer() {
  const map = useMap();
  useEffect(() => {
    const layer = maplibreGL({ style: STYLE, attributionControl: { customAttribution: OFM_ATTRIBUTION } });
    layer.addTo(map);
    return () => {
      map.removeLayer(layer);
    };
  }, [map]);
  return null;
}

export default function Basemap() {
  if (CARTO_KEY) {
    return (
      <TileLayer
        url={`https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png?key=${CARTO_KEY}`}
        subdomains="abcd"
        maxZoom={19}
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/attributions">CARTO</a>'
      />
    );
  }
  return <VectorLayer />;
}
