# Saffron & Stone — Restaurant JSON Server (Frontend Assignment)

**This is the mock API only.** The junior developer builds the React/Next.js frontend independently. You do **not** need Express, Django, a database service, or a backend developer.

## Prerequisites

- Node.js **22.12 or newer** (for the pinned JSON Server v1 beta)
- npm

## Step 1: Start the API

```bash
npm install
npm run validate
npm run dev
```

The mock API runs at **http://localhost:3001** (port 3001 avoids conflicts with a Next.js app on port 3000).

Try in a browser:

- http://localhost:3001/menu
- http://localhost:3001/categories
- http://localhost:3001/orders
- http://localhost:3001/cart
- http://localhost:3001/restaurant

In the frontend, use the base URL `http://localhost:3001` in a configurable environment variable. See `.env.frontend.example`.

## Step 2: Build the frontend

Read `TASK.md` for the assignment and `API_REFERENCE.md` for API contracts and examples. **Do not modify the initial mock API schema as a shortcut**; add missing presentation/computation logic in your frontend.

## Data provided

- **6** categories, **24** menu items
- **24** historical/recent orders for dashboard metrics and charts
- **10** customers, **8** reviews, **3** cart rows
- **1** restaurant profile/settings object

All IDs are **strings**. Prices are numbers in **EGP**. Timestamps are UTC ISO-8601. Image URLs use Unsplash (internet needed for photos). Phone numbers and customer emails are **fictional examples**.

## Persistence and reset

JSON Server saves POST/PATCH/PUT/DELETE changes into `db.json`. To restore the original demo dataset, **stop the API first** and run:

```bash
npm run reset
npm run validate
npm run dev
```

`data/seed.json` is the untouched backup; do not edit it during normal frontend work.

## What this API does not do

- No user authentication, authorization, payment processing, stock control, or server-side business validation.
- No atomic checkout: frontend performs `POST /orders` and then deletes the cart rows, handling errors properly.
- No built-in `/dashboard` endpoint: calculate dashboard KPIs from `GET /orders`, `GET /menu`, and `GET /customers`.
- `cart` represents **one shared demo cart**, not separate carts for different users. No secrets or real personal information should be stored.

> **Security:** mock API for local/dev use only. Do not expose it to the internet. Orders and totals can be edited directly by API consumers. Never use this server for real orders or payments.

## Files

| File | Purpose |
| --- | --- |
| `db.json` | Live database; writes persist here |
| `data/seed.json` | Initial dataset used for reset |
| `package.json` | Pinned JSON Server dependency and commands |
| `API_REFERENCE.md` | Resource schemas and request examples |
| `TASK.md` | Requirements and acceptance criteria for the junior |
| `requests.http` | Ready-to-run HTTP examples for VS Code REST Client |
| `.env.frontend.example` | Example frontend API base URLs |
| `scripts/reset-db.mjs` | Reset local data |
| `scripts/validate-db.mjs` | Check references and numeric values |

JSON Server repository: https://github.com/typicode/json-server
