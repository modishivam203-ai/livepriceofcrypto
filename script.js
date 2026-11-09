/* ========================================================
   LivePriceOfCrypto.com — Forex Factory Edition Engine
   - 1-Second Binance WebSocket Real-Time Broadcast Stream
   - Top 5 Major Cryptos Highlight Cards (BTC, ETH, SOL, BNB, XRP)
   - Top 5 Gainers & Top 5 Losers (24h Momentum)
   - Main Table: Top 10 by Default + Show More (Top 100)
   - Direct Google News Live Wire RSS Syndication API
   - Forex Factory Style Daily Economic Calendar
   ======================================================== */

// ─── Configuration ───
const CG_API = 'https://api.coingecko.com/api/v3';
const GOOGLE_NEWS_RSS = 'https://news.google.com/rss/search?q=cryptocurrency+bitcoin&hl=en-US&gl=US&ceid=US:en';
const RSS2JSON_API = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(GOOGLE_NEWS_RSS)}`;
const CRYPTOCOMPARE_NEWS_API = 'https://min-api.cryptocompare.com/data/v2/news/?lang=EN';
const BINANCE_WS_URL = 'wss://stream.binance.com:9443/ws/!miniTicker@arr';
const NEWS_REFRESH_INTERVAL = 60; // seconds

// ─── State ───
let allCoins = [];
let isExpandedTo100 = false; // default top 10
let currentCurrency = 'usd';
let sortField = 'market_cap_rank';
let sortAsc = true;
let previousPrices = {};
let currencyRates = { usd: 1, inr: 86.5, eur: 0.92, gbp: 0.79, jpy: 154.0, btc: 1 };
let wsSocket = null;
let newsCountdown = NEWS_REFRESH_INTERVAL;
let newsTimerInterval = null;
let calendarWidgetLoaded = false;

// ─── Currency Symbols ───
const currencySymbols = {
    usd: '$', inr: '₹', eur: '€', gbp: '£', jpy: '¥', btc: '₿'
};

const MAJOR_SYMBOLS = ['btc', 'eth', 'sol', 'bnb', 'xrp'];

// ─── DOM Elements ───
const tableBody = document.getElementById('tableBody');
const loading = document.getElementById('loading');
const errorState = document.getElementById('errorState');
const searchInput = document.getElementById('searchInput');
const currencySelect = document.getElementById('currencySelect');
const ticker = document.getElementById('ticker');
const majorCoinsGrid = document.getElementById('majorCoinsGrid');
const gainersList = document.getElementById('gainersList');
const losersList = document.getElementById('losersList');
const googleNewsGrid = document.getElementById('googleNewsGrid');
const newsTimerEl = document.getElementById('newsTimer');
const btnRefreshNews = document.getElementById('btnRefreshNews');
const btnToggleExpand = document.getElementById('btnToggleExpand');
const expandBtnText = document.getElementById('expandBtnText');
const expandBtnIcon = document.getElementById('expandBtnIcon');
const tableCountBadge = document.getElementById('tableCountBadge');
const backToTop = document.getElementById('backToTop');
const themeToggle = document.getElementById('themeToggle');
const themeBtnText = document.getElementById('themeBtnText');
const modalOverlay = document.getElementById('modalOverlay');
const modalClose = document.getElementById('modalClose');
const modalContent = document.getElementById('modalContent');
const ffClock = document.getElementById('ffClock');

// ─── Initialization ───
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    setupEventListeners();
    startClock();
    fetchGlobalData();
    fetchExchangeRates();
    fetchData();
    fetchGoogleNews();
    initBinanceWebSocket();
    startNewsTimer();
    loadEconomicCalendarWidget();
});

// ─── Real-Time GMT Clock ───
function startClock() {
    setInterval(() => {
        if (ffClock) {
            const now = new Date();
            ffClock.textContent = now.toUTCString().replace('GMT', 'UTC').split(' ').slice(4, 6).join(' ');
        }
    }, 1000);
}

// ─── Theme Management ───
function initTheme() {
    const saved = localStorage.getItem('theme') || 'ff-dark';
    document.body.setAttribute('data-theme', saved);
    updateThemeBtn(saved);
}

function toggleTheme() {
    const current = document.body.getAttribute('data-theme') || 'ff-dark';
    const next = current === 'ff-dark' ? 'ff-light' : 'ff-dark';
    document.body.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    updateThemeBtn(next);

    // Refresh TradingView widget
    calendarWidgetLoaded = false;
    const container = document.getElementById('economicCalendarWidget');
    if (container) {
        container.innerHTML = '<div class="tradingview-widget-container__widget" style="width: 100%; height: 750px;"></div>';
        loadEconomicCalendarWidget();
    }
}

function updateThemeBtn(theme) {
    if (themeBtnText) {
        themeBtnText.textContent = theme === 'ff-dark' ? '☀️ Light' : '🌙 Dark';
    }
}

// ─── Event Listeners ───
function setupEventListeners() {
    themeToggle.addEventListener('click', toggleTheme);
    searchInput.addEventListener('input', debounce(filterTable, 200));

    currencySelect.addEventListener('change', () => {
        currentCurrency = currencySelect.value;
        fetchData();
    });

    // Expand / Collapse Table
    btnToggleExpand.addEventListener('click', () => {
        isExpandedTo100 = !isExpandedTo100;
        if (isExpandedTo100) {
            expandBtnText.textContent = 'Show Less (Collapse to Top 10)';
            expandBtnIcon.textContent = '▲';
            if (tableCountBadge) tableCountBadge.textContent = 'Top 100 Assets';
        } else {
            expandBtnText.textContent = 'Show More (Expand to Top 100 Cryptos)';
            expandBtnIcon.textContent = '▼';
            if (tableCountBadge) tableCountBadge.textContent = 'Top 10 Assets';
        }
        sortAndRender();
    });

    // Sorting
    document.querySelectorAll('.sortable').forEach(th => {
        th.addEventListener('click', () => {
            const field = th.dataset.sort;
            if (sortField === field) {
                sortAsc = !sortAsc;
            } else {
                sortField = field;
                sortAsc = field === 'market_cap_rank' || field === 'name';
            }
            sortAndRender();
            updateSortIndicators();
        });
    });

    // Modal
    modalClose.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) closeModal();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });

    // Scroll back to top
    window.addEventListener('scroll', () => {
        backToTop.classList.toggle('visible', window.scrollY > 400);
    });
    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Manual Refresh News
    if (btnRefreshNews) {
        btnRefreshNews.addEventListener('click', () => {
            fetchGoogleNews();
            resetNewsTimer();
        });
    }
}

// ─── TradingView Economic Calendar (Forex Factory Style) ───
function loadEconomicCalendarWidget() {
    if (calendarWidgetLoaded) return;
    calendarWidgetLoaded = true;

    const container = document.getElementById('economicCalendarWidget');
    if (!container) return;

    const isLight = document.body.getAttribute('data-theme') === 'ff-light';

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-events.js';
    script.async = true;
    script.innerHTML = JSON.stringify({
        "colorTheme": isLight ? "light" : "dark",
        "isTransparent": false,
        "width": "100%",
        "height": "750",
        "locale": "en",
        "importanceFilter": "-1,0,1",
        "currencyFilter": "USD,EUR,GBP,JPY,CNY,INR"
    });
    container.appendChild(script);
}

// ─── Exchange Rates ───
async function fetchExchangeRates() {
    try {
        const res = await fetch(`${CG_API}/exchange_rates`);
        if (!res.ok) return;
        const data = await res.json();
        const rates = data.rates;
        const btcToUsd = rates?.usd?.value || 1;

        if (rates.inr) currencyRates.inr = rates.inr.value / btcToUsd;
        if (rates.eur) currencyRates.eur = rates.eur.value / btcToUsd;
        if (rates.gbp) currencyRates.gbp = rates.gbp.value / btcToUsd;
        if (rates.jpy) currencyRates.jpy = rates.jpy.value / btcToUsd;
        currencyRates.usd = 1;
        currencyRates.btc = 1 / btcToUsd;
    } catch (e) {
        console.warn('Rates fallback used:', e);
    }
}

// ─── Global Stats ───
async function fetchGlobalData() {
    try {
        const res = await fetch(`${CG_API}/global`);
        if (!res.ok) return;
        const data = await res.json();
        const g = data.data;

        document.getElementById('totalCryptos').textContent = (g.active_cryptocurrencies || 0).toLocaleString();
        document.getElementById('totalMarketCap').textContent = '$' + formatCompact(g.total_market_cap?.usd || 0);
        document.getElementById('totalVolume').textContent = '$' + formatCompact(g.total_volume?.usd || 0);
        document.getElementById('btcDominance').textContent = (g.market_cap_percentage?.btc || 0).toFixed(1) + '%';
    } catch (e) {
        console.warn('Global fetch fallback:', e);
    }
}

// ─── Fetch Coin Data via CoinGecko REST (Top 100) ───
async function fetchData() {
    showLoading(true);
    errorState.style.display = 'none';

    try {
        const url = `${CG_API}/coins/markets?vs_currency=${currentCurrency}&order=market_cap_desc&per_page=100&page=1&sparkline=true&price_change_percentage=1h,24h,7d`;
        const res = await fetch(url);

        if (res.status === 429) {
            console.warn('REST rate limited, retrying in 12s...');
            setTimeout(fetchData, 12000);
            return;
        }

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();
        allCoins = data;

        data.forEach(c => {
            previousPrices[c.id] = c.current_price;
        });

        renderMajorCoins(data);
        renderGainersAndLosers(data);
        sortAndRender();
        updateTicker(data.slice(0, 15));

        showLoading(false);
    } catch (err) {
        console.error('Fetch error:', err);
        showLoading(false);
        if (allCoins.length === 0) {
            errorState.style.display = 'block';
        }
    }
}

// ─── 1. RENDER TOP 5 MAJOR CRYPTOS (BTC, ETH, SOL, BNB, XRP) ───
function renderMajorCoins(coins) {
    if (!majorCoinsGrid) return;
    const sym = currencySymbols[currentCurrency] || '';

    // Find major coins in order
    const majors = [];
    MAJOR_SYMBOLS.forEach(s => {
        const found = coins.find(c => c.symbol.toLowerCase() === s);
        if (found) majors.push(found);
    });

    if (majors.length === 0) return;

    majorCoinsGrid.innerHTML = majors.map(coin => {
        const change = coin.price_change_percentage_24h || 0;
        const changeClass = change >= 0 ? 'change-positive' : 'change-negative';
        const changeBadgeClass = change >= 0 ? 'gl-tag green' : 'gl-tag red';
        const sign = change >= 0 ? '+' : '';

        return `
            <div class="ff-major-card" data-coin-id="${coin.id}">
                <div class="ff-major-top">
                    <div class="ff-major-coin">
                        <img src="${coin.image}" alt="${coin.name}">
                        <div>
                            <div class="ff-major-name">${escapeHtml(coin.name)}</div>
                            <div class="ff-major-symbol">${coin.symbol.toUpperCase()} / ${currentCurrency.toUpperCase()}</div>
                        </div>
                    </div>
                    <span class="${changeBadgeClass}">${sign}${change.toFixed(2)}%</span>
                </div>
                <div class="ff-major-price" id="major-price-${coin.id}">
                    ${sym}${formatPrice(coin.current_price)}
                </div>
                <div class="ff-major-footer">
                    <span>24h High: ${sym}${formatPrice(coin.high_24h)}</span>
                    <span>Low: ${sym}${formatPrice(coin.low_24h)}</span>
                </div>
            </div>
        `;
    }).join('');

    // Attach click to open modal
    majorCoinsGrid.querySelectorAll('.ff-major-card').forEach(card => {
        card.addEventListener('click', () => {
            const coin = allCoins.find(c => c.id === card.dataset.coinId);
            if (coin) openModal(coin);
        });
    });
}

// ─── 2. RENDER TOP 5 GAINERS & TOP 5 LOSERS (24H) ───
function renderGainersAndLosers(coins) {
    if (!gainersList || !losersList) return;
    const sym = currencySymbols[currentCurrency] || '';

    // Filter valid 24h change
    const valid = coins.filter(c => c.price_change_percentage_24h != null);

    // Sort for top 5 gainers
    const gainers = [...valid].sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h).slice(0, 5);

    // Sort for top 5 losers
    const losers = [...valid].sort((a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h).slice(0, 5);

    // Render Gainers
    gainersList.innerHTML = gainers.map((coin, i) => `
        <div class="ff-gl-row" data-coin-id="${coin.id}">
            <div class="gl-coin-info">
                <span class="gl-rank">#${i + 1}</span>
                <img class="gl-img" src="${coin.image}" alt="${coin.name}" loading="lazy">
                <div>
                    <span class="gl-name">${escapeHtml(coin.name)}</span>
                    <span class="gl-symbol">${coin.symbol}</span>
                </div>
            </div>
            <div class="gl-price-info">
                <div class="gl-price">${sym}${formatPrice(coin.current_price)}</div>
                <span class="gl-badge gl-tag green">+${coin.price_change_percentage_24h.toFixed(2)}%</span>
            </div>
        </div>
    `).join('');

    // Render Losers
    losersList.innerHTML = losers.map((coin, i) => `
        <div class="ff-gl-row" data-coin-id="${coin.id}">
            <div class="gl-coin-info">
                <span class="gl-rank">#${i + 1}</span>
                <img class="gl-img" src="${coin.image}" alt="${coin.name}" loading="lazy">
                <div>
                    <span class="gl-name">${escapeHtml(coin.name)}</span>
                    <span class="gl-symbol">${coin.symbol}</span>
                </div>
            </div>
            <div class="gl-price-info">
                <div class="gl-price">${sym}${formatPrice(coin.current_price)}</div>
                <span class="gl-badge gl-tag red">${coin.price_change_percentage_24h.toFixed(2)}%</span>
            </div>
        </div>
    `).join('');

    // Attach click to open modal
    document.querySelectorAll('.ff-gl-row').forEach(row => {
        row.addEventListener('click', () => {
            const coin = allCoins.find(c => c.id === row.dataset.coinId);
            if (coin) openModal(coin);
        });
    });
}

// ─── 3. BINANCE WEBSOCKET: 1-SECOND REAL-TIME BROADCAST STREAM ───
function initBinanceWebSocket() {
    if (wsSocket) {
        try { wsSocket.close(); } catch(e){}
    }

    try {
        wsSocket = new WebSocket(BINANCE_WS_URL);

        wsSocket.onopen = () => {
            console.log('✅ Connected to Binance 1-second WebSocket stream');
        };

        wsSocket.onmessage = (event) => {
            try {
                const tickers = JSON.parse(event.data);
                if (!Array.isArray(tickers)) return;
                handleLiveTickers(tickers);
            } catch (err) {
                console.error('WebSocket parse error:', err);
            }
        };

        wsSocket.onerror = (err) => {
            console.warn('WebSocket error, retrying in 5s:', err);
        };

        wsSocket.onclose = () => {
            console.log('WebSocket closed, attempting reconnect in 5s...');
            setTimeout(initBinanceWebSocket, 5000);
        };
    } catch (e) {
        console.warn('WebSocket init failed:', e);
    }
}

function handleLiveTickers(tickers) {
    if (!allCoins || allCoins.length === 0) return;

    const rate = currencyRates[currentCurrency] || 1;
    let tickerMap = new Map();

    tickers.forEach(t => {
        if (t.s && t.s.endsWith('USDT')) {
            const symbol = t.s.replace('USDT', '').toLowerCase();
            tickerMap.set(symbol, {
                priceUsd: parseFloat(t.c),
                highUsd: parseFloat(t.h),
                lowUsd: parseFloat(t.l),
                openUsd: parseFloat(t.o)
            });
        }
    });

    allCoins.forEach(coin => {
        const sym = coin.symbol.toLowerCase();
        if (tickerMap.has(sym)) {
            const data = tickerMap.get(sym);
            const newPrice = data.priceUsd * rate;
            const oldPrice = coin.current_price;

            if (newPrice && oldPrice && Math.abs(newPrice - oldPrice) > 0.00000001) {
                const isUp = newPrice > oldPrice;
                coin.current_price = newPrice;

                if (data.openUsd > 0) {
                    coin.price_change_percentage_24h = ((data.priceUsd - data.openUsd) / data.openUsd) * 100;
                }

                // Update Table Row
                updateLivePriceCell(coin.id, newPrice, isUp, coin.price_change_percentage_24h);
                // Update Major Hero Cards
                updateLiveMajorCard(coin.id, newPrice, isUp);
                // Update Ticker
                updateLiveTickerItem(coin.id, newPrice, isUp);
            }
        }
    });
}

function updateLivePriceCell(coinId, newPrice, isUp, change24h) {
    const row = document.querySelector(`tr[data-coin-id="${coinId}"]`);
    if (!row) return;

    const priceCell = row.querySelector('.price-cell');
    if (priceCell) {
        const sym = currencySymbols[currentCurrency] || '';
        priceCell.textContent = `${sym}${formatPrice(newPrice)}`;

        priceCell.classList.remove('price-flash-up', 'price-flash-down');
        void priceCell.offsetWidth;
        priceCell.classList.add(isUp ? 'price-flash-up' : 'price-flash-down');

        setTimeout(() => {
            priceCell.classList.remove('price-flash-up', 'price-flash-down');
        }, 500);
    }

    if (change24h !== undefined) {
        const changeCell = row.querySelector('.td-24h-change');
        if (changeCell) {
            changeCell.className = `td-24h-change ${changeClass(change24h)}`;
            changeCell.textContent = formatChange(change24h);
        }
    }
}

function updateLiveMajorCard(coinId, newPrice, isUp) {
    const el = document.getElementById(`major-price-${coinId}`);
    if (el) {
        const sym = currencySymbols[currentCurrency] || '';
        el.textContent = `${sym}${formatPrice(newPrice)}`;
        el.classList.remove('price-flash-up', 'price-flash-down');
        void el.offsetWidth;
        el.classList.add(isUp ? 'price-flash-up' : 'price-flash-down');
        setTimeout(() => {
            el.classList.remove('price-flash-up', 'price-flash-down');
        }, 500);
    }
}

function updateLiveTickerItem(coinId, newPrice, isUp) {
    const tickerItems = document.querySelectorAll(`.ticker-item[data-coin-id="${coinId}"]`);
    tickerItems.forEach(item => {
        const priceEl = item.querySelector('.ticker-price');
        if (priceEl) {
            const sym = currencySymbols[currentCurrency] || '';
            priceEl.textContent = `${sym}${formatPrice(newPrice)}`;
            priceEl.style.color = isUp ? 'var(--green)' : 'var(--red)';
            setTimeout(() => { priceEl.style.color = 'var(--text-primary)'; }, 600);
        }
    });
}

// ─── 4. DIRECT GOOGLE NEWS LIVE WIRE RSS API (AUTO-REFRESH EVERY 60S) ───
async function fetchGoogleNews() {
    try {
        // Attempt 1: Direct Google News RSS via rss2json
        const res = await fetch(RSS2JSON_API);
        if (res.ok) {
            const data = await res.json();
            if (data.status === 'ok' && data.items && data.items.length > 0) {
                renderGoogleNews(data.items.slice(0, 12));
                return;
            }
        }
        // Fallback: CryptoCompare News
        fallbackCryptoNews();
    } catch (err) {
        console.warn('Google News fetch fallback:', err);
        fallbackCryptoNews();
    }
}

async function fallbackCryptoNews() {
    try {
        const res = await fetch(CRYPTOCOMPARE_NEWS_API);
        if (!res.ok) throw new Error('Fallback failed');
        const json = await res.json();
        const articles = (json.Data || []).map(a => ({
            title: a.title,
            description: a.body,
            link: a.url,
            pubDate: new Date(a.published_on * 1000).toISOString(),
            author: a.source_info?.name || a.source || 'Crypto News'
        }));
        renderGoogleNews(articles.slice(0, 12));
    } catch (e) {
        googleNewsGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align:center; padding: 40px; color: var(--text-muted);">
                <p>Unable to connect to Google News stream. Retrying...</p>
                <button class="ff-btn" onclick="fetchGoogleNews()">Retry Stream</button>
            </div>
        `;
    }
}

function renderGoogleNews(items) {
    if (!items || items.length === 0) {
        googleNewsGrid.innerHTML = `
            <div style="grid-column:1 / -1; text-align:center; padding:30px; color:var(--text-muted);">
                No breaking news articles available.
            </div>`;
        return;
    }

    googleNewsGrid.innerHTML = items.map(item => {
        const timeAgo = formatPubDate(item.pubDate);
        const sourceName = item.author || extractSourceFromTitle(item.title) || 'Google News';
        const cleanTitle = cleanNewsTitle(item.title);
        const cleanDesc = cleanHtml(item.description || '');

        return `
            <article class="ff-news-card fade-in">
                <div class="ff-news-meta">
                    <span class="ff-news-source">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9v-2h2v2zm0-4H9V7h2v5z"/></svg>
                        ${escapeHtml(sourceName)}
                    </span>
                    <span>${timeAgo}</span>
                </div>
                <h4 class="ff-news-title">${escapeHtml(cleanTitle)}</h4>
                <p class="ff-news-snippet">${escapeHtml(cleanDesc)}</p>
                <a href="${item.link}" target="_blank" rel="noopener noreferrer" class="ff-news-link">
                    Read Full Google Dispatch →
                </a>
            </article>
        `;
    }).join('');
}

function startNewsTimer() {
    newsTimerInterval = setInterval(() => {
        newsCountdown--;
        if (newsTimerEl) newsTimerEl.textContent = newsCountdown + 's';

        if (newsCountdown <= 0) {
            fetchGoogleNews();
            resetNewsTimer();
        }
    }, 1000);
}

function resetNewsTimer() {
    newsCountdown = NEWS_REFRESH_INTERVAL;
    if (newsTimerEl) newsTimerEl.textContent = NEWS_REFRESH_INTERVAL + 's';
}

function formatPubDate(dateStr) {
    if (!dateStr) return 'Just now';
    const date = new Date(dateStr);
    const diff = Math.floor((Date.now() - date.getTime()) / 1000);

    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

function extractSourceFromTitle(title) {
    if (!title) return 'Google News';
    const parts = title.split(' - ');
    return parts.length > 1 ? parts[parts.length - 1] : 'Google News';
}

function cleanNewsTitle(title) {
    if (!title) return '';
    const parts = title.split(' - ');
    return parts.length > 1 ? parts.slice(0, -1).join(' - ') : title;
}

function cleanHtml(str) {
    const tmp = document.createElement('div');
    tmp.innerHTML = str;
    return tmp.textContent || tmp.innerText || '';
}

// ─── 5. SORT & RENDER TABLE (TOP 10 OR EXPANDED TOP 100) ───
function sortAndRender() {
    const sorted = [...allCoins].sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];

        if (valA == null) valA = sortField === 'name' ? '' : -Infinity;
        if (valB == null) valB = sortField === 'name' ? '' : -Infinity;

        if (typeof valA === 'string') {
            return sortAsc
                ? valA.localeCompare(valB)
                : valB.localeCompare(valA);
        }
        return sortAsc ? valA - valB : valB - valA;
    });

    // Top 10 by default, or 100 when expanded
    const displayCoins = isExpandedTo100 ? sorted : sorted.slice(0, 10);
    renderTable(displayCoins);
}

function updateSortIndicators() {
    document.querySelectorAll('.sortable').forEach(th => {
        th.classList.remove('sorted', 'desc');
        if (th.dataset.sort === sortField) {
            th.classList.add('sorted');
            if (!sortAsc) th.classList.add('desc');
        }
    });
}

function renderTable(coins) {
    const search = searchInput.value.toLowerCase().trim();
    const filtered = search
        ? allCoins.filter(c =>
            c.name.toLowerCase().includes(search) ||
            c.symbol.toLowerCase().includes(search)
        )
        : coins;

    if (filtered.length === 0 && search) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="9" style="text-align:center; padding:35px; color:var(--text-muted);">
                    No coins found matching "<strong>${escapeHtml(search)}</strong>"
                </td>
            </tr>`;
        return;
    }

    const sym = currencySymbols[currentCurrency] || '';

    tableBody.innerHTML = filtered.map((coin, i) => {
        return `
        <tr class="fade-in" style="animation-delay:${Math.min(i * 12, 300)}ms" data-coin-id="${coin.id}">
            <td class="td-rank">${coin.market_cap_rank || '-'}</td>
            <td>
                <div class="coin-cell">
                    <img class="coin-img" src="${coin.image}" alt="${coin.name}" loading="lazy" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 40 40%22><circle cx=%2220%22 cy=%2220%22 r=%2220%22 fill=%22%23333%22/><text x=%2220%22 y=%2225%22 text-anchor=%22middle%22 fill=%22white%22 font-size=%2216%22>${coin.symbol?.charAt(0)?.toUpperCase() || '?'}</text></svg>'">
                    <div>
                        <div class="coin-name">${escapeHtml(coin.name)}</div>
                        <span class="coin-symbol">${coin.symbol}</span>
                    </div>
                </div>
            </td>
            <td class="price-cell">${sym}${formatPrice(coin.current_price)}</td>
            <td class="${changeClass(coin.price_change_percentage_1h_in_currency)}">${formatChange(coin.price_change_percentage_1h_in_currency)}</td>
            <td class="td-24h-change ${changeClass(coin.price_change_percentage_24h)}">${formatChange(coin.price_change_percentage_24h)}</td>
            <td class="${changeClass(coin.price_change_percentage_7d_in_currency)}">${formatChange(coin.price_change_percentage_7d_in_currency)}</td>
            <td class="volume-cell">${sym}${formatCompact(coin.total_volume)}</td>
            <td class="mcap-cell">${sym}${formatCompact(coin.market_cap)}</td>
            <td class="sparkline-cell">${coin.sparkline_in_7d?.price ? '' : '-'}</td>
        </tr>`;
    }).join('');

    // Sparklines
    filtered.forEach(coin => {
        if (coin.sparkline_in_7d?.price) {
            const row = tableBody.querySelector(`tr[data-coin-id="${coin.id}"]`);
            if (row) {
                const cell = row.querySelector('.sparkline-cell');
                const canvas = document.createElement('canvas');
                canvas.width = 110;
                canvas.height = 34;
                canvas.style.width = '110px';
                canvas.style.height = '34px';
                cell.innerHTML = '';
                cell.appendChild(canvas);
                drawSparkline(canvas, coin.sparkline_in_7d.price, coin.price_change_percentage_7d_in_currency);
            }
        }
    });

    // Row click → modal
    tableBody.querySelectorAll('tr[data-coin-id]').forEach(row => {
        row.addEventListener('click', () => {
            const coinId = row.dataset.coinId;
            const coin = allCoins.find(c => c.id === coinId);
            if (coin) openModal(coin);
        });
    });
}

function drawSparkline(canvas, prices, change) {
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    const padding = 3;

    const step = Math.max(1, Math.floor(prices.length / 45));
    const sampled = prices.filter((_, i) => i % step === 0);

    const min = Math.min(...sampled);
    const max = Math.max(...sampled);
    const range = max - min || 1;

    const color = (change || 0) >= 0 ? '#10b981' : '#f43f5e';

    ctx.clearRect(0, 0, w, h);
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.4;
    ctx.lineJoin = 'round';

    sampled.forEach((price, i) => {
        const x = padding + (i / (sampled.length - 1)) * (w - 2 * padding);
        const y = h - padding - ((price - min) / range) * (h - 2 * padding);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    });
    ctx.stroke();
}

// ─── Ticker Tape ───
function updateTicker(topCoins) {
    const sym = currencySymbols[currentCurrency] || '';
    const items = topCoins.map(coin => `
        <div class="ticker-item" data-coin-id="${coin.id}">
            <img src="${coin.image}" alt="${coin.name}" loading="lazy">
            <span class="ticker-name">${coin.name}</span>
            <span class="ticker-price">${sym}${formatPrice(coin.current_price)}</span>
            <span class="ticker-change ${changeClass(coin.price_change_percentage_24h)}">${formatChange(coin.price_change_percentage_24h)}</span>
        </div>
    `).join('');

    ticker.innerHTML = items + items;

    ticker.querySelectorAll('.ticker-item').forEach(item => {
        item.addEventListener('click', () => {
            const coin = allCoins.find(c => c.id === item.dataset.coinId);
            if (coin) openModal(coin);
        });
    });
}

// ─── Modal ───
function openModal(coin) {
    const sym = currencySymbols[currentCurrency] || '';

    modalContent.innerHTML = `
        <div class="modal-header">
            <img src="${coin.image}" alt="${coin.name}" style="width:38px;height:38px;border-radius:50%;">
            <div>
                <div class="modal-coin-name">${escapeHtml(coin.name)}</div>
                <div class="modal-coin-symbol">${coin.symbol.toUpperCase()} • Rank #${coin.market_cap_rank || '-'}</div>
            </div>
        </div>

        <div class="modal-price">${sym}${formatPrice(coin.current_price)}</div>
        <span class="${changeClass(coin.price_change_percentage_24h)}" style="font-family:var(--font-mono);font-size:0.95rem;">
            ${formatChange(coin.price_change_percentage_24h)} (24h)
        </span>

        <div class="modal-stats">
            <div class="modal-stat">
                <div class="modal-stat-label">Market Cap</div>
                <div class="modal-stat-value">${sym}${formatCompact(coin.market_cap)}</div>
            </div>
            <div class="modal-stat">
                <div class="modal-stat-label">24h Volume</div>
                <div class="modal-stat-value">${sym}${formatCompact(coin.total_volume)}</div>
            </div>
            <div class="modal-stat">
                <div class="modal-stat-label">24h High</div>
                <div class="modal-stat-value">${sym}${formatPrice(coin.high_24h)}</div>
            </div>
            <div class="modal-stat">
                <div class="modal-stat-label">24h Low</div>
                <div class="modal-stat-value">${sym}${formatPrice(coin.low_24h)}</div>
            </div>
            <div class="modal-stat">
                <div class="modal-stat-label">Circulating Supply</div>
                <div class="modal-stat-value">${coin.circulating_supply ? formatCompact(coin.circulating_supply) : 'N/A'}</div>
            </div>
            <div class="modal-stat">
                <div class="modal-stat-label">Total Supply</div>
                <div class="modal-stat-value">${coin.total_supply ? formatCompact(coin.total_supply) : '∞'}</div>
            </div>
            <div class="modal-stat">
                <div class="modal-stat-label">All-Time High (ATH)</div>
                <div class="modal-stat-value">${sym}${formatPrice(coin.ath)}</div>
            </div>
            <div class="modal-stat">
                <div class="modal-stat-label">All-Time Low (ATL)</div>
                <div class="modal-stat-value">${sym}${formatPrice(coin.atl)}</div>
            </div>
        </div>
    `;

    modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
}

// ─── Helpers ───
function formatPrice(price) {
    if (price == null) return 'N/A';
    if (currentCurrency === 'btc') {
        return price < 0.0001
            ? price.toExponential(2)
            : price.toLocaleString(undefined, { minimumFractionDigits: 8, maximumFractionDigits: 8 });
    }
    if (price >= 1) {
        return price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    if (price >= 0.01) {
        return price.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 });
    }
    return price.toLocaleString(undefined, { minimumFractionDigits: 6, maximumFractionDigits: 8 });
}

function formatCompact(num) {
    if (num == null) return 'N/A';
    if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
    return num.toLocaleString();
}

function formatChange(change) {
    if (change == null) return '-';
    const sign = change >= 0 ? '+' : '';
    return sign + change.toFixed(2) + '%';
}

function changeClass(change) {
    if (change == null) return 'change-neutral';
    return change >= 0 ? 'change-positive' : 'change-negative';
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function debounce(fn, delay) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
}

function showLoading(show) {
    loading.style.display = show && allCoins.length === 0 ? 'flex' : 'none';
}
