import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { DbService } from '../db/db.service';
import { tickets } from '../db/schema';

@Injectable()
export class AppService {
  constructor(
    @Inject('RIDER_SERVICE') private readonly riderClient: ClientProxy,
    private readonly dbService: DbService,
  ) {}

  async processOrder(data: {
    orderId: string;
    customerName: string;
    itemName: string;
    quantity: number;
    street: string;
    area: string;
  }) {
    const [ticket] = await this.dbService.db
      .insert(tickets)
      .values({
        orderId: data.orderId,
        customerName: data.customerName,
        itemName: data.itemName,
        quantity: data.quantity,
        street: data.street,
        area: data.area,
        status: 'received',
      })
      .returning();

    console.log('Ticket saved to kitchen DB : ' + ticket.id);

    await new Promise((res) => setTimeout(res, 2000));

    this.riderClient.emit('order_ready', {
      orderId: data.orderId,
      customerName: data.customerName,
      itemName: data.itemName,
      quantity: data.quantity,
      street: data.street,
      area: data.area,
    });

    console.log('Event emitted to rider_queue ( order ready)');
  }
}
