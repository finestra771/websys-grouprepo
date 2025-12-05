document.addEventListener("DOMContentLoaded", () => {
  const portfolioContainer = d3.select("#portfolioGraph");
  const portfolioSVG = portfolioContainer.append("svg")
    .attr("width", 900)
    .attr("height", 500);
  
  const margin = { top: 50, right: 120, bottom: 50, left: 60 };
  const width = +portfolioSVG.attr("width") - margin.left - margin.right;
  const height = +portfolioSVG.attr("height") - margin.top - margin.bottom;

  const g = portfolioSVG.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Clip path so graph doesn't escape the axis area
  g.append("defs").append("clipPath")
    .attr("id", "portfolio-clip")
    .append("rect")
    .attr("width", width)
    .attr("height", height);

  // Zoom layer that gets clipped
  const zoomLayer = g.append("g")
    .attr("class", "zoom-layer")
    .attr("clip-path", "url(#portfolio-clip)");

  const portfolioCSVs = [
    "resources/data/bloomberg_data/HFAreportforVNQUSEquity.csv",
    "resources/data/bloomberg_data/HFAreportforXLBUSEquity.csv",
    "resources/data/bloomberg_data/HFAreportforXLCUSEquity.csv",
    "resources/data/bloomberg_data/HFAreportforXLEUSEquity.csv",
    "resources/data/bloomberg_data/HFAreportforXLFUSEquity.csv",
    "resources/data/bloomberg_data/HFAreportforXLIUSEquity.csv",
    "resources/data/bloomberg_data/HFAreportforXLKUSEquity.csv",
    "resources/data/bloomberg_data/HFAreportforXLPUSEquity.csv",
    "resources/data/bloomberg_data/HFAreportforXLUUSEquity.csv",
    "resources/data/bloomberg_data/HFAreportforXLVUSEquity.csv",
    "resources/data/bloomberg_data/HFAreportforXLYUSEquity.csv"
  ];

  function extractTicker(file) {
    const baseName = file.split("/").pop();
    const match = baseName.match(/HFAreportfor(.*?)Equity/);
    return match ? match[1] : null;
  }

  const portfolioOptions = portfolioCSVs.map(file => ({
    filename: file,
    ticker: extractTicker(file)
  }));

  const dropdown = d3.select("#portfolio-select");
  dropdown.selectAll("option")
    .data(portfolioOptions)
    .enter()
    .append("option")
    .attr("value", d => d.filename)
    .text(d => d.ticker);

  let tariffStory;

  d3.csv("resources/data/news_data/mediacloud_tariff_daily_counts.csv", d3.autoType)
    .then(data => {
      tariffStory = data.map(d => {
        if (!d.tariff_story_count) {
          return {
            date: new Date(d.date),
            tariff_story_count: 0
          };
        }
        const obj = JSON.parse(d.tariff_story_count.replace(/'/g, '"'));
        return {
          date: new Date(d.date),
          tariff_story_count: obj.relevant || 0
        };
      });

      loadPortfolioCSV(portfolioCSVs[0]);
    });

  function loadPortfolioCSV(file) {
    d3.csv(file, d3.autoType).then(ports => {
      ports.forEach(d => {
        d.date = new Date(d.date);
        d.cumulative_portfolio = +d["cumulative portfolio"] || 0;
        d.cumulative_benchmark = +d["cumulative benchmark"] || 0;
      });

      ports = ports.filter(d => !isNaN(d.date.getTime()));
      const tariffMap = new Map(tariffStory.map(d => [d.date.getTime(), d.tariff_story_count]));
      ports.forEach(d => {
        d.tariff_story_count = tariffMap.get(d.date.getTime()) || 0;
      });

      drawCmpChart(ports);
    });
  }

  dropdown.on("change", () => {
    loadPortfolioCSV(dropdown.node().value);
  });

  function drawCmpChart(data) {
    zoomLayer.selectAll("*").remove();
    g.selectAll(".axis").remove();
    g.selectAll(".axis-label").remove();

    const xOriginal = d3.scaleTime()
      .domain(d3.extent(data, d => d.date))
      .range([0, width]);
    let x = xOriginal.copy();

    const yLeft = d3.scaleLinear()
      .domain([
        d3.min(data, d => Math.min(d.cumulative_portfolio, d.cumulative_benchmark)),
        d3.max(data, d => Math.max(d.cumulative_portfolio, d.cumulative_benchmark))
      ])
      .nice()
      .range([height, 0]);

    const yRight = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.tariff_story_count)])
      .nice()
      .range([height, 0]);

    const xAxis = g.append("g")
      .attr("class", "axis x-axis")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x));

    g.append("g").attr("class", "axis y-axis-left").call(d3.axisLeft(yLeft));
    g.append("g").attr("class", "axis y-axis-right").attr("transform", `translate(${width},0)`).call(d3.axisRight(yRight));

    g.append("text")
      .attr("class", "axis-label x-axis-label")
      .attr("x", width / 2)
      .attr("y", height + 40)
      .attr("text-anchor", "middle")
      .style("fill", "#B87432")
      .style("font-family", "BMDOHYEON_TTF")
      .style("font-size", "14px")
      .text("Date");

    g.append("text")
      .attr("class", "axis-label y-axis-label-left")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", -45)
      .attr("text-anchor", "middle")
      .style("fill", "#B87432")
      .style("font-family", "BMDOHYEON_TTF")
      .style("font-size", "14px")
      .text("Cumulative Performance");

    g.append("text")
      .attr("class", "axis-label y-axis-label-right")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", width + 80)
      .attr("text-anchor", "middle")
      .style("fill", "#B87432")
      .style("font-family", "BMDOHYEON_TTF")
      .style("font-size", "14px")
      .text("Tariff Story Count");

    const tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("position", "absolute").style("background", "#fff")
      .style("padding", "6px 10px").style("border", "1px solid #ccc")
      .style("border-radius", "4px").style("pointer-events", "none").style("opacity", 0);

    const linePortfolio = d3.line().x(d => x(d.date)).y(d => yLeft(d.cumulative_portfolio));
    const lineBenchmark = d3.line().x(d => x(d.date)).y(d => yLeft(d.cumulative_benchmark));

    const portfolioPath = zoomLayer.append("path").datum(data)
      .attr("class", "line portfolio").attr("d", linePortfolio)
      .attr("stroke", "steelblue").attr("stroke-width", 2).attr("fill", "none");

    const benchmarkPath = zoomLayer.append("path").datum(data)
      .attr("class", "line benchmark").attr("d", lineBenchmark)
      .attr("stroke", "orange").attr("stroke-width", 2).attr("fill", "none");

    zoomLayer.selectAll(".benchmark-circle").data(data).enter()
      .append("circle")
      .attr("class", "benchmark-circle")
      .attr("cx", d => x(d.date))
      .attr("cy", d => yLeft(d.cumulative_benchmark))
      .attr("r", 4)
      .attr("fill", "orange")
      .attr("opacity", 0.7)
      .on("mouseover", (event, d) => {
        tooltip.transition().duration(200).style("opacity", 1);
        tooltip.html(`
          <strong>${d.date.toDateString()}</strong><br>
          Benchmark: ${d.cumulative_benchmark}<br>
          Portfolio: ${d.cumulative_portfolio}<br>
          Tariff stories: ${d.tariff_story_count}
        `)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 28) + "px");

        d3.select(event.currentTarget).attr("r", 6);
      })
      .on("mouseout", (event) => {
        tooltip.transition().duration(200).style("opacity", 0);
        d3.select(event.currentTarget).attr("r", 4);
      });

    zoomLayer.selectAll(".portfolio-circle").data(data).enter()
      .append("circle")
      .attr("class", "portfolio-circle")
      .attr("cx", d => x(d.date))
      .attr("cy", d => yLeft(d.cumulative_portfolio))
      .attr("r", 4)
      .attr("fill", "steelblue")
      .attr("opacity", 0.7)
      .on("mouseover", (event, d) => {
        tooltip.transition().duration(200).style("opacity", 1);
        tooltip.html(`
          <strong>${d.date.toDateString()}</strong><br>
          Portfolio: ${d.cumulative_portfolio}<br>
          Benchmark: ${d.cumulative_benchmark}<br>
          Tariff stories: ${d.tariff_story_count}
        `)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 28) + "px");

        d3.select(event.currentTarget).attr("r", 6);
      })
      .on("mouseout", (event) => {
        tooltip.transition().duration(200).style("opacity", 0);
        d3.select(event.currentTarget).attr("r", 4);
      });

    const barWidth = width / data.length * 3;
    let bars = zoomLayer.selectAll(".bars").data(data).enter()
      .append("rect")
      .attr("class", "bars")
      .attr("x", d => x(d.date) - barWidth / 2)
      .attr("y", d => yRight(d.tariff_story_count))
      .attr("width", barWidth)
      .attr("height", d => height - yRight(d.tariff_story_count))
      .attr("fill", "lightgreen").attr("opacity", 0.6)
      .on("mouseover", (event, d) => {
        tooltip.transition().duration(200).style("opacity", 1);
        tooltip.html(`
          <strong>${d.date.toDateString()}</strong><br>
          Tariff stories: ${d.tariff_story_count}
        `)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 28) + "px");

        d3.select(event.currentTarget).attr("fill", "green").attr("opacity", 1);
      })
      .on("mouseout", (event) => {
        tooltip.transition().duration(200).style("opacity", 0);
        d3.select(event.currentTarget).attr("fill", "lightgreen").attr("opacity", 0.6);
      });

    const zoom = d3.zoom()
      .scaleExtent([1, 20])
      .translateExtent([[0, 0], [width, height]])
      .extent([[0, 0], [width, height]])
      .on("zoom", (event) => {
        x = event.transform.rescaleX(xOriginal);
        xAxis.call(d3.axisBottom(x));

        portfolioPath.attr("d", d3.line()
          .x(d => x(d.date))
          .y(d => yLeft(d.cumulative_portfolio))
        );

        benchmarkPath.attr("d", d3.line()
          .x(d => x(d.date))
          .y(d => yLeft(d.cumulative_benchmark))
        );

        zoomLayer.selectAll(".benchmark-circle")
          .attr("cx", d => x(d.date))
          .attr("cy", d => yLeft(d.cumulative_benchmark));

        zoomLayer.selectAll(".portfolio-circle")
          .attr("cx", d => x(d.date))
          .attr("cy", d => yLeft(d.cumulative_portfolio));

        bars.attr("x", d => x(d.date) - barWidth / 2);
      });

    portfolioSVG.call(zoom);
    d3.select("#zoom-in").on("click", () => portfolioSVG.transition().call(zoom.scaleBy, 1.3));
    d3.select("#zoom-out").on("click", () => portfolioSVG.transition().call(zoom.scaleBy, 0.75));

    const legend = portfolioSVG.append("g").attr("class", "legend")
      .attr("transform", `translate(80, ${margin.top})`);

    const legendData = [
      { label: "Returns", color: "steelblue" },
      { label: "Benchmark", color: "orange" },
      { label: "Tariff Stories", color: "lightgreen" }
    ];

    legendData.forEach((d, i) => {
      legend.append("rect").attr("x", 0).attr("y", i * 25).attr("width", 15).attr("height", 15).attr("fill", d.color);
      legend.append("text").attr("x", 20).attr("y", i * 25 + 12).text(d.label);
    });

  }

});  