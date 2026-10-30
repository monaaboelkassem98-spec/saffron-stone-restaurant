# Junior Frontend Task — Restaurant Website + Admin Dashboard

## Objective

Build a **responsive, polished, API-driven restaurant website** for the fictional brand **Saffron & Stone**, plus an **admin dashboard**. The supplied mock API is the backend; **do not build another backend and do not hardcode menu/order content in frontend files**.

## Technology

- React + Vite **or** Next.js (choose one), TypeScript encouraged.
- Tailwind CSS or well-structured CSS.
- React Router if using Vite; Axios or fetch; React Query/TanStack Query is optional.
- Recharts/Chart.js may be used for dashboard visualizations.
- Frontend and JSON Server must run as separate processes (API at `localhost:3001`).

## Required public/customer pages

1. **Home page**: hero, CTA, featured dishes, category sections, testimonials/reviews, footer.
2. **Menu page**: load categories and dishes via API; category filter, search, price sorting, availability badges, responsive food cards.
3. **Food details** (page or modal): image, description, price, rating and quantity; add-to-cart action.
4. **Cart page/drawer**: load from API, increment/decrement quantities, remove rows, calculate subtotal, handle empty state.
5. **Checkout page**: customer selection/details, pickup/delivery, delivery address (required for delivery), mock cash/card selection, create order via API, clear cart on success, show confirmation.

## Required admin pages

1. **Dashboard**: KPI cards (orders/revenue/customers/products), recent orders, sales-over-time chart, top dishes chart, order status breakdown.
2. **Menu Management**: table/grid, create/edit/delete dishes, form validation, image URL preview, availability toggle, category selection, loading and error states.
3. **Category Management**: list, create/edit/delete, prevent unsafe removal of categories still used by menu items.
4. **Orders Management**: orders table, status filtering, order details and status update (`PATCH`).

## UX/design requirements

- Professional, modern, consistent visuals; responsive at 375px / 768px / 1440px.
- Cohesive typography, food photography, distinct CTA, tasteful animations, no clutter.
- Usable navigation, working mobile menu, hover/focus states.
- Skeleton/loading state, network error/retry, empty states, success/error toast or feedback.
- Modals must close with Esc and support keyboard focus; forms have visible labels.
- Currency formatting (EGP); sensible price validation; orders sorted newest first.

## Implementation rules

- Fetch all menu/categories/cart/orders/customers from the supplied API. Avoid locally hardcoded replacements.
- Work with **string IDs**. Use meaningful React component boundaries and hooks.
- Keep API base URL in an env variable. Do not scatter `http://localhost:3001` literals.
- `POST` and `PATCH` should reflect in UI without a full-page refresh.
- Confirm destructive actions. Never allow a checkout with zero items.
- Simulate card payments only; no authentication/payment SDK or actual money movement.
- Do not depend on a custom `/dashboard` route; derive stats from orders/menu/customers.
- **Bonus:** favorites via localStorage, reviews display, dark mode, pagination, tests.

## Submission

- GitHub repository with full frontend source (do not commit `node_modules`).
- README with install/run instructions for **both** API and frontend, app screenshots and a feature checklist.
- Working website with customer and admin routes.
- Demonstrate menu CRUD persistence, cart updates, checkout/order creation and dashboard updates.

## Acceptance checklist

- [ ] Restaurant homepage and menu look polished on mobile/desktop
- [ ] Filtering/search/sorting works on fetched menu items
- [ ] Admin can create, edit, delete, and toggle availability of a menu item
- [ ] Admin can create/edit categories and safely handle deletion
- [ ] Cart add/update/delete calls the API and shows correct totals
- [ ] Checkout POST creates an order; cart clears only after success
- [ ] Admin can view orders and PATCH status
- [ ] Dashboard metrics and charts use real seeded/API orders
- [ ] Loading, empty, invalid form and API-failure states work
- [ ] Code is structured, readable and runnable from README

## Evaluation (100 points)

| Category | Points |
| --- | ---: |
| UI quality and responsive design | 25 |
| API integration and menu/category CRUD | 25 |
| Cart + checkout correctness | 20 |
| Dashboard + orders workflow | 20 |
| Maintainability, UX states and documentation | 10 |

No deadline is set by this brief; assign one separately.
