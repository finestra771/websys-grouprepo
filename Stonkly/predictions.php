<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="resources/styles.css">
    <script src="https://d3js.org/d3.v7.min.js"></script>
    <script src="resources/scroll.js"></script>
    <style>
        #gallery h1 {
            margin-top: -20px;
            margin-left: 70px;
        }

        #sectorTable {
            border-collapse: collapse;
            width: 60%;
            margin: 30px auto;
            text-align: center;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
            border-radius: 10px;
            background-color: #fff;
            overflow: hidden;
            margin-top: 102px;
        }

        #sectorTable th {
            background-color: #af5519;
            color: white;
            font-weight: bold;
            padding: 12px 15px;
            text-align: center;
            position: sticky;
            top: 0;
        }

        #sectorTable td {
            border-bottom: 1px solid #e0e0e0;
            padding: 12px 15px;
        }

        #sectorTable tbody tr:nth-child(even) {
            background-color: #f9f9f9;
        }

        #sectorTable tbody tr:hover {
            background-color: #fff1e1;
            transition: background-color 0.3s ease;
        }

        #sectorTable caption {
            caption-side: top;
            font-size: 1.5em;
            font-weight: bold;
            margin-bottom: 15px;
            color: #2c3e50;
        }

        #sectorDescription {
            max-width: 95%;
            margin: 20px auto;
            padding: 15px 20px;
            text-align: center;
            font-size: 1.1rem;
            line-height: 1.6;
            color: #333;
            background-color: #fff7f0;
            border-radius: 10px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
            transition: all 0.3s ease;
        }

        #sectorDescription:hover {
            background-color: #fff1e1;
            transform: translateY(-10px);
        }

        #sectorDescription ul {
            text-align: left;
            margin-top: 10px;
        }

        #etfSectorGrouping {
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 50px;
            width: 95%;
            margin-left: auto;
            margin-right: auto;
            gap: 40px;
        }

        #sectorPieChart {
            margin-top: -30px;
            height: auto;
            font-size: small;
            text-align: center;
            margin-left: -25px;
        }

        #container {
            width: 48%;
            padding: auto;
        }

        #container h3 {
            text-align: center;
            font-size: 1.5rem;
            margin-bottom: -30px;
            margin-top: -20px;
            color: #333;
        }

        #gallery h1 {
            margin-bottom: -30px;
        }

        #searchETF {
            padding: 30px;
        }

        #searchETF h2 {
            text-align: center;
            margin-bottom: 30px;
            color: #6b3e26;
        }

        .search-container {
            display: flex;
            gap: 20px;
            justify-content: center;
            flex-wrap: wrap;
            margin-bottom: 30px;
        }

        .sector-card {
            flex: 1 1 300px;
            background-color: #F3DFCB;
            padding: 20px;
            border-radius: 20px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .sector-card h3 {
            margin-top: 0;
            color: #a0522d;
            margin-bottom: 9px;
        }

        .sector-card select {
            width: 100%;
            padding: 10px;
            margin: 10px 0 20px 0;
            border-radius: 10px;
            border: 1px solid #d2a679;
            background-color: #fff4f0;
        }

        #etfListContainer {
            height: 234px;
            overflow-y: auto;
            padding: 5px;
            background-color: #fff4f0;
            border-radius: 10px;
        }

        #etfList li {
            padding: 8px 12px;
            margin-bottom: 6px;
            background-color: #e0b790;
            border-radius: 20px;
            cursor: pointer;
            transition: all 0.2s ease;
            list-style: none;
            margin-left: -42px;
            color: white;
        }

        #etfList li:hover {
            background-color: #937c68;
            transform: translateX(5px);
        }

        .search-card {
            flex: 1 1 300px;
            background-color: #F3DFCB;
            padding: 20px;
            border-radius: 20px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .search-card:hover {
            background-color: rgb(227, 196, 176);
            transform: translateY(-10px);
        }

        .sector-card:hover {
            background-color: rgb(227, 196, 176);
            transform: translateY(-10px);
        }

        #analysis-card {
            margin-left: 50px;
            margin-right: 50px;
            margin-top: 20px;
            text-align: center;
            width: 500px;
            flex-direction: column;
        }

        .search-card h3 {
            margin-top: 0;
            color: #a0522d;
        }

        .etf-search {
            display: flex;
            gap: 10px;
            margin-bottom: 20px;
        }

        .etf-search input {
            flex: 1;
            padding: 10px;
            border-radius: 10px;
            border: 1px solid #d2a679;
            background-color: #fff4f0;
        }

        .etf-search button {
            padding: 10px 20px;
            border-radius: 10px;
            border: none;
            background-color: #a0522d;
            color: white;
            cursor: pointer;
            transition: background-color 0.2s ease;
        }

        .etf-search button:hover {
            background-color: #8b3a1a;
        }

        #etfResult {
            text-align: center;
            background-color: #fff4f0;
            padding: 15px;
            border-radius: 10px;
            min-height: 214px;
            box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.05);
        }

        .etf-graph-analysis {
            background-color: #F3DFCB;
            padding: 20px;
            border-radius: 20px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .etf-graph-analysis-innerbox {
            display: flex;
            padding: 10px;
            border-radius: 10px;
            border: 1px solid #d2a679;
            background-color: #fff4f0;
        }

        /* Floating Chat Button */
        /* Chat Messages Container */
        /* Chat Widget Window */
        #chat-widget {
            position: fixed;
            bottom: 25px;
            right: 25px;
            width: 350px;
            height: 450px;
            /* fixed height */
            max-height: 90vh;
            background: #F5EBDD;
            border-radius: 15px;
            display: none;
            flex-direction: column;
            overflow: hidden;
            /* prevent overflowing outside widget */
            z-index: 1000;
        }

        /* Header always visible */
        #chat-header {
            background: #A9746E;
            color: #fff8f0;
            padding: 12px 15px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-weight: bold;
            font-size: 16px;
            border-top-left-radius: 15px;
            border-top-right-radius: 15px;
            flex-shrink: 0;
            /* prevent shrinking */
        }

        /* Chat body takes remaining space */
        #chat-body {
            display: flex;
            flex-direction: column;
            height: calc(100% - 60px);
            /* subtract header & input approx height */
        }

        /* Messages scrollable, moves up with new messages */
        #chat-messages {
            flex: 1;
            /* fills available space */
            overflow-y: auto;
            /* scrolls when overflowing */
            display: flex;
            flex-direction: column;
            gap: 6px;
            padding: 5px 10px;
        }

        /* Input always visible at bottom */
        #chat-input {
            padding: 10px;
            border-radius: 12px;
            border: 1px solid #CBB69A;
            outline: none;
            font-size: 14px;
            background: #FFF7ED;
            margin-top: 5px;
            flex-shrink: 0;
            /* prevents shrinking */
        }

        /* Optional: highlight input on focus */
        #chat-input:focus {
            border-color: #A9746E;
        }

        /* User message bubble (right) */
        #chat-messages .user-msg {
            align-self: flex-end;
            /* right side */
            background: #D9B99B;
            /* light brown */
            color: #3e2f24;
            padding: 10px 14px;
            border-radius: 18px 18px 0 18px;
            /* rounded corners with “tail” effect */
            max-width: 75%;
            word-wrap: break-word;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
            position: relative;
        }

        /* Optional: add small “tail” using ::after */
        #chat-messages .user-msg::after {
            content: '';
            position: absolute;
            bottom: 0;
            right: -6px;
            /* outside bubble */
            width: 0;
            height: 0;
            border-top: 10px solid #D9B99B;
            border-left: 6px solid transparent;
            border-right: 0 solid transparent;
        }

        /* Bot message bubble (left) */
        #chat-messages .bot-msg {
            align-self: flex-start;
            /* left side */
            background: #EEDFCC;
            /* lighter tan */
            color: #3e2f24;
            padding: 10px 14px;
            border-radius: 18px 18px 18px 0;
            /* rounded corners with “tail” effect */
            max-width: 75%;
            word-wrap: break-word;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
            position: relative;
        }

        #chat-messages .bot-msg::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: -6px;
            /* outside bubble */
            width: 0;
            height: 0;
            border-top: 10px solid #EEDFCC;
            border-left: 0 solid transparent;
            border-right: 6px solid transparent;
        }

        /* User bubble */
        .user-msg {
            align-self: flex-end;
            background: #D9B99B;
            color: #3e2f24;
            padding: 10px 14px;
            border-radius: 18px 18px 0 18px;
            max-width: 75%;
            word-wrap: break-word;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
            position: relative;
            margin-bottom: 6px;
        }

        /* Bot bubble */
        .bot-msg {
            align-self: flex-start;
            background: #EEDFCC;
            color: #3e2f24;
            padding: 10px 14px;
            border-radius: 18px 18px 18px 0;
            max-width: 75%;
            word-wrap: break-word;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
            position: relative;
            margin-bottom: 6px;
        }

        /* Optional: “typing dots” animation */
        .bot-msg.typing::after {
            content: '...';
            display: inline-block;
            width: 18px;
            animation: blink 1s infinite;
        }

        @keyframes blink {

            0%,
            50%,
            100% {
                opacity: 0;
            }

            25%,
            75% {
                opacity: 1;
            }
        }

        #chat-toggle {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #975929;
            color: white;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            font-size: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
            z-index: 1000;
        }

        #chat-toggle:hover {
            background: #683a17;
        }
    </style>
    <link rel="icon" href="resources/images/bubble-tea.png" type="image/png">
    <title>Stonkly 💸</title>
</head>

<body>
    <script src="py_backend/queryFinance.js"></script>

    <!-- Navigation Bar -->
    <nav>
        <h1 class="title">
            <a href="#" id="link0"> STONKLY💸</a>
        </h1>
        <ul>
            <li><a href="./index.php" class="nav-button">HOME</a></li>
            <li><a href="./meet-team.php" class="nav-button">CONTACTS</a></li>
            <li><a href="./myinfo.php" class="nav-button">MY INFO</a></li>
            <li><a href="./predictions.php" class="nav-button">ANALYZER</a></li>
            <li><a href="./auth.php?action=logout" class="nav-button">LOGOUT</a></li>
        </ul>
    </nav>

    <header id="home">
        <h1 style="font-size: 3rem;">ETF Sector Statistics</h1>
        <div class="vertical-line"></div>
        <h3>Gain insights into the investment landscape and learn more about ETF sector performance.</h3>
    </header>
    <section id="gallery">
        <h1>ETF Sector Statistics</h1>

        <div id="etfSectorGrouping">
            <table id="sectorTable">
                <thead>
                    <tr>
                        <th>AUM Rank</th>
                        <th>Sector</th>
                        <th>Assets Under Management (MM)</th>
                        <th>Number of ETFs</th>
                    </tr>
                </thead>
                <tbody></tbody>
            </table>
            <div id="container">
                <div id="sectorDescription">
                    <h2>What is an ETF Sector? 🤔</h2>
                    <ul>
                        <li>ETF Sectors are a collection of exchange-traded funds (ETFs) that are focused on a specific
                            industry or market</li>
                        <li>They allow investors to target investments based on market outlook and give insights into
                            Tariff effects on an industry.</li>
                    </ul>
                </div>
                <h3>Sector Distribution 📊</h3>
                <div id="sectorPieChart"></div>
            </div>
        </div>
    </section>

    <section id="searchETF">
        <h2>ETF Explorer</h2>
        <div class="search-container">
            <!-- Left side: sector select & ETF list -->
            <div class="sector-card">
                <h3>Browse by Sector</h3>
                <select id="sectorSelect">
                    <option value="">Select Sector...</option>
                </select>

                <div id="etfListContainer">
                    <ul id="etfList"></ul>
                </div>
            </div>

            <!-- Right side: search by name -->
            <div class="search-card">
                <h3>Search for an ETF</h3>
                <div class="etf-search">
                    <input type="text" id="etfSearchInput" placeholder="Enter ETF name or symbol">
                    <button id="etfSearchButton">Search</button>
                </div>
                <div class="etf-analysis">
                    <div id="etfResult"></div>
                </div>
            </div>
        </div>
        <div class="etf-graph-analysis">
            <h3>Current ETF Close Prices [Last 60 Days]</h3>
            <div class="etf-graph-analysis-innerbox">
                <div id="analysis-card">
                    <h4>Analysis:</h4>
                    <div id="anal"></div>
                </div>
                <div id="etfGraphing"></div>
            </div>
        </div>
    </section>
    <section id="gallery">
        <h1 style="font-size: 3rem;">Returns vs Tariffs</h1>
        <h3 style="margin-left: 2em; text-align: center;">Gain insights into the correlation between returns and tariffs.</h3>
    </section>
    <section id="gallery" style="display: flex; justify-content: center;">
        <label for="portfolio-select">Choose ETF:</label>
        <select id="portfolio-select" style="height:2em"></select>

        <svg width="900" height="500">
        </svg>
        <button id="zoom-in" style="height:2em">Zoom In</button>
        <button id="zoom-out" style="height:2em">Zoom Out</button>
    </section>
    <!-- Chat Bot Button -->
    <div id="chat-toggle">💬</div>

    <!-- Chat Widget -->
    <div id="chat-widget">
        <div id="chat-header">
            <span>Chat with us</span>
            <button id="chat-close">✖</button>
        </div>
        <div id="chat-body">
            <div id="chat-messages"></div>
            <input type="text" id="chat-input" placeholder="Type a message..." />
        </div>
    </div>

    <footer id="contacts">
        <p>&copy; 2025 Gatcha!. All rights reserved.</p>
    </footer>

    <!-- Scripts -->
    <script src="resources/jquery-3.7.1.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js"
        integrity="sha384-FKyoEForCGlyvwx9Hj09JcYn3nv7wiPVlz7YYwJrWVcXK/BmnVDxM+D2scQbITxI"
        crossorigin="anonymous"></script>
    <script>
        document.addEventListener('DOMContentLoaded', () => {
            const dropdownItems = document.querySelectorAll('.custom-dropdown-item');
            const dropdownButton = document.getElementById('dropdownMenuButton');

            dropdownItems.forEach(item => {
                item.addEventListener('click', (event) => {
                    event.preventDefault(); // ✅ Prevent jump to top

                    const companyName = item.getAttribute('data-company');
                    dropdownButton.textContent = companyName; // ✅ Update button text
                });
            });
        });
    </script>
    <script src="py_backend/queryPortfolios.js"></script>
</body>

</html>