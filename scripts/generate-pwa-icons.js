/**
 * Script pour générer des icons PWA de base à partir du SVG
 * Nécessite sharp: npm install -D sharp
 *
 * Usage: node scripts/generate-pwa-icons.js
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Créer des placeholders simples
const createPlaceholderIcon = (size, outputPath) => {
  // Pour l'instant, créer un fichier texte qui servira de rappel
  const content = `PWA Icon Placeholder (${size}x${size})

Remplacez ce fichier par une vraie image PNG de ${size}x${size} pixels.

Utilisez l'une des méthodes suivantes :
1. https://realfavicongenerator.net/ (Recommandé)
2. ImageMagick: magick icon.svg -resize ${size}x${size} ${path.basename(outputPath)}
3. PWA Asset Generator: npx pwa-asset-generator icon.svg public/

Design recommandé : Couronne dorée (#fbbf24) sur fond royal (#0f172a)
`

  fs.writeFileSync(outputPath, content, 'utf8')
  console.log(`✓ Placeholder créé: ${path.basename(outputPath)}`)
}

const publicDir = path.join(__dirname, '..', 'public')

// Créer les placeholders
const icons = [
  { size: 192, name: 'icon-192x192.png' },
  { size: 512, name: 'icon-512x512.png' },
  { size: 180, name: 'apple-touch-icon.png' },
  { size: 32, name: 'favicon.ico' }
]

console.log('Génération des placeholders d\'icons PWA...\n')

icons.forEach(icon => {
  const outputPath = path.join(publicDir, icon.name)
  createPlaceholderIcon(icon.size, outputPath)
})

console.log('\n✅ Placeholders créés avec succès!')
console.log('\n⚠️  IMPORTANT: Ces fichiers sont des placeholders temporaires.')
console.log('   Générez de vraies images PNG avant de déployer en production.')
console.log('   Voir public/ICONS_README.md pour les instructions.\n')
