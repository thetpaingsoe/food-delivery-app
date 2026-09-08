import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Joi from 'joi';
import { DbService } from '../db/db.service';
import { HealthModule } from '../health/health.module';
import { ConsulService } from '../consul/consul.service';
import { DiscoveryService } from '../consul/discovery.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        DATABASE_URL: Joi.string().required(),
        PORT: Joi.number().default(3000),
        RABBITMQ_URL: Joi.string().default('amqp://guest:guest@localhost:5672'),
        ITEM_SERVICE_URL: Joi.string().default('http://localhost:3001'),
        CONSUL_URL: Joi.string().default('http://localhost:8500'),
        SERVICE_NAME: Joi.string().default('orders-service'),
        SERVICE_ADDRESS: Joi.string().default('orders-service'),
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test')
          .default('development'),
      }),
    }),
    HttpModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        baseURL: configService.get<string>('ITEM_SERVICE_URL'),
        timeout: 5000,
      }),
      inject: [ConfigService],
    }),
    ClientsModule.registerAsync([
      {
        name: 'KITCHEN_SERVICE',
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('RABBITMQ_URL')!],
            queue: 'kitchen_queue',
            queueOptions: {
              durable: configService.get<string>('NODE_ENV') === 'production',
            },
          },
        }),
        inject: [ConfigService],
      },
    ]),
    HealthModule,
  ],
  controllers: [AppController],
  providers: [AppService, DbService, ConsulService, DiscoveryService],
})
export class AppModule {}
