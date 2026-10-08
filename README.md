# Personal Finance Dashboard

An interactive personal finance dashboard built with plain HTML, CSS (Tailwind CDN), and Chart.js. No build step, no package.json — just open and run.

## Features

- **Summary Cards Row** — Four at-a-glance cards showing total income, total expenses, net balance, and savings rate. Each card uses color-coded icons (green for income, red for expenses, blue for balance, amber for savings rate) with smooth hover lift animations.
- **Spending by Category Bar Chart** — A vertical bar chart displaying total spending per category (e.g., Housing, Food, Transport, Entertainment, Utilities, Healthcare, Shopping, Other). Bars are colored using the category color palette defined in the design tokens. Hovering a bar shows the exact dollar amount.
- **Monthly Trend Line Chart** — A dual-line chart tracking income vs. expenses across the last 12 months. Income is rendered in green (#16a34a) and expenses in red (#dc2626), with filled area gradients beneath each line for visual depth. The chart includes a legend toggle so users can show/hide either series.
- **Category Filter Buttons** — A row of pill-shaped buttons (All, Housing, Food, Transport, Entertainment, Utilities, Healthcare, Shopping, Other). Clicking a category filters both charts and the summary cards to show only that category's data. The active button is highlighted with the primary blue color (#2563eb) and a subtle shadow. Clicking "All" resets the view.
- **Responsive Layout** — The dashboard adapts from a 4-column card grid on desktop to a 2-column grid on tablet and a single column on mobile. Charts resize fluidly within their containers.
- **Smooth Animations** — Chart transitions animate on filter changes. Cards have a 0.2s ease hover transform. Filter buttons have a 0.15s color transition.

## Project Structure

```
/
├── index.html          # Main entry page
├── css/
│   └── styles.css      # All styling (CSS custom properties + utilities)
├── js/
│   ├── data.js         # Sample financial dataset + helper functions
│   ├── charts.js       # Chart.js init/update/destroy logic
│   └── app.js          # Application controller (DOM, filters, coordination)
├── vercel.json         # Vercel deployment config
└── README.md           # This file
```

## Local Preview

No build step or dependencies required. Two options:

### Option 1: Open Directly

Double-click `index.html` in your file explorer. The page loads Tailwind and Chart.js from CDNs, so you need an internet connection.

### Option 2: Local Server (recommended)

Use any static file server. Examples:

```bash
# Python 3
python3 -m http.server 8000

# Node.js (no install needed if you have npx)
npx serve .

# PHP
php -S localhost:8000
```

Then open http://localhost:8000 in your browser.

## Deployment to Vercel

### Prerequisites

- A GitHub (or GitLab/Bitbucket) account
- A Vercel account (free tier is sufficient)

### Steps

1. **Push to GitHub**

   ```bash
   git init
   git add .
   git commit -m "Initial commit: personal finance dashboard"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```

2. **Deploy on Vercel**

   - Go to https://vercel.com/new
   - Import your repository
   - Vercel auto-detects this as a static site (no framework preset needed)
   - Set the **Build Command** to empty (no build step)
   - Set the **Output Directory** to `.` (root)
   - Click **Deploy**

3. **Verify**

   - Vercel deploys in ~30 seconds
   - Your site is live at `https://YOUR_PROJECT.vercel.app`
   - The `vercel.json` config ensures clean URLs and proper cache headers for CSS/JS assets

### vercel.json Details

The included `vercel.json` configures:

- **Rewrites**: All routes serve `index.html` (SPA-style fallback)
- **Headers**: CSS and JS files get `Cache-Control: public, max-age=31536000, immutable` for long-term caching
- **Clean URLs**: Removes `.html` extensions from URLs

## Data Format for Customization

All sample data lives in `js/data.js`. Replace the arrays and objects with your own data using the same schema.

### Transaction Model

Each transaction is an object with these fields:

| Field      | Type    | Description                                      |
|------------|---------|--------------------------------------------------|
| `id`       | number  | Unique identifier (any integer)                  |
| `date`     | string  | ISO date string, e.g. `"2024-01-15"`             |
| `category` | string  | One of: Housing, Food, Transport, Entertainment, Utilities, Healthcare, Shopping, Other |
| `amount`   | number  | Positive number (dollars). Income and expenses are distinguished by `type`. |
| `type`     | string  | Either `"income"` or `"expense"`                 |

**Example:**

```javascript
{
  id: 1,
  date: "2024-01-15",
  category: "Housing",
  amount: 1500,
  type: "expense"
}
```

### MonthlyAggregate Model

Used by the line chart. One entry per month:

| Field      | Type    | Description                          |
|------------|---------|--------------------------------------|
| `month`    | string  | Display label, e.g. `"Jan"`, `"Feb"` |
| `income`   | number  | Total income for that month          |
| `expenses` | number  | Total expenses for that month        |

**Example:**

```javascript
{
  month: "Jan",
  income: 5200,
  expenses: 3800
}
```

### CategoryAggregate Model

Used by the bar chart. One entry per category:

| Field      | Type    | Description                                      |
|------------|---------|--------------------------------------------------|
| `category` | string  | Category name                                    |
| `total`    | number  | Total spending in that category                  |
| `color`    | string  | Hex color from the category color palette        |

**Example:**

```javascript
{
  category: "Housing",
  total: 18000,
  color: "#2563eb"
}
```

### Category Color Palette

The dashboard uses these 8 colors in order. Assign them to your categories in `data.js`:

| Index | Color   | Suggested Category  |
|-------|---------|---------------------|
| 0     | #2563eb | Housing             |
| 1     | #16a34a | Food                |
| 2     | #f59e0b | Transport           |
| 3     | #dc2626 | Entertainment       |
| 4     | #9333ea | Utilities           |
| 5     | #ec4899 | Healthcare          |
| 6     | #06b6d4 | Shopping            |
| 7     | #84cc16 | Other               |

### How to Add Your Own Data

1. Open `js/data.js`
2. Replace the `transactions` array with your own transaction objects
3. Replace the `monthlyData` array with your monthly aggregates
4. Replace the `categoryData` array with your category totals
5. If you add new categories, add corresponding filter buttons in `index.html` and add their colors to the palette in `css/styles.css`
6. Refresh the page — no build step needed

### Helper Functions Available

`data.js` exports these utility functions:

- `getFilteredTransactions(category)` — Returns transactions filtered by category (or all if `"All"`)
- `getFilteredMonthlyData(category)` — Returns monthly aggregates filtered by category
- `getFilteredCategoryData(category)` — Returns category data filtered by category
- `calculateSummary(transactions)` — Returns `{ income, expenses, net, savingsRate }` for the summary cards

## Design Tokens

All colors, spacing, and typography are defined as CSS custom properties in `css/styles.css`:

| Token              | Value     | Usage                    |
|--------------------|-----------|--------------------------|
| `--color-primary`  | #2563eb   | Buttons, links, accents  |
| `--color-success`  | #16a34a   | Income indicators        |
| `--color-danger`   | #dc2626   | Expense indicators       |
| `--color-warning`  | #f59e0b   | Savings rate indicator   |
| `--color-background` | #f8fafc | Page background        |
| `--color-surface`  | #ffffff   | Card backgrounds         |
| `--color-text-primary` | #1e293b | Headings, body text  |
| `--color-text-secondary` | #64748b | Labels, captions     |
| `--color-border`   | #e2e8f0   | Card borders, dividers   |
| `--radius`         | 8px       | Border radius everywhere |
| `--shadow`         | 0 1px 3px rgba(0,0,0,0.1) | Card shadows |

## Tech Stack

- **HTML5** — Semantic markup (header, section, main, footer)
- **Tailwind CSS** — Loaded via CDN (`https://cdn.tailwindcss.com`) for utility classes
- **Chart.js 4.4.x** — Loaded via jsDelivr CDN (`https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js`)
- **Vanilla JavaScript** — ES modules via `<script type="module">`, no frameworks
- **CSS Custom Properties** — Design tokens for consistent theming

## Browser Support

- Chrome 90+
- Firefox 90+
- Safari 15+
- Edge 90+

All modern evergreen browsers are supported. Internet Explorer is not supported.
