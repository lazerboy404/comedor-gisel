/*
 * Auditoría de layout y legibilidad — Comedor Gisel
 * Uso: node devtools/audit.mjs
 * Mide a muchos anchos: desbordes, encimamientos, solapamiento con el
 * encabezado/nav, y contraste real de cada texto (WCAG).
 */
import puppeteer from 'puppeteer-core'

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const URL = process.env.AUDIT_URL || 'http://127.0.0.1:5199/devtools/audit.html'

// Anchos a auditar: móviles chicos -> monitores anchos
const WIDTHS = [280, 320, 360, 375, 390, 414, 480, 540, 640, 768, 820, 900, 1024, 1100, 1280, 1440, 1600, 1920, 2560]
const HEIGHTS = { default: 800, short: 480, landscape: 400 } // incluye pantallas bajas y horizontal

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function inspect(page, label) {
  return page.evaluate(() => {
    const out = {
      overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      clipped: [],       // elementos que se salen de su contenedor
      overlaps: [],      // pares que se enciman
      overlapsHeader: [],// tapados por header/nav
      tiny: [],          // texto por debajo de 9px
      lowContrast: [],   // contraste < 4.5
      cellMin: null,
    }

    const vis = (el) => {
      const s = getComputedStyle(el)
      if (s.display === 'none' || s.visibility === 'hidden' || Number(s.opacity) === 0) return false
      const r = el.getBoundingClientRect()
      return r.width > 0 && r.height > 0
    }

    // opacidad efectiva acumulada (para color real del texto)
    const effOpacity = (el) => {
      let o = 1, n = el
      while (n && n.nodeType === 1) {
        o *= Number(getComputedStyle(n).opacity || 1)
        n = n.parentElement
      }
      return o
    }
    const parse = (c) => {
      const m = c.match(/rgba?\(([^)]+)\)/)
      if (!m) return null
      const p = m[1].split(',').map((x) => parseFloat(x))
      return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 }
    }
    const over = (fg, bg) => ({
      r: fg.r * fg.a + bg.r * (1 - fg.a),
      g: fg.g * fg.a + bg.g * (1 - fg.a),
      b: fg.b * fg.a + bg.b * (1 - fg.a),
      a: 1,
    })
    const bgOf = (el) => {
      let n = el
      while (n && n.nodeType === 1) {
        const c = parse(getComputedStyle(n).backgroundColor)
        if (c && c.a > 0) return c
        n = n.parentElement
      }
      return { r: 255, g: 255, b: 255, a: 1 }
    }
    const lum = (c) => {
      const f = (v) => {
        v /= 255
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
      }
      return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b)
    }
    const ratio = (a, b) => {
      const l1 = lum(a), l2 = lum(b)
      return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)
    }

    // ¿el elemento tiene texto propio visible?
    const hasText = (el) => {
      for (const n of el.childNodes) {
        if (n.nodeType === 3 && n.textContent.trim().length > 0) return true
      }
      return false
    }

    const all = Array.from(document.querySelectorAll('body *')).filter(vis)

    // 1) desborde horizontal del documento
    // 2) elementos que se salen de su padre (clip visible)
    for (const el of all) {
      const r = el.getBoundingClientRect()
      const p = el.parentElement
      if (p && vis(p)) {
        const pr = p.getBoundingClientRect()
        const spillsX = r.left < pr.left - 1.5 || r.right > pr.right + 1.5
        const spillsY = r.top < pr.top - 1.5 || r.bottom > pr.bottom + 1.5
        const clippedByParent = getComputedStyle(p).overflow === 'hidden'
        if (spillsX && clippedByParent) {
          out.clipped.push({
            sel: el.tagName.toLowerCase() + '.' + (el.className || '').toString().split(' ').slice(0, 2).join('.'),
            text: (el.textContent || '').trim().slice(0, 30),
            spill: Math.round(Math.max(pr.left - r.left, r.right - pr.right)),
          })
        }
      }
    }

    // 3) solapamiento entre celdas del calendario (no deben encimarse)
    const cells = Array.from(document.querySelectorAll('[data-date]')).filter(vis)
    if (cells.length) {
      let minW = Infinity, minH = Infinity
      for (const c of cells) {
        const r = c.getBoundingClientRect()
        minW = Math.min(minW, r.width)
        minH = Math.min(minH, r.height)
      }
      out.cellMin = { w: Math.round(minW), h: Math.round(minH), count: cells.length }
      for (let i = 0; i < cells.length; i++) {
        for (let j = i + 1; j < cells.length; j++) {
          const a = cells[i].getBoundingClientRect(), b = cells[j].getBoundingClientRect()
          const ox = Math.min(a.right, b.right) - Math.max(a.left, b.left)
          const oy = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top)
          if (ox > 1 && oy > 1) {
            out.overlaps.push({ a: cells[i].dataset.date, b: cells[j].dataset.date, ox: Math.round(ox), oy: Math.round(oy) })
          }
        }
      }
    }

    // rect visible real: recortado por todos los ancestros con scroll/overflow
    const visibleRect = (el) => {
      let r = el.getBoundingClientRect()
      let n = el.parentElement
      while (n && n.nodeType === 1) {
        const s = getComputedStyle(n)
        if (/auto|scroll|hidden/.test(s.overflowY) || /auto|scroll|hidden/.test(s.overflowX)) {
          const pr = n.getBoundingClientRect()
          const top = Math.max(r.top, pr.top)
          const bottom = Math.min(r.bottom, pr.bottom)
          const left = Math.max(r.left, pr.left)
          const right = Math.min(r.right, pr.right)
          if (bottom <= top || right <= left) return null // totalmente fuera de vista
          r = { top, bottom, left, right, width: right - left, height: bottom - top }
        }
        n = n.parentElement
      }
      return r
    }

    // 4) ¿algo queda tapado por el header fijo o el nav inferior?
    const header = document.querySelector('header')
    const nav = document.querySelector('nav[aria-label="Navegación principal"]')
    if (header) {
      const hr = header.getBoundingClientRect()
      for (const el of all) {
        if (header.contains(el)) continue
        const r = visibleRect(el)
        if (!r) continue
        if (r.top < hr.bottom - 1 && r.bottom > hr.top + 1 && r.left < hr.right && r.right > hr.left) {
          if (hasText(el) || el.tagName === 'BUTTON') {
            out.overlapsHeader.push({ where: 'header', text: (el.textContent || '').trim().slice(0, 30) })
          }
        }
      }
    }
    if (nav) {
      const nr = nav.getBoundingClientRect()
      for (const el of all) {
        if (nav.contains(el)) continue
        const r = visibleRect(el)
        if (!r) continue
        if (r.bottom > nr.top + 1 && r.top < nr.bottom - 1 && r.left < nr.right && r.right > nr.left) {
          if (hasText(el) || el.tagName === 'BUTTON') {
            out.overlapsHeader.push({ where: 'nav', text: (el.textContent || '').trim().slice(0, 30) })
          }
        }
      }
    }

    // 4b) ¿el botón de liquidar es alcanzable? (visible o dentro de un contenedor con scroll)
    const settleBtn = Array.from(document.querySelectorAll('button')).find((b) =>
      (b.textContent || '').includes('Liquidar'),
    )
    if (settleBtn) {
      const vr = visibleRect(settleBtn)
      let scrollable = false
      let n = settleBtn.parentElement
      while (n && n.nodeType === 1) {
        const s = getComputedStyle(n)
        if (/auto|scroll/.test(s.overflowY) && n.scrollHeight > n.clientHeight + 1) { scrollable = true; break }
        n = n.parentElement
      }
      out.settle = { visible: !!vr, reachable: !!vr || scrollable }
    }

    // 5) texto muy chico y contraste
    const seen = new Set()
    for (const el of all) {
      if (!hasText(el)) continue
      const s = getComputedStyle(el)
      const fs = parseFloat(s.fontSize)
      const fg = parse(s.color)
      const op = effOpacity(el)
      const bg = bgOf(el)
      const key = `${s.color}|${s.fontSize}|${(el.className||'').toString().slice(0,40)}`
      if (seen.has(key)) continue
      seen.add(key)

      if (fs < 9) out.tiny.push({ text: (el.textContent || '').trim().slice(0, 28), px: fs })
      if (fg) {
        const fgEff = { ...fg, a: fg.a * op }
        const composed = over(fgEff, bg)
        const cr = ratio(composed, bg)
        const big = fs >= 24 || (fs >= 18.66 && parseInt(s.fontWeight) >= 700)
        const need = big ? 3 : 4.5
        if (cr < need) {
          out.lowContrast.push({
            text: (el.textContent || '').trim().slice(0, 28),
            px: Math.round(fs),
            ratio: Number(cr.toFixed(2)),
            need,
          })
        }
      }
    }

    return out
  })
}

async function main() {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-sandbox', '--disable-gpu', '--hide-scrollbars'],
  })
  const page = await browser.newPage()

  const results = []
  for (const hName of Object.keys(HEIGHTS)) {
    const h = HEIGHTS[hName]
    for (const w of WIDTHS) {
      await page.setViewport({ width: w, height: h, deviceScaleFactor: 1 })
      await page.goto(URL, { waitUntil: 'networkidle2' })
      await sleep(260)
      const r = await inspect(page)
      results.push({ w, h, hName, ...r })
    }
  }

  await browser.close()

  // ---------- resumen ----------
  const problems = (r) =>
    r.overflowX > 1 ||
    r.clipped.length ||
    r.overlaps.length ||
    r.overlapsHeader.length ||
    r.tiny.length ||
    r.lowContrast.length

  console.log('\n========== AUDITORÍA DE LAYOUT ==========')
  console.log('ancho  alto  overflow  clip  encim  header/nav  <9px  bajoContraste  celda(min)')
  for (const r of results) {
    const bad = problems(r)
    console.log(
      [
        String(r.w).padStart(5),
        String(r.h).padStart(5),
        String(r.overflowX).padStart(8),
        String(r.clipped.length).padStart(5),
        String(r.overlaps.length).padStart(6),
        String(r.overlapsHeader.length).padStart(10),
        String(r.tiny.length).padStart(6),
        String(r.lowContrast.length).padStart(13),
        r.cellMin ? `${r.cellMin.w}x${r.cellMin.h}` : '-',
        bad ? '  <-- REVISAR' : '  ok',
      ].join(' '),
    )
  }

  // detalle de los que fallan
  console.log('\n========== DETALLE ==========')
  for (const r of results) {
    if (!problems(r)) continue
    console.log(`\n--- ${r.w}x${r.h} (${r.hName}) ---`)
    if (r.overflowX > 1) console.log(`  desborde horizontal: ${r.overflowX}px`)
    if (r.clipped.length) {
      console.log('  recortados:')
      const uniq = [...new Map(r.clipped.map((c) => [c.sel + c.text, c])).values()]
      for (const c of uniq.slice(0, 6)) console.log(`    - ${c.sel} "${c.text}" (+${c.spill}px)`)
    }
    if (r.overlaps.length) {
      console.log(`  encimados: ${r.overlaps.length} pares`)
      for (const o of r.overlaps.slice(0, 3)) console.log(`    - ${o.a} vs ${o.b} (${o.ox}x${o.oy}px)`)
    }
    if (r.overlapsHeader.length) {
      const uniq = [...new Set(r.overlapsHeader.map((o) => o.where + ':' + o.text))]
      console.log(`  tapados por header/nav: ${uniq.slice(0, 5).join(' | ')}`)
    }
    if (r.tiny.length) {
      const uniq = [...new Set(r.tiny.map((t) => `${t.text}@${t.px}px`))]
      console.log(`  texto <9px: ${uniq.slice(0, 6).join(' | ')}`)
    }
    if (r.lowContrast.length) {
      const uniq = [...new Map(r.lowContrast.map((c) => [c.text + c.ratio, c])).values()]
      console.log(`  contraste bajo:`)
      for (const c of uniq.slice(0, 8)) console.log(`    - "${c.text}" ${c.px}px ${c.ratio}:1 (necesita ${c.need})`)
    }
  }

  const failing = results.filter(problems).length
  console.log(`\n========== RESULTADO: ${failing} de ${results.length} combinaciones con problemas ==========\n`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})