import { Controller, Logger } from '@nestjs/common';
import { AppService } from './app.service';
import { EventPattern, Payload } from '@nestjs/microservices';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);

  constructor(private readonly appService: AppService) {}

  @EventPattern('order_ready')
  async handle(
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
    this.logger.log('Rider received dispatch for order : ' + data.orderId);

    await this.appService.dispatchRider(data);
  }
}
