import { Controller } from '@nestjs/common';
import { AppService } from './app.service';
import { EventPattern, Payload } from '@nestjs/microservices';

@Controller()
export class AppController {
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
    console.log('Rider received dispatch for order : ' + data.orderId);

    await this.appService.dispatchRider(data);
  }
}
