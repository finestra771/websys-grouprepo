//TOKEN
const FINNHUB_TOKEN = "d3pv3rpr01qgab52flagd3pv3rpr01qgab52flb0";
let symbol = "";
let updateInterval = null;

//for using button
document.getElementById("fetch_data_button").addEventListener("click", async () => {
  symbol = document.getElementById("company-input").value.trim().toUpperCase();
  if (!symbol) return;
  await loadStock(symbol);
});

document.getElementById("company-input").addEventListener("keypress", e => {
  if (e.key === "Enter") document.getElementById("fetch_data_button").click();
});

if(!symbol) symbol = "NVDA";
loadInfo(symbol);

async function loadInfo(symbol){
  const companyData = document.getElementById('info-content');
  console.log(`looking at ${symbol}'s data`);
  companyData.innerHTML = "";

  let card = document.createElement("div");
  card.className = "card";
  companyData.appendChild(card);
  card.innerHTML = `<h3>${symbol}</h3>`;

  let companyProfile = {};

  async function fetchCompanyProfile(){
    try{
      const res = await fetch(`https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${FINNHUB_TOKEN}`);
      companyProfile = await res.json();
    } catch(err){
      console.error("Error fetching company profile:", err);
    }
  }

  function updateCard(){
    console.log("updating...");
    card.innerHTML = `
      <h3>${companyProfile.name || symbol}</h3>
      <img src="${companyProfile.logo}" alt="${symbol}-logo">
      <p>Based in the ${companyProfile.country}</p>
      <p>Industry: ${companyProfile.finnhubIndustry}</p>
      <p>Inital Public Offering (IPO)*: ${companyProfile.ipo}</p>
      <p>Listed Exchange**: ${companyProfile.exchange}</p>
      <p>Market Capitalization***: ${companyProfile.marketCapitalization}</p>
      <p>Outstanding Shares****: ${companyProfile.shareOutstanding}</p>
      <p>Phone number: ${companyProfile.phone}</p>
      <a href="${companyProfile.weburl}">See their website</a>
      `;
  }

  await fetchCompanyProfile();
  updateCard();
}

//this is for auto completion of companies
const input = document.getElementById("company-input");
const datalist = document.getElementById("company-list");

input.addEventListener("input", async () => {
  const query = input.value.trim();
  if (!query) {
    datalist.innerHTML = "";
    return;
  }
  try {
    const res = await fetch(`https://finnhub.io/api/v1/search?q=${query}&token=${FINNHUB_TOKEN}`);
    const data = await res.json();

    //Taling advantage of datalist and options to do a "combobox"
    datalist.innerHTML = "";
    data.result.slice(0, 5).forEach(item => {
        const option = document.createElement("option");
        option.value = item.displaySymbol;
        option.textContent = `${item.displaySymbol} — ${item.description}`;
        datalist.appendChild(option);
    });
  } catch (err) {
    console.error("Error fetching symbol suggestions:", err);
  }
});

//if user selects item in drop down switches to said security
input.addEventListener("change", () => {
  document.getElementById("fetch_data_button").click();
});