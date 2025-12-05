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
            .on('mouseover', function (event, d) {
                d3.select(this).transition().duration(200).attr('transform', 'scale(1.05)');
                tooltip.transition().duration(200).style("opacity", 1);
                tooltip.html(`<strong>${d.data.name}</strong><br>AUM: $${d.data.value.toLocaleString()} MM`)
                    .style("left", (event.pageX + 15) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on('mousemove', function (event) {
                tooltip.style("left", (event.pageX + 15) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on('mouseout', function (event, d) {
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
        const response = await fetch(`http://127.0.0.1:3030/etf/data/${ticker}`);
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
        fetchETF(ticker);

    } catch (err) {
        console.error("Error fetching ETF data:", err);
    }
}

async function fetchETF(symbol, interval = "60m") {
    try {
        const histResponse = await fetch(`http://127.0.0.1:3030/etf/${symbol}/intraday?interval=${interval}`);
        const data = await histResponse.json(); // <-- read JSON from response
        const histData = data.intraday_prices;

        if (!histData || histData.error) {
            console.error("No intraday data available for chart");
            return;
        }

        // Log or use the array
        //histData.map(d => console.log(d.Datetime, d.Close));

        // Draw chart
        drawETFLineChart(histData);
        callGemini("Returns a short analytical paragraph about " + symbol + " etf performance, Focus on recent trends, returns, and sector insights. Make sure this output is less than 6 sentences/paragraph. Make it concise and eay for anyone to understand");
    } catch (err) {
        console.error("Error fetching ETF intraday data:", err);
    }
}

// Track typing timeouts per element
const typeWriterMap = new Map();
const typeWriterElementMap = new Map();

//this imitates like the gradual text effect for gemini
function typeWriter(elementId, text, speed = 25) {
    const el = document.getElementById(elementId);
    el.textContent = "";  // reset content

    // If already typing on this element, cancel previous
    if (typeWriterMap.has(el)) {
        clearTimeout(typeWriterMap.get(el));
    }

    let index = 0;

    function type() {
        if (index < text.length) {
            el.textContent += text.charAt(index);
            index++;
            const timeoutId = setTimeout(type, speed);
            typeWriterMap.set(el, timeoutId);
        } else {
            typeWriterMap.delete(el); // done
        }
    }

    type();
}

function typeWriterElement(el, text, speed = 25) {
    el.textContent = "";

    // Cancel any ongoing typing for this element
    if (typeWriterElementMap.has(el)) {
        clearTimeout(typeWriterElementMap.get(el));
    }

    let index = 0;

    function type() {
        if (index < text.length) {
            el.textContent += text.charAt(index);
            index++;
            const timeoutId = setTimeout(type, speed);
            typeWriterElementMap.set(el, timeoutId);
        } else {
            typeWriterElementMap.delete(el); // Done typing
        }
    }
    type();
}

async function callGemini(promptText) {
    try {
        const response = await fetch("http://127.0.0.1:3030/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt: promptText })
        });

        const data = await response.json();

        if (data.text) {
            typeWriter("anal", data.text, 10);
        } else if (data.error) {
            document.getElementById("anal").innerText = "Error: " + data.error;
        }

    } catch (err) {
        console.error("Fetch failed:", err);
        document.getElementById("anal").innerText = "Network error — backend not reachable.";
    }
}

async function getGeminiResponse(promptText) {
    try {

        const response = await fetch("http://127.0.0.1:3030/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt: promptText })
        });

        const data = await response.json();

        if (data.text) {
            return data.text;
        } else if (data.error) {
            return "error";
        }

    } catch (err) {
        console.error("Fetch failed:", err);
        document.getElementById("anal").innerText = "Network error — backend not reachable.";
    }
}

function drawETFLineChart(data) {
    // Clear previous chart
    d3.select("#etfGraphing").selectAll("*").remove();

    // Prepare data
    const chartData = data.map(d => ({
        date: new Date(d.Datetime || d.Date),
        close: d.Close
    }));

    const width = 800,
        height = 400,
        margin = { top: 50, right: 50, bottom: 50, left: 70 };

    const svg = d3.select("#etfGraphing")
        .append("svg")
        .attr("id", "etfChartSVG")
        .attr("width", width)
        .attr("height", height)
        .style("background", "#f9f9f9")
        .style("border-radius", "12px");

    // Scales
    const x = d3.scaleTime()
        .domain(d3.extent(chartData, d => d.date))
        .range([margin.left, width - margin.right]);

    const y = d3.scaleLinear()
        .domain([
            d3.min(chartData, d => d.close) * 0.98,
            d3.max(chartData, d => d.close) * 1.02
        ])
        .range([height - margin.bottom, margin.top]);

    // Line generator
    const line = d3.line()
        .x(d => x(d.date))
        .y(d => y(d.close))
        .curve(d3.curveMonotoneX);

    // Clip for zooming
    svg.append("defs").append("clipPath")
        .attr("id", "etf-clip")
        .append("rect")
        .attr("x", margin.left)
        .attr("y", margin.top)
        .attr("width", width - margin.left - margin.right)
        .attr("height", height - margin.top - margin.bottom);

    // Chart group
    const chartGroup = svg.append("g")
        .attr("clip-path", "url(#etf-clip)");

    // Line path
    const linePath = chartGroup.append("path")
        .datum(chartData)
        .attr("d", line)
        .attr("fill", "none")
        .attr("stroke", "#cc5500")
        .attr("stroke-width", 2.5);

    // Axes
    const xAxis = d3.axisBottom(x).ticks(8);
    const yAxis = d3.axisLeft(y).ticks(6);

    const xAxisG = svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(xAxis);

    const yAxisG = svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(yAxis);

    // Tooltip
    const tooltip = d3.select("#etfGraphing")
        .append("div")
        .style("position", "absolute")
        .style("background", "#fff")
        .style("padding", "6px 12px")
        .style("border-radius", "6px")
        .style("opacity", 0)
        .style("pointer-events", "none")
        .style("box-shadow", "0 4px 12px rgba(0,0,0,0.15)");

    let lastMousePos = null; // LOCAL TO ETF CHART
    
    // Cursor focus group
    const focus = chartGroup.append("g")
        .style("display", "none");

    focus.append("circle")
        .attr("r", 6)
        .attr("fill", "#ff4500")
        .attr("stroke", "#fff")
        .attr("stroke-width", 2);

    focus.append("line")
        .attr("class", "x-cross")
        .attr("stroke", "#999")
        .attr("stroke-dasharray", "4 2");

    focus.append("line")
        .attr("class", "y-cross")
        .attr("stroke", "#999")
        .attr("stroke-dasharray", "4 2");

    // Overlay for hover & zoom
    const overlay = svg.append("rect")
        .attr("x", margin.left)
        .attr("y", margin.top)
        .attr("width", width - margin.left - margin.right)
        .attr("height", height - margin.top - margin.bottom)
        .style("fill", "none")
        .style("pointer-events", "all");

    // Zoom behavior
    const zoom = d3.zoom()
        .scaleExtent([1, 10])
        .translateExtent([[margin.left, margin.top], [width - margin.right, height - margin.bottom]])
        .extent([[margin.left, margin.top], [width - margin.right, height - margin.bottom]])
        .on("zoom", (event) => {
            const newX = event.transform.rescaleX(x);
            const newY = event.transform.rescaleY(y);

            // Update line + axes normally
            linePath.attr("d", line.x(d => newX(d.date)).y(d => newY(d.close)));
            xAxisG.call(d3.axisBottom(newX));
            yAxisG.call(d3.axisLeft(newY));

            // ─── FIX: Update hover focus during zoom ───
            if (lastMousePos) {
                const [mx] = lastMousePos;
                const xDate = newX.invert(mx);

                const bisect = d3.bisector(d => d.date).left;
                const idx = bisect(chartData, xDate);

                const d0 = chartData[idx - 1];
                const d1 = chartData[idx];
                const d = (!d0 || !d1)
                    ? (d0 || d1)
                    : (xDate - d0.date > d1.date - xDate ? d1 : d0);

                const cx = newX(d.date);
                const cy = newY(d.close);

                focus.attr("transform", `translate(${cx},${cy})`);

                focus.select(".x-cross")
                    .attr("x1", margin.left - cx)
                    .attr("x2", width - margin.right - cx)
                    .attr("y1", 0)
                    .attr("y2", 0);

                focus.select(".y-cross")
                    .attr("x1", 0)
                    .attr("x2", 0)
                    .attr("y1", margin.top - cy)
                    .attr("y2", height - margin.bottom - cy);
            }
        });

    // Apply zoom ONCE
    svg.call(zoom);

    // Hover interaction (ONE time only)
    overlay.on("mouseover", () => focus.style("display", null))
        .on("mouseout", () => {
            focus.style("display", "none");
            tooltip.style("opacity", 0);
        })
        .on("mousemove", (event) => {
            lastMousePos = d3.pointer(event);
            const transform = d3.zoomTransform(svg.node());
            const newX = transform.rescaleX(x);
            const newY = transform.rescaleY(y);

            const [mx] = d3.pointer(event);
            const xDate = newX.invert(mx);

            const bisect = d3.bisector(d => d.date).left;
            const idx = bisect(chartData, xDate);

            const d0 = chartData[idx - 1];
            const d1 = chartData[idx];
            const d = (!d0 || !d1)
                ? (d0 || d1)
                : (xDate - d0.date > d1.date - xDate ? d1 : d0);

            const cx = newX(d.date);
            const cy = newY(d.close);

            focus.attr("transform", `translate(${cx},${cy})`);

            focus.select(".x-cross")
                .attr("x1", margin.left - cx)
                .attr("x2", width - margin.right - cx)
                .attr("y1", 0)
                .attr("y2", 0);

            focus.select(".y-cross")
                .attr("x1", 0)
                .attr("x2", 0)
                .attr("y1", margin.top - cy)
                .attr("y2", height - margin.bottom - cy);

            tooltip
                .style("opacity", 1)
                .html(`<strong>${d.date.toLocaleString()}</strong><br>Close: $${d.close.toFixed(2)}`)
                .style("left", `${event.pageX + 15}px`)
                .style("top", `${event.pageY - 40}px`);
        });

    // Title
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", margin.top / 2)
        .attr("text-anchor", "middle")
        .attr("font-size", "18px")
        .attr("font-weight", "bold")
        .text("ETF Price History 📈");
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
                li.style.alignItems = "center";
                li.style.justifyContent = "space-between";
                li.style.cursor = "pointer";

                const tickerSpan = document.createElement("span");
                tickerSpan.textContent = ticker;
                // space
                tickerSpan.style.marginRight = "20px";

                // Star button
                const starButton = document.createElement("button");
                starButton.textContent = "☆";
                starButton.style.cursor = "pointer";
                starButton.style.fontSize = "16px";

                // Toggle favorite
                starButton.addEventListener("click", (e) => {
                    e.stopPropagation(); // Prevent triggering the li click event
                    if (starButton.textContent === "☆") {
                        starButton.textContent = "★"; // Mark as favorite
                        starButton.style.color = "gold";
                        // Send request to PHP
                        fetch("favoriteHandler.php", {
                            method: "POST",
                            headers: { "Content-Type": "application/x-www-form-urlencoded" },
                            body: `ticker=${encodeURIComponent(ticker)}&action=add`
                        })
                            .then(res => res.text())
                            .then(data => {
                                // console.log("Server response:", data);
                            })
                            .catch(err => {
                                console.error("Error updating favorite:", err);
                            });
                    } else {
                        starButton.textContent = "☆"; // Unmark as favorite
                        starButton.style.color = "";
                        // Send request to PHP
                        fetch("favoriteHandler.php", {
                            method: "POST",
                            headers: { "Content-Type": "application/x-www-form-urlencoded" },
                            body: `ticker=${encodeURIComponent(ticker)}&action=remove`
                        })
                            .then(res => res.text())
                            .then(data => {
                                console.log("Server response:", data);
                            })
                            .catch(err => {
                                console.error("Error updating favorite:", err);
                            });
                    }
                });

                // Clicking fills search bar and fetches data
                li.addEventListener("click", () => {
                    document.getElementById("etfSearchInput").value = ticker;
                    fetchETFData(ticker);
                });

                li.appendChild(tickerSpan);
                li.appendChild(starButton);
                etfList.appendChild(li);
            });
        });

        if (sectors.length > 0) {
            sectorSelect.value = sectors[2]; // pre-select first sector 2 is for technology
            sectorSelect.dispatchEvent(new Event('change')); // trigger ETF list population
        }

    } catch (err) {
        console.error("Error loading ETF sectors:", err);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const chatToggle = document.getElementById("chat-toggle");
    const chatWidget = document.getElementById("chat-widget");
    const chatClose = document.getElementById("chat-close");
    const chatInput = document.getElementById("chat-input");
    const chatMessages = document.getElementById("chat-messages");

    const defaultBotMsg = document.createElement("div");
    defaultBotMsg.classList.add("bot-msg");
    defaultBotMsg.textContent =
        "Hi i'm Juniper Huang! Ask me about ETFs and I’ll give a short breakdown.";
    chatMessages.appendChild(defaultBotMsg);

    // Toggle chat visibility
    chatToggle.addEventListener("click", () => {
        chatWidget.style.display = chatWidget.style.display === "flex" ? "none" : "flex";
        chatWidget.style.flexDirection = "column";
    });

    // Close button
    chatClose.addEventListener("click", () => {
        chatWidget.style.display = "none";
    });

    // Add messages
    chatInput.addEventListener("keypress", async (e) => {
        if (e.key === "Enter" && chatInput.value.trim() !== "") {
            const msg = chatInput.value;

            // User message
            const userMsg = document.createElement("div");
            userMsg.classList.add("user-msg");
            userMsg.textContent = msg;
            chatMessages.appendChild(userMsg);

            // Bot typing bubble
            const botMsg = document.createElement("div");
            botMsg.classList.add("bot-msg", "typing");
            chatMessages.appendChild(botMsg);
            chatInput.value = "";
            chatMessages.scrollTop = chatMessages.scrollHeight;

            // Animate "thinking dots"
            let dotCount = 0;
            const maxDots = 3;
            const dotsInterval = setInterval(() => {
                botMsg.textContent = "Thinking" + ".".repeat(dotCount);
                dotCount = (dotCount + 1) % (maxDots + 1);
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }, 400);

            // Fetch bot response
            const botResponse = await getGeminiResponse("Your name is Juniper Huang. Only provide short, plain-language analysis about ETFs (e.g., QQQ). This includes: explanations of what ETFs are, analysis of specific ETFs (e.g., QQQ), comparisons between ETFs, brief suitability notes for different types of investors.Focus on performance, sector exposure, and general investor suitability. If the user greets you (e.g., hi, hello, hey), greet them back briefly. If the user says only “good” or “good.”, ignore it and instead ask: Do you have any ETF questions? If the user message is NOT related to ETFs, respond exactly with: That is beyond my scope as an AI chatbot. Responses must be under 5 sentences." + msg);

            // Stop dots animation
            clearInterval(dotsInterval);

            // Remove typing class
            botMsg.classList.remove("typing");

            // Show final response with typewriter effect
            typeWriterElement(botMsg, botResponse, 20);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    });
});

document.addEventListener("DOMContentLoaded", async () => {
    // Load sector info and charts
    await loadSectors();
    await loadSectors2();

    // Automatically fetch QQQ data
    const defaultETF = "QQQ";
    fetchETFData(defaultETF);
});
