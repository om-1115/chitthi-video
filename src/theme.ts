// Palette and type from the app's design system: Pico CSS 2 (red theme, light mode),
// see chitthi/web/vendor/pico.red.min.css.
export const light = {
  bg: "#fbfbfc", // --pico-card-sectioning-background-color
  surface: "#ffffff", // --pico-background-color
  ink: "#2d3138", // --pico-h1-color
  dim: "#646b79", // --pico-muted-color
  faint: "#8a91a0",
  line: "#e7eaf0", // --pico-muted-border-color
  wax: "#c52f21", // --pico-primary
  mark: "#fde6bf", // --pico-mark-background-color
  ok: "#1c6954", // --pico-ins-color
};

export type Palette = typeof light;

// Pico's system font stacks.
export const SANS = 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", sans-serif';
export const DEVA = '"Kohinoor Devanagari", "Noto Sans Devanagari", sans-serif';
export const MONO = 'ui-monospace, "SF Mono", Menlo, monospace';

export const FPS = 30;
