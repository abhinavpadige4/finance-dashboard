(function () {
  const App = {};

  // ---------- Mock Data ----------
  App.mockData = {
    transactions: [
      { id: 't1', date: '2024-01-15', amount: 2500, category: 'Salary', type: 'income' },
      { id: 't2', date: '2024-01-20', amount: -150, category: 'Groceries', type: 'expense' },
      { id: 't3', date: '2024-01-22', amount: -75, category: 'Transport', type: 'expense' },
      { id: 't4', date: '2024-02-05', amount: 2600, category: 'Salary', type: 'income' },
      { id: 't5', date: '2024-02-10', amount: -200, category: 'Utilities', type: 'expense' },
      { id: 't6', date: '2024-02-14', amount: -120, category: 'Dining', type: 'expense' },
      { id: 't7', date: '2024-03-01', amount: 2700, category: 'Salary', type: 'income' },
      { id: 't8', date: '2024-03-08', amount: -180, category: 'Groceries', type: 'expense' },
      { id: 't9', date: '2024-03-12', amount: -90, category: 'Entertainment', type: 'expense' },
      { id: 't10', date: '2024-03-20', amount: -60, category: 'Transport', type: 'expense' }
    ]
  };

  // ---------- Utilities ----------
  App.formatCurrency = function (num) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num);
  };

  App.groupByMonth = function (transactions) {
    const map = {};
    transactions.forEach(t => {
      const month = t.date.slice(0, 7); // YYYY-MM
      if (!map[month]) map[month] = { income: 0, expenses: 0 };
      if (t.type === 'income') map[month].income += t.amount;
      else map[month].expenses += Math.abs(t.amount);
    });
    return Object.entries(map).map(([month, vals]) => ({
      month,
      income: vals.income,
      expenses: vals.expenses,
      savings: vals.income - vals.expenses
    }));
  };

  App.calculateSummary = function (transactions) {
    let totalIncome = 0, totalExpenses = 0;
    transactions.forEach(t => {
      if (t.type === 'income') totalIncome += t.amount;
      else totalExpenses += Math.abs(t.amount);
    });
    const totalBalance = totalIncome - totalExpenses;
    const totalSavings = totalBalance; // simple assumption
    return { totalBalance, totalIncome, totalExpenses, totalSavings };
  };

  // ---------- Rendering ----------
  App.renderSummary = function (summary) {
    const container = document.querySelector('.summary-cards');
    const cards = [
      { title: 'Balance', value: summary.totalBalance, modifier: 'primary' },
      { title: 'Income', value: summary.totalIncome, modifier: 'success' },
      { title: 'Expenses', value: summary.totalExpenses, modifier: 'danger' },
      { title: 'Savings', value: summary.totalSavings, modifier: 'warning' }
    ];
    container.innerHTML = cards.map(c => `
      <div class="card card--${c.modifier}">
        <div class="card__title">${c.title}</div>
        <div class="card__value">${App.formatCurrency(c.value)}</div>
      </div>`).join('');
  };

  App.renderFilters = function (categories) {
    const container = document.querySelector('.filter-group');
    const allBtn = `<button class="filter-btn active" data-cat="all">All</button>`;
    const others = categories.map(cat => `<button class="filter-btn" data-cat="${cat}">${cat}</button>`).join('');
    container.innerHTML = allBtn + others;
  };

  // ---------- Chart Initialization ----------
  App.initCharts = function () {
    const barCtx = document.getElementById('categoryBarChart').getContext('2d');
    const lineCtx = document.getElementById('monthlyLineChart').getContext('2d');

    // Bar chart (spending by category)
    App.barChart = new Chart(barCtx, {
      type: 'bar',
      data: { labels: [], datasets: [{ label: 'Expenses', data: [], backgroundColor: [] }] },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'top' } },
        scales: { y: { beginAtZero: true } }
      }
    });

    // Line chart (monthly trend)
    App.lineChart = new Chart(lineCtx, {
      type: 'line',
      data: { labels: [], datasets: [
        { label: 'Income', data: [], borderColor: 'var(--color-success)', tension: 0.3, fill: false },
        { label: 'Expenses', data: [], borderColor: 'var(--color-danger)', tension: 0.3, fill: false },
        { label: 'Savings', data: [], borderColor: 'var(--color-primary)', tension: 0.3, fill: false }
      ] },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'right' } },
        scales: { y: { beginAtZero: true } }
      }
    });
  };

  App.updateBarChart = function (filteredTx) {
    const expenseByCat = {};
    filteredTx.forEach(t => {
      if (t.type === 'expense') {
        expenseByCat[t.category] = (expenseByCat[t.category] || 0) + Math.abs(t.amount);
      }
    });
    const labels = Object.keys(expenseByCat);
    const data = labels.map(l => expenseByCat[l]);
    const palette = getComputedStyle(document.documentElement).getPropertyValue('--chartPalette').split(',').map(c => c.trim());
    const colors = labels.map((_, i) => palette[i % palette.length] || '#888');
    App.barChart.data.labels = labels;
    App.barChart.data.datasets[0].data = data;
    App.barChart.data.datasets[0].backgroundColor = colors;
    App.barChart.update();
  };

  App.updateLineChart = function (monthlyAgg) {
    const labels = monthlyAgg.map(m => m.month);
    const income = monthlyAgg.map(m => m.income);
    const expenses = monthlyAgg.map(m => m.expenses);
    const savings = monthlyAgg.map(m => m.savings);
    App.lineChart.data.labels = labels;
    App.lineChart.data.datasets[0].data = income;
    App.lineChart.data.datasets[1].data = expenses;
    App.lineChart.data.datasets[2].data = savings;
    App.lineChart.update();
  };

  // ---------- Filter Logic ----------
  App.currentFilter = 'all';
  App.filterByCategory = function (category) {
    App.currentFilter = category;
    const filtered = category === 'all' ? App.mockData.transactions : App.mockData.transactions.filter(t => t.category === category);
    App.updateBarChart(filtered);
    // line chart shows overall trend, not filtered by category (kept simple)
    const monthly = App.groupByMonth(App.mockData.transactions);
    App.updateLineChart(monthly);
    // update active button style
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.cat === category);
    });
  };

  // ---------- Init ----------
  document.addEventListener('DOMContentLoaded', function () {
    const summary = App.calculateSummary(App.mockData.transactions);
    App.renderSummary(summary);

    const categories = [...new Set(App.mockData.transactions.map(t => t.category))];
    App.renderFilters(categories);

    App.initCharts();
    App.filterByCategory('all'); // initial render

    // Event delegation for filter buttons
    document.querySelector('.filter-group').addEventListener('click', function (e) {
      if (e.target.matches('.filter-btn')) {
        const cat = e.target.dataset.cat;
        App.filterByCategory(cat);
      }
    });
  });
})();
