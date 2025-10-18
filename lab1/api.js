//TOKEN
const FINNHUB_TOKEN = "d3pv3rpr01qgab52flagd3pv3rpr01qgab52flb0";
const symbol = "NVDA";
const MAX_POINTS = 50;

// Get card element & create card
const cardAdd = document.getElementById('cardAdd');
let card = document.createElement('div');
card.className = 'card';
cardAdd.appendChild(card);

// Example card update
card.innerHTML = `
    <h3>${symbol}</h3>
    <p>Price: $0.00</p>
    <p>Time: --:--:--</p>
`;


// Store latest company info & earnings
let companyProfile = {};
let earningsCalendar = [];

async function fetchCompanyProfile() {
    try {
        const res = await fetch(`https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${FINNHUB_TOKEN}`);
        companyProfile = await res.json();
    } catch (err) {
        console.error("Error with fetching company profile:", err);
    }
}

async function fetchEarningsCalendar() {
    try {
        const res = await fetch(`https://finnhub.io/api/v1/stock/earnings?symbol=${symbol}&token=${FINNHUB_TOKEN}`);
        earningsCalendar = await res.json();
    } catch (err) {
        console.error("Error with fetching earnings:", err);
    }
}

// Edits html to update card data
function updateCard(price, time) {
    const mkt_cap = companyProfile.marketCapitalization ? (companyProfile.marketCapitalization / 1000000).toFixed(2) + "T" : "N/A";
    card.innerHTML = `
        <h3>${companyProfile.name || symbol}</h3>
        <p>Price: $${price}</p>
        <p>Time: ${new Date(time).toLocaleTimeString()}</p>
        <p>Industry: ${companyProfile.finnhubIndustry || "N/A"}</p>
        <p>Market Cap: ${mkt_cap}</p>
    `;
}

// D3 chart setup
const svg = d3.select("#chart");
const width = +svg.attr("width");
const height = +svg.attr("height");
const margin = { top: 20, right: 50, bottom: 30 , left: 50 };
const innerWidth = width - margin.left - margin.right;
const innerHeight = height - margin.top - margin.bottom;

const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
const xScale = d3.scaleTime().range([0, innerWidth]);
const yScale = d3.scaleLinear().range([innerHeight, 0]);
const xAxisGroup = g.append("g").attr("transform", `translate(0,${innerHeight})`);
const yAxisGroup = g.append("g");

// Axis titles
g.append("text")
  .attr("class", "y axis-title")
  .attr("transform", "rotate(-90)")
  .attr("x", -innerHeight / 2)
  .attr("y", -margin.left + 15)
  .attr("text-anchor", "middle")
  .text("💵 Price (USD) ")
  .style("fill", "#8B4513");

const line = d3.line()
    .x(d => xScale(d.time))
    .y(d => yScale(d.price));

let data = [];
const path = g.append("path")
    .attr("fill", "none")
    .attr("stroke", "#8B4513")
    .attr("stroke-width", 2);

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
    console.log({ time: now, price: newPrice });
}

fetchCompanyProfile();
fetchEarningsCalendar();

//taken from d3 and adjusted for variables
// create focus circle and text
var focus = g.append("circle")
    .attr("r", 6)
    .style("fill", "none")
    .attr("stroke", "black")
    .style("opacity", 0);

var focusText = g.append("text")
    .style("opacity", 0)
    .attr("text-anchor", "left")
    .attr("alignment-baseline", "middle");

// bisector based on time
var bisect = d3.bisector(d => d.time).left;

// append rect to capture mouse movements
g.append('rect')
    .attr('width', innerWidth)
    .attr('height', innerHeight)
    .style('fill', 'none')
    .style('pointer-events', 'all')
    .on('mouseover', () => {
        focus.style("opacity", 1);
        focusText.style("opacity", 1);
    })
    .on('mousemove', (event) => {
        const [mx] = d3.pointer(event);
        const x0 = xScale.invert(mx);
        const i = bisect(data, x0, 1);
        const d0 = data[i - 1];
        const d1 = data[i];
        const selectedData = x0 - d0.time > d1.time - x0 ? d1 : d0;

        focus
            .attr("cx", xScale(selectedData.time))
            .attr("cy", yScale(selectedData.price));

        focusText
            .html(`$${selectedData.price.toFixed(2)}`)
            .attr("x", xScale(selectedData.time) + 10)
            .attr("y", yScale(selectedData.price) - 10);
    })
    .on('mouseout', () => {
        focus.style("opacity", 0);
        focusText.style("opacity", 0);
});

  
// Update data every second
setInterval(async () => {
    try {
        const res = await fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_TOKEN}`);
        const json = await res.json();
        updateChart(json.c); // use current price
    } catch (err) {
        console.error("Error fetching quote:", err);
    }
}, 1000);
