# SwiftBite

Real-time food delivery on NestJS microservices — order → kitchen → rider.
Neon Postgres per service, RabbitMQ events, Consul service discovery,
structured JSON logging with end-to-end correlation IDs.

## Architecture

```mermaid
flowchart LR
    FE[Frontend<br/>Phase 6] -->|HTTP + JWT| AUTH[auth-service<br/>:3000]
    FE -->|HTTP| ITEM[item-service<br/>:3001]
    FE -->|HTTP + JWT| ORDERS[orders-service<br/>:3002]
    ORDERS -->|HTTP: fetch item| ITEM
    ORDERS -->|order_created| KQ[(kitchen_queue)]
    KQ --> KITCHEN[kitchen-service<br/>RMQ + health :3010]
    KITCHEN -->|order_ready| RQ[(rider_queue)]
    RQ --> RIDER[rider-service<br/>RMQ + health :3011]
    ORDERS -.->|Consul lookup| CONSUL([Consul<br/>:8500])
    ITEM -.->|registers| CONSUL
```

One `correlationId` rides every order from `POST /orders` through all three
databases and log streams — see [observability.md](./docs/observability.md).

## Services

| Service | Database | Transport | Port | Owns |
|---------|----------|-----------|------|------|
| auth-service | auth_db | HTTP | 3000 | Users, JWT |
| item-service | item_db | HTTP | 3001 | Menu items, categories |
| orders-service | orders_db | HTTP + RMQ | 3002 | Orders |
| kitchen-service | kitchen_db | RMQ (health :3010) | — | Tickets |
| rider-service | rider_db | RMQ (health :3011) | — | Dispatches |

## Documentation

| Doc | Description |
|-----|-------------|
| [Database Setup](./docs/database-setup.md) | Neon project, databases, roles, migrations |
| [Database Schema](./docs/database-schema.md) | Table definitions, columns, types, relationships |
| [Docker Setup](./docs/docker-setup.md) | Docker Compose, running all services, troubleshooting |
| [Test Setup](./docs/test-setup.md) | Test databases, .env.test, running tests |
| [API Collections](./docs/api-collections/) | Postman API collections |
| [Observability](./docs/observability.md) | JSON logging, correlation IDs, tracing an order |

## Quick Start

### Docker (recommended)

```bash
cd main
cp .env.example .env  # Fill in your database URLs
docker-compose up -d
```

See [docker-setup.md](./docs/docker-setup.md) for full instructions.

### Local development

1. Create databases and roles — see [database-setup.md](./docs/database-setup.md)
2. Configure `.env` for each service
3. Run migrations: `pnpm db:migrate`
4. Seed test users: `pnpm db:seed` (in `auth-service/`)
5. Start dev server: `pnpm start:dev`

Seeded logins (passwords pass the backend rule):

| Email | Password | Role |
|-------|----------|------|
| admin@swiftbite.local | Admin123! | admin |
| kitchen@swiftbite.local | Kitchen123! | kitchen |
| rider@swiftbite.local | Rider123! | rider |
| customer@swiftbite.local | Customer123! | customer |

## Testing

```bash
cd item-service
pnpm test         # unit tests
pnpm test:e2e     # feature tests (needs test DBs)
```

See [test-setup.md](./docs/test-setup.md) for full instructions.
