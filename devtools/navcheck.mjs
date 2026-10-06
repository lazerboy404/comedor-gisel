import puppeteer from "puppeteer-core"
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
const b = await puppeteer.launch({executablePath:CHROME, headless:"new", args:["--no-sandbox","--disable-gpu","--hide-scrollbars"]})
const p = await b.newPage()
await p.setViewport({width:280,height:568})
await p.goto("http://127.0.0.1:5199/devtools/audit.html",{waitUntil:"networkidle2"})
await new Promise(r=>setTimeout(r,300))
const info = await p.evaluate(() => {
  const nav = document.querySelector('nav[aria-label="Navegación principal"]')
  const s = nav ? getComputedStyle(nav) : null
  const main = document.querySelector('main')
  const navR = nav.getBoundingClientRect(), mainR = main.getBoundingClientRect()
  return {
    navPosition: s ? s.position : null,
    navZ: s ? s.zIndex : null,
    navRect: {top:Math.round(navR.top), bottom:Math.round(navR.bottom)},
    mainRect: {top:Math.round(mainR.top), bottom:Math.round(mainR.bottom)},
    // ¿se tocan o hay separación?
    gap: Math.round(navR.top - mainR.bottom),
    navParentDisplay: getComputedStyle(nav.parentElement).display,
    navParentFlexDir: getComputedStyle(nav.parentElement).flexDirection,
  }
})
console.log(JSON.stringify(info,null,2))
await b.close()
