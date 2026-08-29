# Test Setup

Each service has a separate test database. Tests never touch dev/production data.

## 1. Create test databases and roles

```sql
CREATE ROLE auth_role_test WITH LOGIN PASSWORD 'your_password';
CREATE DATABASE auth_db_test OWNER auth_role_test;

CREATE ROLE item_role_test WITH LOGIN PASSWORD 'your_password';
CREATE DATABASE item_db_test OWNER item_role_test;

CREATE ROLE orders_role_test WITH LOGIN PASSWORD 'your_password';
CREATE DATABASE orders_db_test OWNER orders_role_test;

CREATE ROLE kitchen_role_test WITH LOGIN PASSWORD 'your_password';
CREATE DATABASE kitchen_db_test OWNER kitchen_role_test;

CREATE ROLE rider_role_test WITH LOGIN PASSWORD 'your_password';
CREATE DATABASE rider_db_test OWNER rider_role_test;
```

## 2. Configure test environment

Each service has a `.env.test` file. Copy from `.env` and point to the test database:

```bash
cp auth-service/.env auth-service/.env.test
```

Edit `.env.test`:

```
DATABASE_URL=postgresql://auth_role_test:password@ep-xxx.us-east-2.aws.neon.tech/auth_db_test?sslmode=require
PORT=3000
JWT_SECRET=test-secret-for-testing-only
JWT_EXPIRES_IN=1h
NODE_ENV=test
```

Key differences from `.env`:
- Database name ends with `_test`
- Role ends with `_test`
- `JWT_SECRET` can be a simple string (not production secret)
- `NODE_ENV=test`

## 3. Run migrations on test databases

```bash
cd auth-service
npm run db:migrate:test

cd ../orders-service
npm run db:migrate:test

# Repeat for each service
```

This reads `.env.test` and migrates the test database only.

## 4. Run tests

```bash
cd auth-service
npm run test:e2e
```

What happens:
1. Jest starts
2. `.env.test` is loaded automatically
3. Tests run against the test database
4. Table is cleaned before each test (safe to repeat)

### Run all services' tests

```bash
cd auth-service && npm run test:e2e
cd ../orders-service && npm run test:e2e
cd ../kitchen-service && npm run test:e2e
cd ../rider-service && npm run test:e2e
```

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `Config validation error` | Check `NODE_ENV=test` in `.env.test` |
| Tests hit dev database | Verify `.env.test` points to `_test` database |
| `relation "users" does not exist` | Run `npm run db:migrate:test` first |
| Port conflict | Stop dev server before running tests |
