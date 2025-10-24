import pandas as pd
import world_trade_data as wits
import plotly.graph_objects as go
from plotly.subplots import make_subplots

# =====================================
# CONFIG
# =====================================
REPORTER = 'usa'
YEAR = '2022'
TOP_N = 10  # top N products for pie chart

# =====================================
# STEP 1: Fetch import/export data
# =====================================
imports_df = wits.get_indicator('MPRT-TRD-VL', reporter=REPORTER, year=YEAR)
exports_df = wits.get_indicator('XPRT-TRD-VL', reporter=REPORTER, year=YEAR)

# =====================================
# STEP 2: Pick top N products by trade value
# =====================================
imports_top = imports_df.sort_values('Value', ascending=False).head(TOP_N)
exports_top = exports_df.sort_values('Value', ascending=False).head(TOP_N)

# =====================================
# STEP 3: Extract labels and values from MultiIndex
# =====================================
labels_imports = [idx[3] for idx in imports_top.index]  # ProductCode level in MultiIndex
labels_exports = [idx[3] for idx in exports_top.index]

values_imports = imports_top['Value'].values / 1e3  # convert to million USD
values_exports = exports_top['Value'].values / 1e3

# =====================================
# STEP 4: Create pie charts
# =====================================
fig = make_subplots(rows=1, cols=2, specs=[[{'type':'domain'}, {'type':'domain'}]])

fig.add_trace(go.Pie(labels=labels_imports, values=values_imports, name="Imports"), 1, 1)
fig.add_trace(go.Pie(labels=labels_exports, values=values_exports, name="Exports"), 1, 2)

fig.update_traces(hole=.4,
                  scalegroup='usa',
                  textinfo='label+percent',
                  hovertemplate="%{label}<br>%{value:,.0f}M$<br>%{percent}")

fig.update_layout(
    title_text=f"Top {TOP_N} Trade Commodities/Products, {REPORTER.upper()}, {YEAR}",
    annotations=[
        dict(text=f'Imports<br>{values_imports.sum()/1e6:.3f}T$', x=0.17, y=0.5, font_size=16, showarrow=False),
        dict(text=f'Exports<br>{values_exports.sum()/1e6:.3f}T$', x=0.83, y=0.5, font_size=16, showarrow=False)
    ]
)

# =====================================
# STEP 5: Show plot
# =====================================
fig.show()  # opens in default browser
