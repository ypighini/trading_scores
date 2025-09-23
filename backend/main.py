from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import asyncpg
from backend.config import Config  # Import config

app = FastAPI()

# ---------- CORS ----------
app.add_middleware(
    CORSMiddleware,
    allow_origins=Config.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- DB CONNECTION ----------
async def get_db_pool():
    if not hasattr(app.state, "pool"):
        app.state.pool = await asyncpg.create_pool(
            user=Config.DB_USER,
            password=Config.DB_PASSWORD,
            database=Config.DB_NAME,
            host=Config.DB_HOST,
            port=Config.DB_PORT,
        )
    return app.state.pool

# ---------- GENERIC ENDPOINTS ----------
@app.get("/")
async def root():
    return {"message": "API Crypto/Actions Scoring is running"}

@app.get("/assets")
async def get_assets():
    pool = await get_db_pool()
    rows = await pool.fetch("SELECT * FROM assets_scores ORDER BY last_updated DESC")
    return [dict(row) for row in rows]

@app.get("/assets/{asset_id}")
async def get_asset(asset_id: int):
    pool = await get_db_pool()
    row = await pool.fetchrow("SELECT * FROM assets_scores WHERE id = $1", asset_id)
    if not row:
        raise HTTPException(status_code=404, detail="Asset not found")
    return dict(row)

# ---------- CRYPTO ENDPOINTS ----------
@app.get("/cryptos")
async def get_cryptos():
    pool = await get_db_pool()
    rows = await pool.fetch(
        """
        SELECT code, name, invest_score, swing_score, intraday_score, last_updated, statut
        FROM assets_scores
        WHERE asset_type = 'crypto'
        AND (code ILIKE '%/USDT' OR code ILIKE '%/BTC')
        ORDER BY code
        """
    )
    return [dict(row) for row in rows]

@app.get("/cryptos/{code}")
async def get_crypto(code: str):
    pool = await get_db_pool()
    row = await pool.fetchrow(
        """
        SELECT code, name, invest_score, swing_score, intraday_score, last_updated, statut
        FROM assets_scores
        WHERE asset_type = 'crypto' AND code = $1
        """,
        code
    )
    if not row:
        raise HTTPException(status_code=404, detail="Crypto not found")
    return dict(row)

# ---------- STATIC FRONTEND ----------
app.mount("/app", StaticFiles(directory=Config.STATIC_DIR, html=True), name="static")

# ---------- CLEANUP ----------
@app.on_event("shutdown")
async def shutdown():
    if hasattr(app.state, "pool"):
        await app.state.pool.close()
