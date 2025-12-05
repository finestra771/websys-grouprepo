<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="resources/styles.css">
    <script src="https://d3js.org/d3.v7.min.js"></script>
    <style>
        svg {
            font-family: sans-serif;
        }

        .tooltip {
            font-family: sans-serif;
            font-size: 12px;
            pointer-events: none;
            box-shadow: 0px 2px 6px rgba(0, 0, 0, 0.15);
        }

        .line {
            fill: none;
            stroke-width: 2px;
        }

        .portfolio {
            stroke: steelblue;
        }

        .benchmark {
            stroke: darkorange;
        }

        .bars {
            fill: lightgreen;
            opacity: 0.6;
        }
    </style>
    <link rel="icon" href="resources/images/bubble-tea.png" type="image/png">
    <title>Stonkly 💸</title>
</head>

<body>
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
        <h1 style="font-size: 3rem;">Portfolio vs Tariffs</h1>
        <div class="vertical-line"></div>
        <h3>Gain insights into the correlation between portfolios and tariffs.</h3>
    </header>
    <section id="gallery">
        <h1>Portfolio vs Tariffs</h1>
        <label for="portfolio-select">Choose ETF:</label>
        <select id="portfolio-select"></select>

        <svg width="900" height="500">
        </svg>
        <button id="zoom-in">Zoom In</button>
        <button id="zoom-out">Zoom Out</button>
    </section>

    <footer id="contacts">
        <p>&copy; 2025 Gatcha!. All rights reserved.</p>
    </footer>

    <!-- Scripts -->
    <script src="resources/jquery-3.7.1.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js"
        integrity="sha384-FKyoEForCGlyvwx9Hj09JcYn3nv7wiPVlz7YYwJrWVcXK/BmnVDxM+D2scQbITxI"
        crossorigin="anonymous"></script>
    <script src="py_backend/queryPortfolios.js"></script>
</body>

</html>