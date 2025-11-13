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
    } catch (error) {
        console.error('Error loading sectors:', error);
    }
}

loadSectors();
