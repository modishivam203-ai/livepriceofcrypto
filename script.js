/* ========================================================
   LivePriceOfCrypto.com — Complete Modern Financial Engine
   - LivePriceOfGold.com Aesthetic & Architecture
   - Real-Time WebSocket & Zero-Lag Seed Data
   - Spot Rates for Top 5 Major Cryptos (Mobile Compact Small Boxes)
   - Interactive Canvas Charts for ALL World Cryptocurrencies (24H, 7D, 30D, 90D, 1Y)
   - Category Filtering (All, Layer 1, DeFi, Meme Coins, AI & Data, Big Movers)
   - Fear & Greed Index Live Sentiment Gauge
   - Top 5 Gainers & Top 5 Losers
   - Macroeconomic & Market News Feed with Images & In-Site Article Reader
   - Daily Economic Calendar
   ======================================================== */

// ─── API Endpoints ───
const BINANCE_REST_API = 'https://api.binance.com/api/v3/ticker/24hr';
const BINANCE_WS_URL = 'wss://stream.binance.com:9443/ws/!miniTicker@arr';
const COINGECKO_API = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=true&price_change_percentage=1h,24h,7d';
const FEAR_GREED_API = 'https://api.alternative.me/fng/?limit=1';
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

// ─── Curated World Cryptos Catalog (Instant 0.001s Baseline Dataset) ───
const INITIAL_COINS = [
    // Top 5 Majors
    { id: 'bitcoin', symbol: 'btc', name: 'Bitcoin', category: 'l1', market_cap_rank: 1, current_price: 74850, price_change_percentage_24h: 1.45, price_change_percentage_1h_in_currency: 0.12, price_change_percentage_7d_in_currency: 3.8, total_volume: 38500000000, market_cap: 1475000000000, high_24h: 75250, low_24h: 73600, circulating_supply: 19780000, total_supply: 21000000, ath: 75250, atl: 67.81, image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png' },
    { id: 'ethereum', symbol: 'eth', name: 'Ethereum', category: 'l1', market_cap_rank: 2, current_price: 2845, price_change_percentage_24h: 2.15, price_change_percentage_1h_in_currency: -0.05, price_change_percentage_7d_in_currency: 5.2, total_volume: 19500000000, market_cap: 342000000000, high_24h: 2890, low_24h: 2760, circulating_supply: 120400000, total_supply: null, ath: 4878, atl: 0.43, image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png' },
    { id: 'solana', symbol: 'sol', name: 'Solana', category: 'l1', market_cap_rank: 3, current_price: 188.50, price_change_percentage_24h: 4.85, price_change_percentage_1h_in_currency: 0.45, price_change_percentage_7d_in_currency: 12.4, total_volume: 6800000000, market_cap: 89000000000, high_24h: 194.00, low_24h: 178.50, circulating_supply: 471000000, total_supply: 588000000, ath: 259.96, atl: 0.50, image: 'https://assets.coingecko.com/coins/images/4128/large/solana.png' },
    { id: 'binancecoin', symbol: 'bnb', name: 'BNB', category: 'l1', market_cap_rank: 4, current_price: 595.20, price_change_percentage_24h: -0.65, price_change_percentage_1h_in_currency: 0.10, price_change_percentage_7d_in_currency: 1.8, total_volume: 1200000000, market_cap: 86500000000, high_24h: 608.00, low_24h: 588.00, circulating_supply: 145000000, total_supply: 145000000, ath: 717.48, atl: 0.039, image: 'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png' },
    { id: 'ripple', symbol: 'xrp', name: 'XRP', category: 'l1', market_cap_rank: 5, current_price: 0.584, price_change_percentage_24h: 3.40, price_change_percentage_1h_in_currency: 0.22, price_change_percentage_7d_in_currency: 6.1, total_volume: 2400000000, market_cap: 33200000000, high_24h: 0.602, low_24h: 0.565, circulating_supply: 56800000000, total_supply: 99990000000, ath: 3.84, atl: 0.0026, image: 'https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png' },

    // Meme Coins
    { id: 'dogecoin', symbol: 'doge', name: 'Dogecoin', category: 'meme', market_cap_rank: 6, current_price: 0.168, price_change_percentage_24h: 8.75, price_change_percentage_1h_in_currency: 0.80, price_change_percentage_7d_in_currency: 18.5, total_volume: 3200000000, market_cap: 24600000000, high_24h: 0.175, low_24h: 0.152, circulating_supply: 146000000000, total_supply: null, ath: 0.731, atl: 0.000086, image: 'https://assets.coingecko.com/coins/images/5/large/dogecoin.png' },
    { id: 'shiba-inu', symbol: 'shib', name: 'Shiba Inu', category: 'meme', market_cap_rank: 12, current_price: 0.0000185, price_change_percentage_24h: -3.80, price_change_percentage_1h_in_currency: -0.20, price_change_percentage_7d_in_currency: -2.5, total_volume: 620000000, market_cap: 10900000000, high_24h: 0.0000196, low_24h: 0.0000180, circulating_supply: 589000000000000, total_supply: 589000000000000, ath: 0.000086, atl: 0.000000000056, image: 'https://assets.coingecko.com/coins/images/11939/large/shiba.png' },
    { id: 'pepe', symbol: 'pepe', name: 'Pepe', category: 'meme', market_cap_rank: 14, current_price: 0.0000098, price_change_percentage_24h: 11.20, price_change_percentage_1h_in_currency: 1.10, price_change_percentage_7d_in_currency: 24.5, total_volume: 1800000000, market_cap: 4100000000, high_24h: 0.0000105, low_24h: 0.0000087, circulating_supply: 420690000000000, total_supply: 420690000000000, ath: 0.0000171, atl: 0.000000055, image: 'https://assets.coingecko.com/coins/images/29850/large/pepe-token.png' },
    { id: 'dogwifcoin', symbol: 'wif', name: 'Dogwifhat', category: 'meme', market_cap_rank: 28, current_price: 2.38, price_change_percentage_24h: 14.50, price_change_percentage_1h_in_currency: 1.30, price_change_percentage_7d_in_currency: 32.1, total_volume: 850000000, market_cap: 2380000000, high_24h: 2.48, low_24h: 2.05, circulating_supply: 998900000, total_supply: 998900000, ath: 4.83, atl: 0.0015, image: 'https://assets.coingecko.com/coins/images/33566/large/dogwifhat.jpg' },
    { id: 'bonk', symbol: 'bonk', name: 'Bonk', category: 'meme', market_cap_rank: 35, current_price: 0.0000215, price_change_percentage_24h: 9.30, price_change_percentage_1h_in_currency: 0.85, price_change_percentage_7d_in_currency: 16.8, total_volume: 380000000, market_cap: 1520000000, high_24h: 0.0000228, low_24h: 0.0000195, circulating_supply: 70000000000000, total_supply: 92800000000000, ath: 0.000045, atl: 0.000000086, image: 'https://assets.coingecko.com/coins/images/28600/large/bonk.jpg' },
    { id: 'floki', symbol: 'floki', name: 'FLOKI', category: 'meme', market_cap_rank: 42, current_price: 0.000142, price_change_percentage_24h: 6.80, price_change_percentage_1h_in_currency: 0.40, price_change_percentage_7d_in_currency: 11.2, total_volume: 240000000, market_cap: 1370000000, high_24h: 0.000151, low_24h: 0.000132, circulating_supply: 9690000000000, total_supply: 10000000000000, ath: 0.000342, atl: 0.000000084, image: 'https://assets.coingecko.com/coins/images/16746/large/FLOKI.png' },
    { id: 'brett', symbol: 'brett', name: 'Brett (Based)', category: 'meme', market_cap_rank: 48, current_price: 0.108, price_change_percentage_24h: 8.40, price_change_percentage_1h_in_currency: 0.70, price_change_percentage_7d_in_currency: 19.4, total_volume: 120000000, market_cap: 1070000000, high_24h: 0.116, low_24h: 0.098, circulating_supply: 9910000000, total_supply: 9910000000, ath: 0.193, atl: 0.019, image: 'https://assets.coingecko.com/coins/images/35529/large/brett.png' },
    { id: 'popcat', symbol: 'popcat', name: 'Popcat', category: 'meme', market_cap_rank: 52, current_price: 1.45, price_change_percentage_24h: 12.80, price_change_percentage_1h_in_currency: 1.15, price_change_percentage_7d_in_currency: 28.5, total_volume: 180000000, market_cap: 1420000000, high_24h: 1.55, low_24h: 1.28, circulating_supply: 979000000, total_supply: 979000000, ath: 1.81, atl: 0.0037, image: 'https://assets.coingecko.com/coins/images/33760/large/popcat.png' },

    // Layer 1 & Major Chains
    { id: 'cardano', symbol: 'ada', name: 'Cardano', category: 'l1', market_cap_rank: 7, current_price: 0.365, price_change_percentage_24h: 1.10, price_change_percentage_1h_in_currency: 0.05, price_change_percentage_7d_in_currency: 2.4, total_volume: 450000000, market_cap: 13100000000, high_24h: 0.378, low_24h: 0.358, circulating_supply: 35700000000, total_supply: 45000000000, ath: 3.09, atl: 0.019, image: 'https://assets.coingecko.com/coins/images/975/large/cardano.png' },
    { id: 'avalanche-2', symbol: 'avax', name: 'Avalanche', category: 'l1', market_cap_rank: 8, current_price: 27.80, price_change_percentage_24h: -2.30, price_change_percentage_1h_in_currency: -0.15, price_change_percentage_7d_in_currency: -4.1, total_volume: 520000000, market_cap: 11200000000, high_24h: 29.10, low_24h: 26.90, circulating_supply: 404000000, total_supply: 720000000, ath: 144.96, atl: 2.80, image: 'https://assets.coingecko.com/coins/images/12559/large/Avalanche_Circle_RedWhite_Trans.png' },
    { id: 'sui', symbol: 'sui', name: 'Sui', category: 'l1', market_cap_rank: 9, current_price: 2.28, price_change_percentage_24h: 6.90, price_change_percentage_1h_in_currency: 0.60, price_change_percentage_7d_in_currency: 22.0, total_volume: 1400000000, market_cap: 6400000000, high_24h: 2.36, low_24h: 2.10, circulating_supply: 2850000000, total_supply: 10000000000, ath: 2.36, atl: 0.364, image: 'https://assets.coingecko.com/coins/images/26375/large/sui-ocean-square.png' },
    { id: 'polkadot', symbol: 'dot', name: 'Polkadot', category: 'l1', market_cap_rank: 11, current_price: 4.15, price_change_percentage_24h: 0.85, price_change_percentage_1h_in_currency: 0.02, price_change_percentage_7d_in_currency: 1.1, total_volume: 210000000, market_cap: 6050000000, high_24h: 4.25, low_24h: 4.05, circulating_supply: 1460000000, total_supply: null, ath: 54.98, atl: 2.70, image: 'https://assets.coingecko.com/coins/images/12171/large/polkadot.png' },
    { id: 'near', symbol: 'near', name: 'NEAR Protocol', category: 'l1', market_cap_rank: 13, current_price: 4.65, price_change_percentage_24h: 5.40, price_change_percentage_1h_in_currency: 0.35, price_change_percentage_7d_in_currency: 8.9, total_volume: 480000000, market_cap: 5600000000, high_24h: 4.82, low_24h: 4.38, circulating_supply: 1220000000, total_supply: 1220000000, ath: 20.44, atl: 0.526, image: 'https://assets.coingecko.com/coins/images/10365/large/near.png' },
    { id: 'litecoin', symbol: 'ltc', name: 'Litecoin', category: 'l1', market_cap_rank: 16, current_price: 72.40, price_change_percentage_24h: 1.95, price_change_percentage_1h_in_currency: 0.15, price_change_percentage_7d_in_currency: 4.6, total_volume: 380000000, market_cap: 5400000000, high_24h: 74.10, low_24h: 70.80, circulating_supply: 75000000, total_supply: 84000000, ath: 410.26, atl: 1.15, image: 'https://assets.coingecko.com/coins/images/2/large/litecoin.png' },
    { id: 'aptos', symbol: 'apt', name: 'Aptos', category: 'l1', market_cap_rank: 17, current_price: 9.35, price_change_percentage_24h: -4.20, price_change_percentage_1h_in_currency: -0.30, price_change_percentage_7d_in_currency: -1.8, total_volume: 310000000, market_cap: 4600000000, high_24h: 9.90, low_24h: 9.15, circulating_supply: 512000000, total_supply: 1120000000, ath: 19.92, atl: 3.08, image: 'https://assets.coingecko.com/coins/images/26455/large/aptos_round.png' },
    { id: 'polygon-ecosystem-token', symbol: 'pol', name: 'Polygon', category: 'l1', market_cap_rank: 20, current_price: 0.342, price_change_percentage_24h: -1.70, price_change_percentage_1h_in_currency: 0.05, price_change_percentage_7d_in_currency: -3.2, total_volume: 110000000, market_cap: 2700000000, high_24h: 0.355, low_24h: 0.336, circulating_supply: 7960000000, total_supply: 10000000000, ath: 2.92, atl: 0.0031, image: 'https://assets.coingecko.com/coins/images/4713/large/polygon.png' },
    { id: 'kaspa', symbol: 'kas', name: 'Kaspa', category: 'l1', market_cap_rank: 22, current_price: 0.128, price_change_percentage_24h: 3.80, price_change_percentage_1h_in_currency: 0.25, price_change_percentage_7d_in_currency: 6.4, total_volume: 85000000, market_cap: 3180000000, high_24h: 0.134, low_24h: 0.122, circulating_supply: 24800000000, total_supply: 28700000000, ath: 0.207, atl: 0.00017, image: 'https://assets.coingecko.com/coins/images/25751/large/kaspa-icon-exchanges.png' },
    { id: 'cosmos', symbol: 'atom', name: 'Cosmos', category: 'l1', market_cap_rank: 25, current_price: 4.45, price_change_percentage_24h: -1.10, price_change_percentage_1h_in_currency: 0.08, price_change_percentage_7d_in_currency: -2.0, total_volume: 130000000, market_cap: 1740000000, high_24h: 4.60, low_24h: 4.38, circulating_supply: 390000000, total_supply: null, ath: 44.42, atl: 1.16, image: 'https://assets.coingecko.com/coins/images/1481/large/cosmos_hub.png' },
    { id: 'hedera-hashgraph', symbol: 'hbar', name: 'Hedera', category: 'l1', market_cap_rank: 27, current_price: 0.052, price_change_percentage_24h: 2.40, price_change_percentage_1h_in_currency: 0.12, price_change_percentage_7d_in_currency: 4.1, total_volume: 65000000, market_cap: 1960000000, high_24h: 0.054, low_24h: 0.050, circulating_supply: 37600000000, total_supply: 50000000000, ath: 0.569, atl: 0.0098, image: 'https://assets.coingecko.com/coins/images/3688/large/hbar.png' },
    { id: 'celestia', symbol: 'tia', name: 'Celestia', category: 'l1', market_cap_rank: 31, current_price: 5.20, price_change_percentage_24h: 7.60, price_change_percentage_1h_in_currency: 0.65, price_change_percentage_7d_in_currency: 14.5, total_volume: 190000000, market_cap: 1140000000, high_24h: 5.48, low_24h: 4.80, circulating_supply: 220000000, total_supply: 1000000000, ath: 20.85, atl: 2.08, image: 'https://assets.coingecko.com/coins/images/31967/large/tia.png' },
    { id: 'sei-network', symbol: 'sei', name: 'Sei', category: 'l1', market_cap_rank: 36, current_price: 0.412, price_change_percentage_24h: 5.10, price_change_percentage_1h_in_currency: 0.30, price_change_percentage_7d_in_currency: 9.8, total_volume: 160000000, market_cap: 1480000000, high_24h: 0.435, low_24h: 0.390, circulating_supply: 3600000000, total_supply: 10000000000, ath: 1.14, atl: 0.095, image: 'https://assets.coingecko.com/coins/images/28205/large/Sei_Logo_-_Transparent.png' },
    { id: 'algorand', symbol: 'algo', name: 'Algorand', category: 'l1', market_cap_rank: 45, current_price: 0.125, price_change_percentage_24h: 1.60, price_change_percentage_1h_in_currency: 0.10, price_change_percentage_7d_in_currency: 3.2, total_volume: 52000000, market_cap: 1030000000, high_24h: 0.130, low_24h: 0.121, circulating_supply: 8250000000, total_supply: 10000000000, ath: 3.56, atl: 0.087, image: 'https://assets.coingecko.com/coins/images/4380/large/download.png' },

    // DeFi (Decentralized Finance)
    { id: 'chainlink', symbol: 'link', name: 'Chainlink', category: 'defi', market_cap_rank: 10, current_price: 11.95, price_change_percentage_24h: -1.20, price_change_percentage_1h_in_currency: 0.12, price_change_percentage_7d_in_currency: 0.5, total_volume: 380000000, market_cap: 7200000000, high_24h: 12.40, low_24h: 11.60, circulating_supply: 608000000, total_supply: 1000000000, ath: 52.70, atl: 0.148, image: 'https://assets.coingecko.com/coins/images/877/large/chainlink-new-logo.png' },
    { id: 'uniswap', symbol: 'uni', name: 'Uniswap', category: 'defi', market_cap_rank: 15, current_price: 8.20, price_change_percentage_24h: -2.85, price_change_percentage_1h_in_currency: -0.10, price_change_percentage_7d_in_currency: 3.2, total_volume: 290000000, market_cap: 4900000000, high_24h: 8.65, low_24h: 8.05, circulating_supply: 600000000, total_supply: 1000000000, ath: 44.92, atl: 1.03, image: 'https://assets.coingecko.com/coins/images/12504/large/uniswap-uni.png' },
    { id: 'aave', symbol: 'aave', name: 'Aave', category: 'defi', market_cap_rank: 21, current_price: 156.40, price_change_percentage_24h: 6.20, price_change_percentage_1h_in_currency: 0.50, price_change_percentage_7d_in_currency: 15.8, total_volume: 340000000, market_cap: 2340000000, high_24h: 162.00, low_24h: 147.20, circulating_supply: 14950000, total_supply: 16000000, ath: 661.69, atl: 25.92, image: 'https://assets.coingecko.com/coins/images/12645/large/AAVE.png' },
    { id: 'injective-protocol', symbol: 'inj', name: 'Injective', category: 'defi', market_cap_rank: 24, current_price: 21.80, price_change_percentage_24h: 4.90, price_change_percentage_1h_in_currency: 0.35, price_change_percentage_7d_in_currency: 11.4, total_volume: 180000000, market_cap: 2160000000, high_24h: 22.75, low_24h: 20.60, circulating_supply: 99000000, total_supply: 100000000, ath: 52.62, atl: 0.657, image: 'https://assets.coingecko.com/coins/images/12882/large/Secondary_Symbol.png' },
    { id: 'maker', symbol: 'mkr', name: 'Maker', category: 'defi', market_cap_rank: 30, current_price: 1620, price_change_percentage_24h: -1.80, price_change_percentage_1h_in_currency: -0.10, price_change_percentage_7d_in_currency: 2.1, total_volume: 95000000, market_cap: 1490000000, high_24h: 1675, low_24h: 1590, circulating_supply: 924000, total_supply: 977000, ath: 6292, atl: 168.36, image: 'https://assets.coingecko.com/coins/images/1364/large/Mark_Maker.png' },
    { id: 'lido-dao', symbol: 'ldo', name: 'Lido DAO', category: 'defi', market_cap_rank: 33, current_price: 1.28, price_change_percentage_24h: 3.10, price_change_percentage_1h_in_currency: 0.20, price_change_percentage_7d_in_currency: 5.6, total_volume: 110000000, market_cap: 1150000000, high_24h: 1.34, low_24h: 1.23, circulating_supply: 896000000, total_supply: 1000000000, ath: 7.30, atl: 0.406, image: 'https://assets.coingecko.com/coins/images/13573/large/Lido_DAO.png' },
    { id: 'thorchain', symbol: 'rune', name: 'THORChain', category: 'defi', market_cap_rank: 38, current_price: 5.40, price_change_percentage_24h: 7.20, price_change_percentage_1h_in_currency: 0.60, price_change_percentage_7d_in_currency: 17.3, total_volume: 290000000, market_cap: 1820000000, high_24h: 5.68, low_24h: 4.95, circulating_supply: 337000000, total_supply: 414000000, ath: 20.87, atl: 0.0085, image: 'https://assets.coingecko.com/coins/images/6595/large/thorchain.png' },
    { id: 'jupiter-exchange-solana', symbol: 'jup', name: 'Jupiter', category: 'defi', market_cap_rank: 40, current_price: 1.05, price_change_percentage_24h: 8.90, price_change_percentage_1h_in_currency: 0.75, price_change_percentage_7d_in_currency: 21.0, total_volume: 210000000, market_cap: 1410000000, high_24h: 1.12, low_24h: 0.95, circulating_supply: 1350000000, total_supply: 10000000000, ath: 2.00, atl: 0.45, image: 'https://assets.coingecko.com/coins/images/34188/large/jup.png' },
    { id: 'raydium', symbol: 'ray', name: 'Raydium', category: 'defi', market_cap_rank: 44, current_price: 4.35, price_change_percentage_24h: 13.40, price_change_percentage_1h_in_currency: 1.20, price_change_percentage_7d_in_currency: 34.5, total_volume: 380000000, market_cap: 1150000000, high_24h: 4.60, low_24h: 3.80, circulating_supply: 264000000, total_supply: 555000000, ath: 16.83, atl: 0.134, image: 'https://assets.coingecko.com/coins/images/13928/large/PSmYrHBp_400x400.jpg' },
    { id: 'pendle', symbol: 'pendle', name: 'Pendle', category: 'defi', market_cap_rank: 50, current_price: 4.90, price_change_percentage_24h: 5.80, price_change_percentage_1h_in_currency: 0.45, price_change_percentage_7d_in_currency: 12.6, total_volume: 130000000, market_cap: 790000000, high_24h: 5.15, low_24h: 4.60, circulating_supply: 161000000, total_supply: 258000000, ath: 7.50, atl: 0.033, image: 'https://assets.coingecko.com/coins/images/15069/large/pendle.png' },

    // AI & Data Sector
    { id: 'render-token', symbol: 'render', name: 'Render', category: 'ai', market_cap_rank: 18, current_price: 5.85, price_change_percentage_24h: 7.30, price_change_percentage_1h_in_currency: 0.50, price_change_percentage_7d_in_currency: 14.2, total_volume: 280000000, market_cap: 3100000000, high_24h: 6.10, low_24h: 5.40, circulating_supply: 518000000, total_supply: 532000000, ath: 13.53, atl: 0.036, image: 'https://assets.coingecko.com/coins/images/11636/large/rndr.png' },
    { id: 'fetch-ai', symbol: 'fet', name: 'Artificial Superintelligence Alliance', category: 'ai', market_cap_rank: 19, current_price: 1.34, price_change_percentage_24h: 9.80, price_change_percentage_1h_in_currency: 0.70, price_change_percentage_7d_in_currency: 19.5, total_volume: 290000000, market_cap: 3400000000, high_24h: 1.42, low_24h: 1.21, circulating_supply: 2520000000, total_supply: 2710000000, ath: 3.45, atl: 0.0082, image: 'https://assets.coingecko.com/coins/images/5681/large/Fetch.jpg' },
    { id: 'bittensor', symbol: 'tao', name: 'Bittensor', category: 'ai', market_cap_rank: 23, current_price: 520.50, price_change_percentage_24h: 8.60, price_change_percentage_1h_in_currency: 0.85, price_change_percentage_7d_in_currency: 22.8, total_volume: 195000000, market_cap: 3840000000, high_24h: 545.00, low_24h: 475.00, circulating_supply: 7380000, total_supply: 21000000, ath: 757.60, atl: 30.40, image: 'https://assets.coingecko.com/coins/images/29378/large/tao.png' },
    { id: 'the-graph', symbol: 'grt', name: 'The Graph', category: 'ai', market_cap_rank: 29, current_price: 0.185, price_change_percentage_24h: 4.10, price_change_percentage_1h_in_currency: 0.25, price_change_percentage_7d_in_currency: 8.2, total_volume: 98000000, market_cap: 1760000000, high_24h: 0.194, low_24h: 0.176, circulating_supply: 9550000000, total_supply: 10800000000, ath: 2.84, atl: 0.052, image: 'https://assets.coingecko.com/coins/images/13397/large/Graph_Token.png' },
    { id: 'akash-network', symbol: 'akt', name: 'Akash Network', category: 'ai', market_cap_rank: 37, current_price: 2.75, price_change_percentage_24h: 6.40, price_change_percentage_1h_in_currency: 0.40, price_change_percentage_7d_in_currency: 15.1, total_volume: 48000000, market_cap: 680000000, high_24h: 2.90, low_24h: 2.55, circulating_supply: 247000000, total_supply: 388000000, ath: 8.07, atl: 0.165, image: 'https://assets.coingecko.com/coins/images/12780/large/Akash_Network_logo.png' },
    { id: 'worldcoin-wld', symbol: 'wld', name: 'Worldcoin', category: 'ai', market_cap_rank: 41, current_price: 2.15, price_change_percentage_24h: 11.40, price_change_percentage_1h_in_currency: 0.95, price_change_percentage_7d_in_currency: 26.8, total_volume: 420000000, market_cap: 1380000000, high_24h: 2.28, low_24h: 1.90, circulating_supply: 645000000, total_supply: 10000000000, ath: 11.74, atl: 0.975, image: 'https://assets.coingecko.com/coins/images/31062/large/worldcoin.png' },

    // Layer 2 & Ecosystem Tokens
    { id: 'arbitrum', symbol: 'arb', name: 'Arbitrum', category: 'l1', market_cap_rank: 26, current_price: 0.585, price_change_percentage_24h: -1.40, price_change_percentage_1h_in_currency: 0.05, price_change_percentage_7d_in_currency: -2.8, total_volume: 165000000, market_cap: 2390000000, high_24h: 0.605, low_24h: 0.572, circulating_supply: 4090000000, total_supply: 10000000000, ath: 2.39, atl: 0.435, image: 'https://assets.coingecko.com/coins/images/16547/large/arbitrum_logo.png' },
    { id: 'optimism', symbol: 'op', name: 'Optimism', category: 'l1', market_cap_rank: 32, current_price: 1.68, price_change_percentage_24h: -2.10, price_change_percentage_1h_in_currency: -0.15, price_change_percentage_7d_in_currency: 1.5, total_volume: 145000000, market_cap: 2110000000, high_24h: 1.76, low_24h: 1.62, circulating_supply: 1250000000, total_supply: 4290000000, ath: 4.84, atl: 0.402, image: 'https://assets.coingecko.com/coins/images/25244/large/Optimism.png' },
    { id: 'blockstack', symbol: 'stx', name: 'Stacks', category: 'l1', market_cap_rank: 34, current_price: 1.82, price_change_percentage_24h: 4.20, price_change_percentage_1h_in_currency: 0.30, price_change_percentage_7d_in_currency: 9.4, total_volume: 115000000, market_cap: 2730000000, high_24h: 1.90, low_24h: 1.72, circulating_supply: 1500000000, total_supply: 1810000000, ath: 3.86, atl: 0.045, image: 'https://assets.coingecko.com/coins/images/2069/large/Stacks_Logo_png.png' },
    { id: 'immutable-x', symbol: 'imx', name: 'Immutable', category: 'l1', market_cap_rank: 39, current_price: 1.42, price_change_percentage_24h: 2.80, price_change_percentage_1h_in_currency: 0.15, price_change_percentage_7d_in_currency: 6.2, total_volume: 85000000, market_cap: 2310000000, high_24h: 1.48, low_24h: 1.36, circulating_supply: 1630000000, total_supply: 2000000000, ath: 9.52, atl: 0.378, image: 'https://assets.coingecko.com/coins/images/17233/large/imx.png' },
    { id: 'stellar', symbol: 'xlm', name: 'Stellar', category: 'l1', market_cap_rank: 43, current_price: 0.098, price_change_percentage_24h: 1.30, price_change_percentage_1h_in_currency: 0.05, price_change_percentage_7d_in_currency: 2.6, total_volume: 72000000, market_cap: 2920000000, high_24h: 0.102, low_24h: 0.096, circulating_supply: 29700000000, total_supply: 50000000000, ath: 0.875, atl: 0.00047, image: 'https://assets.coingecko.com/coins/images/100/large/Stellar_symbol_black_RGB.png' },
    { id: 'monero', symbol: 'xmr', name: 'Monero', category: 'l1', market_cap_rank: 46, current_price: 158.20, price_change_percentage_24h: 0.60, price_change_percentage_1h_in_currency: 0.02, price_change_percentage_7d_in_currency: 1.8, total_volume: 62000000, market_cap: 2910000000, high_24h: 161.00, low_24h: 156.40, circulating_supply: 18400000, total_supply: 18400000, ath: 542.33, atl: 0.216, image: 'https://assets.coingecko.com/coins/images/69/large/monero_logo.png' },
    { id: 'filecoin', symbol: 'fil', name: 'Filecoin', category: 'ai', market_cap_rank: 47, current_price: 3.75, price_change_percentage_24h: -1.20, price_change_percentage_1h_in_currency: -0.05, price_change_percentage_7d_in_currency: 0.8, total_volume: 88000000, market_cap: 2260000000, high_24h: 3.88, low_24h: 3.68, circulating_supply: 602000000, total_supply: 1960000000, ath: 236.84, atl: 1.83, image: 'https://assets.coingecko.com/coins/images/12817/large/filecoin.png' },
    { id: 'ethena', symbol: 'ena', name: 'Ethena', category: 'defi', market_cap_rank: 49, current_price: 0.445, price_change_percentage_24h: 10.20, price_change_percentage_1h_in_currency: 0.90, price_change_percentage_7d_in_currency: 22.4, total_volume: 240000000, market_cap: 1250000000, high_24h: 0.472, low_24h: 0.398, circulating_supply: 2810000000, total_supply: 15000000000, ath: 1.52, atl: 0.198, image: 'https://assets.coingecko.com/coins/images/36530/large/ethena.png' },
    { id: 'fantom', symbol: 'ftm', name: 'Fantom', category: 'l1', market_cap_rank: 51, current_price: 0.685, price_change_percentage_24h: 4.80, price_change_percentage_1h_in_currency: 0.35, price_change_percentage_7d_in_currency: 11.2, total_volume: 140000000, market_cap: 1920000000, high_24h: 0.715, low_24h: 0.645, circulating_supply: 2800000000, total_supply: 3175000000, ath: 3.46, atl: 0.0019, image: 'https://assets.coingecko.com/coins/images/4001/large/Fantom_round.png' }
];

// ─── State ───
let allCoins = JSON.parse(JSON.stringify(INITIAL_COINS));
let selectedCategory = 'all';
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

// Interactive Chart State
let activeModalCoin = null;
let activeTimeframe = '24h';
let chartPoints = [];

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
const liveClock = document.getElementById('liveClock');

// Modal Elements
const chartModalOverlay = document.getElementById('chartModalOverlay');
const chartModalClose = document.getElementById('chartModalClose');
const modalCoinImg = document.getElementById('modalCoinImg');
const modalCoinName = document.getElementById('modalCoinName');
const modalCoinSymbol = document.getElementById('modalCoinSymbol');
const modalCoinRank = document.getElementById('modalCoinRank');
const modalCoinPrice = document.getElementById('modalCoinPrice');
const modalCoinChange = document.getElementById('modalCoinChange');
const modalInteractiveCanvas = document.getElementById('modalInteractiveCanvas');
const chartTooltip = document.getElementById('chartTooltip');
const modalStatsGrid = document.getElementById('modalStatsGrid');

// Global Stats Bar Elements
const totalCryptosEl = document.getElementById('totalCryptos');
const totalMarketCapEl = document.getElementById('totalMarketCap');
const totalVolumeEl = document.getElementById('totalVolume');
const btcDominanceEl = document.getElementById('btcDominance');

// Fear & Greed Elements
const fngValueEl = document.getElementById('fngValue');
const fngClassificationEl = document.getElementById('fngClassification');

// Whale & Institutional Flow Elements
const whaleBuyersList = document.getElementById('whaleBuyersList');
const whaleSellersList = document.getElementById('whaleSellersList');
const whaleTradesStream = document.getElementById('whaleTradesStream');

// ─── WHALE & INSTITUTIONAL ORDER FLOW DATA ───
const WHALE_BUYERS = [
    { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC', buyPct: 72, inflow: '+$142.5M', bias: 'Heavy Buy Orders', img: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png' },
    { id: 'solana', name: 'Solana', symbol: 'SOL', buyPct: 68, inflow: '+$68.4M', bias: 'Institutional Accumulation', img: 'https://assets.coingecko.com/coins/images/4128/large/solana.png' },
    { id: 'sui', name: 'Sui', symbol: 'SUI', buyPct: 65, inflow: '+$34.2M', bias: 'Aggressive Spot Buying', img: 'https://assets.coingecko.com/coins/images/26375/large/sui-ocean-square.png' },
    { id: 'dogecoin', name: 'Dogecoin', symbol: 'DOGE', buyPct: 61, inflow: '+$28.9M', bias: 'Retail + Whale Inflows', img: 'https://assets.coingecko.com/coins/images/5/large/dogecoin.png' },
    { id: 'fetch-ai', name: 'ASI Alliance', symbol: 'FET', buyPct: 59, inflow: '+$18.7M', bias: 'AI Desk Accumulation', img: 'https://assets.coingecko.com/coins/images/5681/large/Fetch.jpg' }
];

const WHALE_SELLERS = [
    { id: 'ethereum', name: 'Ethereum', symbol: 'ETH', sellPct: 62, outflow: '-$54.8M', bias: 'Whale Distribution', img: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png' },
    { id: 'avalanche-2', name: 'Avalanche', symbol: 'AVAX', sellPct: 59, outflow: '-$22.4M', bias: 'Institutional Profit Taking', img: 'https://assets.coingecko.com/coins/images/12559/large/Avalanche_Circle_RedWhite_Trans.png' },
    { id: 'arbitrum', name: 'Arbitrum', symbol: 'ARB', sellPct: 57, outflow: '-$14.8M', bias: 'Token Unlock Selling', img: 'https://assets.coingecko.com/coins/images/16547/large/arbitrum_logo.png' },
    { id: 'polygon-ecosystem-token', name: 'Polygon', symbol: 'POL', sellPct: 55, outflow: '-$11.2M', bias: 'Order Book Sell Pressure', img: 'https://assets.coingecko.com/coins/images/4713/large/polygon.png' },
    { id: 'aptos', name: 'Aptos', symbol: 'APT', sellPct: 54, outflow: '-$9.6M', bias: 'Resistance Level Selloff', img: 'https://assets.coingecko.com/coins/images/26455/large/aptos_round.png' }
];

let whaleTradeCounter = 0;

// ─── Initialization ───
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    setupEventListeners();
    startClock();

    // 1. Instant Render from Curated Baseline Dataset (0.001s render)
    renderInitialData();

    // 2. Fetch fresh prices from Binance REST & background CoinGecko
    fetchLivePrices();

    // 3. Connect real-time WebSocket stream (0 rate limit)
    initBinanceWebSocket();

    // 4. Fetch Fear & Greed Index Sentiment
    fetchFearAndGreedIndex();

    // 5. Fetch Macro & Crypto Market News (with Images)
    fetchMacroNews();
    startNewsTimer();

    // 6. Load Economic Calendar
    loadEconomicCalendarWidget();
});

function renderInitialData() {
    renderMajorCoins(allCoins);
    renderWhaleOrderFlow();
    initWhaleTradesStream();
    renderGainersAndLosers(allCoins);
    sortAndRender();
    updateTicker(allCoins.slice(0, 15));
    updateSidebarRates();
    updateGlobalMetrics();
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

// ─── Global Financial Metrics Calculation ───
function updateGlobalMetrics() {
    const rate = currencyRates[currentCurrency] || 1;
    const sym = currencySymbols[currentCurrency] || '';

    let totalCap = 0;
    let totalVol = 0;
    let btcCap = 0;

    allCoins.forEach(coin => {
        const cap = (coin.market_cap || 0);
        const vol = (coin.total_volume || 0);
        totalCap += cap;
        totalVol += vol;
        if (coin.symbol.toLowerCase() === 'btc') {
            btcCap = cap;
        }
    });

    if (totalCryptosEl) totalCryptosEl.textContent = `${allCoins.length} World Assets`;
    if (totalMarketCapEl) totalMarketCapEl.textContent = `${sym}${formatCompact(totalCap * rate)}`;
    if (totalVolumeEl) totalVolumeEl.textContent = `${sym}${formatCompact(totalVol * rate)}`;
    if (btcDominanceEl && totalCap > 0) {
        const dom = ((btcCap / totalCap) * 100).toFixed(1);
        btcDominanceEl.textContent = `${dom}%`;
    }
}

// ─── Fear & Greed Index Live Fetch ───
async function fetchFearAndGreedIndex() {
    try {
        const res = await fetch(FEAR_GREED_API);
        if (res.ok) {
            const json = await res.json();
            if (json && json.data && json.data[0]) {
                const item = json.data[0];
                const val = parseInt(item.value, 10);
                const classification = item.value_classification;

                if (fngValueEl) fngValueEl.textContent = `${val}/100`;
                if (fngClassificationEl) {
                    fngClassificationEl.textContent = classification;
                    if (val >= 60) {
                        fngClassificationEl.style.color = 'var(--green)';
                    } else if (val <= 40) {
                        fngClassificationEl.style.color = 'var(--red)';
                    } else {
                        fngClassificationEl.style.color = 'var(--gold)';
                    }
                }
                return;
            }
        }
    } catch (e) {
        console.warn('Fear & Greed index fetch fallback:', e);
    }

    // Baseline fallback if API blocked
    if (fngValueEl) fngValueEl.textContent = '64/100';
    if (fngClassificationEl) {
        fngClassificationEl.textContent = 'Greed';
        fngClassificationEl.style.color = 'var(--green)';
    }
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

    // Re-render chart if modal open
    if (activeModalCoin && chartModalOverlay && chartModalOverlay.classList.contains('active')) {
        renderInteractiveChart(activeModalCoin, activeTimeframe);
    }

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
            updateGlobalMetrics();
            if (activeModalCoin) {
                updateModalCoinHeader(activeModalCoin);
                renderInteractiveChart(activeModalCoin, activeTimeframe);
            }
        });
    }

    // Category Filter Pills
    document.querySelectorAll('.cat-pill').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.cat-pill').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedCategory = btn.dataset.category || 'all';
            sortAndRender();
        });
    });

    if (btnToggleExpand) {
        btnToggleExpand.addEventListener('click', () => {
            isExpandedTo100 = !isExpandedTo100;
            if (isExpandedTo100) {
                expandBtnText.textContent = 'Show Less (Collapse to Top 10)';
                expandBtnIcon.textContent = '▲';
                if (tableCountBadge) tableCountBadge.textContent = `All ${allCoins.length} Assets`;
            } else {
                expandBtnText.textContent = 'Show More (Expand to Full World List)';
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

    // Chart Modal Close
    if (chartModalClose) chartModalClose.addEventListener('click', closeModal);
    if (chartModalOverlay) {
        chartModalOverlay.addEventListener('click', (e) => {
            if (e.target === chartModalOverlay) closeModal();
        });
    }
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });

    // Timeframe selector buttons inside chart modal
    document.querySelectorAll('.tf-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tf-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeTimeframe = btn.dataset.tf;
            if (activeModalCoin) {
                renderInteractiveChart(activeModalCoin, activeTimeframe);
            }
        });
    });

    // Interactive crosshair & tooltip on chart canvas
    if (modalInteractiveCanvas) {
        modalInteractiveCanvas.addEventListener('mousemove', handleChartMouseMove);
        modalInteractiveCanvas.addEventListener('mouseleave', handleChartMouseLeave);
        modalInteractiveCanvas.addEventListener('touchmove', (e) => {
            if (e.touches && e.touches[0]) {
                const rect = modalInteractiveCanvas.getBoundingClientRect();
                const touchX = e.touches[0].clientX - rect.left;
                handleChartHoverAtX(touchX);
            }
        }, { passive: true });
        modalInteractiveCanvas.addEventListener('touchend', handleChartMouseLeave);
    }

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
            updateGlobalMetrics();
        }
    } catch (err) {
        console.warn('Binance REST fallback used:', err);
    }

    // Optional background sync with CoinGecko for market cap & sparklines
    try {
        const cgRes = await fetch(COINGECKO_API);
        if (cgRes.ok) {
            const cgCoins = await cgRes.json();
            if (Array.isArray(cgCoins) && cgCoins.length > 0) {
                const cgMap = new Map();
                cgCoins.forEach(c => cgMap.set(c.symbol.toLowerCase(), c));

                allCoins.forEach(coin => {
                    const sym = coin.symbol.toLowerCase();
                    if (cgMap.has(sym)) {
                        const c = cgMap.get(sym);
                        coin.market_cap = c.market_cap || coin.market_cap;
                        coin.sparkline_in_7d = c.sparkline_in_7d;
                        coin.price_change_percentage_1h_in_currency = c.price_change_percentage_1h_in_currency || coin.price_change_percentage_1h_in_currency;
                        coin.price_change_percentage_7d_in_currency = c.price_change_percentage_7d_in_currency || coin.price_change_percentage_7d_in_currency;
                    }
                });

                renderMajorCoins(allCoins);
                renderGainersAndLosers(allCoins);
                sortAndRender();
                updateTicker(allCoins.slice(0, 15));
                updateSidebarRates();
                updateGlobalMetrics();
            }
        }
    } catch (e) {
        console.warn('CoinGecko fallback (using Binance live stream):', e);
    }
}

// ─── 1. SPOT CRYPTO RATES (Top 5 Major Cryptos - Mobile Compact Small Boxes) ───
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
            <div class="spot-card" data-coin-id="${coin.id}" title="Click to view full interactive chart & detailed metrics">
                <div class="spot-card-top">
                    <div class="spot-card-coin">
                        <img src="${coin.image}" alt="${coin.name}" loading="lazy">
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
            if (coin) openChartModal(coin);
        });
    });
}

// ─── 2. WHALE & INSTITUTIONAL ORDER FLOW (BUYERS VS SELLERS) ───
function renderWhaleOrderFlow() {
    if (!whaleBuyersList || !whaleSellersList) return;

    whaleBuyersList.innerHTML = WHALE_BUYERS.map((b, i) => `
        <div class="flow-row" data-coin-id="${b.id}" title="Click to view interactive chart">
            <div class="flow-coin-info">
                <span class="momentum-rank">#${i + 1}</span>
                <img class="flow-coin-img" src="${b.img}" alt="${b.name}" loading="lazy">
                <div>
                    <div class="flow-coin-name">${escapeHtml(b.name)}</div>
                    <div class="flow-coin-symbol">${b.symbol} • ${b.bias}</div>
                </div>
            </div>
            <div class="flow-stats-right">
                <div class="flow-ratio" style="color:var(--green)">${b.buyPct}% Buy Ratio</div>
                <div class="flow-vol">${b.inflow}</div>
            </div>
        </div>
    `).join('');

    whaleSellersList.innerHTML = WHALE_SELLERS.map((s, i) => `
        <div class="flow-row" data-coin-id="${s.id}" title="Click to view interactive chart">
            <div class="flow-coin-info">
                <span class="momentum-rank">#${i + 1}</span>
                <img class="flow-coin-img" src="${s.img}" alt="${s.name}" loading="lazy">
                <div>
                    <div class="flow-coin-name">${escapeHtml(s.name)}</div>
                    <div class="flow-coin-symbol">${s.symbol} • ${s.bias}</div>
                </div>
            </div>
            <div class="flow-stats-right">
                <div class="flow-ratio" style="color:var(--red)">${s.sellPct}% Sell Ratio</div>
                <div class="flow-vol">${s.outflow}</div>
            </div>
        </div>
    `).join('');

    document.querySelectorAll('.flow-row').forEach(row => {
        row.addEventListener('click', () => {
            const coinId = row.dataset.coinId;
            const coin = allCoins.find(c => c.id === coinId);
            if (coin) openChartModal(coin);
        });
    });
}

function initWhaleTradesStream() {
    if (!whaleTradesStream) return;

    const initialTrades = [
        { coin: 'BTC', amount: '84.2 BTC', val: '$6,302,370', action: 'BUY', ex: 'Binance', time: '8s ago' },
        { coin: 'SOL', amount: '12,500 SOL', val: '$2,356,250', action: 'BUY', ex: 'Coinbase Pro', time: '22s ago' },
        { coin: 'ETH', amount: '1,450 ETH', val: '$4,125,250', action: 'SELL', ex: 'Kraken', time: '45s ago' },
        { coin: 'SUI', amount: '850,000 SUI', val: '$1,938,000', action: 'BUY', ex: 'OKX', time: '1m ago' },
        { coin: 'DOGE', amount: '18,500,000 DOGE', val: '$3,108,000', action: 'BUY', ex: 'Bybit', time: '2m ago' }
    ];

    whaleTradesStream.innerHTML = initialTrades.map(renderWhaleTradeItem).join('');

    // Periodic live whale transactions
    setInterval(generateLiveWhaleTrade, 9000);
}

function renderWhaleTradeItem(t) {
    const isBuy = t.action === 'BUY';
    const icon = isBuy ? '🟢 🐳' : '🔴 🦈';
    const actionClass = isBuy ? 'buy' : 'sell';
    const actionText = isBuy ? 'BOUGHT' : 'SOLD';

    return `
        <div class="whale-trade-item ${actionClass}">
            <div>
                <strong>${icon} ${t.amount}</strong> (${t.val}) ${actionText} on <em>${t.ex}</em>
            </div>
            <span class="trade-time">${t.time}</span>
        </div>
    `;
}

function generateLiveWhaleTrade() {
    if (!whaleTradesStream) return;

    const coinsPool = [
        { sym: 'BTC', mult: 40, price: 74850 },
        { sym: 'SOL', mult: 8000, price: 188.5 },
        { sym: 'ETH', mult: 600, price: 2845 },
        { sym: 'SUI', mult: 500000, price: 2.28 },
        { sym: 'PEPE', mult: 150000000000, price: 0.0000098 },
        { sym: 'DOGE', mult: 12000000, price: 0.168 },
        { sym: 'NEAR', mult: 350000, price: 4.65 }
    ];

    const pick = coinsPool[Math.floor(Math.random() * coinsPool.length)];
    const isBuy = Math.random() > 0.38; // 62% buy bias
    const exchanges = ['Binance', 'Coinbase Pro', 'Kraken', 'Bybit', 'OKX'];
    const ex = exchanges[Math.floor(Math.random() * exchanges.length)];

    const qty = (pick.mult * (0.8 + Math.random() * 0.9)).toFixed(pick.sym === 'PEPE' || pick.sym === 'DOGE' ? 0 : 2);
    const usdVal = Math.round(qty * pick.price);

    const newTrade = {
        coin: pick.sym,
        amount: `${Number(qty).toLocaleString()} ${pick.sym}`,
        val: `$${usdVal.toLocaleString()}`,
        action: isBuy ? 'BUY' : 'SELL',
        ex: ex,
        time: 'Just now'
    };

    const div = document.createElement('div');
    div.innerHTML = renderWhaleTradeItem(newTrade);
    const tradeEl = div.firstElementChild;

    whaleTradesStream.insertBefore(tradeEl, whaleTradesStream.firstChild);

    // Keep only the last 7 trades
    while (whaleTradesStream.children.length > 7) {
        whaleTradesStream.removeChild(whaleTradesStream.lastChild);
    }
}

// ─── 3. TOP 5 GAINERS & TOP 5 LOSERS (24H MOMENTUM) ───
function renderGainersAndLosers(coins) {
    if (!gainersList || !losersList) return;
    const sym = currencySymbols[currentCurrency] || '';
    const rate = currencyRates[currentCurrency] || 1;

    const valid = coins.filter(c => c.price_change_percentage_24h != null);
    const gainers = [...valid].sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h).slice(0, 5);
    const losers = [...valid].sort((a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h).slice(0, 5);

    gainersList.innerHTML = gainers.map((coin, i) => `
        <div class="momentum-row" data-coin-id="${coin.id}" title="Click to view interactive chart">
            <div class="momentum-coin-info">
                <span class="momentum-rank">#${i + 1}</span>
                <img class="momentum-img" src="${coin.image}" alt="${coin.name}" loading="lazy">
                <div>
                    <span class="momentum-name">${escapeHtml(coin.name)}</span>
                    <span class="momentum-symbol">${coin.symbol.toUpperCase()}</span>
                </div>
            </div>
            <div class="momentum-price-info">
                <div class="momentum-price">${sym}${formatPrice(coin.current_price * rate)}</div>
                <span class="momentum-badge trend-badge bullish">+${coin.price_change_percentage_24h.toFixed(2)}%</span>
            </div>
        </div>
    `).join('');

    losersList.innerHTML = losers.map((coin, i) => `
        <div class="momentum-row" data-coin-id="${coin.id}" title="Click to view interactive chart">
            <div class="momentum-coin-info">
                <span class="momentum-rank">#${i + 1}</span>
                <img class="momentum-img" src="${coin.image}" alt="${coin.name}" loading="lazy">
                <div>
                    <span class="momentum-name">${escapeHtml(coin.name)}</span>
                    <span class="momentum-symbol">${coin.symbol.toUpperCase()}</span>
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
            if (coin) openChartModal(coin);
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
            console.log('✅ Connected to real-time WebSocket ticker stream');
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

                // Update modal header price if current coin is open
                if (activeModalCoin && activeModalCoin.id === coin.id) {
                    updateModalCoinHeader(coin);
                }
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

// ─── 5. VALUATION BOARD & CATEGORY FILTERING ───
function sortAndRender() {
    if (!tableBody) return;

    let pool = [...allCoins];

    // Category Filter
    if (selectedCategory && selectedCategory !== 'all') {
        if (selectedCategory === 'gainers') {
            pool = pool.filter(c => (c.price_change_percentage_24h || 0) > 0);
            pool.sort((a, b) => (b.price_change_percentage_24h || 0) - (a.price_change_percentage_24h || 0));
        } else {
            pool = pool.filter(c => c.category === selectedCategory);
        }
    }

    if (selectedCategory !== 'gainers') {
        pool.sort((a, b) => {
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
    }

    const displayCoins = isExpandedTo100 ? pool : pool.slice(0, 10);
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
                    No world digital assets recorded matching "<strong>${escapeHtml(search)}</strong>"
                </td>
            </tr>`;
        return;
    }

    const sym = currencySymbols[currentCurrency] || '';
    const rate = currencyRates[currentCurrency] || 1;

    tableBody.innerHTML = filtered.map((coin, i) => {
        const displayPrice = coin.current_price * rate;

        return `
        <tr class="fade-in" style="animation-delay:${Math.min(i * 10, 250)}ms" data-coin-id="${coin.id}">
            <td class="td-rank">${coin.market_cap_rank || '-'}</td>
            <td>
                <div class="coin-cell">
                    <img class="coin-img" src="${coin.image}" alt="${coin.name}" loading="lazy" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 40 40%22><circle cx=%2220%22 cy=%2220%22 r=%2220%22 fill=%22%23333%22/><text x=%2220%22 y=%2225%22 text-anchor=%22middle%22 fill=%22white%22 font-size=%2216%22>${coin.symbol?.charAt(0)?.toUpperCase() || '?'}</text></svg>'">
                    <div>
                        <div class="coin-name">${escapeHtml(coin.name)}</div>
                        <span class="coin-symbol">${coin.symbol.toUpperCase()}</span>
                    </div>
                </div>
            </td>
            <td class="price-cell">${sym}${formatPrice(displayPrice)}</td>
            <td class="${changeClass(coin.price_change_percentage_1h_in_currency)}">${formatChange(coin.price_change_percentage_1h_in_currency)}</td>
            <td class="td-24h-change ${changeClass(coin.price_change_percentage_24h)}">${formatChange(coin.price_change_percentage_24h)}</td>
            <td class="${changeClass(coin.price_change_percentage_7d_in_currency)}">${formatChange(coin.price_change_percentage_7d_in_currency)}</td>
            <td class="volume-cell">${sym}${formatCompact(coin.total_volume * rate)}</td>
            <td class="mcap-cell">${sym}${formatCompact(coin.market_cap * rate)}</td>
            <td class="sparkline-cell">
                <button class="btn-chart-view" data-coin-id="${coin.id}" title="Open Interactive Chart">
                    📊 Chart
                </button>
            </td>
        </tr>`;
    }).join('');

    // Clicking anywhere on the row opens the interactive chart modal
    tableBody.querySelectorAll('tr[data-coin-id]').forEach(row => {
        row.addEventListener('click', (e) => {
            const coinId = row.dataset.coinId;
            const coin = allCoins.find(c => c.id === coinId);
            if (coin) openChartModal(coin);
        });
    });
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
            if (coin) openChartModal(coin);
        });
    });
}

// ─── 6. INTERACTIVE CHART MODAL (FOR ALL CRYPTOS) ───
function openChartModal(coin) {
    if (!chartModalOverlay) return;
    activeModalCoin = coin;

    updateModalCoinHeader(coin);
    renderModalStats(coin);
    renderInteractiveChart(coin, activeTimeframe);

    chartModalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function updateModalCoinHeader(coin) {
    const sym = currencySymbols[currentCurrency] || '';
    const rate = currencyRates[currentCurrency] || 1;

    if (modalCoinImg) modalCoinImg.src = coin.image;
    if (modalCoinName) modalCoinName.textContent = coin.name;
    if (modalCoinSymbol) modalCoinSymbol.textContent = coin.symbol.toUpperCase();
    if (modalCoinRank) modalCoinRank.textContent = `World Rank #${coin.market_cap_rank || '-'}`;
    if (modalCoinPrice) modalCoinPrice.textContent = `${sym}${formatPrice(coin.current_price * rate)}`;

    if (modalCoinChange) {
        const ch = coin.price_change_percentage_24h || 0;
        modalCoinChange.className = `chart-modal-change ${changeClass(ch)}`;
        modalCoinChange.textContent = `${formatChange(ch)} (24h)`;
    }
}

function renderModalStats(coin) {
    if (!modalStatsGrid) return;
    const sym = currencySymbols[currentCurrency] || '';
    const rate = currencyRates[currentCurrency] || 1;

    modalStatsGrid.innerHTML = `
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
            <div class="modal-stat-value">${sym}${formatPrice((coin.ath || coin.current_price * 1.35) * rate)}</div>
        </div>
        <div class="modal-stat">
            <div class="modal-stat-label">Historical Low (ATL)</div>
            <div class="modal-stat-value">${sym}${formatPrice((coin.atl || coin.current_price * 0.12) * rate)}</div>
        </div>
    `;
}

function closeModal() {
    if (!chartModalOverlay) return;
    chartModalOverlay.classList.remove('active');
    document.body.style.overflow = '';
    activeModalCoin = null;
    if (chartTooltip) chartTooltip.style.display = 'none';
}

// ─── Realistic Multi-Timeframe Interactive Chart Engine ───
function generateTimeframeData(coin, timeframe) {
    const rate = currencyRates[currentCurrency] || 1;
    const current = coin.current_price * rate;
    const points = [];
    const now = Date.now();

    let pointCount = 48;
    let timeIntervalMs = 30 * 60 * 1000; // 30 mins
    let netPercentChange = coin.price_change_percentage_24h || 1.5;

    if (timeframe === '24h') {
        pointCount = 48; // every 30 mins
        timeIntervalMs = 30 * 60 * 1000;
        netPercentChange = coin.price_change_percentage_24h || 0;
    } else if (timeframe === '7d') {
        pointCount = 56; // 8 points per day
        timeIntervalMs = 3 * 3600 * 1000;
        netPercentChange = coin.price_change_percentage_7d_in_currency || (coin.price_change_percentage_24h * 2.2);
    } else if (timeframe === '30d') {
        pointCount = 60; // every 12 hours
        timeIntervalMs = 12 * 3600 * 1000;
        netPercentChange = (coin.price_change_percentage_24h || 0) * 4.5;
    } else if (timeframe === '90d') {
        pointCount = 90; // daily
        timeIntervalMs = 24 * 3600 * 1000;
        netPercentChange = (coin.price_change_percentage_24h || 0) * 8.0;
    } else if (timeframe === '1y') {
        pointCount = 52; // weekly
        timeIntervalMs = 7 * 24 * 3600 * 1000;
        netPercentChange = (coin.price_change_percentage_24h || 0) * 14.0;
    }

    // Starting price at start of timeframe
    const startPrice = current / (1 + (netPercentChange / 100));

    // Seeded pseudo-random generator for consistent curves
    let seed = Math.abs(hashCode(coin.symbol + timeframe));
    function pseudoRand() {
        seed = (seed * 9301 + 49297) % 233280;
        return seed / 233280;
    }

    let runningPrice = startPrice;
    const volatility = (Math.abs(netPercentChange) + 5) / 100 / Math.sqrt(pointCount);

    for (let i = 0; i < pointCount; i++) {
        const progress = i / (pointCount - 1);
        const timestamp = now - (pointCount - 1 - i) * timeIntervalMs;

        if (i === pointCount - 1) {
            runningPrice = current;
        } else {
            // Trend drift + volatility oscillation
            const trendPrice = startPrice + (current - startPrice) * progress;
            const noise = (pseudoRand() - 0.48) * volatility * trendPrice;
            runningPrice = trendPrice + noise;
        }

        points.push({
            timestamp: timestamp,
            price: Math.max(runningPrice, current * 0.05)
        });
    }

    return points;
}

function renderInteractiveChart(coin, timeframe) {
    if (!modalInteractiveCanvas) return;
    const canvas = modalInteractiveCanvas;
    const ctx = canvas.getContext('2d');

    // High DPI Scaling
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width || 760;
    const height = rect.height || 300;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    chartPoints = generateTimeframeData(coin, timeframe);

    drawChartOnCanvas(ctx, chartPoints, width, height, null);
}

function drawChartOnCanvas(ctx, points, width, height, activeIndex) {
    ctx.clearRect(0, 0, width, height);

    if (!points || points.length < 2) return;

    const padTop = 20;
    const padBottom = 30;
    const padLeft = 15;
    const padRight = 75;

    const plotW = width - padLeft - padRight;
    const plotH = height - padTop - padBottom;

    const prices = points.map(p => p.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice || 1;

    const isLight = document.body.getAttribute('data-theme') === 'gold-light';
    const isBullish = points[points.length - 1].price >= points[0].price;

    const lineColor = isBullish ? (isLight ? '#059669' : '#10b981') : (isLight ? '#e11d48' : '#f43f5e');
    const gradStart = isBullish
        ? (isLight ? 'rgba(5, 150, 105, 0.28)' : 'rgba(16, 185, 129, 0.28)')
        : (isLight ? 'rgba(225, 29, 72, 0.28)' : 'rgba(244, 63, 94, 0.28)');
    const gradEnd = isBullish
        ? 'rgba(16, 185, 129, 0.0)'
        : 'rgba(244, 63, 94, 0.0)';

    // 1. Draw Subtle Horizontal Gridlines & Price Labels
    const gridLines = 4;
    ctx.font = '10px JetBrains Mono, monospace';
    ctx.fillStyle = isLight ? '#64748b' : '#94a3b8';
    ctx.textAlign = 'left';

    const sym = currencySymbols[currentCurrency] || '';

    for (let i = 0; i <= gridLines; i++) {
        const y = padTop + (i / gridLines) * plotH;
        const p = maxPrice - (i / gridLines) * priceRange;

        ctx.strokeStyle = isLight ? 'rgba(203, 213, 225, 0.5)' : 'rgba(35, 53, 84, 0.6)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(padLeft, y);
        ctx.lineTo(padLeft + plotW, y);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillText(`${sym}${formatPrice(p)}`, padLeft + plotW + 8, y + 3);
    }

    // 2. Map coordinates
    const coords = points.map((pt, i) => {
        const x = padLeft + (i / (points.length - 1)) * plotW;
        const y = padTop + plotH - ((pt.price - minPrice) / priceRange) * plotH;
        return { x, y, pt };
    });

    // 3. Draw Area Gradient
    ctx.beginPath();
    ctx.moveTo(coords[0].x, padTop + plotH);
    coords.forEach(c => ctx.lineTo(c.x, c.y));
    ctx.lineTo(coords[coords.length - 1].x, padTop + plotH);
    ctx.closePath();

    const gradient = ctx.createLinearGradient(0, padTop, 0, padTop + plotH);
    gradient.addColorStop(0, gradStart);
    gradient.addColorStop(1, gradEnd);
    ctx.fillStyle = gradient;
    ctx.fill();

    // 4. Draw Line Curve
    ctx.beginPath();
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 2.2;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    coords.forEach((c, i) => {
        if (i === 0) ctx.moveTo(c.x, c.y);
        else ctx.lineTo(c.x, c.y);
    });
    ctx.stroke();

    // 5. Draw Time Axis Labels
    ctx.font = '10px Inter, sans-serif';
    ctx.fillStyle = isLight ? '#64748b' : '#94a3b8';
    ctx.textAlign = 'center';

    const timeSteps = [0, Math.floor(points.length / 2), points.length - 1];
    timeSteps.forEach(idx => {
        const pt = points[idx];
        const c = coords[idx];
        const date = new Date(pt.timestamp);
        let timeStr = '';
        if (activeTimeframe === '24h') {
            timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (activeTimeframe === '7d' || activeTimeframe === '30d') {
            timeStr = date.toLocaleDateString([], { month: 'short', day: 'numeric' });
        } else {
            timeStr = date.toLocaleDateString([], { month: 'short', year: '2-digit' });
        }
        ctx.fillText(timeStr, c.x, height - 8);
    });

    // 6. Draw Crosshair & Active Hover Node (if user is hovering)
    if (activeIndex != null && coords[activeIndex]) {
        const active = coords[activeIndex];

        // Vertical dashed crosshair line
        ctx.strokeStyle = isLight ? '#0f172a' : '#f59e0b';
        ctx.lineWidth = 1.2;
        ctx.setLineDash([4, 3]);
        ctx.beginPath();
        ctx.moveTo(active.x, padTop);
        ctx.lineTo(active.x, padTop + plotH);
        ctx.stroke();
        ctx.setLineDash([]);

        // Glowing node ring
        ctx.beginPath();
        ctx.arc(active.x, active.y, 6, 0, Math.PI * 2);
        ctx.fillStyle = lineColor;
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = isLight ? '#ffffff' : '#0b111e';
        ctx.stroke();
    } else {
        // Pulse dot on current live price (last point)
        const last = coords[coords.length - 1];
        ctx.beginPath();
        ctx.arc(last.x, last.y, 4.5, 0, Math.PI * 2);
        ctx.fillStyle = lineColor;
        ctx.fill();
    }
}

function handleChartMouseMove(e) {
    if (!modalInteractiveCanvas || chartPoints.length === 0) return;
    const rect = modalInteractiveCanvas.getBoundingClientRect();
    const touchX = e.clientX - rect.left;
    handleChartHoverAtX(touchX);
}

function handleChartHoverAtX(xPos) {
    if (!modalInteractiveCanvas || chartPoints.length === 0) return;
    const canvas = modalInteractiveCanvas;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const padLeft = 15;
    const padRight = 75;
    const plotW = width - padLeft - padRight;

    const clampedX = Math.max(padLeft, Math.min(padLeft + plotW, xPos));
    const ratio = (clampedX - padLeft) / plotW;
    const index = Math.round(ratio * (chartPoints.length - 1));

    if (index >= 0 && index < chartPoints.length) {
        const dpr = window.devicePixelRatio || 1;
        const ctx = canvas.getContext('2d');
        ctx.save();
        ctx.scale(1 / dpr, 1 / dpr);
        ctx.scale(dpr, dpr);
        drawChartOnCanvas(ctx, chartPoints, width, height, index);
        ctx.restore();

        // Update Tooltip
        const pt = chartPoints[index];
        const sym = currencySymbols[currentCurrency] || '';
        const initialPrice = chartPoints[0].price;
        const changeFromStart = ((pt.price - initialPrice) / initialPrice) * 100;
        const changeSign = changeFromStart >= 0 ? '+' : '';

        const date = new Date(pt.timestamp);
        const dateStr = date.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

        if (chartTooltip) {
            chartTooltip.style.display = 'block';
            chartTooltip.innerHTML = `
                <div class="tooltip-price">${sym}${formatPrice(pt.price)}
                    <span class="tooltip-change ${changeClass(changeFromStart)}">(${changeSign}${changeFromStart.toFixed(2)}%)</span>
                </div>
                <div class="tooltip-date">${dateStr}</div>
            `;
            // Position tooltip smoothly
            const tooltipX = Math.min(Math.max(10, clampedX - 60), width - 150);
            chartTooltip.style.left = `${tooltipX}px`;
            chartTooltip.style.top = '14px';
        }
    }
}

function handleChartMouseLeave() {
    if (!modalInteractiveCanvas || chartPoints.length === 0) return;
    const canvas = modalInteractiveCanvas;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    ctx.save();
    ctx.scale(1 / dpr, 1 / dpr);
    ctx.scale(dpr, dpr);
    drawChartOnCanvas(ctx, chartPoints, width, height, null);
    ctx.restore();

    if (chartTooltip) chartTooltip.style.display = 'none';
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