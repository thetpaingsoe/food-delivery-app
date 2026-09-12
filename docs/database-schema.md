# Database Schema

Each service owns its own database. No cross-service direct DB access.

## auth-service — `users`

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | default `gen_random_uuid()` |
| `name` | varchar(100) | not null |
| `email` | varchar(255) | not null, unique |
| `password_hash` | varchar(255) | bcrypt hashed, not null |
| `created_at` | timestamp | default now() |

## item-service — `categories` + `menu_items`

### `categories`

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | default `gen_random_uuid()` |
| `name` | varchar(100) | not null, unique ('Food', 'Drinks') |
| `created_at` | timestamp | default now() |

### `menu_items`

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | default `gen_random_uuid()` |
| `name` | varchar(255) | not null |
| `description` | text | not null |
| `price` | integer | not null, minor units (e.g. cents) |
| `category_id` | uuid FK | not null, references `categories.id` with cascade delete |
| `image_url` | varchar(500) | not null, URL to stock photo |
| `available` | boolean | default true |
| `created_at` | timestamp | default now() |

**Seed data:** 6-8 items total (3-4 per category)

## orders-service — `orders`

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | default `gen_random_uuid()` |
| `customer_name` | varchar(100) | not null |
| `menu_item_id` | uuid | not null, logical ref to item-service `menu_items` |
| `item_name` | varchar(255) | not null, snapshot at order time |
| `item_price` | numeric | not null, snapshot at order time (backend owns price) |
| `quantity` | int | not null, min 1 |
| `total_price` | numeric | not null, calculated: item_price * quantity |
| `street` | varchar(255) | not null, delivery address |
| `area` | varchar(255) | not null, delivery area/ward |
| `status` | varchar(50) | not null, default `pending` |
| `correlation_id` | varchar(36) | nullable, end-to-end trace ID (NULL on pre-feature rows) |
| `created_at` | timestamptz | default now() |

**Key decisions:**
- Backend fetches item from item-service and calculates price (never trust client)
- Item name/price snapshotted at order time (menu price changes don't affect old orders)
- `cancelled` status reserved for saga compensation (4.5)

## kitchen-service — `tickets`

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | default `gen_random_uuid()` |
| `order_id` | uuid | not null, logical ref to orders-service `orders` |
| `customer_name` | varchar(100) | not null |
| `item_name` | varchar(255) | not null |
| `quantity` | int | not null |
| `street` | varchar(255) | not null |
| `area` | varchar(255) | not null |
| `status` | varchar(50) | not null, default `received` |
| `correlation_id` | varchar(36) | nullable, forwarded from `order_created` |
| `created_at` | timestamptz | default now() |

## rider-service — `dispatches`

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | default `gen_random_uuid()` |
| `order_id` | uuid | not null, logical ref to orders-service `orders` |
| `customer_name` | varchar(100) | not null |
| `item_name` | varchar(255) | not null |
| `quantity` | int | not null |
| `street` | varchar(255) | not null |
| `area` | varchar(255) | not null |
| `status` | varchar(50) | not null, default `dispatched` (field is `riderStatus` in code) |
| `correlation_id` | varchar(36) | nullable, forwarded from `order_ready` |
| `created_at` | timestamptz | default now() |

## Cross-service references

```
item-service.menu_items.id  ←  orders-service.orders.menu_item_id
orders-service.orders.id  ←  kitchen-service.tickets.order_id
orders-service.orders.id  ←  rider-service.dispatches.order_id
```

These are logical references enforced at the application layer, not database-level
foreign keys — except `menu_items.category_id`, which is a real FK with cascade delete.
Each service only queries its own database.
