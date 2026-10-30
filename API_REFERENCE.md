# REST API Reference

**Base URL:** `http://localhost:3001`  
**JSON headers for writes:** `Content-Type: application/json`  
**ID type:** string, including newly created records. Do not assume numeric IDs.  
**Currency:** EGP; amounts are raw numbers, e.g. `195`.

## Routes

| Resource | GET all | GET one | POST | PATCH | DELETE |
| --- | --- | --- | --- | --- | --- |
| Categories | `/categories` | `/categories/:id` | `/categories` | `/categories/:id` | `/categories/:id` |
| Menu items | `/menu` | `/menu/:id` | `/menu` | `/menu/:id` | `/menu/:id` |
| Cart rows | `/cart` | `/cart/:id` | `/cart` | `/cart/:id` | `/cart/:id` |
| Orders | `/orders` | `/orders/:id` | `/orders` | `/orders/:id` | `/orders/:id` |
| Customers | `/customers` | `/customers/:id` | `/customers` | `/customers/:id` | `/customers/:id` |
| Reviews | `/reviews` | `/reviews/:id` | `/reviews` | `/reviews/:id` | `/reviews/:id` |

`restaurant` is a **single object resource**: `GET /restaurant`, `PATCH /restaurant`. It is not an array; do **not** use `/restaurant/:id`.

## Menu data

```json
{
  "id": "food-001",
  "name": "Margherita Pizza",
  "description": "Classic mozzarella, basil and tomato sauce",
  "price": 195,
  "categoryId": "cat-1",
  "imageUrl": "https://images.unsplash.com/...",
  "available": true,
  "isFeatured": true,
  "prepTimeMinutes": 20,
  "rating": 4.8,
  "createdAt": "2026-09-15T11:00:00Z"
}
```

- **Read menu:** `GET /menu`
- **Get one food item:** `GET /menu/food-001`
- **Filter by category:** `GET /menu?categoryId=cat-1`
- **Filter availability:** `GET /menu?available=true`
- **Sort price ascending:** `GET /menu?_sort=price`
- **Sort price descending:** `GET /menu?_sort=-price`
- **Paginate:** `GET /menu?_page=1&_per_page=8` (response is a page metadata object with a `data` array, **not** a plain array)
- **Search:** `GET /menu?name:contains=Pizza` (the v1 query dialect supports `:contains`; client-side searching is also acceptable for this task)

### Create a menu item

```http
POST /menu
Content-Type: application/json

{
  "name": "Spicy Beef Pizza",
  "description": "Mozzarella, beef and chili",
  "price": 255,
  "categoryId": "cat-1",
  "imageUrl": "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=900",
  "available": true,
  "isFeatured": false,
  "prepTimeMinutes": 22,
  "rating": 0,
  "createdAt": "2026-10-28T11:00:00Z"
}
```

The API creates the ID if omitted. Validate inputs in the frontend (name, category, non-negative price, etc.).

### Edit a menu item

```http
PATCH /menu/food-001
Content-Type: application/json

{ "price": 210, "available": false }
```

### Delete a menu item

```http
DELETE /menu/food-001
```

Keep historical order-item snapshots even if a menu item is edited/deleted. The live data validation script checks references only in the **initial** dataset; it is normal for an old order snapshot to outlive a deleted menu record.

## Category data

```json
{
  "id": "cat-1",
  "name": "Pizza",
  "slug": "pizza",
  "description": "Hand-tossed pizzas, fresh from the oven",
  "imageUrl": "https://images.unsplash.com/...",
  "sortOrder": 1,
  "isActive": true
}
```

**Important:** For a junior assignment, disable deleting a category while any menu item references its ID, or require reassignment first. JSON Server does not enforce foreign keys.

## Cart row data

```json
{
  "id": "cart-001",
  "menuItemId": "food-002",
  "quantity": 1,
  "note": "",
  "addedAt": "2026-10-28T10:05:00Z"
}
```

- `GET /cart` fetches cart rows.
- `POST /cart` adds a row (omit `id`).
- `PATCH /cart/:id` changes `quantity` or `note`.
- `DELETE /cart/:id` removes a row.
- The **frontend** resolves each `menuItemId` against `menu` to show name, image and price and calculate cart totals.
- When adding an already-present menu item, **increment the existing row** with PATCH instead of creating a duplicate row.
- A cart is intentionally shared globally (one demo user).

## Orders

```json
{
  "id": "order-001",
  "orderNumber": "ORD-2026-0001",
  "customerId": "customer-002",
  "customerName": "Mariam Adel",
  "customerPhone": "01000000002",
  "items": [
    { "menuItemId": "food-005", "name": "Classic Cheeseburger", "quantity": 2, "unitPrice": 175 }
  ],
  "orderType": "delivery",
  "deliveryAddress": "8 Tahrir Square, Dokki",
  "status": "pending",
  "paymentMethod": "cash",
  "paymentStatus": "unpaid",
  "subtotal": 350,
  "deliveryFee": 30,
  "total": 380,
  "notes": "",
  "createdAt": "2026-10-28T11:00:00Z"
}
```

The above is a **schema example**, not necessarily an existing seeded order. For checkout:

1. Load the current cart and menu; verify item availability and quantities.
2. Create a snapshot of cart items (name/price/quantity) so later menu changes do not affect history.
3. Calculate `subtotal = sum(unitPrice * quantity)`.
4. Read `restaurant.deliveryFee`, applying it only to delivery orders. No tax or discount is included in this mock task.
5. Create order: `POST /orders` **without** `id`. Use a unique display `orderNumber` (e.g. `ORD-<timestamp>`).
6. When the order POST **succeeds**, remove cart rows with `DELETE /cart/:id` (handle partial failures with an error/retry state).
7. Admin can `PATCH /orders/:id` to update `status`.

Suggested order statuses: `pending`, `preparing`, `ready`, `completed`, `cancelled`.

**Do not implement real card payment.** `paymentMethod: "card"` is UI-only simulation; `paymentStatus` is demo data, not a bank transaction.

## Customers and reviews

- Customers: `{id,fullName,email,phone,address,createdAt}`.
- Reviews: `{id,menuItemId,customerName,rating,comment,createdAt}`.
- Reviews may be shown on the menu details page. Customer and review management are optional bonus features.
- Use the seeded customers for checkout selection, or create a customer first with `POST /customers` (and then use the returned `id`).

## Dashboard data

Calculate metrics in the **frontend** from collections; there is no `/dashboard` endpoint:

- **Total revenue:** sum `total` for `status === "completed"` only (exclude cancelled and pending).
- **Total orders:** `orders.length` (optionally split by status).
- **Pending orders:** count where `status === "pending"`.
- **Menu items:** `menu.length` and out-of-stock count where `available === false`.
- **Customers:** `customers.length`.
- **Sales chart:** group completed orders by calendar day/week based on `createdAt`.
- **Most popular items:** sum quantities in non-cancelled order item snapshots grouped by `menuItemId`.

These are **demo KPI definitions** for grading consistency, not accounting rules.

## JSON Server v1 notes

- `GET /menu` returns an array; `GET /menu?_page=1&_per_page=8` returns a **pagination object** containing `data`.
- `POST`, `PATCH`, and `DELETE` persist to the writable `db.json`.
- IDs are strings; beta v1 syntax differs from old 0.17.x tutorials (`_per_page` replaces `_limit`; `_sort=-price` replaces `_order=desc`).
- JSON Server performs minimal validation; frontend is responsible for user-friendly errors.

Docs: https://github.com/typicode/json-server
