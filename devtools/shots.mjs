import puppeteer from 'puppeteer-core'

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const URL = 'http://localhost:5199/devtools/audit.html'
const OUT = 'devtools/shots'

const SIZES = [
  { name: '01-movil-chico', w: 320, h: 568 },
  { name: '02-movil', w: 390, h: 844 },
  { name: '03-movil-bajo', w: 375, h: 560 },
  { name: '04-tablet', w: 768, h: 900 },
  { name: '05-escritorio', w: 1280, h: 800 },
  { name: '06-escritorio-bajo', w: 1024, h: 560 },
  { name: '07-ancho', w: 1920, h: 1080 },
]

const browser = await puppeteer.launch({
  executablePath: CHROME, headless: 'new',
  args: ['--no-sandbox', '--disable-gpu', '--hide-scrollbars'],
})
const page = await browser.newPage()

for (const s of SIZES) {
  for (const theme of ['light', 'dark']) {
    await page.setViewport({ width: s.w, height: s.h, deviceScaleFactor: 1 })
    await page.goto(URL, { waitUntil: 'networkidle2' })
    await page.evaluate((t) => {
      document.documentElement.classList.toggle('dark', t === 'dark')
    }, theme)
    await new Promise((r) => setTimeout(r, 320))
    const path = `${OUT}/${s.name}-${theme}.png`
    await page.screenshot({ path, fullPage: false })
    console.log('guardado', path, `${s.w}x${s.h}`)
    // también una captura de página completa en móvil para ver si algo se sale
    if (s.name === '03-movil-bajo' && theme === 'light') {
      await page.screenshot({ path: `${OUT}/${s.name}-full.png`, fullPage: true })
    }
  }
}

await browser.close()
console.log('listo')