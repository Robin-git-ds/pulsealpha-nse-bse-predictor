/*
 * PulseAlpha prototype
 * All prices and model outputs are simulated for demonstration purposes.
 */

const STOCKS = [
  {
    symbol: "RELIANCE", name: "Reliance Industries", sector: "Energy & Materials", monogram: "R",
    price: 1542.6, change: 2.14, open: 1512.4, high: 1550, low: 1506.65, volume: "11.8M", range52: "1,114 — 1,608",
    forecastPct: 2.09, confidence: 73, seed: 3, trend: 1.0, volatility: 1.1,
    signals: [
      ["Trend", "Above 20D + 50D averages", 82, "Constructive"],
      ["Momentum", "RSI-style reading: 61", 72, "Positive"],
      ["Relative volume", "1.34× trailing activity", 76, "Supportive"],
      ["Volatility", "Within normal range", 64, "Contained", "warning"],
    ],
  },
  {
    symbol: "TCS", name: "Tata Consultancy Services", sector: "Information Technology", monogram: "T",
    price: 3568.4, change: 1.38, open: 3532.15, high: 3586.7, low: 3524.5, volume: "2.4M", range52: "3,040 — 4,182",
    forecastPct: 1.52, confidence: 69, seed: 8, trend: 0.86, volatility: 0.78,
    signals: [
      ["Trend", "Above 20D moving average", 76, "Constructive"],
      ["Momentum", "RSI-style reading: 58", 66, "Positive"],
      ["Relative volume", "0.92× trailing activity", 52, "Neutral", "warning"],
      ["Volatility", "Below normal range", 74, "Contained"],
    ],
  },
  {
    symbol: "HDFCBANK", name: "HDFC Bank", sector: "Private Banking", monogram: "H",
    price: 978.65, change: -0.44, open: 985.1, high: 988.4, low: 973.8, volume: "17.6M", range52: "806 — 1,016",
    forecastPct: 0.74, confidence: 63, seed: 13, trend: 0.32, volatility: 0.65,
    signals: [
      ["Trend", "Testing 20D average", 54, "Neutral", "warning"],
      ["Momentum", "RSI-style reading: 48", 49, "Balanced", "warning"],
      ["Relative volume", "1.18× trailing activity", 63, "Supportive"],
      ["Volatility", "Below normal range", 76, "Contained"],
    ],
  },
  {
    symbol: "ICICIBANK", name: "ICICI Bank", sector: "Private Banking", monogram: "I",
    price: 1437.8, change: 0.91, open: 1420.2, high: 1444.2, low: 1417.5, volume: "14.2M", range52: "1,090 — 1,507",
    forecastPct: 1.34, confidence: 71, seed: 17, trend: 0.71, volatility: 0.72,
    signals: [
      ["Trend", "Higher highs across 1M", 79, "Constructive"],
      ["Momentum", "RSI-style reading: 57", 65, "Positive"],
      ["Relative volume", "1.11× trailing activity", 67, "Supportive"],
      ["Volatility", "Within normal range", 68, "Contained"],
    ],
  },
  {
    symbol: "INFY", name: "Infosys", sector: "Information Technology", monogram: "I",
    price: 1519.75, change: 1.12, open: 1497.1, high: 1525.9, low: 1494.4, volume: "8.6M", range52: "1,354 — 2,006",
    forecastPct: 1.76, confidence: 70, seed: 21, trend: 0.92, volatility: 1.02,
    signals: [
      ["Trend", "Breaking above 20D average", 75, "Constructive"],
      ["Momentum", "RSI-style reading: 60", 71, "Positive"],
      ["Relative volume", "1.28× trailing activity", 75, "Supportive"],
      ["Volatility", "Within normal range", 61, "Contained", "warning"],
    ],
  },
  {
    symbol: "SBIN", name: "State Bank of India", sector: "Public Banking", monogram: "S",
    price: 861.55, change: -1.02, open: 874.1, high: 876.6, low: 858.4, volume: "20.5M", range52: "706 — 912",
    forecastPct: -0.92, confidence: 66, seed: 27, trend: -0.52, volatility: 1.15,
    signals: [
      ["Trend", "Below short-term average", 39, "Weak", "warning"],
      ["Momentum", "RSI-style reading: 43", 43, "Soft", "warning"],
      ["Relative volume", "1.41× trailing activity", 78, "Elevated"],
      ["Volatility", "Within normal range", 60, "Contained", "warning"],
    ],
  },
];

const state = {
  symbol: "RELIANCE",
  exchange: "NSE",
  range: "1M",
  horizon: "5D",
  favorite: true,
  modelShift: 0,
};

const ranges = { "1D": 12, "5D": 20, "1M": 45, "3M": 75, "1Y": 100 };
const horizonMap = {
  "1D": { sessions: 1, factor: 0.37, label: "next session", rows: 1 },
  "5D": { sessions: 5, factor: 1, label: "next 5 sessions", rows: 5 },
  "1M": { sessions: 20, factor: 2.1, label: "next 20 sessions", rows: 5 },
};

const element = (id) => document.getElementById(id);
const currency = new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const wholeCurrency = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

function currentStock() {
  return STOCKS.find((stock) => stock.symbol === state.symbol) || STOCKS[0];
}

function exchangeMultiplier() {
  return state.exchange === "BSE" ? 1.0017 : 1;
}

function adjustedPrice(value) {
  return value * exchangeMultiplier();
}

function rupees(value, decimals = true) {
  return `₹${decimals ? currency.format(value) : wholeCurrency.format(value)}`;
}

function percent(value) {
  return `${value >= 0 ? "+" : "−"}${Math.abs(value).toFixed(2)}%`;
}

function seededNoise(seed, index) {
  const x = Math.sin(seed * 87.11 + index * 13.37) * 43758.5453;
  return (x - Math.floor(x)) - 0.5;
}

function makeHistory(stock) {
  const points = [];
  const start = stock.price * (1 - stock.trend * 0.08 + (stock.change < 0 ? 0.012 : -0.01));
  let value = start;
  for (let index = 0; index < 105; index += 1) {
    const momentum = stock.trend * stock.price * 0.00065;
    const wave = Math.sin((index + stock.seed) / 4.4) * stock.price * 0.0042 * stock.volatility;
    const disturbance = seededNoise(stock.seed, index) * stock.price * 0.011 * stock.volatility;
    value += momentum + wave + disturbance;
    points.push(value);
  }
  const correction = stock.price - points[points.length - 1];
  return points.map((point, index) => point + correction * ((index + 1) / points.length));
}

STOCKS.forEach((stock) => {
  stock.history = makeHistory(stock);
});

function makeForecast(stock) {
  const spec = horizonMap[state.horizon];
  const current = adjustedPrice(stock.price);
  const totalChange = (stock.forecastPct + state.modelShift) * spec.factor;
  const end = current * (1 + totalChange / 100);
  const values = [];
  for (let index = 1; index <= spec.sessions; index += 1) {
    const progress = index / spec.sessions;
    const curve = Math.sin(progress * Math.PI) * (stock.volatility * 0.32);
    const undulation = seededNoise(stock.seed + 5, index) * stock.volatility * 0.22;
    values.push(current * (1 + ((totalChange * progress + curve + undulation) / 100)));
  }
  values[values.length - 1] = end;
  return { values, totalChange, end };
}

function getForecastRows(stock) {
  const spec = horizonMap[state.horizon];
  const projection = makeForecast(stock);
  const rowCount = spec.rows;
  const steps = state.horizon === "1M" ? [4, 8, 12, 16, 20] : Array.from({ length: rowCount }, (_, index) => index + 1);
  return steps.map((step, index) => {
    const sourceIndex = Math.min(projection.values.length - 1, step - 1);
    const price = projection.values[sourceIndex];
    const width = stock.volatility * 0.52 * Math.sqrt(Math.max(1, step));
    const sign = price - adjustedPrice(stock.price);
    return {
      session: state.horizon === "1M" ? `Week ${index + 1}` : (index === 0 ? "Next session" : `Session +${index + 1}`),
      price,
      low: price * (1 - width / 100),
      high: price * (1 + width / 100),
      bias: sign > 0.08 ? "Bullish" : sign < -0.08 ? "Bearish" : "Neutral",
    };
  });
}

function updateHeader(stock) {
  const multiplier = exchangeMultiplier();
  const price = stock.price * multiplier;
  const change = stock.change;
  element("stockName").textContent = stock.name;
  element("stockSymbol").textContent = stock.symbol;
  element("stockSector").textContent = stock.sector;
  element("stockMonogram").textContent = stock.monogram;
  element("stockPrice").textContent = currency.format(price);
  element("stockChange").textContent = percent(change);
  element("stockChangeAmount").textContent = `${change >= 0 ? "+" : "−"}${rupees(Math.abs(price * change / (100 - change)))} today`;
  const changeBlock = element("changeBlock");
  changeBlock.classList.toggle("positive", change >= 0);
  changeBlock.classList.toggle("negative", change < 0);
  element("statOpen").textContent = rupees(stock.open * multiplier);
  element("statHigh").textContent = rupees(stock.high * multiplier);
  element("statLow").textContent = rupees(stock.low * multiplier);
  element("statVolume").textContent = stock.volume;
  element("statRange").textContent = stock.range52;
  element("priceChart").setAttribute("aria-label", `${stock.name} simulated price chart and forecast`);
  element("favoriteStock").setAttribute("aria-label", `${state.favorite ? "Remove" : "Add"} ${stock.name} ${state.favorite ? "from" : "to"} watchlist`);
  element("favoriteStock").setAttribute("aria-pressed", String(state.favorite));
}

function updateForecast(stock) {
  const spec = horizonMap[state.horizon];
  const forecast = makeForecast(stock);
  const target = forecast.end;
  const variation = stock.volatility * (state.horizon === "1D" ? 0.52 : state.horizon === "5D" ? 1.45 : 3.6);
  const low = target * (1 - variation / 100);
  const high = target * (1 + variation / 100);
  const confidence = Math.max(51, Math.min(87, Math.round(stock.confidence - (state.horizon === "1M" ? 5 : 0) + state.modelShift * 2)));
  const direction = forecast.totalChange >= 0 ? "BULLISH BIAS" : "BEARISH BIAS";
  const confidenceText = confidence >= 70
    ? "Good agreement across price, momentum and volume signals."
    : confidence >= 62
      ? "Mixed inputs; consider this a lower-conviction research signal."
      : "Signal agreement is limited; uncertainty is elevated.";
  const dirEl = element("forecastDirection");
  dirEl.classList.toggle("bearish", forecast.totalChange < 0);
  dirEl.querySelector(".forecast-arrow").textContent = forecast.totalChange >= 0 ? "↗" : "↘";
  element("forecastLabel").textContent = direction;
  element("targetPrice").textContent = rupees(target);
  element("targetDelta").textContent = `${percent(forecast.totalChange)} expected in the ${spec.label}`;
  element("confidenceScore").innerHTML = `${confidence}<small>/100</small>`;
  element("confidenceBar").style.width = `${confidence}%`;
  element("confidenceText").textContent = confidenceText;
  element("rangeWindow").textContent = spec.label.replace("next", "Next");
  element("lowTarget").textContent = rupees(low, false);
  element("midTarget").textContent = rupees(target, false);
  element("highTarget").textContent = rupees(high, false);
}

function pathFromPoints(points) {
  return points.map((point, index) => `${index === 0 ? "M" : "L"}${point.x.toFixed(2)} ${point.y.toFixed(2)}`).join(" ");
}

function renderChart(stock) {
  const chart = element("priceChart");
  const samples = stock.history.slice(-ranges[state.range]).map((value) => adjustedPrice(value));
  const projection = makeForecast(stock);
  const forecastPoints = projection.values;
  const futureDisplayCount = 5;
  const sampledForecast = Array.from({ length: futureDisplayCount }, (_, index) => {
    const source = Math.round(((index + 1) / futureDisplayCount) * (forecastPoints.length - 1));
    return forecastPoints[source];
  });
  const combined = samples.concat(sampledForecast);
  const min = Math.min(...combined) * 0.992;
  const max = Math.max(...combined) * 1.008;
  const left = 9;
  const right = 12;
  const top = 18;
  const bottom = 32;
  const width = 820 - left - right;
  const height = 300 - top - bottom;
  const span = max - min || 1;
  const toY = (value) => top + ((max - value) / span) * height;
  const toX = (index) => left + (index / (samples.length + futureDisplayCount - 1)) * width;
  const observed = samples.map((value, index) => ({ x: toX(index), y: toY(value), value }));
  const future = sampledForecast.map((value, index) => ({ x: toX(samples.length - 1 + index + 1), y: toY(value), value }));
  const forecastWithStart = [observed[observed.length - 1], ...future];
  const upper = forecastWithStart.map((point, index) => ({ x: point.x, y: toY(point.value * (1 + (0.006 + index * 0.0025) * stock.volatility)) }));
  const lower = forecastWithStart.map((point, index) => ({ x: point.x, y: toY(point.value * (1 - (0.006 + index * 0.0025) * stock.volatility)) }));
  const areaPath = `${pathFromPoints(upper)} ${lower.slice().reverse().map((point) => `L${point.x.toFixed(2)} ${point.y.toFixed(2)}`).join(" ")} Z`;
  const yLines = Array.from({ length: 4 }, (_, index) => {
    const value = max - (span * index) / 3;
    const y = toY(value);
    return `<g><line x1="${left}" x2="${820 - right}" y1="${y}" y2="${y}" stroke="rgba(164,185,230,.12)" stroke-dasharray="3 6"/><text x="${820 - right}" y="${y - 6}" text-anchor="end" fill="#7182a0" font-size="9" font-family="Inter, sans-serif">${wholeCurrency.format(value)}</text></g>`;
  }).join("");
  const xLabels = state.range === "1D"
    ? ["10:00", "11:30", "13:00", "14:30"]
    : state.range === "5D"
      ? ["Mon", "Tue", "Wed", "Thu"]
      : state.range === "1M" ? ["4 Oct", "14 Oct", "24 Oct", "3 Nov"] : state.range === "3M" ? ["Aug", "Sep", "Oct", "Nov"] : ["Dec", "Mar", "Jun", "Sep"];
  const xMarkup = xLabels.map((label, index) => `<text x="${left + (index / 3) * (width * .74)}" y="${294}" fill="#6d7e9b" font-size="9" font-family="Inter, sans-serif">${label}</text>`).join("");
  const finalPoint = observed[observed.length - 1];
  chart.innerHTML = `
    <defs>
      <linearGradient id="observedFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#7295ff" stop-opacity=".25"/><stop offset="1" stop-color="#7295ff" stop-opacity="0"/></linearGradient>
      <linearGradient id="forecastFill" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="#53d9ad" stop-opacity=".08"/><stop offset="1" stop-color="#53d9ad" stop-opacity=".28"/></linearGradient>
      <filter id="lineGlow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    </defs>
    ${yLines}
    <path d="${pathFromPoints(observed)} L${observed[observed.length - 1].x.toFixed(2)} ${(top + height).toFixed(2)} L${observed[0].x.toFixed(2)} ${(top + height).toFixed(2)} Z" fill="url(#observedFill)"/>
    <path d="${areaPath}" fill="url(#forecastFill)"/>
    <line x1="${finalPoint.x}" x2="${finalPoint.x}" y1="${top}" y2="${top + height}" stroke="#607395" stroke-dasharray="3 5" opacity=".7"/>
    <path d="${pathFromPoints(observed)}" fill="none" stroke="#9fb7ff" stroke-width="2.15" stroke-linecap="round" stroke-linejoin="round" filter="url(#lineGlow)"/>
    <path d="${pathFromPoints(forecastWithStart)}" fill="none" stroke="#62dbb4" stroke-width="2" stroke-dasharray="5 5" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="${finalPoint.x}" cy="${finalPoint.y}" r="4.2" fill="#a8bdff" stroke="#10223e" stroke-width="3"/>
    <circle cx="${future[future.length - 1].x}" cy="${future[future.length - 1].y}" r="4" fill="#61ddb5" stroke="#10223e" stroke-width="3"/>
    <rect x="${Math.max(left, finalPoint.x - 37)}" y="${Math.max(top + 4, finalPoint.y - 28)}" width="74" height="19" rx="4" fill="#1d3158" stroke="#526caa" stroke-width=".5"/>
    <text x="${finalPoint.x}" y="${Math.max(top + 17, finalPoint.y - 15)}" text-anchor="middle" fill="#e3ebff" font-size="9" font-weight="700" font-family="Inter, sans-serif">${wholeCurrency.format(samples[samples.length - 1])}</text>
    <text x="${finalPoint.x + 8}" y="${top + 12}" fill="#8196bd" font-size="9" font-family="Inter, sans-serif">OBSERVED</text>
    <text x="${future[future.length - 1].x - 6}" y="${top + 12}" text-anchor="end" fill="#70dbb8" font-size="9" font-family="Inter, sans-serif">MODEL PATH</text>
    ${xMarkup}
  `;

  const chartWrap = element("chartWrap");
  const tooltip = element("chartTooltip");
  chartWrap.onmousemove = (event) => {
    const box = chart.getBoundingClientRect();
    const relativeX = ((event.clientX - box.left) / box.width) * 820;
    const closest = [...observed, ...future].reduce((best, point) => Math.abs(point.x - relativeX) < Math.abs(best.x - relativeX) ? point : best, observed[0]);
    const isFuture = closest.x > finalPoint.x + 1;
    tooltip.innerHTML = `<strong>${rupees(closest.value)}</strong><span>${isFuture ? "Model forecast" : "Observed price"}</span>`;
    tooltip.style.left = `${Math.min(Math.max(event.clientX - box.left + 12, 0), box.width - 112)}px`;
    tooltip.style.top = `${Math.max(event.clientY - box.top - 44, 0)}px`;
    tooltip.style.display = "block";
  };
  chartWrap.onmouseleave = () => { tooltip.style.display = "none"; };
}

function renderSignals(stock) {
  element("signalList").innerHTML = stock.signals.map(([name, detail, score, status, kind]) => {
    const valueClass = status === "Weak" || status === "Soft" ? "negative" : status === "Neutral" || status === "Balanced" || status === "Contained" ? "" : "positive";
    return `<div class="signal-row"><div class="signal-name"><strong>${name}</strong><small>${detail}</small></div><div class="signal-meter"><i class="${kind || ""}" style="width:${score}%"></i></div><span class="signal-value ${valueClass}">${status}</span></div>`;
  }).join("");
}

function renderForecastRows(stock) {
  const rows = getForecastRows(stock);
  element("pathTitle").textContent = state.horizon === "1D" ? "Next-session outlook" : state.horizon === "1M" ? "Monthly price path" : "5-session outlook";
  element("forecastRows").innerHTML = rows.map((row) => {
    const biasClass = row.bias.toLowerCase();
    return `<tr><td>${row.session}</td><td>${rupees(row.price)}</td><td>${rupees(row.low, false)} — ${rupees(row.high, false)}</td><td><span class="bias-pill ${biasClass === "neutral" ? "neutral" : biasClass === "bearish" ? "bearish" : ""}">${row.bias}</span></td></tr>`;
  }).join("");
}

function makeSparkline(stock) {
  const values = stock.history.slice(-10);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const points = values.map((value, index) => `${(index / (values.length - 1)) * 42},${15 - ((value - min) / span) * 12}`).join(" ");
  return `<svg class="sparkline ${stock.change >= 0 ? "positive" : "negative"}" viewBox="0 0 42 17" aria-hidden="true"><path d="M${points.replaceAll(" ", " L")}"/></svg>`;
}

function renderWatchlist() {
  element("watchlistGrid").innerHTML = STOCKS.slice(0, 5).map((stock) => `
    <button class="watch-card ${stock.symbol === state.symbol ? "active" : ""}" type="button" data-symbol="${stock.symbol}" aria-label="View ${stock.name}">
      <span class="watch-card-head"><span class="watch-symbol">${stock.symbol}</span><span class="watch-sector">${stock.sector}</span></span>
      <span class="watch-card-bottom"><span><strong class="watch-price">${rupees(adjustedPrice(stock.price))}</strong><span class="watch-change ${stock.change >= 0 ? "positive" : "negative"}"> ${percent(stock.change)}</span></span>${makeSparkline(stock)}</span>
    </button>
  `).join("");
  element("watchlistGrid").querySelectorAll(".watch-card").forEach((card) => {
    card.addEventListener("click", () => selectStock(card.dataset.symbol));
  });
}

function updateRangeAndHorizonButtons() {
  document.querySelectorAll("[data-range]").forEach((button) => {
    const selected = button.dataset.range === state.range;
    button.classList.toggle("selected", selected);
    button.setAttribute("aria-selected", String(selected));
  });
  document.querySelectorAll("[data-horizon]").forEach((button) => {
    const selected = button.dataset.horizon === state.horizon;
    button.classList.toggle("selected", selected);
    button.setAttribute("aria-selected", String(selected));
  });
}

function updateUI() {
  const stock = currentStock();
  updateHeader(stock);
  updateForecast(stock);
  renderChart(stock);
  renderSignals(stock);
  renderForecastRows(stock);
  renderWatchlist();
  updateRangeAndHorizonButtons();
  element("exchangeSelect").value = state.exchange;
}

let toastTimer;
function showToast(message) {
  const toast = element("toast");
  toast.textContent = message;
  toast.classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("visible"), 2400);
}

function selectStock(symbol) {
  state.symbol = symbol;
  state.modelShift = 0;
  state.favorite = true;
  element("stockSearch").value = "";
  hideSearch();
  updateUI();
  showToast(`${currentStock().symbol} loaded in the research workspace`);
}

function renderSearch(query = "") {
  const results = element("searchResults");
  const normalized = query.trim().toLowerCase();
  const candidates = STOCKS.filter((stock) => !normalized || stock.symbol.toLowerCase().includes(normalized) || stock.name.toLowerCase().includes(normalized)).slice(0, 5);
  if (!candidates.length) {
    results.innerHTML = `<div class="search-result"><span>No matching symbols</span></div>`;
  } else {
    results.innerHTML = candidates.map((stock) => `<button class="search-result" type="button" role="option" data-symbol="${stock.symbol}"><span><b>${stock.symbol}</b><small>${stock.name}</small></span><span>${stock.sector}</span></button>`).join("");
    results.querySelectorAll("button").forEach((button) => button.addEventListener("click", () => selectStock(button.dataset.symbol)));
  }
  results.classList.add("visible");
  element("stockSearch").setAttribute("aria-expanded", "true");
}

function hideSearch() {
  element("searchResults").classList.remove("visible");
  element("stockSearch").setAttribute("aria-expanded", "false");
}

function openMethodology() {
  element("methodologyDialog").showModal();
}

function setUpEvents() {
  document.querySelectorAll("[data-range]").forEach((button) => {
    button.addEventListener("click", () => { state.range = button.dataset.range; updateUI(); });
  });
  document.querySelectorAll("[data-horizon]").forEach((button) => {
    button.addEventListener("click", () => { state.horizon = button.dataset.horizon; updateUI(); });
  });
  element("exchangeSelect").addEventListener("change", (event) => { state.exchange = event.target.value; updateUI(); });
  element("favoriteStock").addEventListener("click", () => {
    state.favorite = !state.favorite;
    element("favoriteStock").setAttribute("aria-pressed", String(state.favorite));
    showToast(state.favorite ? `${currentStock().symbol} added to your watchlist` : `${currentStock().symbol} removed from your watchlist`);
  });
  element("rerunModel").addEventListener("click", () => {
    const button = element("rerunModel");
    button.disabled = true;
    button.classList.add("loading");
    button.querySelector("span").textContent = "Refreshing model…";
    setTimeout(() => {
      state.modelShift = state.modelShift >= 0.17 ? -0.09 : state.modelShift + 0.13;
      updateUI();
      button.disabled = false;
      button.classList.remove("loading");
      button.querySelector("span").textContent = "Refresh model view";
      showToast("Model view refreshed from simulated inputs");
    }, 520);
  });
  const search = element("stockSearch");
  search.addEventListener("input", () => renderSearch(search.value));
  search.addEventListener("focus", () => renderSearch(search.value));
  search.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      const first = element("searchResults").querySelector("button[data-symbol]");
      if (first) selectStock(first.dataset.symbol);
    }
    if (event.key === "Escape") hideSearch();
  });
  document.addEventListener("click", (event) => {
    if (!event.target.closest(".search-area")) hideSearch();
  });
  document.addEventListener("keydown", (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      search.focus();
      renderSearch(search.value);
    }
  });
  ["openMethodology", "openMethodologyTop", "openMethodologyBottom"].forEach((id) => element(id).addEventListener("click", openMethodology));
  element("closeMethodology").addEventListener("click", () => element("methodologyDialog").close());
  element("watchlistScroll").addEventListener("click", () => {
    element("watchlistGrid").scrollIntoView({ behavior: "smooth", block: "center" });
    showToast("Showing your top 5 simulated research names");
  });
  const mobileMenu = element("mobileMenu");
  mobileMenu.addEventListener("click", () => {
    const sidebar = document.querySelector(".sidebar");
    const open = sidebar.classList.toggle("open");
    mobileMenu.setAttribute("aria-expanded", String(open));
  });
  document.querySelectorAll(".nav-item").forEach((link) => link.addEventListener("click", () => {
    document.querySelector(".sidebar").classList.remove("open");
    mobileMenu.setAttribute("aria-expanded", "false");
  }));
}

setUpEvents();
updateUI();
