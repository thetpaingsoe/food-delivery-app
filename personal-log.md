### Notes

1. we can create database as seperate module
2. same for rabbit mq, we can create separate module
sample
my-project/
├── apps/                         # Independent Microservices
│   ├── gateway-service/          # Public REST API / Entry point
│   │   └── src/app.module.ts     
│   ├── order-service/            # Handles order business logic
│   │   └── src/app.module.ts     
│   └── kitchen-service/          # Handles kitchen processing
│       └── src/app.module.ts     
│
└── libs/                         # Shared Code Modules (Libraries)
    ├── database/                 # Shared database connections
    │   └── src/database.module.ts
    └── rmq/                      # Shared RabbitMQ configuration module
        └── src/rmq.module.ts