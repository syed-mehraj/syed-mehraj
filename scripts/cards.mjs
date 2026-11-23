import { C, MONO, SANS, esc, r, rng, svg } from './lib.mjs'

/** The toolbox: skills pop in one by one, each with a pulsing dot, while a light scans across. */
export function stack() {
  const W = 880
  const rows = [
    ['Languages', [['Python', '#ffd43b'], ['TypeScript', '#3178c6'], ['C', '#a8b9cc'], ['Java', '#f89820']]],
    [
      'Machine learning',
      [['PyTorch', '#ee4c2c'], ['TensorFlow', '#ff8f00'], ['Keras', '#ff4d4d'], ['Scikit-learn', '#f7931e'], ['LoRA fine-tuning', C.violet], ['CNNs', C.cyan], ['LSTMs', '#34d399']],
    ],
    ['Generative AI', [['LLM APIs', '#c084fc'], ['Gemini API', '#4285f4'], ['RAG', C.pink], ['Tool calling', C.amber], ['Voice agents', C.cyan]]],
    [
      'Backend & mobile',
      [['Node.js', '#5fa04e'], ['NestJS', '#e0234e'], ['PostgreSQL', '#4169e1'], ['Prisma', '#818cf8'], ['Kafka', '#e2e8f0'], ['WebRTC', '#34d399'], ['Expo', '#e2e8f0'], ['Kotlin', '#7f52ff']],
    ],
    ['Data & tools', [['NumPy', '#4dabcf'], ['Pandas', '#e70488'], ['Docker', '#2496ed'], ['Git', '#f05032'], ['Elasticsearch', '#00bfb3'], ['CI pipelines', C.dim]]],
  ]
  const PER = 7.5
  const top = 58
  const step = 44
  let k = 0
  const els = rows
    .map(([label, items], ri) => {
      const y = top + ri * step
      let x = 166
      const chips = items
        .map(([name, color]) => {
          const w = 30 + name.length * PER
          const el = `<g class="pop" style="animation-delay:${r(0.25 + k * 0.06)}s">
  <rect x="${r(x)}" y="${y}" width="${r(w)}" height="28" rx="9" fill="#0f172a" stroke="${color}" stroke-opacity=".35"/>
  <circle cx="${r(x + 14)}" cy="${y + 14}" r="4" fill="${color}" class="beat" style="animation-delay:${r((k % 7) * 0.35)}s"/>
  <text x="${r(x + 24)}" y="${y + 18.5}" font-family="${MONO}" font-size="12.5" fill="#e2e8f0" textLength="${r(name.length * PER)}" lengthAdjust="spacingAndGlyphs">${esc(name)}</text>
</g>`
          x += w + 8
          k++
          return el
        })
        .join('\n')
      return `<text x="24" y="${y + 18.5}" font-family="${MONO}" font-size="12" fill="${C.faint}">${esc(label.toLowerCase())}</text>\n${chips}`
    })
    .join('\n')
  const H = top + rows.length * step + 8

  const body = `<style>
  .pop { opacity: 0; transform-box: fill-box; transform-origin: center; animation: pop .55s cubic-bezier(.2,1.4,.4,1) forwards; }
  @keyframes pop { from { opacity: 0; transform: scale(.6) translateY(6px) } to { opacity: 1; transform: none } }
  .beat { animation: beat 2.4s ease-in-out infinite; }
  @keyframes beat { 50% { opacity: .35 } }
  @media (prefers-reduced-motion: reduce) { * { animation: none !important } .pop { opacity: 1 } }
</style>
<defs>
  <linearGradient id="scan" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#67e8f9" stop-opacity="0"/><stop offset=".5" stop-color="#67e8f9" stop-opacity=".16"/><stop offset="1" stop-color="#67e8f9" stop-opacity="0"/></linearGradient>
  <clipPath id="sc"><rect width="${W}" height="${H}" rx="16"/></clipPath>
</defs>
<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="16" fill="#0b1020" stroke="#ffffff" stroke-opacity=".07"/>
<text x="24" y="34" font-family="${MONO}" font-size="12" fill="${C.faint}">// toolbox — what I reach for</text>
<g clip-path="url(#sc)"><rect y="0" width="140" height="${H}" fill="url(#scan)"><animate attributeName="x" values="-160;${W + 20}" dur="5s" begin="1.8s" repeatCount="indefinite"/></rect></g>
${els}`
  return svg(W, H, body, 'Skills: Python, TypeScript, PyTorch, TensorFlow, LoRA fine-tuning, RAG, voice agents, Node.js, NestJS, PostgreSQL and more')
}

/** A project card with a rotating gradient border and a small animation of its own. */
export function project({ repo, title, lines, tags, accent, motif }) {
  const W = 430
  const H = 178
  const motifs = {
    // Heartbeat: an ECG line that draws itself over and over.
    ecg: `<path d="M336 124 h16 l7 -18 l9 34 l8 -40 l8 30 l5 -6 h20" fill="none" stroke="${accent}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="190" class="draw"/>
<circle cx="413" cy="124" r="3" fill="${accent}" class="beat"/>`,
    // Ensemble: three small models orbiting, merging into one prediction.
    orbit: `<g class="spin" style="transform-origin:364px 112px">${[0, 120, 240]
      .map((a) => {
        const rad = (a * Math.PI) / 180
        return `<circle cx="${r(364 + 30 * Math.cos(rad))}" cy="${r(112 + 30 * Math.sin(rad))}" r="7" fill="${accent}" fill-opacity=".8"/>`
      })
      .join('')}</g><circle cx="364" cy="112" r="10" fill="#fff" class="beat"/><circle cx="364" cy="112" r="30" fill="none" stroke="${accent}" stroke-opacity=".25" stroke-dasharray="3 4"/>`,
    // Recognition: a viewfinder with a scanning line.
    scan: `<g stroke="${accent}" stroke-width="2.4" fill="none" stroke-linecap="round"><path d="M332 84 v-10 h12 M384 74 h12 v10 M396 136 v10 h-12 M344 146 h-12 v-10"/></g>
<rect x="336" y="80" width="56" height="2" fill="${accent}" class="scanline"/>
<path d="M352 112 h24 M364 100 v24" stroke="${accent}" stroke-width="1.4" stroke-opacity=".6" class="beat"/>`,
    // Scores: bars that grow and settle.
    bars: `<g>${[34, 52, 26, 62, 44]
      .map((h, i) => `<rect x="${330 + i * 14}" y="${146 - h}" width="9" height="${h}" rx="2" fill="${accent}" fill-opacity="${0.45 + i * 0.1}" class="grow" style="animation-delay:${i * 0.15}s"/>`)
      .join('')}</g><path d="M326 146.5 h74" stroke="${C.faint}"/>`,
  }
  const rand = rng(title.length)
  const tagEls = (() => {
    let x = 20
    return tags
      .map((t) => {
        const w = 18 + t.length * 6.6
        const el = `<rect x="${r(x)}" y="140" width="${r(w)}" height="22" rx="7" fill="${accent}" fill-opacity=".1"/><text x="${r(x + 9)}" y="155" font-family="${MONO}" font-size="11" fill="${accent}" textLength="${r(t.length * 6.6)}" lengthAdjust="spacingAndGlyphs">${esc(t)}</text>`
        x += w + 6
        return el
      })
      .join('')
  })()

  const body = `<style>
  .draw { animation: draw 2.6s ease-in-out infinite; }
  @keyframes draw { 0% { stroke-dashoffset: 190 } 60%,100% { stroke-dashoffset: 0 } }
  .beat { animation: beat 1.3s ease-in-out infinite; }
  @keyframes beat { 50% { opacity: .35 } }
  .spin { animation: spin 7s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg) } }
  .scanline { animation: scan 2.2s ease-in-out infinite alternate; }
  @keyframes scan { to { transform: translateY(60px) } }
  .grow { transform-box: fill-box; transform-origin: bottom; animation: grow 2.8s ease-in-out infinite alternate; }
  @keyframes grow { from { transform: scaleY(.25) } }
  @media (prefers-reduced-motion: reduce) { * { animation: none !important } }
</style>
<defs>
  <linearGradient id="bd" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="${W}" y2="0">
    <stop offset="0" stop-color="${accent}"/><stop offset=".35" stop-color="${accent}" stop-opacity="0"/><stop offset=".65" stop-color="#ffffff" stop-opacity="0"/><stop offset="1" stop-color="#67e8f9" stop-opacity=".8"/>
    <animateTransform attributeName="gradientTransform" type="rotate" from="0 ${W / 2} ${H / 2}" to="360 ${W / 2} ${H / 2}" dur="${r(6 + rand() * 3)}s" repeatCount="indefinite"/>
  </linearGradient>
</defs>
<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="14" fill="#0b1020"/>
<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="14" fill="none" stroke="url(#bd)" stroke-width="1.6"/>
<g stroke="${C.faint}" stroke-width="1.4" fill="none"><path d="M20 24 h5 l2 2.5 h8 v9 h-15 z"/></g>
<text x="42" y="34" font-family="${MONO}" font-size="11.5" fill="${C.faint}">syed-mehraj/${esc(repo)}</text>
<text x="20" y="66" font-family="${SANS}" font-size="20" font-weight="700" fill="${C.text}">${esc(title)}</text>
${lines.map((l, i) => `<text x="20" y="${92 + i * 19}" font-family="${SANS}" font-size="13.5" fill="${C.dim}">${esc(l)}</text>`).join('\n')}
${motifs[motif]}
${tagEls}`
  return svg(W, H, body, `${title}: ${lines.join(' ')}`)
}

/** Soft layered waves to close the page. */
export function footer() {
  const W = 880
  const H = 110
  const wave = (amp, y, len) => {
    let d = `M0 ${y}`
    for (let x = 0; x < W * 2; x += len) d += ` q${len / 4} ${-amp} ${len / 2} 0 t${len / 2} 0`
    return d + ` V${H} H0 Z`
  }
  const body = `<style>
  .w1 { animation: slide 9s linear infinite; } .w2 { animation: slide 13s linear infinite reverse; } .w3 { animation: slide 17s linear infinite; }
  @keyframes slide { to { transform: translateX(-${W / 2}px) } }
  .fade { animation: fade 3s ease-in-out infinite alternate; }
  @keyframes fade { from { opacity: .55 } }
  @media (prefers-reduced-motion: reduce) { * { animation: none !important } }
</style>
<defs><linearGradient id="g" x1="0" x2="1"><stop offset="0" stop-color="#67e8f9"/><stop offset=".5" stop-color="#a78bfa"/><stop offset="1" stop-color="#f472b6"/></linearGradient>
<clipPath id="fc"><rect width="${W}" height="${H}" rx="16"/></clipPath></defs>
<g clip-path="url(#fc)">
  <path class="w3" d="${wave(10, 58, 220)}" fill="url(#g)" fill-opacity=".14"/>
  <path class="w2" d="${wave(14, 70, 176)}" fill="url(#g)" fill-opacity=".2"/>
  <path class="w1" d="${wave(9, 84, 110)}" fill="url(#g)" fill-opacity=".32"/>
</g>
<text x="${W / 2}" y="36" text-anchor="middle" font-family="${MONO}" font-size="13" fill="${C.dim}" class="fade">thanks for stopping by — let's build something that talks back ✦</text>`
  return svg(W, H, body, 'Thanks for stopping by')
}
