// script.js – Personal Finance Dashboard
// --------------------------------------------------
// This script creates a mock finance dataset, renders summary cards,
// initializes Chart.js bar and line charts, and provides category
// filtering via button group.

// ----- Design Tokens (mirrored from style.css) -----
const tokens = {
  colors: {
    primary: "#2563eb",
    primaryHover: "#1d4ed8",
    success: "#16a34a",
    danger: "#dc2626",
    warning: "#f59e0b",
    background: "#f8fafc",
    surface: "#ffffff",
    textPrimary: "#1e293b",
    textSecondary: "#64748b",
    border: "#e2e8f0",
    cardShadow: "0 1px 3px rgba(0,0,0,0.1)"
  },
  spacing: {
    xs: "4px",
    sm: "8px",
    md: "16px",
    lg: "24px",
    xl: "32px"
  },
  fonts: {
    family: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    sizeBase: "16px",
    sizeSm: "14px",
    sizeLg: "18px",
    sizeXl: "24px"
  },
  borderRadius: "8px",
  transition: "150ms ease"
};

// ----- Mock Data -----
/** @type {Transaction[]} */
const mockTransactions = [
  { id: "t1", date: "2024-01-05", amount: -45.2, category: "Food", description: "Groceries" },
  { id: "t2", date: "2024-01-10", amount: -12.5, category: "Transport", description: "Bus pass" },
  { id: "t3", date: "2024-01-12", amount: 2500, category: "Salary", description: "January salary" },
  { id: "t4", date: "2024-01-15", amount: -78.9, category: "Entertainment", description: "Concert ticket" },
  { id: "t5", date: "2024-01-18", amount: -60, category: "Utilities", description: "Electricity bill" },
  { id: "t6", date: "2024-02-03", amount: -30, category: "Food", description: "Restaurant" },
  { id: "t7", date: "2024-02-07", amount: -20, category: "Transport", description: "Taxi" },
  { id: "t8", date: "2024-02-10", amount: 2600, category: "Salary", description: "February salary" },
  { id: "t9", date: "2024-02-14", amount: -150, category: "Freelance", description: "Project payment (income)" },
  { id: "t10", date: "2024-02-20", amount: -90, category: "Entertainment", description: "Streaming subscription" },
  { id: "t11", date: "2024-03-02", amount: -55, category: "Food", description: "Groceries" },
  { id: "t12", date: "2024-03-05", amount: -70, category: "Utilities", description: "Water bill" },
  { id: "t13", date: "2024-03-10", amount: 2700, category: "Salary", description: "March salary" },
  { id: "t14", date: "2024-03-12", amount: -40, category: "Transport", description: "Gas" },
  { id: "t15", date: "2024-03-15", amount: -120, category: "Entertainment", description: "Video game" }
];

// ----- State Management -----
/** @type {DashboardState} */
const state = {
  selectedCategory: "all",
  transactions: mockTransactions,
  monthlyData: [], // will be computed
  categoryData: [] // will be computed
};

// ----- Utility Functions -----
function formatCurrency(value) {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  });
  return formatter.format(value);
}

function groupByMonth(transactions) {
  const map = {};
  transactions.forEach(t => {
    const month = t.date.slice(0, 7); // YYYY-MM
    if (!map[month]) map[month] = [];
    map[month].push(t);
  });
  return Object.entries(map).map(([month, list]) => {
    const income = list.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
    const expenses = list.filter(t => t.amount < 0).reduce((s, t) => s + t.amount, 0);
    return {
      month,
      income,
      expenses,
      balance: income + expenses
    };
  }).sort((a, b) => a.month.localeCompare(b.month));
}

function groupByCategory(transactions) {
  const map = {};
  transactions.forEach(t => {
    if (!map[t.category]) map[t.category] = { total: 0, count: 0 };
    map[t.category].total += t.amount;
    map[t.category].count += 1;
  });
  return Object.entries(map).map(([cat, data]) => ({
    category: cat,
    total: data.total,
    transactionCount: data.count
  }));
}

function computeSummaries() {
  const filtered = state.selectedCategory === "all"
    ? state.transactions
    : state.transactions.filter(t => t.category === state.selectedCategory);

  const income = filtered.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const expenses = filtered.filter(t => t.amount < 0).reduce((s, t) => s + t.amount, 0);
  const balance = income + expenses;

  return { income, expenses, balance };
}

// ----- DOM Rendering -----
function renderSummaryCards() {
  const container = document.getElementById("summary-cards");
  if (!container) return;
  const { income, expenses, balance } = computeSummaries();
  const cards = [
    { label: "Income", value: formatCurrency(income), color: tokens.colors.success },
    { label: "Expenses", value: formatCurrency(Math.abs(expenses)), color: tokens.colors.danger },
    { label: "Balance", value: formatCurrency(balance), color: balance >= 0 ? tokens.colors.success : tokens.colors.danger },
    { label: "Transactions", value: state.transactions.filter(t => state.selectedCategory === "all" || t.category === state.selectedCategory).length, color: tokens.colors.primary }
  ];
  container.innerHTML = cards
    .map(
      c => `
    <div class="summary-card" style="border-left: 4px solid ${c.color};">
      <div class="summary-label">${c.label}</div>
      <div class="summary-value">${c.value}</div>
    </div>`
    )
    .join("");
}

function renderFilterButtons() {
  const container = document.getElementById("filter-buttons");
  if (!container) return;
  const categories = ["all", ...new Set(state.transactions.map(t => t.category))];
  container.innerHTML = categories
    .map(
      cat => `
    <button class="filter-btn ${state.selectedCategory === cat ? "active" : ""}" data-category="${cat}">
      ${cat.charAt(0).toUpperCase() + cat.slice(1)}
    </button>`
    )
    .join("");
}

// ----- Chart Initialization -----
let barChart, lineChart;
function initCharts() {
  const barCtx = document.getElementById("barChart").getContext("2d");
  const lineCtx = document.getElementById("lineChart").getContext("2d");

  barChart = new Chart(barCtx, {
    type: "bar",
    data: {
      labels: [],
      datasets: [{
        label: "Spending by Category",
        data: [],
        backgroundColor: tokens.colors.primary,
        borderRadius: 4
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true }
      }
    }
  });

  lineChart = new Chart(lineCtx, {
    type: "line",
    data: {
      labels: [],
      datasets: [
        {
          label: "Income",
          data: [],
          borderColor: tokens.colors.success,
          tension: 0.3,
          fill: false
        },
        {
          label: "Expenses",
          data: [],
          borderColor: tokens.colors.danger,
          tension: 0.3,
          fill: false
        }
      ]
    },
    options: {
      responsive: true,
      plugins: { legend: { position: "top" } },
      scales: { y: { beginAtZero: true } }
    }
  });
}

function updateBarChart() {
  const data = state.selectedCategory === "all" ? state.categoryData : state.categoryData.filter(c => c.category === state.selectedCategory);
  const labels = data.map(c => c.category);
  const values = data.map(c => Math.abs(c.total)); // show magnitude
  barChart.data.labels = labels;
  barChart.data.datasets[0].data = values;
  barChart.update();
}

function updateLineChart() {
  const data = state.monthlyData;
  const labels = data.map(m => m.month);
  const incomeVals = data.map(m => m.income);
  const expenseVals = data.map(m => Math.abs(m.expenses));
  lineChart.data.labels = labels;
  lineChart.data.datasets[0].data = incomeVals;
  lineChart.data.datasets[1].data = expenseVals;
  lineChart.update();
}

// ----- Event Handlers -----
function onFilterClick(e) {
  const btn = e.target.closest("button[data-category]");
  if (!btn) return;
  const cat = btn.getAttribute("data-category");
  state.selectedCategory = cat;
  renderFilterButtons();
  renderSummaryCards();
  updateBarChart();
}

// ----- Initialization -----
function initDashboard() {
  // compute aggregates
  state.monthlyData = groupByMonth(state.transactions);
  state.categoryData = groupByCategory(state.transactions);

  renderFilterButtons();
  renderSummaryCards();
  initCharts();
  updateBarChart();
  updateLineChart();

  // attach listeners
  document.getElementById("filter-buttons").addEventListener("click", onFilterClick);
}

// Run after DOM ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initDashboard);
} else {
  initDashboard();
}
