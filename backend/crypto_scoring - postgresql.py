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
    dbname="scanpicking",
    user="postgres",
    password="lebichon1332",
    host="localhost",
    port="5432"
)
cur = conn.cursor()

# --- Exchanges ---
EXCHANGES = {
    "Binance": ccxt.binance(),
    "Bitget": ccxt.bitget(),
    "MEXC": ccxt.mexc()
}

# --- Cache marchés ---
EXCHANGE_MARKETS = {}
for name, ex in EXCHANGES.items():
    try:
        EXCHANGE_MARKETS[ex] = ex.load_markets()
    except Exception as e:
        print(f"[{datetime.now():%H:%M:%S}] ❌ Erreur chargement marchés {name}: {e}")
        EXCHANGE_MARKETS[ex] = {}

# --- Timeframes ---
TIMEFRAMES = {
    "15m": ("15m", 500),
    "1h": ("1h", 500),
    "4h": ("4h", 500),
    "1d": ("1d", 365),
    "1w": ("1w", 150),
}

# --- Chargement des symboles ---
def load_symbols_from_cache(exchange, suffix="/USDT"):
    markets = EXCHANGE_MARKETS.get(exchange, {})
    symbols = [s for s in markets if s.endswith(suffix)]
    return symbols

# Récupération des symboles USDT et BTC
symbols_usdt_all, symbols_btc_all = [], []
for ex in EXCHANGES.values():
    symbols_usdt_all += load_symbols_from_cache(ex, "/USDT")
    symbols_btc_all += load_symbols_from_cache(ex, "/BTC")

symbols_usdt_all = list(set(symbols_usdt_all))
symbols_btc_all = list(set(symbols_btc_all))
print(f"[{datetime.now():%H:%M:%S}] 🔄 Fusion USDT : {len(symbols_usdt_all)} cryptos")
print(f"[{datetime.now():%H:%M:%S}] 🔄 Fusion BTC : {len(symbols_btc_all)} cryptos")

# --- Mapping symbol -> exchanges ---
symbol_to_exchanges = {}
for ex in EXCHANGES.values():
    for s in load_symbols_from_cache(ex, "/USDT") + load_symbols_from_cache(ex, "/BTC"):
        symbol_to_exchanges.setdefault(s, []).append(ex)

# --- Récupération OHLCV ---
def fetch_crypto_data(symbol, timeframe, limit, exchange):
    since = exchange.parse8601(
        (datetime.now(timezone.utc) - timedelta(days=365)).strftime("%Y-%m-%dT%H:%M:%S")
    )
    try:
        ohlcv = exchange.fetch_ohlcv(symbol, timeframe=timeframe, since=since, limit=limit)
        if not ohlcv:
            return pd.DataFrame()
        df = pd.DataFrame(ohlcv, columns=["timestamp", "open", "high", "low", "close", "volume"])
        df["timestamp"] = pd.to_datetime(df["timestamp"], unit="ms")
        return df
    except Exception:
        return pd.DataFrame()

# --- Indicateurs techniques ---
def add_indicators(df):
    if df.empty:
        return df
    df = df.copy()
    close, high, low, vol = df["close"], df["high"], df["low"], df["volume"]

    df["RSI"] = ta.momentum.RSIIndicator(close, 14).rsi()
    df["SMA200"] = close.rolling(200).mean()
    df["Momentum"] = ta.momentum.ROCIndicator(close, 14).roc()
    df["EMA20"] = ta.trend.EMAIndicator(close, 20).ema_indicator()
    df["EMA50"] = ta.trend.EMAIndicator(close, 50).ema_indicator()

    try:
        df["ADX"] = ta.trend.ADXIndicator(high, low, close, 14).adx()
    except Exception:
        df["ADX"] = np.nan

    df["Volume_SMA20"] = vol.rolling(20).mean()
    df["Rel_Volume"] = vol / df["Volume_SMA20"]
    return df

# --- Dow Theory ---
def dow_trend(df, short=50, long=200):
    df = df.copy()
    high, low = df["high"], df["low"]
    df["DowTrend"] = np.select(
        [
            (high.rolling(short).mean() > high.rolling(long).mean()) &
            (low.rolling(short).mean() > low.rolling(long).mean()),
            (high.rolling(short).mean() < high.rolling(long).mean()) &
            (low.rolling(short).mean() < low.rolling(long).mean())
        ],
        ["Up", "Down"],
        default="Sideways"
    )
    return df

# --- Divergence RSI ---
def detect_rsi_div(df, window=14):
    if len(df) < window:
        df["RSI_divergence"] = [None] * len(df)
        return df
    res = []
    for i in range(len(df) - window, len(df)):
        w = df.iloc[i - window:i]
        if w["close"].dropna().empty or w["RSI"].dropna().empty:
            res.append("None")
            continue
        try:
            pl, ph = w["close"].idxmin(), w["close"].idxmax()
            rl, rh = w["RSI"].idxmin(), w["RSI"].idxmax()
            bull = (w.loc[pl, "close"] < w["close"].iloc[0]) and (w.loc[rl, "RSI"] > w["RSI"].iloc[0])
            bear = (w.loc[ph, "close"] > w["close"].iloc[0]) and (w.loc[rh, "RSI"] < w["RSI"].iloc[0])
            res.append("Bullish" if bull else "Bearish" if bear else "None")
        except Exception:
            res.append("None")
    df["RSI_divergence"] = [None] * (len(df) - len(res)) + res
    return df

# --- Scoring ---
def compute_score(row):
    if pd.isna(row.get("RSI")):
        return None
    score = 0
    score += {"Up": 10, "Down": -10}.get(row.get("DowTrend"), 3)
    score += 5 if row["RSI"] < 30 else -5 if row["RSI"] > 70 else 0
    score += {"Bullish": 7, "Bearish": -7}.get(row.get("RSI_divergence"), 0)
    score += 5 if row["Momentum"] > 0 else -5 if row["Momentum"] < 0 else 0
    adx = row.get("ADX")
    if pd.notna(adx):
        score += 8 if adx > 25 else -8 if adx < 20 else 0
    ema20, ema50 = row.get("EMA20"), row.get("EMA50")
    if pd.notna(ema20) and pd.notna(ema50):
        score += 6 if ema20 > ema50 else -6
    if pd.notna(row["close"]) and pd.notna(row["SMA200"]):
        score += 5 if row["close"] > row["SMA200"] else -5
    rel_vol = row.get("Rel_Volume")
    if pd.notna(rel_vol):
        score += 3 if rel_vol > 1.5 else -3 if rel_vol < 0.5 else 0
    return score

# --- Nettoyage valeurs ---
def clean_value(v):
    if v is None: return None
    if isinstance(v, (np.floating, np.integer)): v = v.item()
    if isinstance(v, float) and (np.isnan(v) or np.isinf(v)): return None
    return v

# --- Nom long ---
def get_long_name(symbol, exchanges):
    for ex in exchanges:
        markets = EXCHANGE_MARKETS.get(ex, {})
        info = markets.get(symbol, {}).get("info", {})
        if isinstance(info, dict):
            for key in ("name", "fullname", "baseAsset", "base", "symbol"):
                if info.get(key):
                    return str(info[key])
    return symbol.split("/")[0]

# --- Process symbol ---
def fetch_process(sym):
    exchanges = symbol_to_exchanges.get(sym, [])
    if not exchanges:
        # valeurs par défaut non nulles pour éviter ON CONFLICT error
        return sym, None, f"{sym.split('/')[0]}_name", f"{sym.split('/')[0]}_url"
    res, any_data = {}, False
    for tf, (tf_code, limit) in TIMEFRAMES.items():
        best_df, best_ex = max(
            ((fetch_crypto_data(sym, tf_code, limit, ex), ex) for ex in exchanges),
            key=lambda x: len(x[0]), default=(pd.DataFrame(), None)
        )
        if best_df.empty:
            continue
        any_data = True
        df_tf = detect_rsi_div(dow_trend(add_indicators(best_df)))
        df_tf["Score"] = df_tf.apply(compute_score, axis=1)
        res[tf] = {"score": clean_value(df_tf["Score"].iloc[-1]), "exchange": getattr(best_ex, "id", None)}

    site_name = get_long_name(sym, exchanges) if exchanges else f"{sym.split('/')[0]}_name"
    site_url = f"https://www.{exchanges[0].id.lower()}.com/trade/{sym.replace('/', '')}" if exchanges else f"https://dummy.com/{sym.replace('/', '')}"
    return (sym, res if any_data else None, site_name, site_url)

# --- Process symbols ---
def process_symbols(symbols, max_workers=20):
    results, failed = [], []
    start_time = time.time()
    print(f"[{datetime.now():%H:%M:%S}] 📊 Cryptos à traiter : {len(symbols)}")
    with ThreadPoolExecutor(max_workers=max_workers) as ex:
        futures = {ex.submit(fetch_process, s): s for s in symbols}
        for i, f in enumerate(as_completed(futures), 1):
            sym, row, site_name, site_url = f.result()
            if row:
                results.append((sym, row, site_name, site_url))
            else:
                failed.append(sym)
            if i % 50 == 0:
                elapsed = time.time() - start_time
                print(f"[{datetime.now():%H:%M:%S}] 📈 {i} cryptos traitées, temps écoulé : {elapsed:.1f}s")
    return results, failed

# --- Build rows ---
def build_rows(results, failed, asset_type="crypto"):
    rows = []
    for symbol, scores, site_name, site_url in results:
        s = lambda tf: scores.get(tf, {}).get("score") if scores else None
        invest = (s("1w") or 0) + (s("1d") or 0) if any([s("1w"), s("1d")]) else None
        swing = (s("4h") or 0) + (s("1h") or 0) if any([s("4h"), s("1h")]) else None
        intra = s("15m")
        name = get_long_name(symbol, symbol_to_exchanges.get(symbol, []))
        statut = "KO" if all(v is None for v in (invest, swing, intra)) else "Traité"
        rows.append((
            asset_type, str(symbol), str(name),
            clean_value(invest), clean_value(swing), clean_value(intra),
            statut, site_name, site_url
        ))
    for symbol in failed:
        rows.append((
            asset_type, str(symbol), get_long_name(symbol, []),
            None, None, None, "KO",
            f"{symbol.split('/')[0]}_name",
            f"https://dummy.com/{symbol.replace('/', '')}"
        ))
    return rows

# --- Sauvegarde PostgreSQL ---
UPSERT_QUERY = """
INSERT INTO assets_scores (asset_type, code, name, invest_score, swing_score, intraday_score, statut, site_name, site_url, created_at, last_updated)
VALUES %s
ON CONFLICT (code, name, site_name) DO UPDATE
SET invest_score = EXCLUDED.invest_score,
    swing_score = EXCLUDED.swing_score,
    intraday_score = EXCLUDED.intraday_score,
    statut = EXCLUDED.statut,
    site_name = EXCLUDED.site_name,
    site_url = EXCLUDED.site_url,
    last_updated = now();
"""

def save_to_postgres(rows):
    if not rows: return print("Aucune ligne à sauvegarder.")
    template = "(%s, %s, %s, %s, %s, %s, %s, %s, %s, now(), now())"
    execute_values(cur, UPSERT_QUERY, rows, template=template)
    conn.commit()
    print(f"✅ {len(rows)} enregistrements insérés/maj dans PostgreSQL")

# --- Main ---
if __name__ == "__main__":
    rows_usdt = build_rows(*process_symbols(symbols_usdt_all), asset_type="crypto")
    rows_btc = build_rows(*process_symbols(symbols_btc_all), asset_type="crypto")
    save_to_postgres(rows_usdt + rows_btc)
    cur.close()
    conn.close()
    print("Terminé.")
