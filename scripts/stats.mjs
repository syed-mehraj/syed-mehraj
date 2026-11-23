// Builds assets/stats.svg from GitHub's GraphQL API (run daily by the workflow with its GITHUB_TOKEN).
// Usage: GITHUB_TOKEN=… node scripts/stats.mjs            → real numbers
//        node scripts/stats.mjs --sample > /tmp/x.svg      → made-up numbers, only for previewing the design
import { writeFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { C, MONO, SANS, esc, r, svg } from './lib.mjs'

const LOGIN = 'syed-mehraj'

async function fetchData() {
  const token = process.env.GITHUB_TOKEN
  if (!token) throw new Error('GITHUB_TOKEN is not set')
  const query = `query($login: String!) {
    user(login: $login) {
      repositories(ownerAffiliations: OWNER, privacy: PUBLIC, isFork: false, first: 100) {
        totalCount
        nodes { languages(first: 10, orderBy: {field: SIZE, direction: DESC}) { edges { size node { name color } } } }
      }
      contributionsCollection { contributionCalendar { totalContributions weeks { contributionDays { date contributionCount } } } }
    }
  }`
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: { authorization: `bearer ${token}`, 'content-type': 'application/json', 'user-agent': 'profile-stats' },
    body: JSON.stringify({ query, variables: { login: LOGIN } }),
  })
  const json = await res.json()
  if (!res.ok || json.errors) throw new Error(`GitHub API: ${res.status} ${JSON.stringify(json.errors ?? json)}`)
  const u = json.data.user
  const days = u.contributionsCollection.contributionCalendar.weeks.flatMap((w) => w.contributionDays)
  const langs = new Map()
  for (const repo of u.repositories.nodes)
    for (const e of repo.languages.edges) {
      const cur = langs.get(e.node.name) ?? { size: 0, color: e.node.color }
      cur.size += e.size
      langs.set(e.node.name, cur)
    }
  return {
    total: u.contributionsCollection.contributionCalendar.totalContributions,
    repos: u.repositories.totalCount,
    days,
    langs: [...langs].map(([name, v]) => ({ name, ...v })),
  }
}

function sample() {
  const days = Array.from({ length: 365 }, (_, i) => ({
    date: new Date(Date.UTC(2026, 0, 1) + i * 864e5).toISOString().slice(0, 10),
    contributionCount: (i * 7) % 5 === 0 ? 0 : (i * 13) % 9,
  }))
  return {
    total: 1234,
    repos: 7,
    days,
    langs: [
      { name: 'Jupyter Notebook', size: 800, color: '#DA5B0B' },
      { name: 'Python', size: 300, color: '#3572A5' },
      { name: 'TypeScript', size: 120, color: '#3178c6' },
    ],
  }
}

function streaks(days) {
  let longest = 0
  let run = 0
  for (const d of days) {
    run = d.contributionCount > 0 ? run + 1 : 0
    longest = Math.max(longest, run)
  }
  // Current: counting back from today; a quiet today doesn't break it yet.
  let i = days.length - 1
  if (i >= 0 && days[i].contributionCount === 0) i--
  let current = 0
  for (; i >= 0 && days[i].contributionCount > 0; i--) current++
  return { current, longest }
}

/** An odometer: each digit column spins through 0–9 before landing on its value. */
function odometer(value, x, y, color, delay) {
  const digits = String(value).split('')
  const DW = 25
  const DH = 46
  return digits
    .map((dch, i) => {
      const d = Number(dch)
      const spins = 1 + (digits.length - i)
      const target = (spins * 10 + d) * DH
      const col = Array.from({ length: spins * 10 + d + 1 }, (_, k) => `<tspan x="${x + i * DW}" dy="${k === 0 ? 0 : DH}">${k % 10}</tspan>`).join('')
      return `<clipPath id="od${x}${i}"><rect x="${x + i * DW - 2}" y="${y - 38}" width="${DW + 2}" height="${DH}"/></clipPath>
<g clip-path="url(#od${x}${i})"><g class="roll" style="--to:-${target}px;animation-delay:${r(delay + i * 0.08)}s"><text y="${y}" font-family="${MONO}" font-size="40" font-weight="700" fill="${color}">${col}</text></g></g>`
    })
    .join('\n')
}

export function statsSvg(data, updated) {
  const W = 880
  const H = 236
  const { current, longest } = streaks(data.days)
  const tiles = [
    { label: 'contributions · 1 year', value: data.total, color: C.cyan },
    { label: 'current streak · days', value: current, color: C.violet },
    { label: 'longest streak · days', value: longest, color: C.pink },
  ]
  const tileEls = tiles
    .map((t, i) => {
      const x = 24 + i * 186
      return `<rect x="${x}" y="52" width="174" height="128" rx="12" fill="#0f172a" stroke="${t.color}" stroke-opacity=".22"/>
<text x="${x + 16}" y="76" font-family="${MONO}" font-size="11" fill="${C.faint}">${esc(t.label)}</text>
${odometer(t.value, x + 16, 128, t.color, 0.3 + i * 0.25)}`
    })
    .join('\n')

  // The last 8 weeks as a tiny bar chart under the tiles.
  const recent = data.days.slice(-56)
  const max = Math.max(1, ...recent.map((d) => d.contributionCount))
  const spark = recent
    .map((d, i) => {
      const h = d.contributionCount ? 3 + (d.contributionCount / max) * 22 : 1.5
      return `<rect x="${r(24 + i * 9.9)}" y="${r(210 - h)}" width="6.5" height="${r(h)}" rx="1.5" fill="${C.cyan}" fill-opacity="${d.contributionCount ? 0.85 : 0.25}" class="grow" style="animation-delay:${r(0.6 + i * 0.012)}s"/>`
    })
    .join('')

  const langs = [...data.langs].sort((a, b) => b.size - a.size)
  const total = langs.reduce((s, l) => s + l.size, 0) || 1
  const top = langs.slice(0, 5)
  let lx = 602
  const BW = 254
  const segs = top
    .map((l) => {
      const w = (l.size / total) * BW
      const el = `<rect x="${r(lx)}" y="88" width="${r(Math.max(w, 2))}" height="10" fill="${l.color ?? C.dim}"/>`
      lx += w
      return el
    })
    .join('')
  const legend = top
    .map(
      (l, i) => `<g class="fade" style="animation-delay:${r(1 + i * 0.12)}s"><circle cx="608" cy="${122 + i * 20}" r="4.5" fill="${l.color ?? C.dim}"/>
<text x="620" y="${126 + i * 20}" font-family="${SANS}" font-size="12.5" fill="#e2e8f0">${esc(l.name)}</text>
<text x="856" y="${126 + i * 20}" text-anchor="end" font-family="${MONO}" font-size="12" fill="${C.faint}">${((l.size / total) * 100).toFixed(1)}%</text></g>`,
    )
    .join('\n')

  const body = `<style>
  .roll { animation: roll 2.2s cubic-bezier(.15,.85,.25,1) forwards; }
  @keyframes roll { to { transform: translateY(var(--to)) } }
  .grow { transform-box: fill-box; transform-origin: bottom; transform: scaleY(0); animation: grow .6s ease-out forwards; }
  @keyframes grow { to { transform: scaleY(1) } }
  .bar { transform-box: fill-box; transform-origin: left; transform: scaleX(0); animation: bar 1.4s cubic-bezier(.2,.8,.2,1) .5s forwards; }
  @keyframes bar { to { transform: scaleX(1) } }
  .fade { opacity: 0; animation: fade .6s ease-out forwards; }
  @keyframes fade { to { opacity: 1 } }
  @media (prefers-reduced-motion: reduce) { * { animation: none !important } .roll { transform: translateY(var(--to)) } .grow, .bar { transform: none } .fade { opacity: 1 } }
</style>
<defs><clipPath id="lb"><rect x="602" y="88" width="${BW}" height="10" rx="5"/></clipPath></defs>
<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="16" fill="#0b1020" stroke="#ffffff" stroke-opacity=".07"/>
<text x="24" y="34" font-family="${MONO}" font-size="12" fill="${C.faint}">// live from GitHub · updated ${esc(updated)}</text>
${tileEls}
${spark}
<text x="602" y="76" font-family="${MONO}" font-size="11" fill="${C.faint}">languages · public repos (${data.repos})</text>
<rect x="602" y="88" width="${BW}" height="10" rx="5" fill="#1e293b"/>
<g clip-path="url(#lb)"><g class="bar">${segs}</g></g>
${legend}`
  return svg(W, H, body, `GitHub activity: ${data.total} contributions in the past year, current streak ${current} days, longest streak ${longest} days`)
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const isSample = process.argv.includes('--sample')
  const data = isSample ? sample() : await fetchData()
  const updated = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' })
  const out = statsSvg(data, isSample ? 'sample data' : updated)
  if (isSample) process.stdout.write(out)
  else writeFileSync(new URL('../assets/stats.svg', import.meta.url), out)
}
