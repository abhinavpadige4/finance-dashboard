import { transactions, getFilteredTransactions, getMonthlyAggregates, getCategoryAggregates, getSummaryStats, categories } from './data.js';
import { createBarChart, createLineChart, updateCharts, destroyCharts } from './charts.js';

let barChartInstance = null;
let lineChartInstance = null;
let activeFilter = 'all';

function initApp() {
  document.addEventListener('DOMContentLoaded', () => {
    renderFilterButtons();
    updateSummaryCards();
    initCharts();
    wireFilterHandlers();
  });
}

function renderFilterButtons() {
  const container = document.getElementById('filter-buttons');
  if (!container) return;

  const allBtn = document.createElement('button');
  allBtn.className = 'filter-btn active';
  allBtn.dataset.category = 'all';
  allBtn.textContent = 'All';
  container.appendChild(allBtn);

  categories.forEach((cat) => {
    const btn = document.createElement('button');
    btn.className = 'filter-btn';
    btn.dataset.category = cat;
    btn.textContent = cat;
    container.appendChild(btn);
  });
}

function wireFilterHandlers() {
  const container = document.getElementById('filter-buttons');
  if (!container) return;

  container.addEventListener('click', (e) => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;

    container.querySelectorAll('.filter-btn').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');

    activeFilter = btn.dataset.category;
    handleFilterChange(activeFilter);
  });
}

function handleFilterChange(category) {
  const filtered = getFilteredTransactions(transactions, category);
  const monthly = getMonthlyAggregates(filtered);
  const categoryAgg = getCategoryAggregates(filtered);
  const stats = getSummaryStats(filtered);

  updateSummaryCards(stats);
  updateCharts(monthly, categoryAgg);
}

function updateSummaryCards(stats) {
  const incomeEl = document.getElementById('total-income');
  const expenseEl = document.getElementById('total-expenses');
  const balanceEl = document.getElementById('net-balance');
  const txnCountEl = document.getElementById('txn-count');

  if (incomeEl) incomeEl.textContent = formatCurrency(stats.totalIncome);
  if (expenseEl) expenseEl.textContent = formatCurrency(stats.totalExpenses);
  if (balanceEl) {
    balanceEl.textContent = formatCurrency(stats.netBalance);
    balanceEl.style.color = stats.netBalance >= 0 ? '#16a34a' : '#dc2626';
  }
  if (txnCountEl) txnCountEl.textContent = stats.transactionCount;
}

function initCharts() {
  const filtered = getFilteredTransactions(transactions, activeFilter);
  const monthly = getMonthlyAggregates(filtered);
  const categoryAgg = getCategoryAggregates(filtered);

  const barCtx = document.getElementById('bar-chart');
  const lineCtx = document.getElementById('line-chart');

  if (barCtx) {
    barChartInstance = createBarChart(barCtx, categoryAgg);
  }
  if (lineCtx) {
    lineChartInstance = createLineChart(lineCtx, monthly);
  }
}

function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
}

export { initApp, handleFilterChange, updateSummaryCards };
