# 💎 Block Puzzle Rush

A vibrant, addictive 10x10 jewel polyomino block puzzle web game built with pure vanilla JavaScript, HTML5 DOM grid, and the Web Audio API. Drag block shapes onto the board, fill complete horizontal rows and vertical columns to vaporize them, build streak multipliers, and chase record high scores.

Part of the [Gamility](https://mahesh-yennam.github.io/Gamility/) web games collection. Fully configured to run as an **independent standalone repository** on GitHub Pages or embedded directly within the Gamility portal.

---

## 🚀 1-Click GitHub Pages Deployment

To host this repository independently on GitHub Pages:
1. Initialize a new GitHub repository (e.g. `https://github.com/Mahesh-Yennam/block-puzzle-rush`).
2. Push all files from this folder directly into the repository root:
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Block Puzzle Rush Standalone"
   git branch -M main
   git remote add origin https://github.com/Mahesh-Yennam/block-puzzle-rush.git
   git push -u origin main
   ```
3. On GitHub, navigate to **Settings** > **Pages**.
4. Under **Source / Branch**, select `main` and root `/`, then click **Save**.
5. Your standalone game is instantly live at `https://<your-username>.github.io/block-puzzle-rush/`!

---

## 📁 Repository Structure

```text
block-puzzle-rush/
├── index.html        # Game layout, 10x10 grid, tray, and Schema.org JSON-LD
├── style.css         # Neon jewel styles, glowing blocks, ghost drag previews
├── game.js           # Polyomino placement engine, line clear & Web Audio SFX
├── favicon.svg       # Dedicated jewel polyomino vector SVG favicon
├── site.webmanifest  # Progressive Web App (PWA) manifest for mobile install
├── robots.txt        # Search engine crawler configuration
├── sitemap.xml       # Standalone XML sitemap
├── .gitignore        # Standard web gitignore
└── README.md         # Documentation & deployment guide
```

---

## 🎮 How to Play

- **Objective:** Place shapes from the bottom tray onto the 10x10 board to completely fill horizontal rows or vertical columns. Clear lines to stay alive and score big.
- **Placement Controls:**
  - **Drag and Drop:** Touch or click-and-drag any piece from the tray onto the board with automatic ghost cell preview.
  - **Click to Place:** Tap a piece to select it, then tap any valid board square to drop it immediately.
- **Tray Refresh:** Once all 3 shapes in your tray are placed, a fresh batch of 3 new polyominoes is automatically dealt.
- **Game Over:** If none of the remaining pieces in your tray can fit anywhere on the board, the game ends.

### ⚡ Scoring & Combos

| Clear Type | Base Points | Bonus |
| :--- | :---: | :--- |
| **Single Line** | 100 Pts | Standard line clear. |
| **Double Clear** | 300 Pts | Clear 2 lines simultaneously. |
| **Triple Clear** | 600 Pts | Clear 3 lines simultaneously. |
| **Mega Clear (4+)** | 1,000+ Pts | Clear 4 or more lines at once. |
| **Streak Multiplier** | Up to 5x | Clear lines on consecutive turns to multiply all points! |

---

## ✨ Features

- **Pure Vanilla Web Tech:** Zero dependencies, zero external libraries, zero build tools.
- **Dual Input Architecture:** Supports both fluid touch/mouse drag-and-drop and one-tap click-to-place accessibility.
- **Smart Placement Preview:** Live green/red ghost highlighting shows exactly where a piece will land before releasing.
- **Satisfying Visuals & Audio:** Sparkling row clearance flash animations and harmonic synthesizer chords generated via the Web Audio API.
- **Persistent High Scores:** Automatically saves your personal best score in `localStorage`.
- **SEO & PWA Ready:** Includes dedicated `favicon.svg`, `site.webmanifest`, `robots.txt`, `sitemap.xml`, and Schema.org structured data.

---

## 💻 Local Development

Run with any local static HTTP server or simply double-click `index.html`:

```bash
# Using Python
python -m http.server 8080

# Using Node.js npx
npx serve .
```

Then visit `http://localhost:8080` in your web browser.

---

## 📄 Copyright & Terms

Copyright © 2026 Gamility. All rights reserved.
This repository and its source code are proprietary. Unauthorized copying, distribution, or commercial reuse without explicit permission is strictly prohibited.
