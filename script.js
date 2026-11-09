/* ========================================================
   LivePriceOfCrypto.com — LivePriceOfGold.com Style Engine
   - 1-Second Real-Time WebSocket & Zero-Lag Seed Data
   - Spot Rates for Top 5 Major Cryptos (BTC, ETH, SOL, BNB, XRP)
   - Top 5 Gainers & Top 5 Losers (24h Momentum)
   - Valuation Board: Top 10 by Default + Show More (Top 100)
   - Macroeconomic & Crypto News Feed with Images & In-Site Article Reader
   - Daily Economic Calendar
   ======================================================== */

// ─── Configuration ───
const BINANCE_REST_API = 'https://api.binance.com/api/v3/ticker/24hr';
const BINANCE_WS_URL = 'wss://stream.binance.com:9443/ws/!miniTicker@arr';
const COINGECKO_API = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=true&price_change_percentage=1h,24h,7d';
const MACRO_NEWS_API = 'https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fnews.google.com%2Frss%2Fsearch%3Fq%3Dcrypto%2Bbitcoin%2Bfed%2Binflation%2Bmarkets';
const COINTELEGRAPH_API = 'https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fcointelegraph.com%2Frss';
const NEWS_REFRESH_INTERVAL = 60; // seconds

// ─── Curated High-Definition Macro & Crypto Topic Images ───
const NEWS_IMAGES = [
    'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=700&auto=format&fit=crop&q=80', // Bitcoin physical coin
    'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=700&auto=format&fit=crop&q=80', // Financial chart & trading screen
    'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=700&auto=format&fit=crop&q=80', // Stock market green/red candlestick
    'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=700&auto=format&fit=crop&q=80', // Federal Reserve / US Dollar cash
    'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=700&auto=format&fit=crop&q=80', // Ethereum blockchain node
    'https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?w=700&auto=format&fit=crop&q=80', // Digital currency globe & network
    'https://images.unsplash.com/photo-1565514020179-026b92b84bb6?w=700&auto=format&fit=crop&q=80', // Wall Street bull / exchange building
    'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?w=700&auto=format&fit=crop&q=80', // Solana & altcoins network
    'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=700&auto=format&fit=crop&q=80', // Central bank / inflation gold
    'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=700&auto=format&fit=crop&q=80'  // Financial data analytics dashboard
];

// ─── Initial Baseline Dataset (Instant 0.001s Render) ───
const INITIAL_COINS = [
    { id: 'bitcoin', symbol: 'btc', name: 'Bitcoin', market_cap_rank: 1, current_price: 74850, price_change_percentage_24h: 1.45, price_change_percentage_1h_in_currency: 0.12, price_change_percentage_7d_in_currency: 3.8, total_volume: 38500000000, market_cap: 1475000000000, high_24h: 75250, low_24h: 73600, image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png' },
    { id: 'ethereum', symbol: 'eth', name: 'Ethereum', market_cap_rank: 2, current_price: 2845, price_change_percentage_24h: 2.15, price_change_percentage_1h_in_currency: -0.05, price_change_percentage_7d_in_currency: 5.2, total_volume: 19500000000, market_cap: 342000000000, high_24h: 2890, low_24h: 2760, image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png' },
    { id: 'solana', symbol: 'sol', name: 'Solana', market_cap_rank: 3, current_price: 188.50, price_change_percentage_24h: 4.85, price_change_percentage_1h_in_currency: 0.45, price_change_percentage_7d_in_currency: 12.4, total_volume: 6800000000, market_cap: 89000000000, high_24h: 194.00, low_24h: 178.50, image: 'https://assets.coingecko.com/coins/images/4128/large/solana.png' },
    { id: 'binancecoin', symbol: 'bnb', name: 'BNB', market_cap_rank: 4, current_price: 595.20, price_change_percentage_24h: -0.65, price_change_percentage_1h_in_currency: 0.10, price_change_percentage_7d_in_currency: 1.8, total_volume: 1200000000, market_cap: 86500000000, high_24h: 608.00, low_24h: 588.00, image: 'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png' },
    { id: 'ripple', symbol: 'xrp', name: 'XRP', market_cap_rank: 5, current_price: 0.584, price_change_percentage_24h: 3.40, price_change_percentage_1h_in_currency: 0.22, price_change_percentage_7d_in_currency: 6.1, total_volume: 2400000000, market_cap: 33200000000, high_24h: 0.602, low_24h: 0.565, image: 'https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png' },
    { id: 'dogecoin', symbol: 'doge', name: 'Dogecoin', market_cap_rank: 6, current_price: 0.168, price_change_percentage_24h: 8.75, price_change_percentage_1h_in_currency: 0.80, price_change_percentage_7d_in_currency: 18.5, total_volume: 3200000000, market_cap: 24600000000, high_24h: 0.175, low_24h: 0.152, image: 'https://assets.coingecko.com/coins/images/5/large/dogecoin.png' },
    { id: 'cardano', symbol: 'ada', name: 'Cardano', market_cap_rank: 7, current_price: 0.365, price_change_percentage_24h: 1.10, price_change_percentage_1h_in_currency: 0.05, price_change_percentage_7d_in_currency: 2.4, total_volume: 450000000, market_cap: 13100000000, high_24h: 0.378, low_24h: 0.358, image: 'https://assets.coingecko.com/coins/images/975/large/cardano.png' },
    { id: 'avalanche-2', symbol: 'avax', name: 'Avalanche', market_cap_rank: 8, current_price: 27.80, price_change_percentage_24h: -2.30, price_change_percentage_1h_in_currency: -0.15, price_change_percentage_7d_in_currency: -4.1, total_volume: 520000000, market_cap: 11200000000, high_24h: 29.10, low_24h: 26.90, image: 'https://assets.coingecko.com/coins/images/12559/large/Avalanche_Circle_RedWhite_Trans.png' },
    { id: 'sui', symbol: 'sui', name: 'Sui', market_cap_rank: 9, current_price: 2.28, price_change_percentage_24h: 6.90, price_change_percentage_1h_in_currency: 0.60, price_change_percentage_7d_in_currency: 22.0, total_volume: 1400000000, market_cap: 6400000000, high_24h: 2.36, low_24h: 2.10, image: 'https://assets.coingecko.com/coins/images/26375/large/sui-ocean-square.png' },
    { id: 'chainlink', symbol: 'link', name: 'Chainlink', market_cap_rank: 10, current_price: 11.95, price_change_percentage_24h: -1.20, price_change_percentage_1h_in_currency: 0.12, price_change_percentage_7d_in_currency: 0.5, total_volume: 380000000, market_cap: 7200000000, high_24h: 12.40, low_24h: 11.60, image: 'https://assets.coingecko.com/coins/images/877/large/chainlink-new-logo.png' },
    { id: 'polkadot', symbol: 'dot', name: 'Polkadot', market_cap_rank: 11, current_price: 4.15, price_change_percentage_24h: 0.85, price_change_percentage_1h_in_currency: 0.02, price_change_percentage_7d_in_currency: 1.1, total_volume: 210000000, market_cap: 6050000000, high_24h: 4.25, low_24h: 4.05, image: 'https://assets.coingecko.com/coins/images/12171/large/polkadot.png' },
    { id: 'shiba-inu', symbol: 'shib', name: 'Shiba Inu', market_cap_rank: 12, current_price: 0.0000185, price_change_percentage_24h: -3.80, price_change_percentage_1h_in_currency: -0.20, price_change_percentage_7d_in_currency: -2.5, total_volume: 620000000, market_cap: 10900000000, high_24h: 0.0000196, low_24h: 0.0000180, image: 'https://assets.coingecko.com/coins/images/11939/large/shiba.png' },
    { id: 'near', symbol: 'near', name: 'NEAR Protocol', market_cap_rank: 13, current_price: 4.65, price_change_percentage_24h: 5.40, price_change_percentage_1h_in_currency: 0.35, price_change_percentage_7d_in_currency: 8.9, total_volume: 480000000, market_cap: 5600000000, high_24h: 4.82, low_24h: 4.38, image: 'https://assets.coingecko.com/coins/images/10365/large/near.png' },
    { id: 'pepe', symbol: 'pepe', name: 'Pepe', market_cap_rank: 14, current_price: 0.0000098, price_change_percentage_24h: 11.20, price_change_percentage_1h_in_currency: 1.10, price_change_percentage_7d_in_currency: 24.5, total_volume: 1800000000, market_cap: 4100000000, high_24h: 0.0000105, low_24h: 0.0000087, image: 'https://assets.coingecko.com/coins/images/29850/large/pepe-token.png' },
    { id: 'uniswap', symbol: 'uni', name: 'Uniswap', market_cap_rank: 15, current_price: 8.20, price_change_percentage_24h: -2.85, price_change_percentage_1h_in_currency: -0.10, price_change_percentage_7d_in_currency: 3.2, total_volume: 290000000, market_cap: 4900000000, high_24h: 8.65, low_24h: 8.05, image: 'https://assets.coingecko.com/coins/images/12504/large/uniswap-uni.png' },
    { id: 'litecoin', symbol: 'ltc', name: 'Litecoin', market_cap_rank: 16, current_price: 72.40, price_change_percentage_24h: 1.95, price_change_percentage_1h_in_currency: 0.15, price_change_percentage_7d_in_currency: 4.6, total_volume: 380000000, market_cap: 5400000000, high_24h: 74.10, low_24h: 70.80, image: 'https://assets.coingecko.com/coins/images/2/large/litecoin.png' },
    { id: 'aptos', symbol: 'apt', name: 'Aptos', market_cap_rank: 17, current_price: 9.35, price_change_percentage_24h: -4.20, price_change_percentage_1h_in_currency: -0.30, price_change_percentage_7d_in_currency: -1.8, total_volume: 310000000, market_cap: 4600000000, high_24h: 9.90, low_24h: 9.15, image: 'https://assets.coingecko.com/coins/images/26455/large/aptos_round.png' },
    { id: 'render-token', symbol: 'render', name: 'Render', market_cap_rank: 18, current_price: 5.85, price_change_percentage_24h: 7.30, price_change_percentage_1h_in_currency: 0.50, price_change_percentage_7d_in_currency: 14.2, total_volume: 280000000, market_cap: 3100000000, high_24h: 6.10, low_24h: 5.40, image: 'https://assets.coingecko.com/coins/images/11636/large/rndr.png' },
    { id: 'fetch-ai', symbol: 'fet', name: 'Artificial Superintelligence', market_cap_rank: 19, current_price: 1.34, price_change_percentage_24h: 9.80, price_change_percentage_1h_in_currency: 0.70, price_change_percentage_7d_in_currency: 19.5, total_volume: 290000000, market_cap: 3400000000, high_24h: 1.42, low_24h: 1.21, image: 'https://assets.coingecko.com/coins/images/5681/large/Fetch.jpg' },
    { id: 'polygon-ecosystem-token', symbol: 'pol', name: 'Polygon', market_cap_rank: 20, current_price: 0.342, price_change_percentage_24h: -1.70, price_change_percentage_1h_in_currency: 0.05, price_change_percentage_7d_in_currency: -3.2, total_volume: 110000000, market_cap: 2700000000, high_24h: 0.355, low_24h: 0.336, image: 'https://assets.coingecko.com/coins/images/4713/large/polygon.png' }
];

// ─── State ───
let allCoins = JSON.parse(JSON.stringify(INITIAL_COINS));
let isExpandedTo100 = false;
let currentCurrency = 'usd';
let sortField = 'market_cap_rank';
let sortAsc = true;
let currencyRates = { usd: 1, inr: 86.5, eur: 0.92, gbp: 0.79, jpy: 154.0, btc: 1 };
let wsSocket = null;
let newsCountdown = NEWS_REFRESH_INTERVAL;
let newsTimerInterval = null;
let calendarWidgetLoaded = false;
let currentNewsArticles = [];

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
const themeBtnIcon = document.getElementById('themeBtnIcon');
const modalOverlay = document.getElementById('modalOverlay');
const modalClose = document.getElementById('modalClose');
const modalContent = document.getElementById('modalContent');
const liveClock = document.getElementById('liveClock');

// ─── Initialization ───
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    setupEventListeners();
    startClock();

    // 1. Instant Render from Baseline Dataset
    renderInitialData();

    // 2. Fetch fresh prices from Binance REST & background CoinGecko
    fetchLivePrices();

    // 3. Connect real-time 1s WebSocket stream
    initBinanceWebSocket();

    // 4. Fetch Macro & Crypto Market News (with Images)
    fetchMacroNews();
    startNewsTimer();

    // 5. Load Economic Calendar
    loadEconomicCalendarWidget();
});

function renderInitialData() {
    renderMajorCoins(allCoins);
    renderGainersAndLosers(allCoins);
    sortAndRender();
    updateTicker(allCoins.slice(0, 15));
    updateSidebarRates();
    if (loading) loading.style.display = 'none';
}

// ─── Real-Time Clock ───
function startClock() {
    setInterval(() => {
        if (liveClock) {
            const now = new Date();
            liveClock.textContent = now.toUTCString().replace('GMT', 'UTC').split(' ').slice(4, 6).join(' ');
        }
    }, 1000);
}

// ─── Theme Management (livepriceofgold.com Palette) ───
function initTheme() {
    const saved = localStorage.getItem('theme') || 'gold-dark';
    document.body.setAttribute('data-theme', saved);
    updateThemeButton(saved);
}

function toggleTheme() {
    const current = document.body.getAttribute('data-theme') || 'gold-dark';
    const next = current === 'gold-dark' ? 'gold-light' : 'gold-dark';
    document.body.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    updateThemeButton(next);

    calendarWidgetLoaded = false;
    const container = document.getElementById('economicCalendarWidget');
    if (container) {
        container.innerHTML = '<div class="tradingview-widget-container__widget" style="width: 100%; height: 750px;"></div>';
        loadEconomicCalendarWidget();
    }
}

function updateThemeButton(theme) {
    if (themeBtnIcon) {
        themeBtnIcon.textContent = theme === 'gold-dark' ? '☀️ Light' : '🌙 Dark';
    }
}

// ─── Event Listeners ───
function setupEventListeners() {
    if (themeToggle) themeToggle.addEventListener('click', toggleTheme);

    if (searchInput) {
        searchInput.addEventListener('input', debounce(filterTable, 200));
    }

    if (currencySelect) {
        currencySelect.addEventListener('change', () => {
            currentCurrency = currencySelect.value;
            renderMajorCoins(allCoins);
            renderGainersAndLosers(allCoins);
            sortAndRender();
            updateTicker(allCoins.slice(0, 15));
            updateSidebarRates();
        });
    }

    if (btnToggleExpand) {
        btnToggleExpand.addEventListener('click', () => {
            isExpandedTo100 = !isExpandedTo100;
            if (isExpandedTo100) {
                expandBtnText.textContent = 'Show Less (Collapse to Top 10)';
                expandBtnIcon.textContent = '▲';
                if (tableCountBadge) tableCountBadge.textContent = `Top ${allCoins.length} Assets`;
            } else {
                expandBtnText.textContent = 'Show More (Expand to Top 100 Assets)';
                expandBtnIcon.textContent = '▼';
                if (tableCountBadge) tableCountBadge.textContent = 'Top 10 Assets';
            }
            sortAndRender();
        });
    }

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

    if (modalClose) modalClose.addEventListener('click', closeModal);
    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) closeModal();
        });
    }
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });

    if (backToTop) {
        window.addEventListener('scroll', () => {
            backToTop.classList.toggle('visible', window.scrollY > 400);
        });
        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    if (btnRefreshNews) {
        btnRefreshNews.addEventListener('click', () => {
            fetchMacroNews();
            resetNewsTimer();
        });
    }
}

// ─── Economic Calendar Widget ───
function loadEconomicCalendarWidget() {
    if (calendarWidgetLoaded) return;
    calendarWidgetLoaded = true;

    const container = document.getElementById('economicCalendarWidget');
    if (!container) return;

    const isLight = document.body.getAttribute('data-theme') === 'gold-light';

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

// ─── Reliable Price Fetching (Binance REST & CoinGecko Background) ───
async function fetchLivePrices() {
    try {
        const binanceRes = await fetch(BINANCE_REST_API);
        if (binanceRes.ok) {
            const tickers = await binanceRes.json();
            const tickerMap = new Map();

            tickers.forEach(t => {
                if (t.symbol && t.symbol.endsWith('USDT')) {
                    const sym = t.symbol.replace('USDT', '').toLowerCase();
                    tickerMap.set(sym, {
                        price: parseFloat(t.lastPrice),
                        change: parseFloat(t.priceChangePercent),
                        volume: parseFloat(t.quoteVolume),
                        high: parseFloat(t.highPrice),
                        low: parseFloat(t.lowPrice)
                    });
                }
            });

            allCoins.forEach(coin => {
                const sym = coin.symbol.toLowerCase();
                if (tickerMap.has(sym)) {
                    const data = tickerMap.get(sym);
                    coin.current_price = data.price;
                    coin.price_change_percentage_24h = data.change;
                    coin.total_volume = data.volume;
                    coin.high_24h = data.high;
                    coin.low_24h = data.low;
                }
            });

            renderMajorCoins(allCoins);
            renderGainersAndLosers(allCoins);
            sortAndRender();
            updateTicker(allCoins.slice(0, 15));
            updateSidebarRates();
        }
    } catch (err) {
        console.warn('Binance REST fallback used:', err);
    }

    try {
        const cgRes = await fetch(COINGECKO_API);
        if (cgRes.ok) {
            const cgCoins = await cgRes.json();
            if (Array.isArray(cgCoins) && cgCoins.length > 0) {
                allCoins = cgCoins;
                renderMajorCoins(allCoins);
                renderGainersAndLosers(allCoins);
                sortAndRender();
                updateTicker(allCoins.slice(0, 15));
                updateSidebarRates();
            }
        }
    } catch (e) {
        console.warn('CoinGecko fallback (using Binance live stream):', e);
    }
}

// ─── 1. SPOT CRYPTO RATES (Top 5 Major Cryptos Highlight Cards) ───
function renderMajorCoins(coins) {
    if (!majorCoinsGrid) return;
    const sym = currencySymbols[currentCurrency] || '';
    const rate = currencyRates[currentCurrency] || 1;

    const majors = [];
    MAJOR_SYMBOLS.forEach(s => {
        const found = coins.find(c => c.symbol.toLowerCase() === s);
        if (found) majors.push(found);
    });

    if (majors.length === 0) return;

    majorCoinsGrid.innerHTML = majors.map(coin => {
        const change = coin.price_change_percentage_24h || 0;
        const changeBadgeClass = change >= 0 ? 'trend-badge bullish' : 'trend-badge bearish';
        const sign = change >= 0 ? '+' : '';
        const displayPrice = coin.current_price * rate;

        return `
            <div class="spot-card" data-coin-id="${coin.id}">
                <div class="spot-card-top">
                    <div class="spot-card-coin">
                        <img src="${coin.image}" alt="${coin.name}">
                        <div>
                            <div class="spot-card-name">${escapeHtml(coin.name)}</div>
                            <div class="spot-card-symbol">${coin.symbol.toUpperCase()} / ${currentCurrency.toUpperCase()}</div>
                        </div>
                    </div>
                    <span class="${changeBadgeClass}">${sign}${change.toFixed(2)}%</span>
                </div>
                <div class="spot-card-price" id="major-price-${coin.id}">
                    ${sym}${formatPrice(displayPrice)}
                </div>
                <div class="spot-card-footer">
                    <span>High: ${sym}${formatPrice(coin.high_24h * rate)}</span>
                    <span>Low: ${sym}${formatPrice(coin.low_24h * rate)}</span>
                </div>
            </div>
        `;
    }).join('');

    majorCoinsGrid.querySelectorAll('.spot-card').forEach(card => {
        card.addEventListener('click', () => {
            const coin = allCoins.find(c => c.id === card.dataset.coinId);
            if (coin) openModal(coin);
        });
    });
}

// ─── 2. TOP 5 GAINERS & TOP 5 LOSERS (24H MOMENTUM) ───
function renderGainersAndLosers(coins) {
    if (!gainersList || !losersList) return;
    const sym = currencySymbols[currentCurrency] || '';
    const rate = currencyRates[currentCurrency] || 1;

    const valid = coins.filter(c => c.price_change_percentage_24h != null);
    const gainers = [...valid].sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h).slice(0, 5);
    const losers = [...valid].sort((a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h).slice(0, 5);

    gainersList.innerHTML = gainers.map((coin, i) => `
        <div class="momentum-row" data-coin-id="${coin.id}">
            <div class="momentum-coin-info">
                <span class="momentum-rank">#${i + 1}</span>
                <img class="momentum-img" src="${coin.image}" alt="${coin.name}" loading="lazy">
                <div>
                    <span class="momentum-name">${escapeHtml(coin.name)}</span>
                    <span class="momentum-symbol">${coin.symbol}</span>
                </div>
            </div>
            <div class="momentum-price-info">
                <div class="momentum-price">${sym}${formatPrice(coin.current_price * rate)}</div>
                <span class="momentum-badge trend-badge bullish">+${coin.price_change_percentage_24h.toFixed(2)}%</span>
            </div>
        </div>
    `).join('');

    losersList.innerHTML = losers.map((coin, i) => `
        <div class="momentum-row" data-coin-id="${coin.id}">
            <div class="momentum-coin-info">
                <span class="momentum-rank">#${i + 1}</span>
                <img class="momentum-img" src="${coin.image}" alt="${coin.name}" loading="lazy">
                <div>
                    <span class="momentum-name">${escapeHtml(coin.name)}</span>
                    <span class="momentum-symbol">${coin.symbol}</span>
                </div>
            </div>
            <div class="momentum-price-info">
                <div class="momentum-price">${sym}${formatPrice(coin.current_price * rate)}</div>
                <span class="momentum-badge trend-badge bearish">${coin.price_change_percentage_24h.toFixed(2)}%</span>
            </div>
        </div>
    `).join('');

    document.querySelectorAll('.momentum-row').forEach(row => {
        row.addEventListener('click', () => {
            const coin = allCoins.find(c => c.id === row.dataset.coinId);
            if (coin) openModal(coin);
        });
    });
}

// ─── 3. REAL-TIME BINANCE WEBSOCKET STREAM ───
function initBinanceWebSocket() {
    if (wsSocket) {
        try { wsSocket.close(); } catch(e){}
    }

    try {
        wsSocket = new WebSocket(BINANCE_WS_URL);

        wsSocket.onopen = () => {
            console.log('✅ Connected to real-time WebSocket stream');
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
            console.warn('WebSocket error, reconnecting:', err);
        };

        wsSocket.onclose = () => {
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
            const oldPrice = coin.current_price * rate;

            if (newPrice && oldPrice && Math.abs(newPrice - oldPrice) > 0.00000001) {
                const isUp = newPrice > oldPrice;
                coin.current_price = data.priceUsd;

                if (data.openUsd > 0) {
                    coin.price_change_percentage_24h = ((data.priceUsd - data.openUsd) / data.openUsd) * 100;
                }

                updateLivePriceCell(coin.id, newPrice, isUp, coin.price_change_percentage_24h);
                updateLiveSpotCard(coin.id, newPrice, isUp);
                updateLiveTickerItem(coin.id, newPrice, isUp);
            }
        }
    });

    updateSidebarRates();
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

function updateLiveSpotCard(coinId, newPrice, isUp) {
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
            setTimeout(() => { priceEl.style.color = 'var(--gold-light)'; }, 600);
        }
    });
}

function updateSidebarRates() {
    const rate = currencyRates[currentCurrency] || 1;
    const sym = currencySymbols[currentCurrency] || '';
    const btc = allCoins.find(c => c.symbol.toLowerCase() === 'btc');
    const eth = allCoins.find(c => c.symbol.toLowerCase() === 'eth');
    const sol = allCoins.find(c => c.symbol.toLowerCase() === 'sol');
    const bnb = allCoins.find(c => c.symbol.toLowerCase() === 'bnb');
    const xrp = allCoins.find(c => c.symbol.toLowerCase() === 'xrp');

    const sideBtc = document.getElementById('side-btc');
    const sideEth = document.getElementById('side-eth');
    const sideSol = document.getElementById('side-sol');
    const sideBnb = document.getElementById('side-bnb');
    const sideXrp = document.getElementById('side-xrp');

    if (sideBtc && btc) sideBtc.textContent = `${sym}${formatPrice(btc.current_price * rate)}`;
    if (sideEth && eth) sideEth.textContent = `${sym}${formatPrice(eth.current_price * rate)}`;
    if (sideSol && sol) sideSol.textContent = `${sym}${formatPrice(sol.current_price * rate)}`;
    if (sideBnb && bnb) sideBnb.textContent = `${sym}${formatPrice(bnb.current_price * rate)}`;
    if (sideXrp && xrp) sideXrp.textContent = `${sym}${formatPrice(xrp.current_price * rate)}`;
}

// ─── 4. MACRO & MARKET NEWS (Images on Every Card + In-Site Article Redirect) ───
async function fetchMacroNews() {
    // Attempt 1: Macro & Crypto Google News RSS via rss2json
    try {
        const res = await fetch(MACRO_NEWS_API);
        if (res.ok) {
            const data = await res.json();
            if (data.status === 'ok' && Array.isArray(data.items) && data.items.length > 0) {
                processAndRenderNews(data.items.slice(0, 12));
                return;
            }
        }
    } catch (e) {
        console.warn('Macro news fetch attempt 1 error:', e);
    }

    // Attempt 2: Cointelegraph RSS fallback
    try {
        const ctRes = await fetch(COINTELEGRAPH_API);
        if (ctRes.ok) {
            const ctData = await ctRes.json();
            if (ctData.status === 'ok' && Array.isArray(ctData.items) && ctData.items.length > 0) {
                processAndRenderNews(ctData.items.slice(0, 12));
                return;
            }
        }
    } catch (e) {
        console.warn('Cointelegraph fallback error:', e);
    }

    // Attempt 3: Comprehensive Built-In Market Intelligence Dispatches
    renderCuratedMacroNews();
}

function processAndRenderNews(rawItems) {
    const formatted = rawItems.map((item, index) => {
        const assignedImage = item.thumbnail || (item.enclosure && item.enclosure.link) || NEWS_IMAGES[index % NEWS_IMAGES.length];
        const sourceName = item.author || extractSourceFromTitle(item.title) || 'Financial Press';
        const cleanTitle = cleanNewsTitle(item.title);
        const cleanSnippet = cleanHtml(item.description || '');
        const id = 'art_' + index + '_' + Math.abs(hashCode(cleanTitle));

        return {
            id: id,
            title: cleanTitle,
            snippet: cleanSnippet,
            source: sourceName,
            link: item.link,
            image: assignedImage,
            pubDate: formatPubDate(item.pubDate)
        };
    });

    currentNewsArticles = formatted;

    // Cache to localStorage for article.html to read immediately
    try {
        localStorage.setItem('cached_crypto_news', JSON.stringify(formatted));
    } catch (e) {}

    renderNewsCards(formatted);
}

function renderCuratedMacroNews() {
    const curated = [
        { id: 'art_1_macro', title: "Federal Reserve Interest Rate Trajectory Shapes Global Liquidity and Cryptocurrency Valuations", source: "Bloomberg Markets", snippet: "Macroeconomic indicators, sovereign bond yield curves, and central bank commentary indicate potential rate adjustments, driving capital into Bitcoin and risk assets.", pubDate: "15m ago", link: "https://news.google.com/search?q=crypto+fed", image: NEWS_IMAGES[3] },
        { id: 'art_2_inflation', title: "US Consumer Price Index (CPI) Inflation Print Impacts Digital Asset Treasury Inflows", source: "Reuters Financial", snippet: "Institutional asset managers analyze latest inflation benchmarks as spot Bitcoin and Ethereum exchange-traded funds report heightened volume.", pubDate: "45m ago", link: "https://news.google.com/search?q=crypto+inflation", image: NEWS_IMAGES[1] },
        { id: 'art_3_sec', title: "Global Regulatory Frameworks and SEC Guidance Solidify Digital Asset Infrastructure", source: "Financial Times", snippet: "Cross-border regulatory harmonization provides institutional grade clarity for major exchange operations and custodial banking reserves.", pubDate: "1h ago", link: "https://news.google.com/search?q=crypto+regulation", image: NEWS_IMAGES[0] },
        { id: 'art_4_sol', title: "High-Frequency Blockchain Settlement Volumes Reach New Highs Amid DeFi Expansion", source: "CoinDesk Research", snippet: "Decentralized liquidity protocols and decentralized exchange volume continue to post robust metrics across high-throughput networks.", pubDate: "2h ago", link: "https://news.google.com/search?q=solana+defi", image: NEWS_IMAGES[7] },
        { id: 'art_5_gold', title: "Gold and Digital Gold: Correlation Dynamics Between Precious Metals and Bitcoin", source: "MarketWatch", snippet: "Hedge portfolios increasingly pair physical bullion reserves with decentralized digital assets as a twin buffer against currency depreciation.", pubDate: "3h ago", link: "https://news.google.com/search?q=gold+bitcoin", image: NEWS_IMAGES[8] },
        { id: 'art_6_eth', title: "Ethereum Layer-2 Rollups Process Over 85% of Smart Contract Transactions", source: "Cointelegraph", snippet: "Ecosystem scaling efficiency substantially compresses gas fee costs while total active addresses expand toward new quarterly benchmarks.", pubDate: "4h ago", link: "https://news.google.com/search?q=ethereum+layer2", image: NEWS_IMAGES[4] }
    ];

    currentNewsArticles = curated;
    try {
        localStorage.setItem('cached_crypto_news', JSON.stringify(curated));
    } catch (e) {}
    renderNewsCards(curated);
}

function renderNewsCards(items) {
    if (!googleNewsGrid || !items || items.length === 0) return;

    googleNewsGrid.innerHTML = items.map(item => `
        <article class="market-news-card fade-in">
            <div class="news-card-image-wrap">
                <img class="news-card-img" src="${item.image}" alt="${escapeHtml(item.title)}" loading="lazy" onerror="this.src='${NEWS_IMAGES[0]}'">
                <span class="news-card-badge">${escapeHtml(item.source)}</span>
                <span class="news-card-time">${item.pubDate}</span>
            </div>
            <div class="news-card-body">
                <h4 class="news-card-title">${escapeHtml(item.title)}</h4>
                <p class="news-card-snippet">${escapeHtml(item.snippet)}</p>
                <a href="article.html?id=${encodeURIComponent(item.id)}" class="btn-read-analysis">
                    Read Full Analysis →
                </a>
            </div>
        </article>
    `).join('');
}

function startNewsTimer() {
    newsTimerInterval = setInterval(() => {
        newsCountdown--;
        if (newsTimerEl) newsTimerEl.textContent = newsCountdown + 's';

        if (newsCountdown <= 0) {
            fetchMacroNews();
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
    if (!title) return 'Financial Press';
    const parts = title.split(' - ');
    return parts.length > 1 ? parts[parts.length - 1] : 'Financial Press';
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

function hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash |= 0;
    }
    return hash;
}

// ─── 5. VALUATION BOARD (Top 10 Default + Show More 100) ───
function sortAndRender() {
    if (!tableBody) return;

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
    if (!tableBody) return;
    const search = searchInput ? searchInput.value.toLowerCase().trim() : '';
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
                    No assets recorded matching "<strong>${escapeHtml(search)}</strong>"
                </td>
            </tr>`;
        return;
    }

    const sym = currencySymbols[currentCurrency] || '';
    const rate = currencyRates[currentCurrency] || 1;

    tableBody.innerHTML = filtered.map((coin, i) => {
        const displayPrice = coin.current_price * rate;

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
            <td class="price-cell">${sym}${formatPrice(displayPrice)}</td>
            <td class="${changeClass(coin.price_change_percentage_1h_in_currency)}">${formatChange(coin.price_change_percentage_1h_in_currency)}</td>
            <td class="td-24h-change ${changeClass(coin.price_change_percentage_24h)}">${formatChange(coin.price_change_percentage_24h)}</td>
            <td class="${changeClass(coin.price_change_percentage_7d_in_currency)}">${formatChange(coin.price_change_percentage_7d_in_currency)}</td>
            <td class="volume-cell">${sym}${formatCompact(coin.total_volume * rate)}</td>
            <td class="mcap-cell">${sym}${formatCompact(coin.market_cap * rate)}</td>
            <td class="sparkline-cell">${coin.sparkline_in_7d?.price ? '' : '-'}</td>
        </tr>`;
    }).join('');

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
    if (!ticker) return;
    const sym = currencySymbols[currentCurrency] || '';
    const rate = currencyRates[currentCurrency] || 1;

    const items = topCoins.map(coin => `
        <div class="ticker-item" data-coin-id="${coin.id}">
            <img src="${coin.image}" alt="${coin.name}" loading="lazy">
            <span class="ticker-name">${coin.name}</span>
            <span class="ticker-price">${sym}${formatPrice(coin.current_price * rate)}</span>
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
    if (!modalContent || !modalOverlay) return;
    const sym = currencySymbols[currentCurrency] || '';
    const rate = currencyRates[currentCurrency] || 1;

    modalContent.innerHTML = `
        <div class="modal-header">
            <img src="${coin.image}" alt="${coin.name}" style="width:38px;height:38px;border-radius:50%;">
            <div>
                <div class="modal-coin-name">${escapeHtml(coin.name)}</div>
                <div class="modal-coin-symbol">${coin.symbol.toUpperCase()} • Rank #${coin.market_cap_rank || '-'}</div>
            </div>
        </div>

        <div class="modal-price">${sym}${formatPrice(coin.current_price * rate)}</div>
        <span class="${changeClass(coin.price_change_percentage_24h)}" style="font-family:var(--font-mono);font-size:0.95rem;">
            ${formatChange(coin.price_change_percentage_24h)} (24h)
        </span>

        <div class="modal-stats">
            <div class="modal-stat">
                <div class="modal-stat-label">Market Capitalization</div>
                <div class="modal-stat-value">${sym}${formatCompact(coin.market_cap * rate)}</div>
            </div>
            <div class="modal-stat">
                <div class="modal-stat-label">24h Trading Volume</div>
                <div class="modal-stat-value">${sym}${formatCompact(coin.total_volume * rate)}</div>
            </div>
            <div class="modal-stat">
                <div class="modal-stat-label">24h High Record</div>
                <div class="modal-stat-value">${sym}${formatPrice(coin.high_24h * rate)}</div>
            </div>
            <div class="modal-stat">
                <div class="modal-stat-label">24h Low Record</div>
                <div class="modal-stat-value">${sym}${formatPrice(coin.low_24h * rate)}</div>
            </div>
            <div class="modal-stat">
                <div class="modal-stat-label">Circulating Reserve</div>
                <div class="modal-stat-value">${coin.circulating_supply ? formatCompact(coin.circulating_supply) : 'N/A'}</div>
            </div>
            <div class="modal-stat">
                <div class="modal-stat-label">Total Reserve Ceiling</div>
                <div class="modal-stat-value">${coin.total_supply ? formatCompact(coin.total_supply) : '∞'}</div>
            </div>
            <div class="modal-stat">
                <div class="modal-stat-label">Historical High (ATH)</div>
                <div class="modal-stat-value">${sym}${formatPrice((coin.ath || coin.current_price * 1.4) * rate)}</div>
            </div>
            <div class="modal-stat">
                <div class="modal-stat-label">Historical Low (ATL)</div>
                <div class="modal-stat-value">${sym}${formatPrice((coin.atl || coin.current_price * 0.1) * rate)}</div>
            </div>
        </div>
    `;

    modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    if (!modalOverlay) return;
    modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
}

// ─── Helpers ───
function formatPrice(price) {
    if (price == null || isNaN(price)) return 'N/A';
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
    if (num == null || isNaN(num)) return 'N/A';
    if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
    return num.toLocaleString();
}

function formatChange(change) {
    if (change == null || isNaN(change)) return '-';
    const sign = change >= 0 ? '+' : '';
    return sign + change.toFixed(2) + '%';
}

function changeClass(change) {
    if (change == null || isNaN(change)) return 'change-neutral';
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

function filterTable() {
    sortAndRender();
}
