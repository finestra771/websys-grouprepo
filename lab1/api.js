//TOKEN
const FINNHUB_TOKEN = "d3pv3rpr01qgab52flagd3pv3rpr01qgab52flb0";
let symbol = "";
let updateInterval = null;

//For using button
document.getElementById("fetch_data_button").addEventListener("click", async () => {
  symbol = document.getElementById("company-input").value.trim().toUpperCase();
  if (!symbol) return;
  await loadStock(symbol);
});

document.getElementById("company-input").addEventListener("keypress", e => {
  if (e.key === "Enter") document.getElementById("fetch_data_button").click();
});


if(!symbol) symbol = "NVDA";
loadStock(symbol)
const MAX_POINTS = 50;

async function loadStock(symbol) {
  try {
    
    //First if available remove/erase old data
    if (updateInterval) {
      clearInterval(updateInterval);
      updateInterval = null;
    }
    const svg = d3.select("#chart");
    svg.selectAll("*").remove();
    const cardAdd = document.getElementById("cardAdd");
    cardAdd.innerHTML = ""; 
    const newsData = document.getElementById('news');
    newsData.innerHTML = "";

    // Make new company card
    let card = document.createElement("div");
    card.className = "card";
    cardAdd.appendChild(card);
    card.innerHTML = `
      <h3>${symbol}</h3>
      <p>Price: $0.00</p>
      <p>Time: --:--:--</p>
    `;

    let companyProfile = {};
    let earningsCalendar = {};

    async function fetchCompanyProfile() {
      try {
        const res = await fetch(`https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${FINNHUB_TOKEN}`);
        companyProfile = await res.json();
      } catch (err) {
        console.error("Error fetching company profile:", err);
      }
    }

    async function fetchEarningsCalendar() {
      try {
        const res = await fetch(`https://finnhub.io/api/v1/stock/earnings?symbol=${symbol}&token=${FINNHUB_TOKEN}`);
        earningsCalendar = await res.json();
      } catch (err) {
        console.error("Error fetching earnings:", err);
      }
    }

    function updateCard(price, time) {
      const mkt_cap = companyProfile.marketCapitalization
        ? (companyProfile.marketCapitalization / 1000).toFixed(2) + "B"
        : "N/A";
      card.innerHTML = `
        <h3>${companyProfile.name || symbol}</h3>
        <p>Price: $${price}</p>
        <p>Time: ${new Date(time).toLocaleTimeString()}</p>
        <p>Industry: ${companyProfile.finnhubIndustry || "N/A"}</p>
        <p>Market Cap: ${mkt_cap}</p>
      `;
    }

    //Borrowed d3 setup with cursor follow
    const width = +svg.attr("width");
    const height = +svg.attr("height");
    const margin = { top: 20, right: 50, bottom: 30, left: 50 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
    const xScale = d3.scaleTime().range([0, innerWidth]);
    const yScale = d3.scaleLinear().range([innerHeight, 0]);
    const xAxisGroup = g.append("g").attr("transform", `translate(0,${innerHeight})`);
    const yAxisGroup = g.append("g");

    //Axis title for graph
    g.append("text")
      .attr("class", "y axis-title")
      .attr("transform", "rotate(-90)")
      .attr("x", -innerHeight / 2)
      .attr("y", -margin.left + 15)
      .attr("text-anchor", "middle")
      .text("💵 Price (USD)")
      .style("fill", "#8B4513");

    const line = d3.line()
      .x(d => xScale(d.time))
      .y(d => yScale(d.price));

    let data = [];
    const path = g.append("path")
      .attr("fill", "none")
      .attr("stroke", "#8B4513")
      .attr("stroke-width", 2);

    //for new prices each second update with new date
    function updateChart(newPrice) {
      const now = new Date();
      data.push({ time: now, price: newPrice });
      if (data.length > MAX_POINTS) data.shift();

      xScale.domain(d3.extent(data, d => d.time));
      yScale.domain([
        d3.min(data, d => d.price) * 0.95,
        d3.max(data, d => d.price) * 1.05
      ]);

      path.datum(data).attr("d", line);
      xAxisGroup.call(d3.axisBottom(xScale));
      yAxisGroup.call(d3.axisLeft(yScale));

      updateCard(newPrice, now);
    }

    await fetchCompanyProfile();
    await fetchEarningsCalendar();
    await fetchCompanyNews(symbol);

    //mouse hovering tool used in d3
    const focus = g.append("circle")
      .attr("r", 6)
      .style("fill", "none")
      .attr("stroke", "black")
      .style("opacity", 0);

    const focusText = g.append("text")
      .style("opacity", 0)
      .attr("text-anchor", "left")
      .attr("alignment-baseline", "middle");

    const bisect = d3.bisector(d => d.time).left;

    g.append("rect")
      .attr("width", innerWidth)
      .attr("height", innerHeight)
      .style("fill", "none")
      .style("pointer-events", "all")
      .on("mouseover", () => {
        focus.style("opacity", 1);
        focusText.style("opacity", 1);
      })
      .on("mousemove", (event) => {
        const [mx] = d3.pointer(event);
        const x0 = xScale.invert(mx);
        const i = bisect(data, x0, 1);
        const d0 = data[i - 1];
        const d1 = data[i];

        let selectedData;
        if (!d0) {
            selectedData = d1;
        } else if (!d1) {
            selectedData = d0;
        } else {
            selectedData = x0 - d0.time > d1.time - x0 ? d1 : d0;
        }

        if (!selectedData) return;
        focus.attr("cx", xScale(selectedData.time)).attr("cy", yScale(selectedData.price));
        focusText.text(`$${selectedData.price.toFixed(2)}`)
          .attr("x", xScale(selectedData.time) + 10)
          .attr("y", yScale(selectedData.price) - 10);
      })
      .on("mouseout", () => {
        focus.style("opacity", 0);
        focusText.style("opacity", 0);
      });

    //this is to avoid overcalling the api (30 call per second max)
    updateInterval = setInterval(async () => {
      try {
        const res = await fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_TOKEN}`);
        const json = await res.json();
        updateChart(json.c);
      } catch (err) {
        console.error("Error fetching quote:", err);
      }
    }, 1000);

  } catch (err) {
    console.error("Error fetching stock data:", err);
  }
}

//This is for auto completion of companies
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

//If user selects item in drop down switches to said security
input.addEventListener("change", () => {
  document.getElementById("fetch_data_button").click();
});


//This gets company news
async function fetchCompanyNews(symbol) {
  try {
    let card = document.getElementById("news");
    // Use the last 7 days for news
    const to = new Date().toISOString().split("T")[0];
    const from = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

    const res = await fetch(`https://finnhub.io/api/v1/company-news?symbol=${symbol}&from=${from}&to=${to}&token=${FINNHUB_TOKEN}`);
    const news = await res.json();

    // Add news to card
    let newsHTML;
    news.slice(0, 5).forEach(article => {
      newsHTML += `<span>
        ${new Date(article.datetime * 1000).toLocaleDateString()}:
        <a href="${article.url}" target="_blank">${article.headline}</a>
      </span>`;
    });

    // Append or update in card
    const newsContainer = card.querySelector("#company-news") || document.createElement("span");
    newsContainer.id = "company-news";
    newsContainer.innerHTML = newsHTML;

    if (!card.contains(newsContainer)) card.appendChild(newsContainer);

  } catch (err) {
    console.error("Error fetching company news:", err);
  }
}
