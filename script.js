/* ============================================
   LivePriceOfCrypto.com — JavaScript
   CoinGecko Free API (no key required)
   ============================================ */

// ─── Config ───
const API_BASE = 'https://api.coingecko.com/api/v3';
const REFRESH_INTERVAL = 60; // seconds

// ─── State ───
let allCoins = [];
let currentPage = 1;
let currentCurrency = 'usd';
let currentPerPage = 100;
let sortField = 'market_cap_rank';
let sortAsc = true;
let refreshCountdown = REFRESH_INTERVAL;
let refreshTimer = null;
let previousPrices = {};

// ─── Currency Symbols ───
const currencySymbols = {
    usd: '$', eur: '€', inr: '₹', gbp: '£', jpy: '¥', btc: '₿'
};

// ─── DOM Elements ───
const tableBody = document.getElementById('tableBody');
const loading = document.getElementById('loading');
const errorState = document.getElementById('errorState');
const searchInput = document.getElementById('searchInput');
const currencySelect = document.getElementById('currencySelect');
const perPageSelect = document.getElementById('perPageSelect');
const refreshTimerEl = document.getElementById('refreshTimer');
const refreshIcon = document.querySelector('.refresh-icon');
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

// ─── Init ───
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    fetchGlobalData();
    fetchData();
    startRefreshTimer();
    setupEventListeners();
});

// ─── Theme ───
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

    searchInput.addEventListener('input', debounce(filterTable, 250));

    currencySelect.addEventListener('change', () => {
        currentCurrency = currencySelect.value;
        currentPage = 1;
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

    // Sortable headers
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

    // Back to top
    window.addEventListener('scroll', () => {
        backToTop.classList.toggle('visible', window.scrollY > 400);
    });

    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// ─── Fetch Global Market Data ───
async function fetchGlobalData() {
    try {
        const res = await fetch(`${API_BASE}/global`);
        if (!res.ok) return;
        const data = await res.json();
        const g = data.data;

        document.getElementById('totalCryptos').textContent = (g.active_cryptocurrencies || 0).toLocaleString();
        document.getElementById('totalMarketCap').textContent = formatCompact(g.total_market_cap?.usd || 0);
        document.getElementById('totalVolume').textContent = formatCompact(g.total_volume?.usd || 0);
        document.getElementById('btcDominance').textContent = (g.market_cap_percentage?.btc || 0).toFixed(1) + '%';
    } catch (e) {
        console.warn('Failed to fetch global data:', e);
    }
}

// ─── Fetch Coin Data ───
async function fetchData() {
    showLoading(true);
    errorState.style.display = 'none';
    refreshIcon.classList.add('spinning');

    try {
        const url = `${API_BASE}/coins/markets?vs_currency=${currentCurrency}&order=market_cap_desc&per_page=${currentPerPage}&page=${currentPage}&sparkline=true&price_change_percentage=1h,24h,7d`;
        const res = await fetch(url);

        if (res.status === 429) {
            // Rate limited — retry after delay
            console.warn('Rate limited, retrying in 10s...');
            setTimeout(fetchData, 10000);
            return;
        }

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();
        allCoins = data;

        // Store previous prices for flash animation
        const newPrices = {};
        data.forEach(c => { newPrices[c.id] = c.current_price; });

        sortAndRender();
        updateTicker(data.slice(0, 15));
        updatePagination();
        updateLastUpdated();

        previousPrices = newPrices;

        showLoading(false);
        resetRefreshTimer();
        fetchGlobalData();
    } catch (err) {
        console.error('Fetch error:', err);
        showLoading(false);
        if (allCoins.length === 0) {
            errorState.style.display = 'block';
        }
    }

    refreshIcon.classList.remove('spinning');
}

// ─── Sort & Render ───
function sortAndRender() {
    const sorted = [...allCoins].sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];

        // Handle nulls
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
        const priceChange = previousPrices[coin.id] !== undefined && previousPrices[coin.id] !== coin.current_price;
        const priceUp = coin.current_price > (previousPrices[coin.id] || 0);
        const flashClass = priceChange ? (priceUp ? 'price-flash' : 'price-flash-down') : '';

        return `
        <tr class="fade-in" style="animation-delay:${Math.min(i * 15, 500)}ms" data-coin-id="${coin.id}">
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
            <td class="price-cell ${flashClass}">${sym}${formatPrice(coin.current_price)}</td>
            <td class="${changeClass(coin.price_change_percentage_1h_in_currency)}">${formatChange(coin.price_change_percentage_1h_in_currency)}</td>
            <td class="${changeClass(coin.price_change_percentage_24h)}">${formatChange(coin.price_change_percentage_24h)}</td>
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

    // Row click → modal
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

    // Sample down for performance
    const step = Math.max(1, Math.floor(prices.length / 60));
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

    // Gradient fill
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

    // Duplicate for seamless loop
    ticker.innerHTML = items + items;

    // Ticker click → modal
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

// ─── Refresh Timer ───
function startRefreshTimer() {
    refreshTimer = setInterval(() => {
        refreshCountdown--;
        refreshTimerEl.textContent = refreshCountdown + 's';

        if (refreshCountdown <= 0) {
            fetchData();
        }
    }, 1000);
}

function resetRefreshTimer() {
    refreshCountdown = REFRESH_INTERVAL;
    refreshTimerEl.textContent = REFRESH_INTERVAL + 's';
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
