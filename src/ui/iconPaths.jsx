// The drawings behind <Icon>: 24 by 24, drawn in strokes unless marked filled.
export const PATHS = {
  back: <path d="M19 12H5M11 6l-6 6 6 6" />,
  close: <path d="M7.5 7.5l9 9M16.5 7.5l-9 9" />,
  check: <path d="M5.5 12.5l4.2 4.2L18.5 8" />,
  trash: <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />,
  pencil: (
    <>
      <path d="M4 20h4L19 9l-4-4L4 16v4Z" />
      <path d="M13.5 6.5l4 4" />
    </>
  ),
  eraser: (
    <>
      <path d="M8 20h12M5.5 15.5l9-9a2 2 0 0 1 2.8 0l1.2 1.2a2 2 0 0 1 0 2.8L12 17l-3 3H7l-1.5-1.5a2 2 0 0 1 0-3Z" />
      <path d="M9.5 11.5l4 4" />
    </>
  ),
  eye: (
    <>
      <path d="M2.8 12s3.4-6 9.2-6 9.2 6 9.2 6-3.4 6-9.2 6-9.2-6-9.2-6z" />
      <circle cx="12" cy="12" r="2.6" />
    </>
  ),
  warn: (
    <>
      <path d="M12 3.5 22 20.5H2Z" />
      <path d="M12 10v4.5M12 17.2v.3" />
    </>
  ),
  help: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.6 9.6a2.5 2.5 0 1 1 3.6 2.2c-.8.4-1.2 1-1.2 1.9M12 16.9v.2" />
    </>
  ),
  prev: <path d="M14.5 6.5 9 12l5.5 5.5" />,
  undo: <path d="M8.5 13.5 4.5 9.5l4-4M4.5 9.5h9.250a5 5 0 0 1 0 10H9" />,
  up: <path d="M6.5 14.5 12 9l5.5 5.5" />,
  down: <path d="M6.5 9.5 12 15l5.5-5.5" />,
  first: <path d="M17 6.5 11.5 12l5.5 5.5M7.5 6.5v11" />,
  last: <path d="M7 6.5 12.5 12 7 17.5M16.5 6.5v11" />,
  chevron: <path d="M7 10l5 5 5-5" />,
  gear: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </>
  ),
  sound: (
    <>
      <path d="M4.5 9.5h3l4-3.5v12l-4-3.5h-3z" />
      <path d="M15 9.2a4 4 0 0 1 0 5.6M17.6 6.8a7.5 7.5 0 0 1 0 10.4" />
    </>
  ),
  mute: (
    <>
      <path d="M4.5 9.5h3l4-3.5v12l-4-3.5h-3z" />
      <path d="M15.5 9.5l5 5M20.5 9.5l-5 5" />
    </>
  ),
  moon: <path d="M19.5 14.2A7.5 7.5 0 0 1 9.8 4.5a7.5 7.5 0 1 0 9.7 9.7Z" />,
  sun: (
    <>
      <circle cx="12" cy="12" r="3.6" />
      <path d="M12 3.5v2M12 18.5v2M3.5 12h2M18.5 12h2M6 6l1.4 1.4M16.6 16.6 18 18M6 18l1.4-1.4M16.6 7.4 18 6" />
    </>
  ),
  shrink: <path d="M9 4.5V9H4.5M15 4.5V9h4.5M9 19.5V15H4.5M15 19.5V15h4.5" />,
  expand: <path d="M4.5 9V4.5H9M19.5 9V4.5H15M4.5 15v4.5H9M19.5 15v4.5H15" />,
  next: <path d="M9.5 6.5 15 12l-5.5 5.5" />,
  // Nothing here / take away: a square drawn in dashes
  empty: <rect x="5.5" y="5.5" width="13" height="13" rx="2" strokeDasharray="3 2.6" />,
  // Filled shapes
  globe: <path d="M12 3.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17ZM3.5 12h17M12 3.5c-2.6 2.4-3.9 5.200-3.9 8.500s1.300 6.100 3.900 8.500c2.600-2.400 3.900-5.200 3.900-8.500S14.600 5.900 12 3.500Z" />,
  menu: <path d="M4.5 7h15M4.5 12h15M4.5 17h15" />,
  more: (
    <g fill="currentColor" stroke="none">
      <circle cx="6" cy="12" r="1.6" />
      <circle cx="12" cy="12" r="1.6" />
      <circle cx="18" cy="12" r="1.6" />
    </g>
  ),
  copy: <path d="M9 9h10v10H9zM5 15V5h10" />,
  download: <path d="M12 4.5v10M7.5 10.5 12 15l4.5-4.5M5 19h14" />,
  link: <path d="M10.5 13.5a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M13.5 10.5a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />,
  robot: (
    <>
      <rect x="5" y="8.5" width="14" height="10" rx="2.5" />
      <path d="M12 8.5V5.5M9.5 12.5v1.6M14.5 12.5v1.6M2.8 12.5v2.5M21.2 12.5v2.5" />
      <circle cx="12" cy="4.4" r="1.1" />
    </>
  ),
  play: <path d="M8.5 5.5v13l10-6.5z" fill="currentColor" stroke="none" />,
  pause: <path d="M8 5.5h2.5v13H8zM13.5 5.5H16v13h-2.5z" fill="currentColor" stroke="none" />,
  stop: <rect x="7" y="7" width="10" height="10" rx="1.5" fill="currentColor" stroke="none" />,
};
export const ICON_NAMES = Object.keys(PATHS);
