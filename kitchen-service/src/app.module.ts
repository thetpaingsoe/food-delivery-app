import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: "RIDER_SERVICE",
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://guest:guest@localhost:5672'],
          queue: "order_ready",
          queueOptions: {duration: false}
        }
      }
    ])
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
