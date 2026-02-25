# Sunset Ridge Retreat — Property Website

A beautiful, responsive informational website for your vacation rental property.

## 🚀 Quick Start

Just open `index.html` in your browser, or use any static file server:

```bash
npx serve .
```

## ✏️ Updating Content

**Edit `site-config.js`** — this is the only file you need to touch.

| What to update | Where in `site-config.js` |
|---|---|
| Property name & tagline | `propertyName`, `tagline` |
| Announcement banner | `banner.message`, `banner.enabled` |
| Hero image & text | `hero` section |
| About text | `about.paragraphs` |
| Photos | `gallery.images` — add `{ src: "...", alt: "..." }` |
| Amenities | `amenities.categories` |
| Reviews | `reviews.items` — add new ones at the top |
| Contact info | `contact` section |

### Adding a photo

1. Place your image file in `assets/images/`
2. Add an entry to `gallery.images` in `site-config.js`:
```js
{ src: "assets/images/my-new-photo.jpg", alt: "Description of photo" }
```

### Toggling the banner

Set `banner.enabled` to `true` or `false`:
```js
banner: {
  enabled: true,  // change to false to hide
  message: "Your message here!",
},
```

## 🌐 Deploying for Free

### Option 1: Netlify (easiest)
1. Go to [netlify.com](https://netlify.com), sign up free
2. Drag & drop the project folder onto the dashboard
3. Done! You'll get a URL like `your-site.netlify.app`

### Option 2: GitHub Pages
1. Create a GitHub repo and push this code
2. Go to Settings → Pages → Source: `main` branch
3. Your site will be at `username.github.io/repo-name`

### Custom Domain (~$10-15/year)
After deploying, follow your hosting provider's docs to add a custom domain like `sunsetridgeretreat.com`.

## 📁 File Structure

```
├── index.html          ← Page structure (rarely needs changes)
├── style.css           ← All styles (customize colors via CSS variables at the top)
├── main.js             ← All interactivity (no changes needed)
├── site-config.js      ← ★ ALL YOUR CONTENT LIVES HERE
├── assets/images/      ← Your property photos
└── README.md           ← This file
```
