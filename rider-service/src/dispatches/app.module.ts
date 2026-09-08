import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import Joi from 'joi';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DbService } from '../db/db.service';
import { ConsulService } from '../consul/consul.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        DATABASE_URL: Joi.string().required(),
        PORT: Joi.number().default(3000),
        RABBITMQ_URL: Joi.string().default('amqp://guest:guest@localhost:5672'),
        CONSUL_URL: Joi.string().default('http://localhost:8500'),
        SERVICE_NAME: Joi.string().default('rider-service'),
        SERVICE_ADDRESS: Joi.string().default('rider-service'),
        SERVICE_PORT: Joi.number().default(3011),
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test')
          .default('development'),
      }),
    }),
  ],
  controllers: [AppController],
  providers: [AppService, DbService, ConsulService],
})
export class AppModule {}
