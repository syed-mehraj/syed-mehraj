import { C, MONO, SANS, svg, timeline, windowAnim } from './lib.mjs'

const W = 880
const H = 270

/** One turn of a live voice call, animated: the signal travels caller → STT → LLM → TTS → reply and loops back. */
export function pipeline() {
  const CY = 118
  const NW = 136
  const NH = 82
  const xs = [96, 268, 440, 612, 784]
  const nodes = [
    { title: 'Caller', sub: 'speaks', color: C.cyan, icon: 'mic' },
    { title: 'Speech → text', sub: 'streaming STT', color: '#60a5fa', icon: 'wave' },
    { title: 'LLM + tools', sub: 'reasons, acts', color: C.violet, icon: 'spark' },
    { title: 'Text → speech', sub: 'streaming TTS', color: C.pink, icon: 'wave' },
    { title: 'Reply', sub: 'barge-in ready', color: C.green, icon: 'speaker' },
  ]

  // Timeline (seconds): each node is busy for a while, then a packet travels to the next one.
  const CYCLE = 6.4
  const busy = [0.55, 0.55, 0.95, 0.55, 0.9]
  const TRAVEL = 0.45
  const windows = []
  let t = 0.05
  for (let i = 0; i < nodes.length; i++) {
    windows.push({ node: [t, t + busy[i]] })
    t += busy[i]
    if (i < nodes.length - 1) {
      windows[i].seg = [t, t + TRAVEL]
      t += TRAVEL
    }
  }
  const loopStart = t
  const loopEnd = Math.min(CYCLE - 0.05, t + 0.85)

  const icon = (kind, x, y, color) => {
    switch (kind) {
      case 'mic':
        return `<g stroke="${color}" stroke-width="1.8" fill="none" stroke-linecap="round"><rect x="${x - 4.5}" y="${y - 11}" width="9" height="14" rx="4.5"/><path d="M${x - 8} ${y - 2} a8 8 0 0 0 16 0 M${x} ${y + 6} v4"/></g>`
      case 'speaker':
        return `<g stroke="${color}" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M${x - 10} ${y - 4} h5 l6 -5 v18 l-6 -5 h-5 z"/><path d="M${x + 5} ${y - 4} a6 6 0 0 1 0 8 M${x + 8} ${y - 8} a11 11 0 0 1 0 16"/></g>`
      case 'spark':
        return `<path d="M${x} ${y - 11} C${x + 1.5} ${y - 3} ${x + 3} ${y - 1.5} ${x + 11} ${y} C${x + 3} ${y + 1.5} ${x + 1.5} ${y + 3} ${x} ${y + 11} C${x - 1.5} ${y + 3} ${x - 3} ${y + 1.5} ${x - 11} ${y} C${x - 3} ${y - 1.5} ${x - 1.5} ${y - 3} ${x} ${y - 11} Z" fill="${color}"/>`
      default:
        return `<g stroke="${color}" stroke-width="2.2" stroke-linecap="round">${[-8, -4, 0, 4, 8].map((d, k) => `<path d="M${x + d} ${y - [3, 7, 10, 6, 3][k]} V${y + [3, 7, 10, 6, 3][k]}"/>`).join('')}</g>`
    }
  }

  const nodeEls = nodes
    .map((n, i) => {
      const x = xs[i]
      const [a, b] = windows[i].node
      const thinking =
        n.icon === 'spark'
          ? `<g>${[0, 1, 2]
              .map(
                (k) =>
                  `<circle cx="${x - 8 + k * 8}" cy="${CY + 48}" r="2.4" fill="${C.violet}" opacity="0">${windowAnim('opacity', 0, 1, a + k * 0.18, b, CYCLE)}</circle>`,
              )
              .join('')}</g>`
          : ''
      return `<g>
  <rect x="${x - NW / 2 - 6}" y="${CY - NH / 2 - 6}" width="${NW + 12}" height="${NH + 12}" rx="20" fill="${n.color}" opacity="0" filter="url(#glow)">${windowAnim('opacity', 0, 0.45, a, b + 0.15, CYCLE)}</rect>
  <rect x="${x - NW / 2}" y="${CY - NH / 2}" width="${NW}" height="${NH}" rx="15" fill="#0d1428" stroke="${C.line}" stroke-width="1.5">${windowAnim('stroke', C.line, n.color, a, b + 0.15, CYCLE)}</rect>
  ${icon(n.icon, x, CY - 16, n.color)}
  <text x="${x}" y="${CY + 13}" text-anchor="middle" font-family="${SANS}" font-size="14" font-weight="650" fill="${C.text}">${n.title}</text>
  <text x="${x}" y="${CY + 30}" text-anchor="middle" font-family="${MONO}" font-size="11" fill="${C.faint}">${n.sub}</text>
  ${thinking}
</g>`
    })
    .join('\n')

  const segEls = xs
    .slice(0, -1)
    .map((x, i) => {
      const x1 = x + NW / 2
      const x2 = xs[i + 1] - NW / 2
      const [a, b] = windows[i].seg
      return `<path d="M${x1} ${CY} H${x2}" stroke="#243049" stroke-width="2" stroke-dasharray="3 5" class="flow"/>
<circle cy="${CY}" r="4.5" fill="#fff" opacity="0" filter="url(#dot)">
  ${windowAnim('opacity', 0, 1, a, b, CYCLE)}
  <animate attributeName="cx" dur="${CYCLE}s" repeatCount="indefinite" calcMode="linear" keyTimes="0;${(a / CYCLE).toFixed(4)};${(b / CYCLE).toFixed(4)};1" values="${x1};${x1};${x2};${x2}"/>
</circle>`
    })
    .join('\n')

  const loopPath = `M${xs[4]} ${CY + NH / 2} C${xs[4]} ${CY + 125}, ${xs[0]} ${CY + 125}, ${xs[0]} ${CY + NH / 2}`
  const body = `<style>
  .flow { animation: flow 1.2s linear infinite; }
  @keyframes flow { to { stroke-dashoffset: -16 } }
  .loop { animation: flow 2.4s linear infinite; }
  @media (prefers-reduced-motion: reduce) { * { animation: none !important } }
</style>
<defs>
  <filter id="glow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="10"/></filter>
  <filter id="dot" x="-200%" y="-200%" width="500%" height="500%"><feGaussianBlur stdDeviation="1.2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <linearGradient id="pb" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0b1020"/><stop offset="1" stop-color="#0a0f1f"/></linearGradient>
</defs>
<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="16" fill="url(#pb)" stroke="#ffffff" stroke-opacity=".07"/>
<text x="24" y="34" font-family="${MONO}" font-size="12" fill="${C.faint}">// one turn of a live voice call — what I work on every day</text>
<path d="${loopPath}" fill="none" stroke="#243049" stroke-width="1.6" stroke-dasharray="4 6" class="loop"/>
<circle r="4" fill="${C.green}" opacity="0" filter="url(#dot)">
  ${windowAnim('opacity', 0, 1, loopStart, loopEnd, CYCLE)}
  <animateMotion dur="${CYCLE}s" repeatCount="indefinite" calcMode="linear" keyPoints="0;0;1;1" keyTimes="0;${(loopStart / CYCLE).toFixed(4)};${(loopEnd / CYCLE).toFixed(4)};1" path="${loopPath}"/>
</circle>
<text x="${W / 2}" y="${CY + 112}" text-anchor="middle" font-family="${MONO}" font-size="11" fill="${C.faint}">↺ the caller can interrupt at any moment — the loop starts again</text>
${segEls}
${nodeEls}`

  return svg(W, H, body, 'A live voice call: caller, speech to text, LLM with tools, text to speech, reply')
}
