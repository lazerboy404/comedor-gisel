import puppeteer from "puppeteer-core"
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
const URL = "http://127.0.0.1:5199/devtools/audit.html"
const b = await puppeteer.launch({executablePath:CHROME, headless:"new", args:["--no-sandbox","--disable-gpu","--hide-scrollbars"]})
const p = await b.newPage()
for (const s of [{n:"08-escritorio-aplastado",w:1280,h:400},{n:"09-mini-280",w:280,h:568}]) {
  await p.setViewport({width:s.w,height:s.h})
  await p.goto(URL,{waitUntil:"networkidle2"})
  await new Promise(r=>setTimeout(r,300))
  await p.screenshot({path:`devtools/shots/${s.n}.png`})
  console.log("guardado",s.n)
}
await b.close()
