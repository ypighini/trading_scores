import pandas as pd
import ccxt
from datetime import datetime, timedelta, timezone
import ta
import numpy as np
from concurrent.futures import ThreadPoolExecutor, as_completed
import time
import psycopg2
from psycopg2.extras import execute_values

# --- Connexion PostgreSQL ---
conn = psycopg2.connect(
    dbname="trading_scores",
    user="postgres",
    password="lebichon1332",  # adapte si besoin
    host="localhost",
    port="5432"
)
cur = conn.cursor()

# NOTE: Assure-toi d'avoir créé la table assets_scores avec au moins les colonnes suivantes :
# asset_type TEXT, code TEXT, name TEXT, invest_score INTEGER, swing_score INTEGER, intraday_score INTEGER,
# statut TEXT, created_at TIMESTAMP, last_updated TIMESTAMP
# Et un index unique sur (code, name):
# ALTER TABLE assets_scores ADD CONSTRAINT assets_code_name_unique UNIQUE (code, name);

# --- Instanciation des exchanges ---
exchange_binance = ccxt.binance()
exchange_bitget = ccxt.bitget()
exchange_mexc = ccxt.mexc()

# --- Chargement des marchés ---
def load_symbols(exchange, name, suffix='/USDT'):
    try:
        markets = exchange.load_markets()
        symbols = [s for s in markets if s.endswith(suffix)]
        print(f"[{datetime.now().strftime('%H:%M:%S')}] 📦 {name} : {len(symbols)} paires {suffix}")
        return symbols
    except Exception as e:
        print(f"[{datetime.now().strftime('%H:%M:%S')}] ❌ Erreur chargement {name} : {e}")
        return []

# Charger listes USDT et BTC
symbols_usdt_binance = load_symbols(exchange_binance, 'Binance', '/USDT')
symbols_usdt_bitget = load_symbols(exchange_bitget, 'Bitget', '/USDT')
symbols_usdt_mexc = load_symbols(exchange_mexc, 'MEXC', '/USDT')
symbols_usdt_all = list(set(symbols_usdt_binance + symbols_usdt_bitget + symbols_usdt_mexc))
print(f"[{datetime.now().strftime('%H:%M:%S')}] 🔄 Fusion USDT : {len(symbols_usdt_all)} cryptos")

symbols_btc_binance = load_symbols(exchange_binance, 'Binance', '/BTC')
symbols_btc_bitget = load_symbols(exchange_bitget, 'Bitget', '/BTC')
symbols_btc_mexc = load_symbols(exchange_mexc, 'MEXC', '/BTC')
symbols_btc_all = list(set(symbols_btc_binance + symbols_btc_bitget + symbols_btc_mexc))
print(f"[{datetime.now().strftime('%H:%M:%S')}] 🔄 Fusion BTC : {len(symbols_btc_all)} cryptos")

# --- Mapping symbol -> list of exchanges (meilleure robustesse) ---
symbol_to_exchanges = {}
def add_mapping(lst, exchange_obj):
    for s in lst:
        symbol_to_exchanges.setdefault(s, []).append(exchange_obj)

add_mapping(symbols_usdt_binance + symbols_btc_binance, exchange_binance)
add_mapping(symbols_usdt_bitget + symbols_btc_bitget, exchange_bitget)
add_mapping(symbols_usdt_mexc + symbols_btc_mexc, exchange_mexc)

# --- Timeframes et limites ---
timeframes = {
    '15m': ('15m', 500),
    '1h': ('1h', 500),
    '4h': ('4h', 500),
    '1d': ('1d', 365),
    '1w': ('1w', 150)
}

# --- Récupération OHLCV (essaie un exchange donné) ---
def fetch_crypto_data(symbol, timeframe, limit, exchange):
    since = exchange.parse8601((datetime.now(timezone.utc) - timedelta(days=365)).strftime('%Y-%m-%dT%H:%M:%S'))
    try:
        ohlcv = exchange.fetch_ohlcv(symbol, timeframe=timeframe, since=since, limit=limit)
        if not ohlcv:
            return pd.DataFrame()
        df = pd.DataFrame(ohlcv, columns=['timestamp', 'open', 'high', 'low', 'close', 'volume'])
        df['timestamp'] = pd.to_datetime(df['timestamp'], unit='ms')
        return df
    except Exception:
        return pd.DataFrame()

# --- Indicateurs ---
def add_indicators(df):
    if df.empty or 'close' not in df.columns:
        return df
    df = df.copy()
    df['RSI'] = ta.momentum.RSIIndicator(close=df['close'], window=14).rsi()
    df['SMA200'] = df['close'].rolling(window=200).mean()
    df['Momentum'] = ta.momentum.ROCIndicator(close=df['close'], window=14).roc()
    df['EMA20'] = ta.trend.EMAIndicator(close=df['close'], window=20).ema_indicator()
    df['EMA50'] = ta.trend.EMAIndicator(close=df['close'], window=50).ema_indicator()
    # ADX : try/except pour éviter IndexError si données trop courtes
    try:
        adx_ind = ta.trend.ADXIndicator(high=df['high'], low=df['low'], close=df['close'], window=14)
        df['ADX'] = adx_ind.adx()
    except Exception:
        df['ADX'] = np.nan
    return df

# --- Dow trend ---
def dow_trend(df, short_window=50, long_window=200):
    df = df.copy()
    df['High_MA_short'] = df['high'].rolling(window=short_window).mean()
    df['High_MA_long'] = df['high'].rolling(window=long_window).mean()
    df['Low_MA_short'] = df['low'].rolling(window=short_window).mean()
    df['Low_MA_long'] = df['low'].rolling(window=long_window).mean()
    conditions = [
        (df['High_MA_short'] > df['High_MA_long']) & (df['Low_MA_short'] > df['Low_MA_long']),
        (df['High_MA_short'] < df['High_MA_long']) & (df['Low_MA_short'] < df['Low_MA_long'])
    ]
    choices = ['Up', 'Down']
    df['DowTrend'] = np.select(conditions, choices, default='Sideways')
    return df

# --- Divergence RSI (optionnel, simple) ---
def detect_rsi_div(df, window=14):
    df = df.copy()
    if len(df) < window:
        df['RSI_divergence'] = [None] * len(df)
        return df
    res = []
    for i in range(len(df) - window, len(df)):
        w = df.iloc[i - window:i]
        if w['close'].dropna().empty or w['RSI'].dropna().empty:
            res.append('None')
            continue
        try:
            pl, ph, rl, rh = w['close'].idxmin(), w['close'].idxmax(), w['RSI'].idxmin(), w['RSI'].idxmax()
            bull = (w.loc[pl, 'close'] < w['close'].iloc[0]) and (w.loc[rl, 'RSI'] > w['RSI'].iloc[0])
            bear = (w.loc[ph, 'close'] > w['close'].iloc[0]) and (w.loc[rh, 'RSI'] < w['RSI'].iloc[0])
            res.append('Bullish' if bull else 'Bearish' if bear else 'None')
        except Exception:
            res.append('None')
    df['RSI_divergence'] = [None] * (len(df) - len(res)) + res
    return df

# --- Calcul du score sur une ligne (un timeframe) ---
def compute_score(row):
    # Si RSI manquant -> pas de score
    if pd.isna(row.get('RSI', np.nan)):
        return None
    score = 0
    # DowTrend
    score += 10 if row.get('DowTrend') == 'Up' else (-10 if row.get('DowTrend') == 'Down' else 3)
    # RSI
    rsi = row.get('RSI')
    score += 5 if rsi < 30 else (-5 if rsi > 70 else 0)
    # RSI divergence
    rdiv = row.get('RSI_divergence')
    score += 7 if rdiv == 'Bullish' else (-7 if rdiv == 'Bearish' else 0)
    # Momentum
    mom = row.get('Momentum')
    score += 5 if mom > 0 else (-5 if mom < 0 else 0)
    # ADX
    adx = row.get('ADX')
    if pd.notna(adx):
        score += 8 if adx > 25 else (-8 if adx < 20 else 0)
    # EMA cross
    ema20 = row.get('EMA20'); ema50 = row.get('EMA50')
    if pd.notna(ema20) and pd.notna(ema50):
        score += 6 if ema20 > ema50 else (-6 if ema20 < ema50 else 0)
    # SMA200
    close = row.get('close')
    sma200 = row.get('SMA200')
    if pd.notna(close) and pd.notna(sma200):
        score += 5 if close > sma200 else (-5 if close < sma200 else 0)
    return score

# --- Fetch + compute per symbol.
# On recherche pour chaque timeframe une exchange parmi la liste qui renvoie des données.
def fetch_process(sym):
    exchanges = symbol_to_exchanges.get(sym, [])
    if not exchanges:
        return sym, None

    res = {}
    any_data = False

    # pour chaque timeframe on essaie de récupérer les données depuis une des exchanges disponibles (première qui retourne)
    for tf, (tf_code, limit) in timeframes.items():
        df_tf = pd.DataFrame()
        used_exchange = None
        for ex in exchanges:
            df_candidate = fetch_crypto_data(sym, tf_code, limit, ex)
            if not df_candidate.empty:
                df_tf = df_candidate
                used_exchange = ex
                break
        if df_tf.empty:
            continue

        any_data = True
        df_tf = add_indicators(df_tf)
        df_tf = dow_trend(df_tf)
        df_tf = detect_rsi_div(df_tf)
        df_tf['Score'] = df_tf.apply(compute_score, axis=1)
        # Dernier score dispo pour ce timeframe
        last_score = df_tf['Score'].iloc[-1] if not df_tf.empty else None
        res[tf] = {'score': last_score, 'exchange': getattr(used_exchange, 'id', None)}

    if not any_data:
        return sym, None
    return sym, res

def process_symbols(symbols, max_workers=20):
    results = []
    failed = []
    start_time = time.time()
    print(f"[{datetime.now().strftime('%H:%M:%S')}] 📊 Cryptos à traiter : {len(symbols)}")
    with ThreadPoolExecutor(max_workers=max_workers) as ex:
        futures = {ex.submit(fetch_process, s): s for s in symbols}
        for i, f in enumerate(as_completed(futures), 1):
            sym, row = f.result()
            if row:
                results.append((sym, row))
            else:
                failed.append(sym)
            if i % 50 == 0:
                elapsed = time.time() - start_time
                print(f"[{datetime.now().strftime('%H:%M:%S')}] 📈 {i} cryptos traitées, temps écoulé : {elapsed:.1f}s")
    return results, failed

# --- Récupérer nom long si possible (essaie les exchanges fournis) ---
def get_long_name(symbol, exchanges):
    # exchanges : liste d'objets ccxt exchanges
    for ex in exchanges:
        try:
            markets = ex.load_markets()
            info = markets.get(symbol, {}).get('info', {})
            # Différentes APIs ont des clés différentes pour le nom
            if isinstance(info, dict):
                for key in ('name', 'fullname', 'baseAsset', 'base', 'symbol'):
                    if key in info and info[key]:
                        return str(info[key])
        except Exception:
            pass
    # fallback : portion avant '/'
    return symbol.split('/')[0]

# --- Build rows pour insertion (inclut KO si demandé) ---
def build_rows(results, failed, asset_type="crypto"):
    rows = []
    # traités
    for symbol, scores in results:
        # scores est un dict {tf: {'score': val, 'exchange': exid}, ...}
        invest = int((scores.get('1w', {}).get('score') or 0) + (scores.get('1d', {}).get('score') or 0))
        swing = int((scores.get('4h', {}).get('score') or 0) + (scores.get('1h', {}).get('score') or 0))
        intra = int((scores.get('15m', {}).get('score') or 0))
        # pour nom long on passe les exchanges connus pour ce symbole
        exchanges = symbol_to_exchanges.get(symbol, [])
        name = get_long_name(symbol, exchanges)
        statut = "Traité"
        # on envoie 7 valeurs : asset_type, code, name, invest, swing, intra, statut
        rows.append((asset_type, str(symbol), str(name), invest, swing, intra, statut))
    # non traités (KO) -> scores 0, statut KO
    for symbol in failed:
        exchanges = symbol_to_exchanges.get(symbol, [])
        name = get_long_name(symbol, exchanges)
        rows.append((asset_type, str(symbol), str(name), 0, 0, 0, "KO"))
    return rows

# --- Sauvegarde PostgreSQL (batch) ---
def save_to_postgres(rows):
    if not rows:
        print("Aucune ligne à sauvegarder.")
        return

    # Template: 7 params + created_at/last_updated = now()
    template = "(%s, %s, %s, %s, %s, %s, %s, now(), now())"
    query = """
    INSERT INTO assets_scores (asset_type, code, name, invest_score, swing_score, intraday_score, statut, created_at, last_updated)
    VALUES %s
    ON CONFLICT (code, name) DO UPDATE
    SET invest_score = EXCLUDED.invest_score,
        swing_score = EXCLUDED.swing_score,
        intraday_score = EXCLUDED.intraday_score,
        statut = EXCLUDED.statut,
        last_updated = now();
    """
    execute_values(cur, query, rows, template=template)
    conn.commit()
    print(f"✅ {len(rows)} enregistrements insérés/maj dans PostgreSQL")

# -------------------------
# --- Exécution principale
# -------------------------
if __name__ == "__main__":
    # 1) Process USDT
    results_usdt, failed_usdt = process_symbols(symbols_usdt_all)
    rows_usdt = build_rows(results_usdt, failed_usdt, asset_type="crypto")

    # 2) Process BTC
    results_btc, failed_btc = process_symbols(symbols_btc_all)
    rows_btc = build_rows(results_btc, failed_btc, asset_type="crypto")

    # 3) Sauvegarde en base (concat)
    all_rows = rows_usdt + rows_btc
    save_to_postgres(all_rows)

    cur.close()
    conn.close()

    print("Terminé.")
