import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { DbService } from 'src/db/db.service';
import { tickets } from 'src/db/schema';

@Injectable()
export class AppService {

  constructor(
    @Inject("RIDER_SERVICE") private readonly riderClient: ClientProxy, 
    private readonly dbService: DbService
  ) {}
  
  async processOrder(data: {
    orderId: string, 
    customerName : string,
    item : string, 
    quantity: number
  }) {
    const [ticket] = await this.dbService.db.insert(tickets)
    .values({
      orderId: data.orderId, 
      customName: data.customerName, 
      item: data.item,
      status: "received"
     }).returning();

     console.log("Ticket saved to kitchen DB : " + ticket.id)

     await new Promise((res) => setTimeout(res, 2000))

     this.riderClient.emit("order_ready", {
      orderId : data.orderId,
      customerName : data.customerName, 
      item: data.item,
     })

     console.log("Event emitted to rider_queue ( order ready)")
  }
}
