// Utility Functions
function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}

function aggregateSummary(transactions) {
  let totalIncome = 0, totalExpenses = 0;
  transactions.forEach(t => {
    if (t.amount > 0) totalIncome += t.amount;
    else totalExpenses += t.amount; // amount is negative for expenses
  });
  const totalBalance = totalIncome + totalExpenses;
  const totalSavings = totalBalance; // simple model: savings = balance
  return { totalBalance, totalIncome, totalExpenses: Math.abs(totalExpenses), totalSavings };
}

function getCategories(transactions) {
  const set = new Set();
  transactions.forEach(t => set.add(t.category));
  return Array.from(set);
}

function aggregateByCategory(transactions, filterCategories) {
  const map = {};
  transactions.forEach(t => {
    if (filterCategories && !filterCategories.includes(t.category)) return;
    if (!map[t.category]) map[t.category] = 0;
    if (t.amount < 0) map[t.category] += Math.abs(t.amount);
  });
  return Object.entries(map).map(([category, total]) => ({ category, total }));
}

function aggregateMonthlyTrend(transactions, filterCategories) {
  const map = {};
  transactions.forEach(t => {
    if (filterCategories && !filterCategories.includes(t.category)) return;
    const month = t.date.slice(0, 7); // YYYY-MM
    if (!map[month]) map[month] = { income: 0, expenses: 0 };
    if (t.amount > 0) map[month].income += t.amount;
    else map[month].expenses += Math.abs(t.amount);
  });
  const sortedMonths = Object.keys(map).sort();
  return sortedMonths.map(m => {
    const inc = map[m].income;
    const exp = map[m].expenses;
    return { month: m, income: inc, expenses: exp, balance: inc - exp };
  });
}

// Mock Data
const mockTransactions = [
  { id: '1', date: '2024-01-15', amount: 3000, category: 'Salary', description: 'January Salary' },
  { id: '2', date: '2024-01-20', amount: -150, category: 'Food', description: 'Groceries' },
  { id: '3', date: '2024-01-22', amount: -60, category: 'Transport', description: 'Gas' },
  { id: '4', date: '2024-02-01', amount: 1200, category: 'Freelance', description: 'Project X' },
  { id: '5', date: '2024-02-05', amount: -200, category: 'Entertainment', description: 'Concert' },
  { id: '6', date: '2024-02-10', amount: -90, category: 'Utilities', description: 'Electricity' },
  { id: '7', date: '2024-03-03', amount: 3000, category: 'Salary', description: 'March Salary' },
  { id: '8', date: '2024-03-12', amount: -180, category: 'Food', description: 'Restaurant' },
  { id: '9', date: '2024-03-15', amount: -70, category: 'Transport', description: 'Bus pass' },
  { id: '10', date: '2024-03-20', amount: -120, category: 'Utilities', description: 'Water' },
];

let activeCategories = null; // null means all

// DOM References
const cardElements = {
  totalBalance: document.querySelector('#card-balance .card-value'),
  totalIncome: document.querySelector('#card-income .card-value'),
  totalExpenses: document.querySelector('#card-expenses .card-value'),
  totalSavings: document.querySelector('#card-savings .card-value'),
};

const filterContainer = document.getElementById('category-filters');
const categoryChartCtx = document.getElementById('categoryChart').getContext('2d');
const trendChartCtx = document.getElementById('trendChart').getContext('2d');

let categoryChart, trendChart;

function renderSummary() {
  const summary = aggregateSummary(mockTransactions);
  cardElements.totalBalance.textContent = formatCurrency(summary.totalBalance);
  cardElements.totalIncome.textContent = formatCurrency(summary.totalIncome);
  cardElements.totalExpenses.textContent = formatCurrency(summary.totalExpenses);
  cardElements.totalSavings.textContent = formatCurrency(summary.totalSavings);
}

function renderFilterButtons() {
  const categories = getCategories(mockTransactions);
  categories.forEach(cat => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'filter-button';
    btn.textContent = cat;
    btn.dataset.category = cat;
    btn.addEventListener('click', () => {
      const isActive = btn.classList.toggle('active');
      if (isActive) {
        if (!activeCategories) activeCategories = [];
        activeCategories.push(cat);
      } else {
        activeCategories = activeCategories.filter(c => c !== cat);
        if (activeCategories.length === 0) activeCategories = null;
      }
      updateCharts();
    });
    filterContainer.appendChild(btn);
  });
}

function createCategoryChart(data) {
  const labels = data.map(d => d.category);
  const values = data.map(d => d.total);
  const colors = getComputedStyle(document.documentElement)
    .getPropertyValue('--color-primary')
    .trim();
  const chartColors = [
    '#2563eb', '#16a34a', '#f59e0b', '#dc2626', '#9333ea', '#0891b2', '#ea580c', '#7c3aed'
  ];
  if (categoryChart) categoryChart.destroy();
  categoryChart = new Chart(categoryChartCtx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Spending by Category',
        data: values,
        backgroundColor: chartColors.slice(0, labels.length),
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
}

function createTrendChart(data) {
  const labels = data.map(d => d.month);
  const incomeVals = data.map(d => d.income);
  const expenseVals = data.map(d => d.expenses);
  if (trendChart) trendChart.destroy();
  trendChart = new Chart(trendChartCtx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Income',
          data: incomeVals,
          borderColor: '#16a34a',
          backgroundColor: 'rgba(22,163,74,0.1)',
          tension: 0.3,
        },
        {
          label: 'Expenses',
          data: expenseVals,
          borderColor: '#dc2626',
          backgroundColor: 'rgba(220,38,38,0.1)',
          tension: 0.3,
        }
      ]
    },
    options: {
      responsive: true,
      plugins: { legend: { position: 'top' } },
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}

function updateCharts() {
  const catData = aggregateByCategory(mockTransactions, activeCategories);
  const trendData = aggregateMonthlyTrend(mockTransactions, activeCategories);
  createCategoryChart(catData);
  createTrendChart(trendData);
}

// Initial Render
renderSummary();
renderFilterButtons();
updateCharts();