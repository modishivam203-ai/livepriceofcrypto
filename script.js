/* ========================================================
   LivePriceOfCrypto.com — Complete JavaScript
   - Real-Time 1s Price Streaming via Binance WebSocket
   - CoinGecko REST API for Coin Data, Rankings & Sparklines
   - Automated Live Breaking Crypto Blog Feed (CryptoCompare API)
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
const modalOverlay = document.getElementById('modalOverlay');
const modalClose = document.getElementById('modalClose');
const modalContent = document.getElementById('modalContent');
const blogFeedGrid = document.getElementById('blogFeedGrid');
const blogTimerEl = document.getElementById('blogTimer');
const btnRefreshBlog = document.getElementById('btnRefreshBlog');
const wsStatusBadge = document.getElementById('wsStatusBadge');
const wsStatusText = document.getElementById('wsStatusText');

// ─── Initialization ───
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    setupTabs();
    setupEventListeners();
    fetchGlobalData();
    fetchExchangeRates();
    fetchData();
    fetchLiveBlog();
    initBinanceWebSocket();
    startBlogTimer();
});

// ─── Tab Switching ───
function setupTabs() {
    const tabs = document.querySelectorAll('.nav-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-view').forEach(view => view.classList.remove('active'));

            tab.classList.add('active');
            const targetId = tab.dataset.tab;
            const targetView = document.getElementById(targetId);
            if (targetView) targetView.classList.add('active');
        });
    });
}

// ─── Theme Management ───
function initTheme() {
    const saved = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', saved);
}

function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
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

    // Manual Refresh Blog
    btnRefreshBlog.addEventListener('click', () => {
        fetchLiveBlog();
        resetBlogTimer();
    });
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
            if (wsStatusText) wsStatusText.textContent = 'Live Feed (1s)';
            if (wsStatusBadge) wsStatusBadge.style.borderColor = 'rgba(34, 197, 94, 0.4)';
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
            console.warn('WebSocket error, falling back to polling:', err);
            if (wsStatusText) wsStatusText.textContent = 'Reconnecting...';
        };

        wsSocket.onclose = () => {
            console.log('WebSocket closed, attempting reconnect in 5s...');
            if (wsStatusText) wsStatusText.textContent = 'Reconnecting...';
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
        // e.g. s = "BTCUSDT", c = current close price
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

                // Update 24h change % if available
                if (data.openUsd > 0) {
                    coin.price_change_percentage_24h = ((data.priceUsd - data.openUsd) / data.openUsd) * 100;
                }

                // Instant UI Update: table cell
                updateLivePriceCell(coin.id, newPrice, isUp, coin.price_change_percentage_24h);
                // Instant UI Update: ticker
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

        // Trigger instant 1s color pulse
        priceCell.classList.remove('price-flash-up', 'price-flash-down');
        // Force reflow
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
            setTimeout(() => { priceEl.style.color = 'var(--text-primary)'; }, 600);
        }
    });
}

// ─── AUTOMATIC LIVE BLOG FEED (CryptoCompare Free Public News API) ───
async function fetchLiveBlog() {
    try {
        const res = await fetch(NEWS_API);
        if (!res.ok) throw new Error('News fetch error');
        const json = await res.json();
        const articles = json.Data || [];

        renderBlogFeed(articles.slice(0, 15));
    } catch (err) {
        console.warn('Live blog fetch error:', err);
        blogFeedGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align:center; padding: 40px; color: var(--text-muted);">
                <p>Failed to load live breaking crypto news. Retrying shortly...</p>
                <button class="btn-retry" onclick="fetchLiveBlog()">Retry Now</button>
            </div>
        `;
    }
}

function renderBlogFeed(articles) {
    if (!articles || articles.length === 0) {
        blogFeedGrid.innerHTML = `
            <div style="grid-column:1 / -1; text-align:center; padding:40px; color:var(--text-muted);">
                No breaking articles right now.
            </div>`;
        return;
    }

    blogFeedGrid.innerHTML = articles.map(item => {
        const timeAgo = formatTimeAgo(item.published_on);
        const tags = item.tags ? item.tags.split('|').slice(0, 2) : ['CRYPTO'];
        const fallbackImg = 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=600&auto=format&fit=crop&q=80';

        return `
            <article class="blog-card fade-in">
                <div class="blog-img-wrap">
                    <img class="blog-img" src="${item.imageurl || fallbackImg}" alt="${escapeHtml(item.title)}" loading="lazy" onerror="this.src='${fallbackImg}'">
                    <span class="blog-source-badge">${escapeHtml(item.source_info?.name || 'Crypto News')}</span>
                    <span class="blog-time-badge">${timeAgo}</span>
                </div>
                <div class="blog-body">
                    <div class="blog-tags">
                        ${tags.map(t => `<span class="blog-tag">${escapeHtml(t)}</span>`).join('')}
                    </div>
                    <h4 class="blog-card-title">${escapeHtml(item.title)}</h4>
                    <p class="blog-card-desc">${escapeHtml(item.body || '')}</p>
                    <div class="blog-card-footer">
                        <span style="font-size:0.75rem; color:var(--text-muted);">By ${escapeHtml(item.source || 'Breaking')}</span>
                        <a href="${item.url}" target="_blank" rel="noopener noreferrer" class="blog-read-btn">
                            Read Article
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                        </a>
                    </div>
                </div>
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
                <td colspan="9" style="text-align:center; padding:40px; color:var(--text-muted);">
                    No coins found matching "<strong>${escapeHtml(search)}</strong>"
                </td>
            </tr>`;
        return;
    }

    const sym = currencySymbols[currentCurrency] || '';

    tableBody.innerHTML = filtered.map((coin, i) => {
        return `
        <tr class="fade-in" style="animation-delay:${Math.min(i * 15, 400)}ms" data-coin-id="${coin.id}">
            <td class="td-rank">${coin.market_cap_rank || '-'}</td>
            <td>
                <div class="coin-cell">
                    <img class="coin-img" src="${coin.image}" alt="${coin.name}" loading="lazy" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 40 40%22><circle cx=%2220%22 cy=%2220%22 r=%2220%22 fill=%22%23333%22/><text x=%2220%22 y=%2225%22 text-anchor=%22middle%22 fill=%22white%22 font-size=%2216%22>${coin.symbol?.charAt(0)?.toUpperCase() || '?'}</text></svg>'">
                    <div class="coin-info">
                        <span class="coin-name">${escapeHtml(coin.name)}</span>
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

    // Draw sparklines
    filtered.forEach(coin => {
        if (coin.sparkline_in_7d?.price) {
            const row = tableBody.querySelector(`tr[data-coin-id="${coin.id}"]`);
            if (row) {
                const cell = row.querySelector('.sparkline-cell');
                const canvas = document.createElement('canvas');
                canvas.width = 120;
                canvas.height = 40;
                canvas.style.width = '120px';
                canvas.style.height = '40px';
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
    const padding = 4;

    const step = Math.max(1, Math.floor(prices.length / 50));
    const sampled = prices.filter((_, i) => i % step === 0);

    const min = Math.min(...sampled);
    const max = Math.max(...sampled);
    const range = max - min || 1;

    const color = (change || 0) >= 0 ? '#22c55e' : '#ef4444';

    ctx.clearRect(0, 0, w, h);
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.lineJoin = 'round';

    sampled.forEach((price, i) => {
        const x = padding + (i / (sampled.length - 1)) * (w - 2 * padding);
        const y = h - padding - ((price - min) / range) * (h - 2 * padding);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    });
    ctx.stroke();

    const lastX = padding + (w - 2 * padding);
    ctx.lineTo(lastX, h);
    ctx.lineTo(padding, h);
    ctx.closePath();

    const gradient = ctx.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, color + '30');
    gradient.addColorStop(1, color + '05');
    ctx.fillStyle = gradient;
    ctx.fill();
}

// ─── Ticker ───
function updateTicker(topCoins) {
    const sym = currencySymbols[currentCurrency] || '';
    const items = topCoins.map(coin => `
        <div class="ticker-item" data-coin-id="${coin.id}">
            <img src="${coin.image}" alt="${coin.name}" loading="lazy">
            <span class="ticker-name">${coin.name}</span>
            <span class="ticker-symbol">${coin.symbol}</span>
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
            <img src="${coin.image}" alt="${coin.name}">
            <div>
                <div class="modal-coin-name">${escapeHtml(coin.name)}</div>
                <div class="modal-coin-symbol">${coin.symbol} · Rank #${coin.market_cap_rank || '-'}</div>
            </div>
        </div>

        <div class="modal-price">${sym}${formatPrice(coin.current_price)}</div>
        <span class="${changeClass(coin.price_change_percentage_24h)}" style="font-size:1.1rem;">
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
                <div class="modal-stat-label">All-Time High</div>
                <div class="modal-stat-value">${sym}${formatPrice(coin.ath)}<br><span style="font-size:0.75rem;color:var(--text-muted)">${formatChange(coin.ath_change_percentage)} from ATH</span></div>
            </div>
            <div class="modal-stat">
                <div class="modal-stat-label">All-Time Low</div>
                <div class="modal-stat-value">${sym}${formatPrice(coin.atl)}<br><span style="font-size:0.75rem;color:var(--text-muted)">${formatChange(coin.atl_change_percentage)} from ATL</span></div>
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
