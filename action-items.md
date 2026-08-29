# Food Delivery App — Production Readiness Action Plan

**Tech Stack:** NestJS 11 / TypeScript 5.7 / Drizzle ORM / Neon Postgres / RabbitMQ / React (Vite) / Tailwind CSS
**Recommended Stack:** Pino + Joi + pnpm + Jest

**Services (5 total):**
| Service | Database | Transport | Port | Owns |
|---------|----------|-----------|------|------|
| auth-service | auth-db | HTTP | 3000 | Users, JWT |
| item-service | item-db | HTTP | 3001 | Menu items, categories |
| orders-service | orders-db | HTTP + RMQ | 3002 | Orders |
| kitchen-service | kitchen-db | RMQ | — | Tickets |
| rider-service | rider-db | RMQ | — | Dispatches |

---

## 📊 Progress Tracker

**Overall:** `2 / 89 items completed (2%)`

```
Phase 1 — Foundation       [██░░░░░░░░]  2/21  (10%)
Phase 2 — Operations       [░░░░░░░░░░]  0/20  (0%)
Phase 3 — Observability    [░░░░░░░░░░]  0/13  (0%)
Phase 4 — Resilience       [░░░░░░░░░░]  0/15  (0%)
Phase 5 — Organization     [░░░░░░░░░░]  0/8   (0%)
Phase 6 — Frontend         [░░░░░░░░░░]  0/8   (0%)
Phase 7 — Integration      [░░░░░░░░░░]  0/4   (0%)
```

> Update the `#/#` counts and replace `░` with `█` as you complete items.

**Last action completed:** 1.1 — Verify .env git status + update action items | **Date:** 2026-06-22

---

## Phase 1 — Foundation (Security & Error Handling)

### 1.1 Create .env.example files
- [x] Verify `.env` is listed in `.gitignore` (confirmed — already done in all 3 services)
- [x] Confirm `.env` files are not tracked by git (confirmed — `git ls-files` shows none tracked)
- [x] Create `.env.example` for each service listing all required env vars with placeholder values
- [ ] Create auth-service with its own database (users table)
- [ ] Create item-service with its own database (menu items + categories tables)

### 1.2 Add `@nestjs/config` with Joi validation
- [x] Install `@nestjs/config` + `joi` in all 3 services
- [x] Register `ConfigModule.forRoot({ validationSchema })` in each `AppModule`
- [x] Define a Joi schema validating: `DATABASE_URL`, `PORT` (orders only), `RABBITMQ_URL`, `NODE_ENV`
- [x] Move all `process.env.*` access to `ConfigService` injection
- [x] Move RMQ credentials to env vars (stop hardcoding `guest:guest`)

### 1.3 Add validation pipe
- [x] Install `class-validator` + `class-transformer` in orders-service
- [x] Create `CreateOrderDto` in `src/orders/dto/create-order.dto.ts` with `@IsString()`, `@IsInt()`, `@Min(1)` etc.
- [x] Register `ValidationPipe` globally in `orders-service/src/main.ts`

### 1.4 Add global exception filter
- [ ] Create `src/common/filters/all-exceptions.filter.ts` in each service
- [ ] Register it as a global filter via `app.useGlobalFilters()` in `main.ts`
- [ ] Log errors with structured format (prepares for Pino later)

### 1.5 Add error handling to business logic
- [ ] Wrap all DB inserts in try/catch in all 3 `app.service.ts` files
- [ ] Wrap all RMQ `.emit()` calls in try/catch
- [ ] `await` the `ClientProxy.emit()` promise (or `.catch()`) — orders-service line 26
- [ ] Add error recovery / graceful degradation where appropriate

### 1.6 Clean up code issues
- [ ] Remove unused import `duration` from `drizzle-orm/gel-core` in:
  - `orders-service/src/app.module.ts` (line 5)
  - `rider-service/src/main.ts` (line 6)
- [ ] Fix typos:
  - `kitchen-service/src/main.ts` line 18: `"kitchen servie"` → `"kitchen service"`
  - `rider-service/src/main.ts` line 24: `"Rider Serivce"` → `"Rider Service"`
- [ ] Standardize column naming: `kitchen-service/src/db/schema.ts` line 6: `customName` → `customerName`

---

## Phase 2 — Operations (Graceful Shutdown, Health Checks, Docker)

### 2.1 Standardize on pnpm
- [ ] For `orders-service` and `kitchen-service`:
  - Delete `package-lock.json`
  - Run `pnpm import` to generate `pnpm-lock.yaml` from existing deps
  - Add `pnpm-workspace.yaml` at `main/` level (rider already has it)
- [ ] Create root `pnpm-workspace.yaml`:
  ```yaml
  packages:
    - 'orders-service'
    - 'kitchen-service'
    - 'rider-service'
  ```

### 2.2 Enable graceful shutdown
- [ ] Add `app.enableShutdownHooks()` in all 3 `main.ts` files
- [ ] Register `SIGTERM`/`SIGINT` handlers that:
  - Close RMQ connections
  - Close DB connections
  - Wait for in-flight requests to complete
  - Exit cleanly

### 2.3 Add health check endpoints
- [ ] Install `@nestjs/terminus` in all 3 services
- [ ] Create health controller with:
  - `GET /health` — liveness probe (service is running)
  - `GET /health/readiness` — readiness probe (DB + RMQ are reachable)
- [ ] Register `TerminusModule` with `DrizzleHealthIndicator` (or custom DB health check) and `RabbitMQHealthIndicator`
- [ ] Expose health endpoints on a different port (e.g., 3001) or via a separate admin server to avoid conflating with business traffic

### 2.4 Add Dockerfiles
- [ ] Create `main/Dockerfile` (multi-stage build, shared across services with build args):
  ```dockerfile
  # Build stage
  FROM node:22-alpine AS build
  WORKDIR /app
  COPY package.json pnpm-lock.yaml ./
  RUN pnpm install
  COPY . .
  RUN pnpm build
  
  # Production stage
  FROM node:22-alpine
  WORKDIR /app
  COPY --from=build /app/dist ./dist
  COPY --from=build /app/node_modules ./node_modules
  EXPOSE 3000
  CMD ["node", "dist/main"]
  ```
- [ ] Create service-specific Dockerfiles that set the correct entry point

### 2.5 Update docker-compose
- [ ] Add service definitions for all 5 services in `docker-compose.yml`
- [ ] Set up proper networking so services can reach each other by hostname
- [ ] Define env vars per service (or use `.env` file)
- [ ] Add healthcheck for RabbitMQ

### 2.6 Service Discovery
- [ ] Set up Consul or DNS-based service discovery in Docker
- [ ] Each service registers itself on startup with name + host + port
- [ ] orders-service discovers item-service dynamically instead of hardcoded URL
- [ ] Add health check registration for each service
- [ ] Handle service deregistration on shutdown

### 2.7 Enable strict TypeScript
- [ ] In all 5 `tsconfig.json` files:
  - Set `"strict": true` (which enables `noImplicitAny`, `strictNullChecks`, etc.)
  - Fix all resulting type errors
- [ ] Consider adding `"noUnusedLocals": true` and `"noUnusedParameters": true` for extra safety

---

## Phase 3 — Observability (Logging, Tracing, Docs)

### 3.1 Replace console.log with structured logging
- [ ] Install `@nestjs/pino` + `pino-pretty` (dev) in all 3 services
- [ ] Register `LoggerModule.forRoot()` in each `AppModule`
- [ ] Replace all `console.log()` calls with `this.logger.log()` / `.warn()` / `.error()`
- [ ] Ensure logs are JSON-formatted in production, pretty-printed in development (via `NODE_ENV`)

### 3.2 Add correlation IDs across services
- [ ] In orders-service (HTTP entry point):
  - Create middleware that generates a `correlationId` (UUID) for each incoming request
  - Attach it to `req.headers['x-correlation-id']`
  - Inject it into logger context
- [ ] Pass `correlationId` in RMQ message payloads
- [ ] In kitchen-service and rider-service:
  - Read `correlationId` from incoming RMQ messages
  - Set it on the logger context for traceability
- [ ] This lets you trace a single order through all 3 services

### 3.3 Add Swagger/OpenAPI docs
- [ ] Install `@nestjs/swagger` in orders-service
- [ ] Add `SwaggerModule.setup('api', app, document)` in `main.ts`
- [ ] Decorate `CreateOrderDto` with `@ApiProperty()` decorators
- [ ] Decorate `AppController.createOrder()` with `@ApiOperation()`, `@ApiResponse()`
- [ ] Access docs at `http://localhost:3000/api` (Swagger UI)

---

## Phase 4 — Resilience (Retry, DLQ, Rate Limiting)

### 4.1 Add dead-letter queues for RMQ
- [ ] Configure DLQ for `kitchen_queue`: messages that fail processing go to `kitchen_queue.dlq`
- [ ] Configure DLQ for `rider_queue`: messages that fail go to `rider_queue.dlq`
- [ ] Set up a DLQ consumer that logs/re-queues alerts

### 4.2 Add retry logic
- [ ] Implement retry with exponential backoff for DB operations
- [ ] For RMQ consumers: if processing fails, reject the message (it goes to DLQ after max retries)
- [ ] Consider using a simple retry wrapper or library (e.g., `p-retry`)

### 4.3 Add rate limiting
- [ ] Install `@nestjs/throttler` in orders-service
- [ ] Configure `ThrottlerModule` with sensible defaults (e.g., 10 requests/60 seconds per IP)
- [ ] This protects the public `POST /orders` endpoint from abuse

### 4.4 Add circuit breaker for inter-service calls
- [ ] Install `opossum` in orders-service
- [ ] Wrap item-service HTTP calls with circuit breaker
- [ ] Configure: 5 failures → open circuit for 30s → half-open → retry
- [ ] Return meaningful error when circuit is open (503 Service Unavailable)
- [ ] Add circuit breaker metrics/logging for observability

### 4.5 Add saga pattern (compensation)
- [ ] orders-service emits `order_created` with a saga ID
- [ ] If kitchen-service fails or rejects: emits `order_failed` with saga ID
- [ ] orders-service listens for `order_failed`, updates order status to `cancelled`
- [ ] Add `cancelled` status to order status enum
- [ ] Add compensation logging for observability
- [ ] Handle partial failures (e.g., kitchen succeeds but rider fails)

---

## Phase 5 — Code Organization & Quality

### 5.1 Split into proper domain modules
- **orders-service example:**
  ```
  src/
    orders/
      orders.module.ts
      orders.controller.ts
      orders.service.ts
      dto/
        create-order.dto.ts
        update-order.dto.ts
    kitchen-client/
      kitchen-client.module.ts
      kitchen-client.service.ts   # wraps RMQ ClientProxy
    common/
      filters/
        all-exceptions.filter.ts
      pipes/
        validation.pipe.ts
  ```
- **Apply similar structure to kitchen-service and rider-service**

### 5.2 Move DTOs to separate files
- [ ] All DTO classes in dedicated `dto/` directories
- [ ] All response types in dedicated `interfaces/` or `types/` directories

### 5.3 Fix and expand tests

**Feature tests (preferred — like Laravel feature tests, uses supertest):**
- [ ] Write feature tests for all 3 services:
  - `orders-service`: `POST /orders` — validates body, returns correct response, rejects bad input
  - `kitchen-service`: `order_created` handler — verifies ticket creation flow
  - `rider-service`: `order_ready` handler — verifies dispatch creation flow
- [ ] Mock DB + RMQ at the module level in feature tests (not real connections)

**Unit tests (optional — for service logic edge cases):**
- [ ] Add unit tests for service methods with mocked DB + RMQ
- [ ] Aim for test structure: feature (behavior, survives refactors) + unit (edge cases, faster feedback)

### 5.4 Add CI/CD pipeline
- [ ] Create `.github/workflows/ci.yml`:
  ```yaml
  name: CI
  on: [push, pull_request]
  jobs:
    test:
      runs-on: ubuntu-latest
      services:
        rabbitmq:
          image: rabbitmq:3-management
          ports: ['5672:5672']
      steps:
        - uses: actions/checkout@v4
        - uses: pnpm/action-setup@v4
        - uses: actions/setup-node@v4
          with: { node-version: 22 }
        - run: pnpm install
        - run: pnpm lint
        - run: pnpm test
        - run: pnpm build
  ```

### 5.5 Standardize READMEs
- [ ] Replace NestJS boilerplate README with actual project documentation:
  - What the service does
  - Prerequisites (Node, pnpm, Docker)
  - Setup steps
  - Available scripts
  - Environment variables reference

---

## Phase 6 — Frontend (React + Vite + Tailwind)

### 6.1 Project setup
- [ ] Create `frontend/` directory with Vite + React + TypeScript
- [ ] Install Tailwind CSS for styling
- [ ] Set up React Router for navigation
- [ ] Configure API proxy to backend services

### 6.2 Auth pages
- [ ] Build login page (email + password form)
- [ ] Build register page (name + email + password form)
- [ ] Store JWT in localStorage/httpOnly cookie
- [ ] Add auth context/hook for managing user state
- [ ] Protected routes: redirect to login if not authenticated

### 6.3 Menu browsing
- [ ] Build menu page with category tabs (Food / Drinks)
- [ ] Fetch items from item-service API
- [ ] Display items with image, name, description, price
- [ ] Add to cart functionality (client-side state)

### 6.4 Order placement
- [ ] Build cart/checkout page
- [ ] Show cart items with quantity, unit price, total
- [ ] Delivery address form (street + area)
- [ ] Place order button → calls orders-service API
- [ ] Show order confirmation with order ID

### 6.5 Order tracking
- [ ] Build order history page (list of user's orders)
- [ ] Build order detail page with status timeline
- [ ] Poll orders-service for status updates (pending → cooking → dispatched → delivered)
- [ ] Show estimated time or status messages

### 6.6 UI polish
- [ ] Responsive design (mobile-first)
- [ ] Loading states and error handling
- [ ] Toast notifications for actions
- [ ] Clean, modern food delivery UI

---

## Phase 7 — Integration Testing

### 7.1 End-to-end flow tests
- [ ] Test full order flow: register → login → browse menu → place order → kitchen processes → rider dispatched
- [ ] Test auth flows: register, login, invalid credentials, token expiration
- [ ] Test menu browsing: list items, filter by category
- [ ] Test order placement: valid order, invalid item, missing address

### 7.2 Failure scenario tests
- [ ] Test circuit breaker: item-service down → orders fail gracefully
- [ ] Test saga compensation: kitchen fails → order cancelled
- [ ] Test DLQ: message fails → goes to dead letter queue
- [ ] Test service discovery: service goes down → requests route elsewhere

### 7.3 Performance baseline
- [ ] Measure order placement latency (with item-service call)
- [ ] Measure menu fetch latency
- [ ] Identify bottlenecks

---

## Reference: Critical Files & Line Numbers

| File | Line | Issue |
|------|------|-------|
| `main/orders-service/.env` | 1 | Live DB creds committed |
| `main/kitchen-service/.env` | 1 | Live DB creds committed |
| `main/rider-service/.env` | 1 | Live DB creds committed |
| `main/orders-service/src/app.module.ts` | 5 | Unused `duration` import |
| `main/orders-service/src/app.module.ts` | 14 | Hardcoded `guest:guest` |
| `main/orders-service/src/app.service.ts` | 26 | RMQ emit not awaited |
| `main/orders-service/src/app.controller.ts` | 4-8 | DTO inline, no validation |
| `main/kitchen-service/src/main.ts` | 11, 18 | Hardcoded RMQ + typo |
| `main/kitchen-service/src/db/schema.ts` | 6 | `customName` vs `customerName` |
| `main/rider-service/src/main.ts` | 6, 14, 24 | Unused import + hardcoded RMQ + typo |
| All `tsconfig.json` | 21 | `noImplicitAny: false` |
| All `*.spec.ts` + `*.e2e-spec.ts` | various | Stale tests referencing `getHello()` |

---

## Architecture Flow (for reference)

```
Frontend (React)
  ↓ HTTP
auth-service (register/login) → returns JWT
  ↓ HTTP
item-service (browse menu) → returns items
  ↓ HTTP + JWT
orders-service (place order)
  → calls item-service (fetch item details) [with circuit breaker]
  → saves order to DB (with item snapshot)
  → emits "order_created" → RMQ (kitchen_queue)
    ↓
kitchen-service
  → creates ticket in DB
  → waits 2s (simulates cooking)
  → emits "order_ready" → RMQ (rider_queue)
    ↓
rider-service
  → assigns random rider
  → creates dispatch record in DB

Saga Compensation:
  If kitchen-service fails → emits "order_failed"
  → orders-service listens → updates order status to "cancelled"
```

---

*Created: 2026-06-22*
*Last action completed: —*
