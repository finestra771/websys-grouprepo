from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import yfinance as yf
import json

# Data as of 11/12/2025
# Load your JSON file
with open("Stonkly\py_backend\sectors.json", "r") as f:
    etf_data = json.load(f)

# Loop through each theme and print the sector and tickers
for theme, info in etf_data["etf_themes"].items():
    print(f"Sector: {theme}")
    print("ETFs:", ", ".join(info["tickers"]))
    print("-" * 40)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------------------
# Endpoints
# -------------------------------

@app.get("/etf/data/{ticker}")
def get_etf_data(ticker: str):
    """Get specific ETF info and recent performance"""
    try:
        t = yf.Ticker(ticker)
        info = t.info
        hist = t.history(period="1mo")  # past month of price data

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
            "recent_prices": hist.tail(10).to_dict()
        }

    except Exception as e:
        return {"error": f"Failed to fetch data for {ticker}: {str(e)}"}