from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from google import genai
from dotenv import load_dotenv
import os
import yfinance as yf
from typing import Literal
import json

# ------------------------------
# Load environment and data
# ------------------------------
load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=GEMINI_API_KEY)

with open("Stonkly/py_backend/sectors.json", "r") as f:
    etf_data = json.load(f)

# ------------------------------
# FastAPI initialization
# ------------------------------
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------------------
# Pydantic models
# ------------------------------
class PromptRequest(BaseModel):
    prompt: str

# ------------------------------
# Gemini AI endpoint
# ------------------------------
@app.post("/generate")
async def generate_content(request: PromptRequest):
    try:
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=request.prompt,
        )
        return {"text": response.text}
    except Exception as e:
        return {"error": str(e)}

# ------------------------------
# ETF endpoints
# ------------------------------
@app.get("/etf/data/{ticker}")
def get_etf_data(ticker: str):
    """Get specific ETF info, recent performance, and return"""
    try:
        t = yf.Ticker(ticker)
        info = t.info
        hist = t.history(period="2d")  # last 2 days to calculate return

        # Compute daily return if enough data exists
        closes = hist['Close'].tolist()
        daily_return = None
        if len(closes) >= 2:
            daily_return = ((closes[-1] - closes[-2]) / closes[-2]) * 100

        return {
            "ticker": ticker.upper(),
            "info": {
                "name": info.get("shortName", "N/A"),
                "sector": info.get("sector", "N/A"),
                "industry": info.get("industry", "N/A"),
                "marketCap": info.get("marketCap", "N/A"),
                "navPrice": info.get("navPrice", "N/A"),
                "totalAssets": info.get("totalAssets", "N/A"),
                "category": info.get("category", "N/A")
            },
            "daily_return": round(daily_return, 2) if daily_return is not None else None,
            "recent_prices": hist.tail(10).to_dict()
        }

    except Exception as e:
        return {"error": f"Failed to fetch data for {ticker}: {str(e)}"}


@app.get("/etf/{ticker}/intraday")
def get_intraday_etf(
    ticker: str,
    interval: Literal['1m','2m','5m','15m','30m','60m'] = Query('60m'),
    period: str = Query('60d')
):
    """
    Get intraday ETF price data (up to 60 days for large intervals)
    Example: /etf/QQQ/intraday?interval=60m&period=30d
    """
    try:
        # Adjust period for small intervals
        if interval in ['1m','2m','5m','15m','30m'] and period not in ['1d','5d','7d','30d']:
            period = '7d'

        t = yf.Ticker(ticker)
        hist = t.history(period=period, interval=interval)

        if hist.empty:
            return {"error": f"No intraday data found for {ticker} with interval {interval} and period {period}"}

        hist = hist.reset_index()
        if 'Datetime' in hist.columns:
            hist['Datetime'] = hist['Datetime'].astype(str)

        return {
            "ticker": ticker.upper(),
            "interval": interval,
            "period": period,
            "intraday_prices": hist.to_dict(orient="records")
        }

    except Exception as e:
        return {"error": f"Failed to fetch intraday data for {ticker}: {str(e)}"}
