# ZOCO Website

Minimal, bold, and designer-oriented custom apparel website for **Zoco**.

## 🚀 Quick Start
Open `index.html` in a browser.

## 📦 Structure
```
zoco-site/
├─ index.html
├─ quote.html
├─ assets/
│  ├─ css/styles.css
│  ├─ js/main.js
│  ├─ img/            (logo + gallery images)
│  └─ banner/         (hero banner placeholder)
└─ README.md
```

## 🎨 Edit
- Colors/gradients: `assets/css/styles.css` (variables in `:root`).
- Images: replace `assets/img/gallery-1.jpg … gallery-6.jpg`.
- Banner: replace `assets/banner/banner-placeholder.png`.

## ☁️ Deploy to GitHub Pages
1. Create a repo on GitHub named **zoco-site** (or your choice).
2. Push this folder:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/Ahmed-SMA/zoco-site.git
   git push -u origin main
   ```
3. On GitHub: **Settings → Pages → Deploy from branch**, select `main` and `/ (root)`.
4. Your site will be live at: https://Ahmed-SMA.github.io/zoco-site/

## 🧩 Notes
- Lead capture saves to the browser and can be exported as CSV.
- Location dialog includes province → city selection.
- No build tools; pure HTML/CSS/JS.
