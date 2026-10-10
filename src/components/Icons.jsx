const base = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
};

export const LocateIcon = (p) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="3.2" />
    <path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3" />
    <circle cx="12" cy="12" r="7.5" />
  </svg>
);

export const RouteIcon = (p) => (
  <svg {...base} {...p}>
    <circle cx="6" cy="18" r="2.2" />
    <circle cx="18" cy="6" r="2.2" />
    <path d="M8 18h6.5a3.5 3.5 0 0 0 0-7h-5a3.5 3.5 0 0 1 0-7H16" />
  </svg>
);

export const DirectionsIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M4 12 20 4l-4 16-4-7z" />
  </svg>
);

export const Logo = ({ size = 34 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
    <circle cx="32" cy="32" r="32" fill="#0A2533" />
    <path d="M14 36c6-14 22-18 36-8-8 0-12 3-14 8 4 0 8 2 10 6-10-4-20-4-32-6z" fill="#FFB000" />
  </svg>
);
