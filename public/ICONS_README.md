# PWA Icons - À générer

## Icons requis

Pour que la PWA fonctionne correctement, vous devez générer les icons suivants :

- `icon-192x192.png` (192x192px)
- `icon-512x512.png` (512x512px)
- `apple-touch-icon.png` (180x180px)
- `favicon.ico`

## Générer les icons

### Option 1 : Utiliser RealFaviconGenerator (Recommandé)
1. Allez sur https://realfavicongenerator.net/
2. Uploadez le fichier `icon.svg`
3. Configurez les options :
   - **Android Chrome** : Sélectionnez "Assets" et choisissez les tailles 192x192 et 512x512
   - **iOS** : Choisissez 180x180
   - **Theme color** : #fbbf24
   - **Background color** : #0f172a
4. Générez et téléchargez
5. Placez tous les fichiers dans le dossier `public/`

### Option 2 : Utiliser ImageMagick
Si vous avez ImageMagick installé :

```bash
# Générer les PNG à partir du SVG
magick icon.svg -resize 192x192 icon-192x192.png
magick icon.svg -resize 512x512 icon-512x512.png
magick icon.svg -resize 180x180 apple-touch-icon.png
magick icon.svg -resize 32x32 favicon.ico
```

### Option 3 : Utiliser PWA Asset Generator
```bash
npx pwa-asset-generator icon.svg public/ --icon-only --favicon --type png
```

## Design recommandé

Le design actuel dans `icon.svg` représente :
- **Couronne dorée** : Symbole royal et du pouvoir
- **Cartes** : Représentent le jeu de cartes
- **Couleur gold (#fbbf24)** : Thème doré du jeu
- **Fond royal (#0f172a)** : Arrière-plan sombre élégant

N'hésitez pas à personnaliser le design selon vos préférences !
