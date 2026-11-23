// Shared helpers for the hand-made animated SVGs. Everything is plain SVG + CSS/SMIL, so it animates inside
// GitHub's <img> tags (no scripts, no external fonts).

export const MONO = "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace"
export const SANS = "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif"

export const C = {
  bg0: '#060913',
  bg1: '#0b1020',
  line: '#1e293b',
  text: '#f8fafc',
  dim: '#94a3b8',
  faint: '#64748b',
  violet: '#a78bfa',
  cyan: '#67e8f9',
  pink: '#f472b6',
  green: '#4ade80',
  amber: '#fbbf24',
}

export const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

export const r = (n) => Math.round(n * 1000) / 1000

/** Deterministic random numbers, so every build draws the same stars and waves. */
export function rng(seed) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function svg(w, h, body, title) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(title)}">
<title>${esc(title)}</title>
${body}
</svg>
`
}

/**
 * A discrete SMIL animation over a repeating cycle, from points [{t, v}] (t in seconds within the cycle).
 * The value before the first point is `start`; the last value holds until the cycle repeats.
 */
export function timeline(attr, start, points, cycle, extra = '') {
  const pts = [{ t: 0, v: start }, ...points.filter((p) => p.t > 0 && p.t < cycle)]
  pts.sort((a, b) => a.t - b.t)
  const merged = []
  for (const p of pts) {
    const last = merged[merged.length - 1]
    if (last && Math.abs(last.t - p.t) < 1e-6) last.v = p.v
    else merged.push({ ...p })
  }
  const keyTimes = merged.map((p) => r(p.t / cycle)).join(';')
  const values = merged.map((p) => p.v).join(';')
  return `<animate attributeName="${attr}" dur="${cycle}s" repeatCount="indefinite" calcMode="discrete" keyTimes="${keyTimes}" values="${values}" ${extra}/>`
}

/** Points for a typewriter: type n characters from t0 at `speed` s/char, hold, then erase (or drop) at tEnd. */
export function typingPoints({ n, perChar, base = 0, t0, speed, tEnd, eraseSpeed = 0 }) {
  const pts = []
  for (let k = 1; k <= n; k++) pts.push({ t: t0 + k * speed, v: r(base + k * perChar) })
  if (tEnd !== undefined) {
    if (eraseSpeed > 0) for (let k = n - 1; k >= 0; k--) pts.push({ t: tEnd + (n - k) * eraseSpeed, v: r(base + k * perChar) })
    else pts.push({ t: tEnd, v: base })
  }
  return pts
}

/** A window: `on` between t0 and t1 of the cycle, `off` otherwise. */
export const windowAnim = (attr, off, on, t0, t1, cycle) =>
  timeline(attr, off, [{ t: Math.max(t0, 0.001), v: on }, { t: t1, v: off }], cycle)
