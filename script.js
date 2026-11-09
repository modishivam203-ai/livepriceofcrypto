/* ========================================================
   LivePriceOfCrypto.com — Vintage Financial Gazette JS
   - 1-Second Binance WebSocket Real-Time Broadcast Stream
   - Forex Factory Style Daily Economic Events Calendar
   - Automated Live Breaking Crypto News Wire (Every 60s)
   - Vintage Newspaper / Terminal Dark & Light Modes
   ======================================================== */

// ─── Configuration ───
const CG_API = 'https://api.coingecko.com/api/v3';
const NEWS_API = 'https://min-api.cryptocompare.com/data/v2/news/?lang=EN';
const BINANCE_WS_URL = 'wss://stream.binance.com:9443/ws/!miniTicker@arr';
const BLOG_REFRESH_INTERVAL = 60; // seconds

// ─── State ───
let allCoins = [];
let currentPage = 1;
let currentCurrency = 'usd';
let currentPerPage = 100;
let sortField = 'market_cap_rank';
let sortAsc = true;
let previousPrices = {};
let currencyRates = { usd: 1, inr: 86.5, eur: 0.92, gbp: 0.79, jpy: 154.0, btc: 1 };
let wsSocket = null;
let blogCountdown = BLOG_REFRESH_INTERVAL;
let blogTimerInterval = null;
let calendarWidgetLoaded = false;

// ─── Currency Symbols ───
const currencySymbols = {
    usd: '$', inr: '₹', eur: '€', gbp: '£', jpy: '¥', btc: '₿'
};

// ─── DOM Elements ───
const tableBody = document.getElementById('tableBody');
const loading = document.getElementById('loading');
const errorState = document.getElementById('errorState');
const searchInput = document.getElementById('searchInput');
const currencySelect = document.getElementById('currencySelect');
const perPageSelect = document.getElementById('perPageSelect');
const ticker = document.getElementById('ticker');
const pagination = document.getElementById('pagination');
const prevPageBtn = document.getElementById('prevPage');
const nextPageBtn = document.getElementById('nextPage');
const pageInfo = document.getElementById('pageInfo');
const lastUpdated = document.getElementById('lastUpdated');
const backToTop = document.getElementById('backToTop');
const themeToggle = document.getElementById('themeToggle');
const themeToggleIcon = document.getElementById('themeToggleIcon');
const modalOverlay = document.getElementById('modalOverlay');
const modalClose = document.getElementById('modalClose');
const modalContent = document.getElementById('modalContent');
const blogFeedGrid = document.getElementById('blogFeedGrid');
const blogTimerEl = document.getElementById('blogTimer');
const btnRefreshBlog = document.getElementById('btnRefreshBlog');

// ─── Initialization ───
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    setupEventListeners();
    fetchGlobalData();
    fetchExchangeRates();
    fetchData();
    fetchLiveBlog();
    initBinanceWebSocket();
    startBlogTimer();
    loadEconomicCalendarWidget();
    initGazetteDate();
});

// ─── Date Banner ───
function initGazetteDate() {
    const el = document.getElementById('gazetteDate');
    if (!el) return;
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    }).toUpperCase();
    el.textContent = `DAILY FINANCIAL GAZETTE • ${dateStr} • REAL-TIME WIRE`;
}

// ─── Theme Management (Vintage Dark / Vintage Light) ───
function initTheme() {
    const saved = localStorage.getItem('theme') || 'vintage-dark';
    document.body.setAttribute('data-theme', saved);
    updateThemeButtonText(saved);
}

function toggleTheme() {
    const current = document.body.getAttribute('data-theme') || 'vintage-dark';
    const next = current === 'vintage-dark' ? 'vintage-light' : 'vintage-dark';
    document.body.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    updateThemeButtonText(next);

    // Refresh TradingView calendar widget with matching theme
    calendarWidgetLoaded = false;
    const container = document.getElementById('economicCalendarWidget');
    if (container) {
        container.innerHTML = '<div class="tradingview-widget-container__widget" style="width: 100%; height: 750px;"></div>';
        loadEconomicCalendarWidget();
    }
}

function updateThemeButtonText(theme) {
    if (themeToggleIcon) {
        themeToggleIcon.textContent = theme === 'vintage-dark' ? '📜 Classic Light' : '🏛️ Vintage Dark';
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

    perPageSelect.addEventListener('change', () => {
        currentPerPage = parseInt(perPageSelect.value);
        currentPage = 1;
        fetchData();
    });

    prevPageBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            fetchData();
        }
    });

    nextPageBtn.addEventListener('click', () => {
        currentPage++;
        fetchData();
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
    if (btnRefreshBlog) {
        btnRefreshBlog.addEventListener('click', () => {
            fetchLiveBlog();
            resetBlogTimer();
        });
    }
}

// ─── Forex Factory Style Daily Economic Calendar ───
function loadEconomicCalendarWidget() {
    if (calendarWidgetLoaded) return;
    calendarWidgetLoaded = true;

    const container = document.getElementById('economicCalendarWidget');
    if (!container) return;

    const isLight = document.body.getAttribute('data-theme') === 'vintage-light';

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

// ─── Exchange Rates for Currency Conversion ───
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

// ─── Fetch Global Market Data ───
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
        console.warn('Failed to fetch global data:', e);
    }
}

// ─── Fetch Coin Data via REST API ───
async function fetchData() {
    showLoading(true);
    errorState.style.display = 'none';

    try {
        const url = `${CG_API}/coins/markets?vs_currency=${currentCurrency}&order=market_cap_desc&per_page=${currentPerPage}&page=${currentPage}&sparkline=true&price_change_percentage=1h,24h,7d`;
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

        sortAndRender();
        updateTicker(data.slice(0, 15));
        updatePagination();
        updateLastUpdated();

        showLoading(false);
    } catch (err) {
        console.error('Fetch error:', err);
        showLoading(false);
        if (allCoins.length === 0) {
            errorState.style.display = 'block';
        }
    }
}

// ─── BINANCE WEBSOCKET: 1-SECOND REAL-TIME PRICE STREAM ───
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
        console.warn('WebSocket initialization failed:', e);
    }
}

// ─── Handle Real-Time Live Ticker Messages (Fires Every 1 Second) ───
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

                updateLivePriceCell(coin.id, newPrice, isUp, coin.price_change_percentage_24h);
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

function updateLiveTickerItem(coinId, newPrice, isUp) {
    const tickerItems = document.querySelectorAll(`.ticker-item[data-coin-id="${coinId}"]`);
    tickerItems.forEach(item => {
        const priceEl = item.querySelector('.ticker-price');
        if (priceEl) {
            const sym = currencySymbols[currentCurrency] || '';
            priceEl.textContent = `${sym}${formatPrice(newPrice)}`;
            priceEl.style.color = isUp ? 'var(--green)' : 'var(--red)';
            setTimeout(() => { priceEl.style.color = 'var(--gold)'; }, 600);
        }
    });
}

// ─── AUTOMATIC LIVE NEWS WIRE (CryptoCompare Free Public News API) ───
async function fetchLiveBlog() {
    try {
        const res = await fetch(NEWS_API);
        if (!res.ok) throw new Error('News fetch error');
        const json = await res.json();
        const articles = json.Data || [];

        renderBlogFeed(articles.slice(0, 12));
    } catch (err) {
        console.warn('Live blog fetch error:', err);
        blogFeedGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align:center; padding: 40px; color: var(--text-muted); font-family: var(--font-mono);">
                <p>Unable to connect to live wire dispatches. Retrying...</p>
                <button class="btn-vintage" onclick="fetchLiveBlog()" style="margin-top:10px;">Retry Now</button>
            </div>
        `;
    }
}

function renderBlogFeed(articles) {
    if (!articles || articles.length === 0) {
        blogFeedGrid.innerHTML = `
            <div style="grid-column:1 / -1; text-align:center; padding:40px; color:var(--text-muted); font-family:var(--font-mono);">
                No dispatches available at this hour.
            </div>`;
        return;
    }

    blogFeedGrid.innerHTML = articles.map(item => {
        const timeAgo = formatTimeAgo(item.published_on);

        return `
            <article class="vintage-news-card fade-in">
                <div class="news-card-meta">
                    <span class="news-source-tag">${escapeHtml(item.source_info?.name || item.source || 'WIRE')}</span>
                    <span>${timeAgo}</span>
                </div>
                <h4 class="news-card-title">${escapeHtml(item.title)}</h4>
                <p class="news-card-body">${escapeHtml(item.body || '')}</p>
                <a href="${item.url}" target="_blank" rel="noopener noreferrer" class="news-read-link">
                    Read Full Dispatch →
                </a>
            </article>
        `;
    }).join('');
}

// ─── Blog Auto-Refresh Timer ───
function startBlogTimer() {
    blogTimerInterval = setInterval(() => {
        blogCountdown--;
        if (blogTimerEl) blogTimerEl.textContent = blogCountdown + 's';

        if (blogCountdown <= 0) {
            fetchLiveBlog();
            resetBlogTimer();
        }
    }, 1000);
}

function resetBlogTimer() {
    blogCountdown = BLOG_REFRESH_INTERVAL;
    if (blogTimerEl) blogTimerEl.textContent = BLOG_REFRESH_INTERVAL + 's';
}

function formatTimeAgo(timestamp) {
    if (!timestamp) return 'Just now';
    const now = Math.floor(Date.now() / 1000);
    const diff = now - timestamp;

    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

// ─── Sort & Render ───
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

    renderTable(sorted);
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

// ─── Render Table ───
function renderTable(coins) {
    const search = searchInput.value.toLowerCase().trim();
    const filtered = search
        ? coins.filter(c =>
            c.name.toLowerCase().includes(search) ||
            c.symbol.toLowerCase().includes(search)
        )
        : coins;

    if (filtered.length === 0 && search) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="9" style="text-align:center; padding:40px; color:var(--text-muted); font-family:var(--font-mono);">
                    No assets recorded matching "<strong>${escapeHtml(search)}</strong>"
                </td>
            </tr>`;
        return;
    }

    const sym = currencySymbols[currentCurrency] || '';

    tableBody.innerHTML = filtered.map((coin, i) => {
        return `
        <tr class="fade-in" style="animation-delay:${Math.min(i * 12, 350)}ms" data-coin-id="${coin.id}">
            <td class="td-rank">${coin.market_cap_rank || '-'}</td>
            <td>
                <div class="coin-cell">
                    <img class="coin-img" src="${coin.image}" alt="${coin.name}" loading="lazy" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 40 40%22><circle cx=%2220%22 cy=%2220%22 r=%2220%22 fill=%22%23333%22/><text x=%2220%22 y=%2225%22 text-anchor=%22middle%22 fill=%22white%22 font-size=%2216%22>${coin.symbol?.charAt(0)?.toUpperCase() || '?'}</text></svg>'">
                    <span class="coin-name">${escapeHtml(coin.name)}</span>
                    <span class="coin-symbol">${coin.symbol}</span>
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

    // Draw sparklines
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

    // Row click → detail modal
    tableBody.querySelectorAll('tr[data-coin-id]').forEach(row => {
        row.addEventListener('click', () => {
            const coinId = row.dataset.coinId;
            const coin = allCoins.find(c => c.id === coinId);
            if (coin) openModal(coin);
        });
    });
}

// ─── Sparkline Drawing ───
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

    const color = (change || 0) >= 0 ? '#22c55e' : '#f43f5e';

    ctx.clearRect(0, 0, w, h);
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.3;
    ctx.lineJoin = 'round';

    sampled.forEach((price, i) => {
        const x = padding + (i / (sampled.length - 1)) * (w - 2 * padding);
        const y = h - padding - ((price - min) / range) * (h - 2 * padding);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    });
    ctx.stroke();
}

// ─── Ticker ───
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
            <img src="${coin.image}" alt="${coin.name}" style="width:40px;height:40px;border-radius:50%;">
            <div>
                <div class="modal-coin-name">${escapeHtml(coin.name)}</div>
                <div class="modal-coin-symbol">${coin.symbol.toUpperCase()} • RANK #${coin.market_cap_rank || '-'}</div>
            </div>
        </div>

        <div class="modal-price">${sym}${formatPrice(coin.current_price)}</div>
        <span class="${changeClass(coin.price_change_percentage_24h)}" style="font-family:var(--font-mono);font-size:0.95rem;">
            ${formatChange(coin.price_change_percentage_24h)} (24 Hours)
        </span>

        <div class="modal-stats">
            <div class="modal-stat">
                <div class="modal-stat-label">Market Capitalization</div>
                <div class="modal-stat-value">${sym}${formatCompact(coin.market_cap)}</div>
            </div>
            <div class="modal-stat">
                <div class="modal-stat-label">24h Trading Volume</div>
                <div class="modal-stat-value">${sym}${formatCompact(coin.total_volume)}</div>
            </div>
            <div class="modal-stat">
                <div class="modal-stat-label">24h High Record</div>
                <div class="modal-stat-value">${sym}${formatPrice(coin.high_24h)}</div>
            </div>
            <div class="modal-stat">
                <div class="modal-stat-label">24h Low Record</div>
                <div class="modal-stat-value">${sym}${formatPrice(coin.low_24h)}</div>
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
                <div class="modal-stat-label">Historical Peak (ATH)</div>
                <div class="modal-stat-value">${sym}${formatPrice(coin.ath)}</div>
            </div>
            <div class="modal-stat">
                <div class="modal-stat-label">Historical Floor (ATL)</div>
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

// ─── Pagination ───
function updatePagination() {
    pagination.style.display = 'flex';
    prevPageBtn.disabled = currentPage <= 1;
    pageInfo.textContent = `Page ${currentPage}`;
}

// ─── Filter ───
function filterTable() {
    sortAndRender();
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

function updateLastUpdated() {
    const now = new Date();
    lastUpdated.textContent = now.toLocaleTimeString();
}
