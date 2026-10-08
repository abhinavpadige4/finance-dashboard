// js/charts.js
// Chart.js (v4.4.x) initialization and update logic for the personal finance dashboard.
// This module depends on ./data.js which exports the raw dataset and helper functions.

import { getCategoryAggregates, getMonthlyAggregates, getAllCategories } from "./data.js";

// Exported chart instances (will be set by initCharts)
export let barChartInstance = null;
export let lineChartInstance = null;

// Chart.js default configuration helpers
const chartFont = {
  family: "'Inter', sans-serif",
  size: 12,
};

function baseOptions() {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          font: chartFont,
          color: getComputedStyle(document.documentElement).getPropertyValue("--text-primary").trim(),
        },
      },
      tooltip: {
        titleFont: chartFont,
        bodyFont: chartFont,
        backgroundColor: getComputedStyle(document.documentElement).getPropertyValue("--surface").trim(),
        titleColor: getComputedStyle(document.documentElement).getPropertyValue("--text-primary").trim(),
        bodyColor: getComputedStyle(document.documentElement).getPropertyValue("--text-secondary").trim(),
        borderColor: getComputedStyle(document.documentElement).getPropertyValue("--border").trim(),
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        ticks: { font: chartFont, color: getComputedStyle(document.documentElement).getPropertyValue("--text-secondary").trim() },
        grid: { display: false },
      },
      y: {
        ticks: { font: chartFont, color: getComputedStyle(document.documentElement).getPropertyValue("--text-secondary").trim() },
        grid: { color: getComputedStyle(document.documentElement).getPropertyValue("--border").trim() },
      },
    },
  };
}

/**
 * Create the bar chart showing spending by category.
 * @param {string} canvasId - The id of the <canvas> element.
 * @param {Array} categoryData - Array of objects {category, total, color}.
 */
export function createBarChart(canvasId, categoryData) {
  const ctx = document.getElementById(canvasId).getContext("2d");
  const labels = categoryData.map((c) => c.category);
  const data = categoryData.map((c) => c.total);
  const backgroundColors = categoryData.map((c) => c.color);

  barChartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Spending",
          data,
          backgroundColor: backgroundColors,
          borderRadius: 4,
        },
      ],
    },
    options: {
      ...baseOptions(),
      plugins: {
        ...baseOptions().plugins,
        title: {
          display: true,
          text: "Spending by Category",
          font: chartFont,
          color: getComputedStyle(document.documentElement).getPropertyValue("--text-primary").trim(),
        },
      },
      scales: {
        ...baseOptions().scales,
        y: {
          ...baseOptions().scales.y,
          beginAtZero: true,
        },
      },
    },
  });
}

/**
 * Create the line chart showing monthly income vs expenses.
 * @param {string} canvasId - The id of the <canvas> element.
 * @param {Array} monthlyData - Array of objects {month, income, expenses}.
 */
export function createLineChart(canvasId, monthlyData) {
  const ctx = document.getElementById(canvasId).getContext("2d");
  const labels = monthlyData.map((m) => m.month);
  const incomeData = monthlyData.map((m) => m.income);
  const expenseData = monthlyData.map((m) => m.expenses);

  lineChartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Income",
          data: incomeData,
          borderColor: getComputedStyle(document.documentElement).getPropertyValue("--success").trim(),
          backgroundColor: getComputedStyle(document.documentElement).getPropertyValue("--success").trim(),
          tension: 0.3,
          fill: false,
          pointRadius: 4,
        },
        {
          label: "Expenses",
          data: expenseData,
          borderColor: getComputedStyle(document.documentElement).getPropertyValue("--danger").trim(),
          backgroundColor: getComputedStyle(document.documentElement).getPropertyValue("--danger").trim(),
          tension: 0.3,
          fill: false,
          pointRadius: 4,
        },
      ],
    },
    options: {
      ...baseOptions(),
      plugins: {
        ...baseOptions().plugins,
        title: {
          display: true,
          text: "Monthly Income & Expenses",
          font: chartFont,
          color: getComputedStyle(document.documentElement).getPropertyValue("--text-primary").trim(),
        },
      },
      scales: {
        ...baseOptions().scales,
        y: {
          ...baseOptions().scales.y,
          beginAtZero: true,
        },
      },
    },
  });
}

/**
 * Destroy existing chart instances if they exist.
 */
function destroyCharts() {
  if (barChartInstance) {
    barChartInstance.destroy();
    barChartInstance = null;
  }
  if (lineChartInstance) {
    lineChartInstance.destroy();
    lineChartInstance = null;
  }
}

/**
 * Initialize both charts with the full dataset.
 */
export function initCharts() {
  const categoryData = getCategoryAggregates(); // all categories
  const monthlyData = getMonthlyAggregates();
  createBarChart("categoryBarChart", categoryData);
  createLineChart("monthlyLineChart", monthlyData);
}

/**
 * Update charts based on a filtered category list.
 * If filteredCategories is empty or null, show all data.
 * @param {Array<string>} filteredCategories - List of category names to include.
 */
export function updateCharts(filteredCategories = null) {
  // Re‑aggregate data according to filter
  const categoryData = filteredCategories && filteredCategories.length
    ? getCategoryAggregates(filteredCategories)
    : getCategoryAggregates();

  const monthlyData = filteredCategories && filteredCategories.length
    ? getMonthlyAggregates(filteredCategories)
    : getMonthlyAggregates();

  // Re‑create charts (destroy first to avoid memory leaks)
  destroyCharts();
  createBarChart("categoryBarChart", categoryData);
  createLineChart("monthlyLineChart", monthlyData);
}
