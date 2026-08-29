# Database Schema

Each service owns its own database. No cross-service direct DB access.

## auth-service — `users`

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `name` | varchar | |
| `email` | varchar | unique |
| `password` | varchar | bcrypt hashed |
| `created_at` | timestamptz | |

## item-service — `categories` + `menu_items`

### `categories`

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `name` | varchar | 'Food', 'Drinks' |
| `created_at` | timestamptz | |

### `menu_items`

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `name` | varchar | |
| `description` | text | |
| `price` | numeric | |
| `category_id` | uuid FK | references categories |
| `image_url` | varchar | URL to stock photo |
| `available` | boolean | default true |
| `created_at` | timestamptz | |

**Seed data:** 6-8 items total (3-4 per category)

## orders-service — `orders`

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `user_id` | uuid FK | references auth-service users |
| `customer_name` | varchar | |
| `menu_item_id` | uuid FK | references item-service menu_items |
| `item_name` | varchar | snapshot at order time |
| `item_price` | numeric | snapshot at order time (backend owns price) |
| `quantity` | int | min 1 |
| `total_price` | numeric | calculated: item_price * quantity |
| `street` | varchar | delivery address |
| `area` | varchar | delivery area/ward |
| `status` | varchar | 'pending' → 'cooking' → 'dispatched' → 'delivered' → 'cancelled' |
| `created_at` | timestamptz | |

**Key decisions:**
- Backend fetches item from item-service and calculates price (never trust client)
- Item name/price snapshotted at order time (menu price changes don't affect old orders)
- `cancelled` status added for saga compensation

## kitchen-service — `tickets`

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `order_id` | uuid FK | references orders-service orders |
| `customer_name` | varchar | |
| `item` | varchar | |
| `status` | varchar | |
| `created_at` | timestamptz | |

## rider-service — `dispatches`

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `order_id` | uuid FK | references orders-service orders |
| `customer_name` | varchar | |
| `item` | varchar | |
| `rider_status` | varchar | |
| `created_at` | timestamptz | |

## Cross-service references

```
auth-service.users.id  ←  orders-service.orders.user_id
item-service.menu_items.id  ←  orders-service.orders.menu_item_id
orders-service.orders.id  ←  kitchen-service.tickets.order_id
orders-service.orders.id  ←  rider-service.dispatches.order_id
```

These are logical references enforced at the application layer, not database-level foreign keys. Each service only queries its own database.
