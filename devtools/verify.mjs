import puppeteer from 'puppeteer-core'

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const URL = 'http://127.0.0.1:5199/devtools/audit.html'

const CASES = [
  { w: 280, h: 568 },
  { w: 1280, h: 400 },
  { w: 375, h: 560 },
]

const browser = await puppeteer.launch({
  executablePath: CHROME, headless: 'new',
  args: ['--no-sandbox', '--disable-gpu', '--hide-scrollbars'],
})
const page = await browser.newPage()

for (const c of CASES) {
  await page.setViewport({ width: c.w, height: c.h })
  await page.goto(URL, { waitUntil: 'networkidle2' })
  await new Promise((r) => setTimeout(r, 300))

  const res = await page.evaluate(() => {
    // ¿algún texto se desborda de su caja? (scrollWidth > clientWidth con overflow visible)
    const spills = []
    for (const el of document.querySelectorAll('body *')) {
      const s = getComputedStyle(el)
      if (s.display === 'none') continue
      const hasOwnText = Array.from(el.childNodes).some(
        (n) => n.nodeType === 3 && n.textContent.trim(),
      )
      if (!hasOwnText) continue
      if (el.scrollWidth > el.clientWidth + 2 && s.overflowX === 'visible') {
        spills.push({
          text: el.textContent.trim().slice(0, 26),
          over: el.scrollWidth - el.clientWidth,
        })
      }
    }
    // celdas del calendario: cuántas y si caben su contenido
    const cells = Array.from(document.querySelectorAll('[data-date]'))
    let cellBad = 0
    for (const el of cells) {
      if (el.scrollHeight > el.clientHeight + 2 || el.scrollWidth > el.clientWidth + 2) cellBad++
    }
    // el nav: ¿encima del contenido?
    const nav = document.querySelector('nav[aria-label="Navegación principal"]')
    const navTop = nav ? nav.getBoundingClientRect().top : null
    let navOnTop = 0
    if (nav) {
      for (const el of document.querySelectorAll('main *')) {
        const r = el.getBoundingClientRect()
        const s = getComputedStyle(el)
        if (s.display === 'none') continue
        const hasOwnText = Array.from(el.childNodes).some(
          (n) => n.nodeType === 3 && n.textContent.trim(),
        )
        if (hasOwnText && r.bottom > navTop + 1 && r.top < navTop - 1) navOnTop++
      }
    }
    return {
      docOverflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      spills,
      cells: cells.length,
      cellBad,
      navOnTop,
      cellH: cells.length ? Math.round(cells[0].getBoundingClientRect().height) : null,
    }
  })

  console.log(`\n=== ${c.w}x${c.h} ===`)
  console.log('  desborde horizontal:', res.docOverflowX + 'px')
  console.log('  textos que se salen de su caja:', res.spills.length, res.spills.slice(0, 4))
  console.log('  celdas de calendario:', res.cells, '| con contenido recortado:', res.cellBad, '| alto:', res.cellH + 'px')
  console.log('  textos bajo el nav (encimados):', res.navOnTop)
}

await browser.close()