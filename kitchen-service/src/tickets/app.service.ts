import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';
import { DbService } from '../db/db.service';
import { tickets } from '../db/schema';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

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
    let ticket;
    try {
      [ticket] = await this.dbService.db
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
    } catch (error) {
      this.logger.error(
        `Failed to create ticket for order ${data.orderId}`,
        error as Error,
      );
      throw error;
    }

    this.logger.log('Ticket saved to kitchen DB : ' + ticket.id);

    await new Promise((res) => setTimeout(res, 2000));

    try {
      await firstValueFrom(
        this.riderClient
          .emit('order_ready', {
            orderId: data.orderId,
            customerName: data.customerName,
            itemName: data.itemName,
            quantity: data.quantity,
            street: data.street,
            area: data.area,
          })
          .pipe(timeout(5000)),
      );
      this.logger.log('Event emitted to rider_queue (order ready)');
    } catch (error) {
      this.logger.error(
        `Ticket ${ticket.id} created but could not notify rider`,
        error as Error,
      );
    }
  }
}
