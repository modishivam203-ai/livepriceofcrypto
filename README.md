# 🚀 LivePriceOfCrypto.com

Real-time cryptocurrency price tracker built with vanilla HTML, CSS & JavaScript. Powered by the free [CoinGecko API](https://www.coingecko.com/en/api).

![Live Preview](https://img.shields.io/badge/Status-Live-brightgreen) ![License](https://img.shields.io/badge/License-MIT-blue)

## ✨ Features

- 📊 **Live Prices** — 100+ cryptocurrencies with auto-refresh every 60 seconds
- 📈 **7-Day Sparklines** — Mini charts showing weekly price trends
- 🔍 **Search** — Instantly filter by coin name or symbol
- 💱 **Multi-Currency** — USD, EUR, INR, GBP, JPY, BTC
- 📱 **Fully Responsive** — Works on all devices
- 🌙 **Dark/Light Theme** — Toggle with one click, preference saved
- 🔃 **Sortable Columns** — Sort by rank, name, price, change, volume, market cap
- 📋 **Coin Details Modal** — Click any coin for detailed stats (ATH, ATL, supply)
- 🎯 **Global Market Stats** — Total market cap, volume, BTC dominance
- 📡 **Scrolling Ticker** — Top 15 coins in a live ticker bar
- ⚡ **Zero Dependencies** — Pure HTML/CSS/JS, no frameworks needed
- 🆓 **No API Key Required** — Uses CoinGecko's free public API

## 🛠️ Tech Stack

- **HTML5** + **CSS3** + **Vanilla JavaScript**
- **CoinGecko API** (free, no authentication)
- **GitHub Pages** (hosting)

## 🚀 Deployment (GitHub Pages)

1. Create a new GitHub repository (e.g., `livepriceofcrypto`)
2. Push this code:
   ```bash
   cd livepriceofcrypto
   git init
   git add .
   git commit -m "Initial commit - LivePriceOfCrypto.com"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/livepriceofcrypto.git
   git push -u origin main
   ```
3. Go to repo **Settings → Pages**
4. Source: Deploy from branch → `main` → `/ (root)` → Save
5. Add custom domain: `livepriceofcrypto.com`
6. In your domain DNS, add:
   - **A Records** (for apex domain):
     ```
     185.199.108.153
     185.199.109.153
     185.199.110.153
     185.199.111.153
     ```
   - **CNAME Record** (for www):
     ```
     www → YOUR_USERNAME.github.io
     ```
7. Wait 5-10 minutes for DNS propagation
8. Enable "Enforce HTTPS" in GitHub Pages settings

## 📁 Project Structure

```
livepriceofcrypto/
├── index.html     # Main HTML page (SEO optimized)
├── style.css      # Complete stylesheet (dark/light themes)
├── script.js      # API calls, rendering, interactions
├── CNAME          # Custom domain for GitHub Pages
└── README.md      # This file
```

## 📄 License

MIT License — free to use and modify.
