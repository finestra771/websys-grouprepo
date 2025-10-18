import 'dotenv/config'; // Loads variables from .env file
import finnhub from 'finnhub';

const FINNHUB_TOKEN = process.env.FINNHUB_TOKEN; 
const finnhub = require("finnhub");

const api_key = finnhub.ApiClient.instance.authentications['api_key'];
api_key.apiKey = FINNHUB_TOKEN;

const finnhubClient = new finnhub.DefaultApi()

finnhubClient.companyEpsEstimates("AAPL", {}, (error, data, response) => {
  if (error) {
    console.error("Finnhub API Error:", error);
    // The error object often has a message like 'Invalid API Key'
    return;
  }
  
  // If no error, but data might contain a specific Finnhub error structure
  if (data && data.error) {
      console.error("Finnhub Data Error:", data.error);
      return;
  }
  
  console.log(data);
});