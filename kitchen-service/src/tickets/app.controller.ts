import { Controller } from '@nestjs/common';
import { AppService } from './app.service';
import { EventPattern, Payload } from '@nestjs/microservices';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @EventPattern('order_created')
  async handleOrderCreated(
    @Payload()
    data: {
      orderId: string;
      customerName: string;
      itemName: string;
      quantity: number;
      street: string;
      area: string;
    },
  ) {
    console.log('kitchen received order: ' + data.orderId);

    await this.appService.processOrder(data);
  }
}
