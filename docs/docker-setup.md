# Docker Setup

Run all services locally with Docker Compose.

## Prerequisites

- Docker Desktop installed and running
- `.env` file with your database URLs (see [database-setup.md](./database-setup.md))

## 1. Configure environment

Copy the example env file and fill in your Neon database URLs:

```bash
cd main
cp .env.example .env
```

Edit `.env` with your actual connection strings:

```
AUTH_DATABASE_URL=postgresql://auth_role:password@ep-xxx.aws.neon.tech/auth_db?sslmode=require
ITEM_DATABASE_URL=postgresql://item_role:password@ep-xxx.aws.neon.tech/item_db?sslmode=require
ORDERS_DATABASE_URL=postgresql://orders_role:password@ep-xxx.aws.neon.tech/orders_db?sslmode=require
KITCHEN_DATABASE_URL=postgresql://kitchen_role:password@ep-xxx.aws.neon.tech/kitchen_db?sslmode=require
RIDER_DATABASE_URL=postgresql://rider_role:password@ep-xxx.aws.neon.tech/rider_db?sslmode=require
```

## 2. Start all services

```bash
docker-compose up --build -d
```

The `--build` flag builds images before starting. First run takes a few minutes.

This starts:

| Service | Port | Purpose |
|---------|------|---------|
| rabbitmq | 5672, 15672 | Message broker |
| auth-service | 3000 | User registration/login |
| item-service | 3001 | Menu browsing |
| orders-service | 3002 | Order placement |
| kitchen-service | 3010 | RMQ consumer, health endpoint only |
| rider-service | 3011 | RMQ consumer, health endpoint only |

## 3. Verify services are running

```bash
docker-compose ps
```

All services should show `Up` status.

Check health endpoints:

```bash
# Liveness (is process alive?)
curl http://localhost:3000/health
curl http://localhost:3001/health
curl http://localhost:3002/health

# Readiness (is DB + RMQ reachable?)
curl http://localhost:3000/health/readiness
curl http://localhost:3002/health/readiness

# Kitchen/Rider health (separate ports)
curl http://localhost:3010/health
curl http://localhost:3011/health
```

## 4. View logs

```bash
# All services
docker-compose logs -f

# Single service
docker-compose logs -f orders-service

# RabbitMQ management UI
open http://localhost:15672
# Login: guest / guest
```

## 5. Stop services

```bash
docker-compose down
```

Add `-v` to also remove volumes (resets RabbitMQ):

```bash
docker-compose down -v
```

## 6. Rebuild after code changes

```bash
docker-compose up --build -d
```

Or rebuild a single service:

```bash
docker-compose up --build -d orders-service
```

## Project structure

```
main/
├── docker-compose.yml
├── auth-service/
│   ├── Dockerfile
│   └── ...
├── item-service/
│   ├── Dockerfile
│   └── ...
├── orders-service/
│   ├── Dockerfile
│   └── ...
├── kitchen-service/
│   ├── Dockerfile
│   └── ...
└── rider-service/
    ├── Dockerfile
    └── ...
```

Each service has its own `Dockerfile`. The `docker-compose.yml` at the root orchestrates everything.

## Service discovery

Services communicate via Docker DNS:

- `orders-service` → `http://item-service:3001` (fetches menu items)
- `orders-service` → `rabbitmq:5672` (emits to kitchen queue)
- `kitchen-service` → `rabbitmq:5672` (listens on kitchen_queue)
- `rider-service` → `rabbitmq:5672` (listens on rider_queue)

No hardcoded `localhost` in production — Docker networking handles it.

## Troubleshooting

**Service won't start:**
```bash
docker-compose logs orders-service
```

**RabbitMQ not ready:**
Wait 10-15 seconds after `docker-compose up`. The health check waits for RabbitMQ to be ready before starting services.

**Connection refused:**
Ensure `.env` has the correct database URLs and RabbitMQ is running:

```bash
docker-compose ps rabbitmq
curl http://localhost:15672
```

**Port conflicts:**
If ports 3000-3002 or 3010-3011 are in use, stop local processes or change ports in `docker-compose.yml`.
