import { C, MONO, SANS, esc, r, rng, svg, timeline, typingPoints } from './lib.mjs'

const W = 880
const H = 300

/** The header: aurora sky, twinkling stars, the name written in, rotating roles, and a "speaking" voice orb. */
export function hero() {
  const rand = rng(7)

  const stars = Array.from({ length: 46 }, () => {
    const x = r(rand() * W)
    const y = r(rand() * H)
    const s = r(0.5 + rand() * 1.3)
    const d = r(2 + rand() * 4)
    const delay = r(rand() * 5)
    return `<circle cx="${x}" cy="${y}" r="${s}" fill="#fff" class="tw" style="animation-duration:${d}s;animation-delay:-${delay}s"/>`
  }).join('')

  // Roles typed and erased in turn, with one caret following whichever is on screen.
  const roles = [
    { text: 'AI engineer', color: C.cyan },
    { text: 'voice AI builder', color: C.violet },
    { text: 'LLM fine-tuner', color: C.pink },
    { text: 'full-stack developer', color: C.green },
  ]
  const CYCLE = 16
  const SLOT = CYCLE / roles.length
  const PER = 12 // monospace 20px → 12px per character (forced with textLength)
  const X0 = 74
  const caretPts = []
  const roleEls = roles
    .map((role, i) => {
      const n = role.text.length
      const t0 = i * SLOT + 0.25
      const tEnd = i * SLOT + SLOT - 0.75
      const pts = typingPoints({ n, perChar: PER, t0, speed: 0.065, tEnd, eraseSpeed: 0.022 })
      for (const p of pts) caretPts.push({ t: p.t, v: r(X0 + p.v + 2) })
      return `<clipPath id="role${i}"><rect x="${X0}" y="160" height="34" width="0">${timeline('width', 0, pts, CYCLE)}</rect></clipPath>
<text x="${X0}" y="186" font-family="${MONO}" font-size="20" fill="${role.color}" textLength="${n * PER}" lengthAdjust="spacingAndGlyphs" clip-path="url(#role${i})">${esc(role.text)}</text>`
    })
    .join('\n')

  // Voice waveform across the orb: bars breathe at different speeds, taller in the middle.
  const BARS = 27
  const bars = Array.from({ length: BARS }, (_, i) => {
    const off = i - (BARS - 1) / 2
    const env = Math.exp(-(off * off) / 60)
    const h = r(10 + env * 78)
    const x = r(700 + off * 7 - 2)
    const d = r(0.55 + rand() * 0.9)
    const delay = r(rand() * 1.2)
    return `<rect x="${x}" y="${r(150 - h / 2)}" width="4" height="${h}" rx="2" class="bar" style="animation-duration:${d}s;animation-delay:-${delay}s"/>`
  }).join('')

  const states = ['listening…', 'thinking…', 'speaking…']
  const stateEls = states
    .map(
      (s, i) =>
        `<text x="700" y="262" text-anchor="middle" font-family="${MONO}" font-size="12" fill="${C.dim}" opacity="0">${s}${timeline('opacity', 0, [{ t: i * 2 + 0.001, v: 1 }, { t: i * 2 + 2, v: 0 }], 6)}</text>`,
    )
    .join('')

  const pills = [
    ['Parallel Labs', C.violet],
    ['Hyderabad, India', C.cyan],
    ['MJCET · class of 2027', C.pink],
  ]
  let px = 48
  const pillEls = pills
    .map(([label, color], i) => {
      const w = 38 + label.length * 7.2
      const el = `<g class="fade" style="animation-delay:${1.4 + i * 0.25}s">
  <rect x="${px}" y="222" width="${r(w)}" height="28" rx="14" fill="#0b1224" fill-opacity=".72" stroke="${color}" stroke-opacity=".45"/>
  <circle cx="${px + 14}" cy="236" r="3.5" fill="${color}" class="pulse" style="animation-delay:${i * 0.6}s"/>
  <text x="${px + 24}" y="240.5" font-family="${MONO}" font-size="12" fill="#cbd5e1" textLength="${r(label.length * 7.2)}" lengthAdjust="spacingAndGlyphs">${esc(label)}</text>
</g>`
      px += w + 10
      return el
    })
    .join('\n')

  const body = `<defs>
  <clipPath id="card"><rect width="${W}" height="${H}" rx="22"/></clipPath>
  <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#050816"/><stop offset=".55" stop-color="#0c1430"/><stop offset="1" stop-color="#170c33"/>
  </linearGradient>
  <filter id="blur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="42"/></filter>
  <filter id="soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="16"/></filter>
  <pattern id="dots" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="#fff" fill-opacity=".06"/></pattern>
  <linearGradient id="name" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="420" y2="0" spreadMethod="repeat">
    <stop offset="0" stop-color="#f0abfc"/><stop offset=".33" stop-color="#a78bfa"/><stop offset=".66" stop-color="#67e8f9"/><stop offset="1" stop-color="#f0abfc"/>
    <animateTransform attributeName="gradientTransform" type="translate" from="0 0" to="420 0" dur="7s" repeatCount="indefinite"/>
  </linearGradient>
  <radialGradient id="orb" cx=".38" cy=".32" r=".75">
    <stop offset="0" stop-color="#ede9fe"/><stop offset=".35" stop-color="#a78bfa"/><stop offset=".8" stop-color="#4338ca"/><stop offset="1" stop-color="#1e1b4b"/>
  </radialGradient>
  <linearGradient id="wave" gradientUnits="userSpaceOnUse" x1="605" y1="0" x2="795" y2="0">
    <stop offset="0" stop-color="#67e8f9" stop-opacity=".2"/><stop offset=".3" stop-color="#67e8f9"/><stop offset=".5" stop-color="#ffffff"/><stop offset=".7" stop-color="#f472b6"/><stop offset="1" stop-color="#f472b6" stop-opacity=".2"/>
  </linearGradient>
  <linearGradient id="edge" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="${W}" y2="0" spreadMethod="repeat">
    <stop offset="0" stop-color="#a78bfa" stop-opacity="0"/><stop offset=".5" stop-color="#67e8f9"/><stop offset="1" stop-color="#a78bfa" stop-opacity="0"/>
    <animateTransform attributeName="gradientTransform" type="translate" from="-${W} 0" to="${W} 0" dur="5s" repeatCount="indefinite"/>
  </linearGradient>
  <clipPath id="nameclip"><rect x="40" y="88" height="70" width="0"><animate attributeName="width" begin=".25s" dur="1.2s" from="0" to="440" fill="freeze" calcMode="spline" keyTimes="0;1" keySplines=".6 0 .2 1"/></rect></clipPath>
</defs>
<style>
  .tw { animation: tw 3s ease-in-out infinite; }
  @keyframes tw { 0%,100% { opacity: .15 } 50% { opacity: .95 } }
  .a1 { animation: a1 16s ease-in-out infinite alternate; }
  .a2 { animation: a2 19s ease-in-out infinite alternate; }
  .a3 { animation: a3 13s ease-in-out infinite alternate; }
  @keyframes a1 { to { transform: translate(140px, 50px) } }
  @keyframes a2 { to { transform: translate(-160px, -40px) } }
  @keyframes a3 { to { transform: translate(90px, 70px) } }
  .bar { fill: url(#wave); transform-box: fill-box; transform-origin: center; animation: talk 1s ease-in-out infinite alternate; }
  @keyframes talk { 0% { transform: scaleY(.18) } 55% { transform: scaleY(.85) } 100% { transform: scaleY(.4) } }
  .orb { transform-box: fill-box; transform-origin: center; animation: breathe 4s ease-in-out infinite; }
  @keyframes breathe { 50% { transform: scale(1.07) } }
  .fade { opacity: 0; animation: fade .7s ease-out forwards; }
  @keyframes fade { from { opacity: 0; transform: translateY(6px) } to { opacity: 1; transform: none } }
  .pulse { animation: pulse 2s ease-in-out infinite; }
  @keyframes pulse { 50% { opacity: .25 } }
  .blink { animation: blink 1s steps(1) infinite; }
  @keyframes blink { 50% { opacity: 0 } }
  @media (prefers-reduced-motion: reduce) { * { animation: none !important } }
</style>
<g clip-path="url(#card)">
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <g filter="url(#blur)">
    <ellipse class="a1" cx="170" cy="40" rx="230" ry="90" fill="#7c3aed" fill-opacity=".5"/>
    <ellipse class="a2" cx="720" cy="280" rx="260" ry="90" fill="#0891b2" fill-opacity=".42"/>
    <ellipse class="a3" cx="520" cy="10" rx="170" ry="70" fill="#db2777" fill-opacity=".32"/>
  </g>
  <rect width="${W}" height="${H}" fill="url(#dots)"/>
  ${stars}

  <text x="48" y="74" font-family="${MONO}" font-size="14" fill="${C.cyan}" class="fade">&lt;hello world /&gt;  <tspan fill="${C.faint}">// welcome to my corner of GitHub</tspan></text>
  <text x="44" y="140" font-family="${SANS}" font-size="56" font-weight="800" letter-spacing="-1" fill="url(#name)" clip-path="url(#nameclip)">Syed Mehraj</text>
  <text x="48" y="186" font-family="${MONO}" font-size="20" fill="${C.faint}">&gt;</text>
  ${roleEls}
  <rect y="167" width="10" height="23" rx="1.5" fill="#e2e8f0" class="blink" x="${X0 + 2}">${timeline('x', X0 + 2, caretPts, CYCLE)}</rect>
  ${pillEls}

  <g>
    ${[0, 1.2, 2.4]
      .map(
        (b) => `<circle cx="700" cy="150" r="50" fill="none" stroke="#a78bfa" stroke-width="1.4">
      <animate attributeName="r" values="52;140" dur="3.6s" begin="${b}s" repeatCount="indefinite"/>
      <animate attributeName="stroke-opacity" values=".7;0" dur="3.6s" begin="${b}s" repeatCount="indefinite"/>
    </circle>`,
      )
      .join('\n    ')}
    <circle cx="700" cy="150" r="70" fill="#8b5cf6" fill-opacity=".35" filter="url(#soft)"/>
    <circle class="orb" cx="700" cy="150" r="54" fill="url(#orb)"/>
    <circle cx="700" cy="150" r="54" fill="none" stroke="#ffffff" stroke-opacity=".18"/>
    ${bars}
    <circle cx="648" cy="258" r="4" fill="#4ade80" class="pulse"/>
    ${stateEls}
  </g>

  <rect x="0" y="${H - 3}" width="${W}" height="3" fill="url(#edge)"/>
</g>
<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="21.5" fill="none" stroke="#ffffff" stroke-opacity=".08"/>`

  return svg(W, H, body, 'Syed Mehraj — AI engineer building real-time voice AI')
}
