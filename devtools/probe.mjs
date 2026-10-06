import puppeteer from 'puppeteer-core'

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const URL = 'http://127.0.0.1:5199/devtools/audit.html'

const browser = await puppeteer.launch({
  executablePath: CHROME, headless: 'new',
  args: ['--no-sandbox', '--disable-gpu', '--hide-scrollbars'],
})
const page = await browser.newPage()
await page.setViewport({ width: 375, height: 560, deviceScaleFactor: 1 })
await page.goto(URL, { waitUntil: 'networkidle2' })
await new Promise((r) => setTimeout(r, 400))

const geo = await page.evaluate(() => {
  const rect = (sel) => {
    const el = document.querySelector(sel)
    if (!el) return null
    const r = el.getBoundingClientRect()
    return { top: Math.round(r.top), bottom: Math.round(r.bottom), h: Math.round(r.height) }
  }
  const main = document.querySelector('main')
  const cal = document.querySelector('[aria-label="Calendario mensual"]')
  const cell = document.querySelector('[data-date]')
  const settleBtn = document.querySelector('button[disabled], button')
  const nav = document.querySelector('nav[aria-label="Navegación principal"]')
  return {
    viewport: { w: innerWidth, h: innerHeight },
    header: rect('header'),
    main: rect('main'),
    mainScrollH: main ? main.scrollHeight : null,
    mainClientH: main ? main.clientHeight : null,
    calSection: cal ? rect('[aria-label="Calendario mensual"]') : null,
    calCardScrollH: cal ? cal.scrollHeight : null,
    cellH: cell ? Math.round(cell.getBoundingClientRect().height) : null,
    calendarCaption: (() => {
      const d = document.querySelectorAll('[aria-label="Calendario mensual"] div')
      return null
    })(),
    isSettleOverNav: (() => {
      const btns = Array.from(document.querySelectorAll('button')).filter((b) =>
        b.textContent.includes('Liquidar'),
      )
      if (!btns.length || !nav) return null
      const br = btns[0].getBoundingClientRect()
      const nr = nav.getBoundingClientRect()
      return { btn: { top: Math.round(br.top), bottom: Math.round(br.bottom) }, nav: { top: Math.round(nr.top), bottom: Math.round(nr.bottom) }, overlaps: br.bottom > nr.top }
    })(),
    docScroll: document.documentElement.scrollHeight - document.documentElement.clientHeight,
  }
})

console.log(JSON.stringify(geo, null, 2))
await browser.close()