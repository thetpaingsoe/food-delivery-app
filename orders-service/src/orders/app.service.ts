import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { orders } from '../db/schema';
import { DbService } from '../db/db.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class AppService {
  constructor(
    @Inject('KITCHEN_SERVICE') private readonly kitchenClient: ClientProxy,
    private readonly dbService: DbService,
  ) {}

  async createOrder(dto: CreateOrderDto) {
    const [order] = await this.dbService.db
      .insert(orders)
      .values({
        customerName: dto.customerName,
        item: dto.item,
        quantity: dto.quantity,
        status: 'pending',
      })
      .returning();

    console.log(`Order saved to DB: ${order.id}`);

    this.kitchenClient.emit('order_created', {
      orderId: order.id,
      customerName: order.customerName,
      item: order.item,
      quantity: order.quantity,
    });

    console.log('Event emitted to kitchen queue');

    return { success: true, orderId: order.id };
  }
}
