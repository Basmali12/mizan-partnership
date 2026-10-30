# Partnership interactive prototype

Live demo: https://basmali12.github.io/mizan-partnership/

GitHub Pages serves the `gh-pages` branch. Build locally with `npm run build` and publish the contents of `dist/` plus a `.nojekyll` file to that branch. GitHub Actions workflows are not used because this account currently has an Actions billing restriction.

React, TypeScript, Tailwind CSS and Vite. Arabic RTL dashboard with in-memory transaction state only.

## Run

```sh
npm install
npm run dev
```

Open http://127.0.0.1:5187/. To validate: `npm run build`.

- `src/main.tsx` wraps `Dashboard` in `PartnershipProvider`.
- `src/Dashboard.tsx` contains dynamic summary cards, reconciliation, recent transactions, filters and the add-transaction form. Type-specific buttons preselect capital, expense, withdrawal or revenue.
- `src/PartnershipContext.tsx` owns mock transactions, validation and calculations.
- `src/style.css` imports Tailwind CSS and contains the dashboard's existing visual styles. Keep it imported when reusing the components.

Amounts use positive whole IQD. Reconciliation equalizes branch cash: capital + revenue - expenses - withdrawals. The transfer is half the gap, potentially including 0.5 IQD. This is not a partner capital repayment or profit entitlement calculation.

All edits reset on refresh; there is no database, persistence, multi-device synchronization or service worker in this prototype. No v0.dev source was supplied, so these components implement the locally created preview interface.
