// scripts/generate-icons.mjs — gera ícones e splash screens PWA a partir de public/icon.png
// Cores lidas de theme.config.mjs — edite apenas lá para trocar a paleta
import sharp from 'sharp'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { theme } from '../theme.config.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const srcPath = resolve(__dirname, '../public/icon.png')

/** Converte hex (#RRGGBB) para objeto rgba usado pelo sharp */
function hexToRgb(hex) {
  const h = hex.replace('#', '')
  return { r: parseInt(h.slice(0,2),16), g: parseInt(h.slice(2,4),16), b: parseInt(h.slice(4,6),16), alpha: 1 }
}

// --- Ícones ---
const icons = [
  { name: 'favicon.ico',          size: 48  },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'pwa-192x192.png',      size: 192 },
  { name: 'pwa-512x512.png',      size: 512 },
]

for (const { name, size } of icons) {
  const outPath = resolve(__dirname, '../public', name)
  await sharp(srcPath).resize(size, size).png().toFile(outPath)
  console.log(`✓ ${name} (${size}x${size})`)
}

// --- Splash screens iOS (ícone centralizado em fundo brand-blue) ---
const ICON_SIZE = 192   // tamanho do ícone na splash
const BG = hexToRgb(theme.colorPrimary)

const splashes = [
  { name: 'splash-640x1136.png',   w: 640,  h: 1136 }, // iPhone SE
  { name: 'splash-750x1334.png',   w: 750,  h: 1334 }, // iPhone 8
  { name: 'splash-1170x2532.png',  w: 1170, h: 2532 }, // iPhone 12/13/14
  { name: 'splash-1290x2796.png',  w: 1290, h: 2796 }, // iPhone 14 Pro Max
  { name: 'splash-1668x2224.png',  w: 1668, h: 2224 }, // iPad Air
  { name: 'splash-2048x2732.png',  w: 2048, h: 2732 }, // iPad Pro 12.9"
]

const iconBuffer = await sharp(srcPath).resize(ICON_SIZE, ICON_SIZE).png().toBuffer()

for (const { name, w, h } of splashes) {
  const outPath = resolve(__dirname, '../public', name)
  await sharp({
    create: { width: w, height: h, channels: 4, background: BG }
  })
    .composite([{
      input: iconBuffer,
      gravity: 'centre',
    }])
    .png()
    .toFile(outPath)
  console.log(`✓ ${name} (${w}x${h})`)
}

console.log('Done.')
