import { Controller, Logger } from '@nestjs/common';
import { AppService } from './app.service';
import { EventPattern, Payload } from '@nestjs/microservices';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);

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
    this.logger.log('kitchen received order: ' + data.orderId);

    await this.appService.processOrder(data);
  }
}
