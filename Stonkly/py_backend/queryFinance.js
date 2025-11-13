async function loadSectors() {
    try {
        const response = await fetch('py_backend/sectors.json');
        if (!response.ok) throw new Error('Failed to load JSON');
        const data = await response.json();
        const sectorStats = data.sector_stats;

        // Populate table
        const tbody = document.querySelector("#sectorTable tbody");
        const descriptionBox = document.getElementById("sectorDescription");
        for (const [sector, stats] of Object.entries(sectorStats)) {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${stats.AUM_Rank}</td>
                <td>${sector}</td>
                <td>$${stats.Assets_Under_Management_MM.toLocaleString()}</td>
                <td>${stats.Num_ETFs}</td>
            `;
            tbody.appendChild(row);

            row.addEventListener("mouseenter", () => {
                descriptionBox.innerHTML = `
                    <h2>${sector}</h2>
                    <ul>
                    <li>${stats.Description}</li>
                    </ul>
                `;
            });
            row.addEventListener("mouseleave", () => {
                descriptionBox.innerHTML = `
                <h2>What is an ETF Sector? 🤔</h2> 
                <ul>
                    <li>ETF Sectors are a collection of exchange-traded funds (ETFs) that are focused on a specific industry or market</li>
                    <li>They allow investors to target investments based on market outlook and give insights into Tariff effects on an industry.</li>
                </ul>`;
                descriptionBox.classList.remove("hovering");
            });
        }

       // Draw donut chart
        const width = 360, height = 360, margin = 40;
        const radius = Math.min(width, height) / 2 - margin;

        // Create SVG
        const svg = d3.select("#sectorPieChart")
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", `translate(${width / 2}, ${height / 2})`);

        // Prepare data
        const sectorsArray = Object.entries(sectorStats).map(([key, value]) => ({
            name: key,
            value: value.Assets_Under_Management_MM
        }));

        const color = d3.scaleOrdinal()
            .domain(sectorsArray.map(d => d.name))
            .range([
            "#8b4513",
            "#d2691e",
            "#ff8c42",
            "#6f4e37", 
            "#a0522d",
            "#b5651d",
            "#c19a6b",
            "#ff7f50",
            "#deb887",
            "#cd853f", 
            "#f4a460"
        ]);

        // Pie layout
        const pie = d3.pie()
            .value(d => d.value)
            .sort(null);

        const arcs = pie(sectorsArray);

        // Arc generators
        const arcGenerator = d3.arc()
            .innerRadius(radius * 0.5) // Donut hole
            .outerRadius(radius);

        const labelArc = d3.arc()
            .innerRadius(radius * 1.05)
            .outerRadius(radius * 1.05);

        // Tooltip
        const tooltip = d3.select("body")
            .append("div")
            .style("position", "absolute")
            .style("background-color", "#fff7f0")
            .style("padding", "8px 12px")
            .style("border-radius", "8px")
            .style("box-shadow", "0 4px 12px rgba(0,0,0,0.1)")
            .style("pointer-events", "none")
            .style("opacity", 0);

        // Draw slices
        svg.selectAll('path')
            .data(arcs)
            .enter()
            .append('path')
            .attr('d', arcGenerator)
            .attr('fill', d => color(d.data.name))
            .attr('stroke', '#fff')
            .style('stroke-width', '2px')
            .on('mouseover', function(event, d) {
                d3.select(this).transition().duration(200).attr('transform', 'scale(1.05)');
                tooltip.transition().duration(200).style("opacity", 1);
                tooltip.html(`<strong>${d.data.name}</strong><br>AUM: $${d.data.value.toLocaleString()} MM`)
                    .style("left", (event.pageX + 15) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on('mousemove', function(event) {
                tooltip.style("left", (event.pageX + 15) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on('mouseout', function(event, d) {
                d3.select(this).transition().duration(200).attr('transform', 'scale(1)');
                tooltip.transition().duration(200).style("opacity", 0);
            });

        // Compute total AUM for percentage
        const total = d3.sum(sectorsArray, d => d.value);

        // Add percentage labels inside each slice
        svg.selectAll('text')
            .data(arcs)
            .enter()
            .append('text')
            .text(d => `${((d.data.value / total) * 100).toFixed(0)}%`)
            .attr('transform', d => `translate(${arcGenerator.centroid(d)})`)
            .style('text-anchor', 'middle')
            .style('font-size', '10px')
            .style('fill', '#fff')
            .style('font-weight', 'bold');
    } catch (error) {
        console.error('Error loading sectors:', error);
    }
}

loadSectors();
loadSectors2()

//helper function to get sector from ticker
function getSectorFromTicker(ticker, data) {
    for (const [sector, info] of Object.entries(data.etf_themes)) {
        if (info.tickers.includes(ticker)) {
            return sector;
        }
    }
    return "Unknown";
}

// Fetch individual ETF data from backend
async function fetchETFData(ticker) {
    try {
        const response = await fetch(`http://127.0.0.1:8000/etf/data/${ticker}`);
        const data = await response.json();
        const sector = getSectorFromTicker(ticker, await (await fetch("py_backend/sectors.json")).json());

        if (data.error) {
            document.getElementById("etfResult").textContent = data.error;
            return;
        }

        const info = data.info;
        const html = `
            <h3>${info.name} (${ticker})</h3>
            <p><strong>Sector:</strong> ${sector}</p>
            <p><strong>Market Cap:</strong> ${info.marketCap}</p>
            <p><strong>Total Assets:</strong> ${info.totalAssets}</p>
            <p><strong>Category:</strong> ${info.category}</p>
        `;
        document.getElementById("etfResult").innerHTML = html;

    } catch (err) {
        console.error("Error fetching ETF data:", err);
    }
}

// Initialize everything after DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
    const searchButton = document.getElementById("etfSearchButton");
    searchButton.addEventListener("click", () => {
        const tickerInput = document.getElementById("etfSearchInput").value.trim().toUpperCase();
        if (tickerInput) fetchETFData(tickerInput);
    });
});


async function loadSectors2() {
    try {
        const response = await fetch("py_backend/sectors.json");
        if (!response.ok) throw new Error("Failed to load JSON");
        const data = await response.json();

        const sectorSelect = document.getElementById("sectorSelect");
        const etfList = document.getElementById("etfList");

        // Populate dropdown
        const sectors = Object.keys(data.etf_themes);
        sectors.forEach(sector => {
            const option = document.createElement("option");
            option.value = sector;
            option.textContent = sector;
            sectorSelect.appendChild(option);
        });

        // Handle sector selection
        sectorSelect.addEventListener("change", e => {
            const selected = e.target.value;
            etfList.innerHTML = ""; // clear previous list

            if (!selected) return;

            const tickers = data.etf_themes[selected]?.tickers || [];
            if (tickers.length === 0) {
                etfList.innerHTML = "<li>No ETFs found for this sector.</li>";
                return;
            }

            tickers.forEach(ticker => {
                const li = document.createElement("li");
                li.textContent = ticker;
                li.style.cursor = "pointer";

                // Clicking fills search bar and fetches data
                li.addEventListener("click", () => {
                    document.getElementById("etfSearchInput").value = ticker;
                    fetchETFData(ticker);
                });

                etfList.appendChild(li);
            });
        });

    } catch (err) {
        console.error("Error loading ETF sectors:", err);
    }
}