# PWA (Progressive Web App) Setup

This app is configured as a PWA.

## What's Included

- ✅ PWA configuration in `next.config.ts`
- ✅ Manifest file at `public/manifest.json`
- ✅ Service Worker for offline caching
- ✅ App shortcuts for quick navigation

## Icons

The PWA requires PNG icons in various sizes. Currently, only an SVG placeholder is provided.

### To Generate PNG Icons

1. Open `public/icons/icon-512.svg` in a design tool (Figma, Canva, etc.)
2. Export as PNG in these sizes:
   - 72x72
   - 96x96
   - 128x128
   - 144x144
   - 152x152
   - 192x192
   - 384x384
   - 512x512

3. Save them to `public/icons/` folder as:
   - `icon-72.png`
   - `icon-96.png`
   - `icon-128.png`
   - `icon-144.png`
   - `icon-152.png`
   - `icon-192.png`
   - `icon-384.png`
   - `icon-512.png`

## Testing PWA

1. Deploy to Vercel
2. Open on a mobile device or Chrome DevTools
3. Look for "Install" prompt or use F12 → Application → Manifest

## Features

- **Installable**: Users can add to home screen
- **Offline Support**: Previously visited pages cached
- **Fast Loading**: Service worker caching
- **App-like**: Full-screen standalone mode
