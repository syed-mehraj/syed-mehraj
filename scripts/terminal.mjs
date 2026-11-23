import { C, MONO, esc, r, svg, timeline, typingPoints } from './lib.mjs'

const W = 880
const PER = 9 // monospace 15px → 9px per character (forced with textLength)
const LH = 27

/** A terminal that types who I am, line by line, then clears and starts again. */
export function terminal() {
  const blue = '#60a5fa'
  const lines = [
    { cmd: 'whoami' },
    { out: [['Syed Mehraj', C.text], [' · AI engineer · Hyderabad, India', C.dim]] },
    { cmd: 'cat now.md' },
    { out: [['▸ ', C.violet], ['building real-time voice AI agents at ', C.dim], ['Parallel Labs', C.text]] },
    { out: [['▸ ', C.violet], ['fine-tuning multilingual LLMs · RAG · tool calling', C.dim]] },
    { out: [['▸ ', C.violet], ['B.E. AI & ML at MJCET, class of 2027 · CGPA 9.0', C.dim]] },
    { cmd: 'ls ~/interests' },
    { out: [['voice-agents/  ', blue], ['llms/  ', blue], ['real-time-systems/  ', blue], ['backend/', blue]] },
    { cmd: 'echo $STATUS' },
    { out: [['● ', C.green], ['open to AI and backend roles · let’s build something', C.green]] },
    { prompt: true },
  ]

  const CYCLE = 24
  const CLEAR = CYCLE - 1.2
  const top = 70
  let t = 0.6
  const els = []
  lines.forEach((line, i) => {
    const y = top + i * LH
    if (line.cmd !== undefined || line.prompt) {
      const n = line.cmd?.length ?? 0
      const x0 = 70
      const start = t
      const pts = typingPoints({ n, perChar: PER, base: 0, t0: start + 0.35, speed: 0.075, tEnd: CLEAR })
      const typedEnd = start + 0.35 + n * 0.075
      const next = line.prompt ? CLEAR : typedEnd + 0.25
      const caretPts = [{ t: start, v: x0 + 1 }, ...pts.filter((p) => p.t < CLEAR).map((p) => ({ t: p.t, v: r(x0 + p.v + 1) }))]
      els.push(`<g opacity="0">${timeline('opacity', 0, [{ t: start, v: 1 }, { t: CLEAR, v: 0 }], CYCLE)}
  <text x="28" y="${y}" font-family="${MONO}" font-size="15" fill="${C.green}">➜</text>
  <text x="48" y="${y}" font-family="${MONO}" font-size="15" fill="${C.cyan}">~</text>
</g>`)
      if (n)
        els.push(`<clipPath id="tc${i}"><rect x="${x0}" y="${y - 18}" height="26" width="0">${timeline('width', 0, pts, CYCLE)}</rect></clipPath>
<text x="${x0}" y="${y}" font-family="${MONO}" font-size="15" fill="${C.text}" textLength="${n * PER}" lengthAdjust="spacingAndGlyphs" clip-path="url(#tc${i})">${esc(line.cmd)}</text>`)
      // The caret sits on this line from when it starts until the command runs.
      els.push(`<g opacity="0">${timeline('opacity', 0, [{ t: start, v: 1 }, { t: next, v: 0 }], CYCLE)}
  <rect class="blink" y="${y - 15}" width="9" height="19" rx="1" fill="#e2e8f0" x="${x0 + 1}">${timeline('x', x0 + 1, caretPts, CYCLE)}</rect>
</g>`)
      t = next
    } else {
      const start = t + 0.12
      const spans = line.out.map(([s, color]) => `<tspan fill="${color}">${esc(s)}</tspan>`).join('')
      els.push(`<text x="28" y="${y}" font-family="${MONO}" font-size="15" opacity="0" xml:space="preserve">${spans}${timeline('opacity', 0, [{ t: start, v: 1 }, { t: CLEAR, v: 0 }], CYCLE)}</text>`)
      t = start
      if (lines[i + 1] && !lines[i + 1].out) t += 0.9
    }
  })

  const H = top + lines.length * LH + 6
  const body = `<style>
  .blink { animation: blink 1s steps(1) infinite; }
  @keyframes blink { 50% { opacity: 0 } }
  .glow { animation: glow 6s ease-in-out infinite; }
  @keyframes glow { 50% { stroke-opacity: .55 } }
  @media (prefers-reduced-motion: reduce) { * { animation: none !important } }
</style>
<defs>
  <linearGradient id="tb" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0b1020"/><stop offset="1" stop-color="#0d0a1f"/></linearGradient>
  <linearGradient id="bd" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#67e8f9"/><stop offset=".5" stop-color="#a78bfa"/><stop offset="1" stop-color="#f472b6"/></linearGradient>
</defs>
<rect x=".75" y=".75" width="${W - 1.5}" height="${H - 1.5}" rx="16" fill="url(#tb)" stroke="url(#bd)" stroke-opacity=".25" stroke-width="1.5" class="glow"/>
<path d="M1 37 H${W - 1}" stroke="${C.line}"/>
<circle cx="24" cy="19" r="6" fill="#ff5f57"/><circle cx="44" cy="19" r="6" fill="#febc2e"/><circle cx="64" cy="19" r="6" fill="#28c840"/>
<text x="${W / 2}" y="23.5" text-anchor="middle" font-family="${MONO}" font-size="12" fill="${C.faint}">syed@parallel-labs: ~ — zsh</text>
${els.join('\n')}`

  return svg(W, H, body, 'Terminal: Syed Mehraj, AI engineer at Parallel Labs, building real-time voice AI agents')
}
