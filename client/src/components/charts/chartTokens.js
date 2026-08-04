// Dark-mode-only chart tokens for this app (no light theme exists here).
// Categorical order/hexes and the sequential hue are the dataviz skill's
// validated dark-mode defaults (references/palette.md) -- not the UI's
// `luma-*` accent tokens, which are a narrow warm-gold ramp unsuited to
// multi-series categorical charts (fails the palette validator's lightness
// band + chroma floor checks).
export const CATEGORICAL = [
  '#3987e5', // blue
  '#d95926', // orange
  '#199e70', // aqua
  '#c98500', // yellow
  '#d55181', // magenta
  '#008300', // green
  '#9085e9', // violet
  '#e66767', // red
];

export const SEQUENTIAL = '#3987e5'; // single hue, blue-400 step
export const SEQUENTIAL_SOFT = 'rgba(57, 135, 229, 0.18)'; // area fill

export const SURFACE = '#131517';
export const GRID = 'rgba(255,255,255,0.06)';
export const TEXT_MUTED = '#8a8f98';
export const TEXT_PRIMARY = '#ffffff';
