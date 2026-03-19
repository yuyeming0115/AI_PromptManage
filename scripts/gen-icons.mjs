// Generate PNG icons using pure Node.js (no external deps)
// Uses a minimal PNG encoder to create solid-color circle icons

import { createWriteStream } from 'fs'
import { deflateSync } from 'zlib'

function createPNG(size) {
  const width = size
  const height = size
  const cx = size / 2
  const cy = size / 2
  const r = size / 2

  // RGBA pixel data
  const pixels = new Uint8Array(width * height * 4)

  // Background: transparent, circle: #6366f1, letter P drawn manually
  const bg = [0x63, 0x66, 0xf1, 255]   // indigo
  const white = [255, 255, 255, 255]

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const dx = x - cx
      const dy = y - cy
      const inCircle = dx * dx + dy * dy <= r * r
      const idx = (y * width + x) * 4
      if (inCircle) {
        pixels[idx] = bg[0]; pixels[idx+1] = bg[1]; pixels[idx+2] = bg[2]; pixels[idx+3] = bg[3]
      } else {
        pixels[idx] = 0; pixels[idx+1] = 0; pixels[idx+2] = 0; pixels[idx+3] = 0
      }
    }
  }

  // Draw letter "P" using a simple bitmap approach
  // Scale factor relative to 128px base
  const scale = size / 128
  const px = Math.round(38 * scale)  // left edge of P
  const py = Math.round(28 * scale)  // top of P
  const pw = Math.round(52 * scale)  // total width
  const ph = Math.round(72 * scale)  // total height
  const stemW = Math.round(14 * scale)
  const bowlH = Math.round(36 * scale)
  const bowlW = Math.round(38 * scale)
  const thick = Math.max(2, Math.round(4 * scale))

  function setPixel(x, y) {
    if (x < 0 || x >= width || y < 0 || y >= height) return
    const dx = x - cx, dy = y - cy
    if (dx*dx + dy*dy > r*r) return
    const idx = (y * width + x) * 4
    pixels[idx] = white[0]; pixels[idx+1] = white[1]; pixels[idx+2] = white[2]; pixels[idx+3] = white[3]
  }

  function fillRect(x, y, w, h) {
    for (let iy = y; iy < y + h; iy++)
      for (let ix = x; ix < x + w; ix++)
        setPixel(ix, iy)
  }

  // Vertical stem
  fillRect(px, py, stemW, ph)

  // Top horizontal bar
  fillRect(px, py, bowlW, thick)

  // Middle horizontal bar
  fillRect(px, py + bowlH, bowlW, thick)

  // Right side of bowl (vertical)
  fillRect(px + bowlW - thick, py, thick, bowlH + thick)

  // Build PNG
  const buf = []

  function write4(n) {
    buf.push((n >>> 24) & 0xff, (n >>> 16) & 0xff, (n >>> 8) & 0xff, n & 0xff)
  }

  function crc32(data) {
    let crc = 0xffffffff
    const table = crc32.table || (crc32.table = (() => {
      const t = new Uint32Array(256)
      for (let i = 0; i < 256; i++) {
        let c = i
        for (let j = 0; j < 8; j++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1)
        t[i] = c
      }
      return t
    })())
    for (const b of data) crc = table[(crc ^ b) & 0xff] ^ (crc >>> 8)
    return (crc ^ 0xffffffff) >>> 0
  }

  function chunk(type, data) {
    const typeBytes = [...type].map(c => c.charCodeAt(0))
    const combined = [...typeBytes, ...data]
    write4(data.length)
    buf.push(...typeBytes, ...data)
    write4(crc32(combined))
  }

  // PNG signature
  buf.push(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a)

  // IHDR
  const ihdr = []
  const push4 = (arr, n) => arr.push((n>>>24)&0xff,(n>>>16)&0xff,(n>>>8)&0xff,n&0xff)
  push4(ihdr, width); push4(ihdr, height)
  ihdr.push(8, 6, 0, 0, 0) // 8-bit RGBA
  chunk('IHDR', ihdr)

  // IDAT
  const raw = []
  for (let y = 0; y < height; y++) {
    raw.push(0) // filter type None
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4
      raw.push(pixels[i], pixels[i+1], pixels[i+2], pixels[i+3])
    }
  }
  const compressed = deflateSync(Buffer.from(raw))
  chunk('IDAT', [...compressed])

  // IEND
  chunk('IEND', [])

  return Buffer.from(buf)
}

import { writeFileSync, mkdirSync } from 'fs'
mkdirSync('public', { recursive: true })

for (const size of [16, 48, 128]) {
  const png = createPNG(size)
  writeFileSync(`public/icon-${size}.png`, png)
  console.log(`Generated public/icon-${size}.png (${png.length} bytes)`)
}
