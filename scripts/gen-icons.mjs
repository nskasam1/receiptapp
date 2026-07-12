import { PNG } from 'pngjs'
import { writeFileSync, mkdirSync } from 'node:fs'

const BG = [16, 18, 21] // oklch(0.09 0 0) approx
const PRIMARY = [79, 157, 166] // oklch(0.62 0.11 200) approx mineral teal
const ACCENT = [212, 165, 90] // oklch(0.74 0.14 75) approx warm amber

function draw(size, maskable) {
  const png = new PNG({ width: size, height: size })
  const pad = maskable ? size * 0.24 : size * 0.14

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (size * y + x) << 2
      png.data[idx] = BG[0]
      png.data[idx + 1] = BG[1]
      png.data[idx + 2] = BG[2]
      png.data[idx + 3] = 255
    }
  }

  // receipt card: rounded rect in primary teal
  const cardLeft = pad
  const cardRight = size - pad
  const cardTop = pad
  const cardBottom = size - pad
  const radius = size * 0.06

  const inCard = (x, y) => {
    if (x < cardLeft || x > cardRight || y < cardTop || y > cardBottom) return false
    // corner rounding
    const corners = [
      [cardLeft + radius, cardTop + radius],
      [cardRight - radius, cardTop + radius],
      [cardLeft + radius, cardBottom - radius],
      [cardRight - radius, cardBottom - radius],
    ]
    if (x < cardLeft + radius && y < cardTop + radius) return dist(x, y, corners[0]) <= radius
    if (x > cardRight - radius && y < cardTop + radius) return dist(x, y, corners[1]) <= radius
    if (x < cardLeft + radius && y > cardBottom - radius) return dist(x, y, corners[2]) <= radius
    if (x > cardRight - radius && y > cardBottom - radius) return dist(x, y, corners[3]) <= radius
    return true
  }
  function dist(x, y, [cx, cy]) {
    return Math.hypot(x - cx, y - cy)
  }

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (inCard(x, y)) {
        const idx = (size * y + x) << 2
        png.data[idx] = PRIMARY[0]
        png.data[idx + 1] = PRIMARY[1]
        png.data[idx + 2] = PRIMARY[2]
        png.data[idx + 3] = 255
      }
    }
  }

  // three "line item" bars in bg color + one accent bar (the split/total line)
  const lineHeight = (cardBottom - cardTop) * 0.07
  const lineInset = (cardRight - cardLeft) * 0.16
  const lines = [0.24, 0.42, 0.6, 0.8]
  lines.forEach((frac, i) => {
    const ly = cardTop + (cardBottom - cardTop) * frac
    const color = i === lines.length - 1 ? ACCENT : BG
    const widthFrac = i === lines.length - 1 ? 0.68 : 1
    for (let y = ly; y < ly + lineHeight; y++) {
      for (let x = cardLeft + lineInset; x < cardLeft + lineInset + (cardRight - cardLeft - lineInset * 2) * widthFrac; x++) {
        const xi = Math.round(x)
        const yi = Math.round(y)
        if (xi < 0 || xi >= size || yi < 0 || yi >= size) continue
        const idx = (size * yi + xi) << 2
        png.data[idx] = color[0]
        png.data[idx + 1] = color[1]
        png.data[idx + 2] = color[2]
        png.data[idx + 3] = 255
      }
    }
  })

  return png
}

mkdirSync('public/icons', { recursive: true })

const targets = [
  { size: 192, name: 'icon-192.png', maskable: false },
  { size: 512, name: 'icon-512.png', maskable: false },
  { size: 512, name: 'icon-512-maskable.png', maskable: true },
]

for (const t of targets) {
  const png = draw(t.size, t.maskable)
  writeFileSync(`public/icons/${t.name}`, PNG.sync.write(png))
  console.log('wrote', t.name)
}
