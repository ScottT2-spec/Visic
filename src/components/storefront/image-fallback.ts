/**
 * Shared image fallback for template blocks.
 * Generates a gradient placeholder SVG when product/blog images are missing or broken.
 */

const GRADIENTS = [
  ["#6366f1", "#8b5cf6"], // indigo → violet
  ["#ec4899", "#f43f5e"], // pink → rose
  ["#f59e0b", "#ef4444"], // amber → red
  ["#10b981", "#06b6d4"], // emerald → cyan
  ["#3b82f6", "#6366f1"], // blue → indigo
  ["#8b5cf6", "#ec4899"], // violet → pink
  ["#14b8a6", "#22c55e"], // teal → green
  ["#f97316", "#eab308"], // orange → yellow
];

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = s.charCodeAt(i) + ((h << 5) - h);
  return Math.abs(h);
}

/** Generate a gradient placeholder SVG data URI */
export function placeholderImage(seed?: string, width = 600, height = 700): string {
  const idx = seed ? hashStr(seed) % GRADIENTS.length : 0;
  const [c1, c2] = GRADIENTS[idx];
  // Shopping bag icon path (simplified)
  const icon = `<g transform="translate(${width/2 - 20},${height/2 - 24})" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></g>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${c1}"/><stop offset="100%" stop-color="${c2}"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#g)"/>${icon}</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/** Get a safe image src — returns the url if truthy, or a placeholder */
export function safeSrc(url: string | undefined | null, seed?: string): string {
  return url || placeholderImage(seed || "default");
}

/** onError handler for <img> tags — swaps to placeholder on load failure */
export function onImgError(e: React.SyntheticEvent<HTMLImageElement>, seed?: string) {
  const img = e.currentTarget;
  const fallback = placeholderImage(seed || img.alt || "fallback");
  if (img.src !== fallback) {
    img.src = fallback;
  }
}
