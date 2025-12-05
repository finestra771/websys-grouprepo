<?php
session_start();
$favTickers = []; // for JS
?>

<?php if (isset($_GET['msg'])): ?>
    <div id="popup" class="popup">
        <?php 
            switch ($_GET['msg']) {
                case "password_changed": echo "Password changed successfully! Please log in again."; break;
                case "confirm_mismatch": echo "New passwords do not match."; break;
                case "wrong_current": echo "Your current password is incorrect."; break;
                case "same_password": echo "New password cannot be the same as the old password."; break;
                default: echo htmlspecialchars($_GET['msg']);
            }
        ?>
    </div>
    <script src="resources/jquery-3.7.1.min.js"></script>
    <script src="https://d3js.org/d3.v7.min.js"></script>
    <script src="resources/scroll.js"></script>
    <script>
        const p = document.getElementById("popup");
        p.style.position = "fixed";
        p.style.bottom = "20px";
        p.style.right = "20px";
        p.style.background = "#222";
        p.style.color = "#fff";
        p.style.padding = "12px 18px";
        p.style.borderRadius = "6px";
        p.style.boxShadow = "0 4px 10px rgba(0,0,0,0.3)";
        p.style.zIndex = "9999";
        setTimeout(() => p.remove(), 4000);
    </script>
<?php endif; ?>

<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="resources/stonkly.css">
    <link rel="stylesheet" href="resources/styles.css">
    <link rel="icon" href="resources/images/bubble-tea.png" type="image/png">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
    <title>Stonkly 💸</title>
    <style>

        #stonkly-info {
            padding: 2em 0;
        }

        #block {
            font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif;
            width: 90%;
            margin: 10em auto 7em auto;
            display: flex;
            flex-direction: column;
        }

        #infoBlock {
            width: 100%;
            text-align: center;
        }

        #featureList {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            width: 70%;
            margin-top: 3em;
            text-align: center;
            background-color: white;
            padding: 1em;
            gap: 2%;
            margin-left: auto;
            margin-right: auto;
        }

        #descFav {
            font-size: 0.9em;
            color: #555;
            margin-top: -10px;
        }

        #favTick {
            width: 45%;
            max-height: 300px;  
            display: flex;
            flex-direction: column;
            box-sizing: border-box;
            padding: 5px;
            margin-left: 10px;
        }

        .tickers-grid {
            display: flex;            
            flex-wrap: wrap;          
            gap: 10px;               
            max-height: 300px;
            overflow-y: auto;
            justify-content: flex-start; 
        }

        .tickers-grid p {
            flex: 1 1 calc(25% - 10px);
            min-width: 80px;             
            padding: 8px 5px;
            margin: 0;
            background-color: #f3f3f3;
            border-radius: 4px;
            text-align: center;
            word-wrap: break-word;
        }

        #favTickGraph {
            width: 50%;
            height: 300px;
        }

        .tooltip {
            position: absolute;
            background-color: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 6px 10px;
            border-radius: 4px;
            pointer-events: none;
            font-size: 0.9em;
            opacity: 0;
            transition: opacity 0.2s;
        }

        h1 {
            margin-top: -30px;
            margin-bottom: -10px;
        }

        h3 {
            margin-top: -10px;
        }

        #clearFavoritesBtn {
            margin-top: 10px;
            padding: 8px 12px;
            background: #c49464ff;
            color: #fff;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
            width: 10%;
            margin-left: auto;
            margin-right: auto;
        }

        #clearFavoritesBtn:hover {
            background: #af7841ff;
        }

    </style>
</head>

<body>

    <!-- Navigation Bar -->
    <nav>
        <h1 class="title">
            <a href="#" id="link0">STONKLY💸</a>
        </h1>
        <ul>
            <li><a href="./index.php" class="nav-button">HOME</a></li>
            <li><a href="./meet-team.php" class="nav-button">CONTACTS</a></li>
            <li><a href="./myinfo.php" class="nav-button">MY INFO</a></li>
            <li><a href="./predictions.php" class="nav-button">ANALYZER</a></li>
            <li><a href="./auth.php?action=logout" class="nav-button">LOGOUT</a></li>
        </ul>
    </nav>

    <section id="stonkly-info">
        <div id="block">
                <?php
                if (isset($_SESSION['username'])) {
                    echo "<h1>Welcome back " . htmlspecialchars($_SESSION['username']) . "!!</h1>";
                } else {
                    echo "<h1>Guest</h1>";
                }
                ?>

            <div id="featureList">
                <!-- Left: Favorite tickers list -->
                <div id="favTick">
                    <h3>Your favorite tickers</h3>
                    <p id = "descFav"> See the daily returns of your favorite tickers. </p>
                    <div class="tickers-grid">
                        <?php
                        if (isset($_SESSION['username'])) {
                            require "conn.php";
                            $username = $_SESSION['username'];
                            $stmt = $conn->prepare("SELECT ticker_id FROM favorites WHERE username = ?");
                            $stmt->bind_param("s", $username);
                            $stmt->execute();
                            $result = $stmt->get_result();

                            while ($row = $result->fetch_assoc()) {
                                $ticker_id = $row['ticker_id'];
                                $tickerStmt = $conn->prepare("SELECT company_name FROM tickers WHERE id = ?");
                                $tickerStmt->bind_param("i", $ticker_id);
                                $tickerStmt->execute();
                                $tickerResult = $tickerStmt->get_result();
                                if ($tickerRow = $tickerResult->fetch_assoc()) {
                                    $favTickers[] = htmlspecialchars($tickerRow['company_name']);
                                        echo "<p>" . htmlspecialchars($tickerRow['company_name']) . "</p>";
                                }
                                $tickerStmt->close();
                            }
                            $stmt->close();
                            $conn->close();
                        }
                        ?>
                    </div>
                </div>
                
                <!-- Right: Favorite tickers graph -->
                <div id="favTickGraph"></div>
            </div>
            <button id="clearFavoritesBtn">Clear Favorites</button>
            <div id="analyzer" class="section">
                <h2 class="subtle" style="margin-bottom:12px">
                    Open the analyzer to search tickers, view charts, and see key context.
                </h2>
                <a class="btn" href="stock.html">Open Company Analyzer →</a>
            </div>
        </div>
    </section>
        
    <section id="personal-info">
        <h2 style="text-align:center; margin-bottom:30px; color:#B87432;">Reset / Change Password</h2>

        <div style="
            max-width:450px; 
            margin:0 auto; 
            background:#F3DFCB; 
            padding:30px; 
            border-radius:20px; 
            box-shadow:0 4px 12px rgba(0,0,0,0.15);
        ">
            <form action="update_password.php" method="POST" style="display:flex; flex-direction:column; gap:15px;">
                
                <div style="display:flex; flex-direction:column;">
                    <label for="current_password" style="font-weight:600; color:#B87432;">Current Password</label>
                    <input type="password" name="current_password" id="current_password" required
                        placeholder="Enter current password" style="
                            padding:12px; 
                            border-radius:12px; 
                            border:1px solid #ccc; 
                            font-size:1em;
                        ">
                </div>

                <div style="display:flex; flex-direction:column;">
                    <label for="new_password" style="font-weight:600; color:#B87432;">New Password</label>
                    <input type="password" name="new_password" id="new_password" required
                        placeholder="Enter new password" style="
                            padding:12px; 
                            border-radius:12px; 
                            border:1px solid #ccc; 
                            font-size:1em;
                        ">
                </div>

                <div style="display:flex; flex-direction:column;">
                    <label for="confirm_password" style="font-weight:600; color:#B87432;">Confirm New Password</label>
                    <input type="password" name="confirm_password" id="confirm_password" required
                        placeholder="Re-enter new password" style="
                            padding:12px; 
                            border-radius:12px; 
                            border:1px solid #ccc; 
                            font-size:1em;
                        ">
                </div>

                <button type="submit" style="
                    padding:12px; 
                    background:#B87432; 
                    color:white; 
                    font-weight:700; 
                    border:none; 
                    border-radius:25px; 
                    cursor:pointer; 
                    transition:0.3s;
                " onmouseover="this.style.background='#A36220'" onmouseout="this.style.background='#B87432'">
                    Change Password
                </button>
            </form>
        </div>
    </section>
    
    <footer id="contacts">
        <p>&copy; 2025 Gatcha!. All rights reserved.</p>
    </footer>

    <!-- Scripts -->
    <script>
    document.getElementById("clearFavoritesBtn").addEventListener("click", () => {
        if (!confirm("Are you sure you want to remove all your favorite tickers?")) return;

        fetch("clear_favorites.php", {
            method: "POST"
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                alert("Favorites cleared!");
                location.reload(); // reload page to update UI
            } else {
                alert("Error clearing favorites.");
            }
        })
        .catch(err => {
            console.error(err);
            alert("Error clearing favorites.");
        });
    });
    </script>

    <script>
        const favoriteTickers = <?php echo json_encode($favTickers); ?>;

        async function fetchReturnsParallel(tickers) {
            const urls = tickers.map(t => `http://127.0.0.1:3030/etf/data/${t}`);

            const promises = urls.map((url, i) =>
                fetch(url)
                    .then(res => res.json())
                    .then(data => {
                        const ret = data.daily_return ?? 0;
                        return {
                            name: tickers[i],
                            return: ret,
                            value: Math.max(Math.abs(ret), 1)
                        };
                    })
                    .catch(err => {
                        console.error(`Error for ${tickers[i]}:`, err);
                        return {
                            name: tickers[i],
                            return: 0,
                            value: 1
                        };
                    })
            );

            return Promise.all(promises);
        }

        function renderTreemap(dataChildren) {
            const data = { name: "favorites", children: dataChildren };

            const width = document.getElementById('favTickGraph').clientWidth;
            const height = document.getElementById('favTickGraph').clientHeight;

            const svg = d3.select("#favTickGraph")
                .append("svg")
                .attr("width", width)
                .attr("height", height);

            const tooltip = d3.select("body")
                .append("div")
                .attr("class", "tooltip");

            const root = d3.hierarchy(data).sum(d => d.value);

            d3.treemap()
                .size([width, height])
                .padding(2)(root);

            const maxAbs = Math.max(...data.children.map(d => Math.abs(d.return)));

            const colorScale = d3.scaleLinear()
                .domain([-maxAbs, 0, maxAbs])
                .range(["#ff0000", "#f0f0f0", "#00ff00"]);

            const nodes = svg.selectAll("g")
                .data(root.leaves())
                .enter()
                .append("g")
                .attr("transform", d => `translate(${d.x0},${d.y0})`);

            nodes.append("rect")
                .attr("width", d => d.x1 - d.x0)
                .attr("height", d => d.y1 - d.y0)
                .attr("fill", d => colorScale(d.data.return))
                .attr("stroke", "#fff")
                .on("mouseover", (event, d) => {
                    tooltip.style("opacity", 1)
                        .html(`<strong>${d.data.name}</strong><br>${d.data.return.toFixed(2)}%`)
                        .style("left", `${event.pageX + 10}px`)
                        .style("top", `${event.pageY - 28}px`);
                })
                .on("mousemove", event => {
                    tooltip.style("left", `${event.pageX + 10}px`)
                        .style("top", `${event.pageY - 28}px`);
                })
                .on("mouseout", () => tooltip.style("opacity", 0));

            nodes.append("text")
                .attr("x", d => (d.x1 - d.x0) / 2)
                .attr("y", d => (d.y1 - d.y0) / 2)
                .attr("text-anchor", "middle")
                .attr("alignment-baseline", "middle")
                .attr("font-size", d => Math.min(12, (d.x1 - d.x0) / 5))
                .text(d => d.data.name);
        }

        if (favoriteTickers.length === 0) {
            document.getElementById('favTickGraph').innerHTML =
                "<p style='text-align:center; margin-top:100px;'>No chart data to display.</p>";
        } else {
            fetchReturnsParallel(favoriteTickers).then(renderTreemap);
        }
    </script>

</body>
</html>
