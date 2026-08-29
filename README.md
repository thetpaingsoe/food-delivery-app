# Food Delivery App

NestJS microservices architecture with Neon Postgres and RabbitMQ.

## Services

| Service | Database | Transport | Port | Owns |
|---------|----------|-----------|------|------|
| auth-service | auth_db | HTTP | 3000 | Users, JWT |
| item-service | item_db | HTTP | 3001 | Menu items, categories |
| orders-service | orders_db | HTTP + RMQ | 3002 | Orders |
| kitchen-service | kitchen_db | RMQ | — | Tickets |
| rider-service | rider_db | RMQ | — | Dispatches |

## Documentation

| Doc | Description |
|-----|-------------|
| [Database Setup](./docs/database-setup.md) | Neon project, databases, roles, migrations |
| [Test Setup](./docs/test-setup.md) | Test databases, .env.test, running tests |

## Quick Start

1. Create databases and roles — see [database-setup.md](./docs/database-setup.md)
2. Configure `.env` for each service
3. Run migrations: `npm run db:migrate`
4. Start dev server: `npm run start:dev`

## Testing

```bash
cd auth-service
npm run test:e2e
```

See [test-setup.md](./docs/test-setup.md) for full instructions.
