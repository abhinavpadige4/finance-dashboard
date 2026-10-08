// js/data.js
// Sample financial dataset and utility functions for the personal finance dashboard
// ------------------------------------------------------------
// Design tokens are defined in CSS, this module focuses purely on data handling.

// -------------------------------------------------------------------
// Raw transaction data (sample for the last 6 months)
// -------------------------------------------------------------------
export const rawData = [
  // January
  { id: 1, date: '2024-01-05', category: 'Salary', amount: 5000, type: 'income' },
  { id: 2, date: '2024-01-10', category: 'Groceries', amount: 250, type: 'expense' },
  { id: 3, date: '2024-01-12', category: 'Rent', amount: 1200, type: 'expense' },
  { id: 4, date: '2024-01-15', category: 'Utilities', amount: 150, type: 'expense' },
  { id: 5, date: '2024-01-20', category: 'Dining Out', amount: 80, type: 'expense' },
  { id: 6, date: '2024-01-22', category: 'Freelance', amount: 800, type: 'income' },
  // February
  { id: 7, date: '2024-02-03', category: 'Salary', amount: 5000, type: 'income' },
  { id: 8, date: '2024-02-08', category: 'Groceries', amount: 230, type: 'expense' },
  { id: 9, date: '2024-02-11', category: 'Rent', amount: 1200, type: 'expense' },
  { id:10, date: '2024-02-14', category: 'Entertainment', amount: 120, type: 'expense' },
  { id:11, date: '2024-02-18', category: 'Utilities', amount: 160, type: 'expense' },
  { id:12, date: '2024-02-25', category: 'Freelance', amount: 600, type: 'income' },
  // March
  { id:13, date: '2024-03-02', category: 'Salary', amount: 5000, type: 'income' },
  { id:14, date: '2024-03-07', category: 'Groceries', amount: 260, type: 'expense' },
  { id:15, date: '2024-03-10', category: 'Rent', amount: 1200, type: 'expense' },
  { id:16, date: '2024-03-13', category: 'Travel', amount: 400, type: 'expense' },
  { id:17, date: '2024-03-16', category: 'Utilities', amount: 155, type: 'expense' },
  { id:18, date: '2024-03-20', category: 'Freelance', amount: 900, type: 'income' },
  // April
  { id:19, date: '2024-04-01', category: 'Salary', amount: 5000, type: 'income' },
  { id:20, date: '2024-04-06', category: 'Groceries', amount: 240, type: 'expense' },
  { id:21, date: '2024-04-09', category: 'Rent', amount: 1200, type: 'expense' },
  { id:22, date: '2024-04-12', category: 'Dining Out', amount: 95, type: 'expense' },
  { id:23, date: '2024-04-15', category: 'Utilities', amount: 158, type: 'expense' },
  { id:24, date: '2024-04-22', category: 'Freelance', amount: 750, type: 'income' },
  // May
  { id:25, date: '2024-05-03', category: 'Salary', amount: 5000, type: 'income' },
  { id:26, date: '2024-05-08', category: 'Groceries', amount: 255, type: 'expense' },
  { id:27, date: '2024-05-11', category: 'Rent', amount: 1200, type: 'expense' },
  { id:28, date: '2024-05-14', category: 'Entertainment', amount: 130, type: 'expense' },
  { id:29, date: '2024-05-17', category: 'Utilities', amount: 162, type: 'expense' },
  { id:30, date: '2024-05-23', category: 'Freelance', amount: 650, type: 'income' },
  // June
  { id:31, date: '2024-06-02', category: 'Salary', amount: 5000, type: 'income' },
  { id:32, date: '2024-06-07', category: 'Groceries', amount: 245, type: 'expense' },
  { id:33, date: '2024-06-10', category: 'Rent', amount: 1200, type: 'expense' },
  { id:34, date: '2024-06-13', category: 'Travel', amount: 350, type: 'expense' },
  { id:35, date: '2024-06-16', category: 'Utilities', amount: 159, type: 'expense' },
  { id:36, date: '2024-06-20', category: 'Freelance', amount: 820, type: 'income' }
];

// -------------------------------------------------------------------
// Helper: parse month string (e.g., '2024-03') from a date
// -------------------------------------------------------------------
function getMonthKey(dateStr) {
  const d = new Date(dateStr);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

// -------------------------------------------------------------------
// Get list of unique categories (including Income categories)
// -------------------------------------------------------------------
export function getCategories() {
  const set = new Set();
  rawData.forEach(t => set.add(t.category));
  return Array.from(set).sort();
}

// -------------------------------------------------------------------
// Filter data by a set of categories (if empty array -> all)
// -------------------------------------------------------------------
export function getFilteredData(selectedCategories = []) {
  if (!selectedCategories.length) return rawData.slice();
  const set = new Set(selectedCategories);
  return rawData.filter(t => set.has(t.category));
}

// -------------------------------------------------------------------
// Aggregate totals per category (used for the bar chart)
// Returns array of { category, total, color }
// -------------------------------------------------------------------
export function aggregateByCategory(data = rawData) {
  const map = new Map();
  data.forEach(t => {
    if (t.type !== 'expense') return; // bar chart shows expenses by category
    const prev = map.get(t.category) || 0;
    map.set(t.category, prev + t.amount);
  });
  const categories = Array.from(map.entries());
  const colors = getDesignToken('categoryColors');
  return categories.map(([category, total], idx) => ({
    category,
    total,
    color: colors[idx % colors.length]
  }));
}

// -------------------------------------------------------------------
// Aggregate monthly income & expenses (used for the line chart)
// Returns array of { month, income, expenses }
// -------------------------------------------------------------------
export function aggregateByMonth(data = rawData) {
  const monthMap = new Map();
  data.forEach(t => {
    const month = getMonthKey(t.date);
    if (!monthMap.has(month)) {
      monthMap.set(month, { income: 0, expenses: 0 });
    }
    const entry = monthMap.get(month);
    if (t.type === 'income') entry.income += t.amount;
    else entry.expenses += t.amount;
  });
  // Sort months chronologically
  const sorted = Array.from(monthMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([month, { income, expenses }]) => ({ month, income, expenses }));
  return sorted;
}

// -------------------------------------------------------------------
// Utility: read CSS custom property values (design tokens) from :root
// -------------------------------------------------------------------
function getDesignToken(name) {
  const root = getComputedStyle(document.documentElement);
  const value = root.getPropertyValue(`--${name}`).trim();
  // For arrays (e.g., categoryColors) we store as JSON string in CSS
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

// Export all utilities as a single object for convenience (optional)
export const dataAPI = {
  rawData,
  getCategories,
  getFilteredData,
  aggregateByCategory,
  aggregateByMonth
};
