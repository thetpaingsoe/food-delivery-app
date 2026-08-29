import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { orders } from '../db/schema';
import { DbService } from '../db/db.service';
import { CreateOrderDto } from './dto/create-order.dto';

interface MenuItem {
  id: string;
  name: string;
  price: number;
}

@Injectable()
export class AppService {
  constructor(
    @Inject('KITCHEN_SERVICE') private readonly kitchenClient: ClientProxy,
    private readonly dbService: DbService,
    private readonly httpService: HttpService,
  ) {}

  async createOrder(dto: CreateOrderDto) {
    const item = await this.fetchItem(dto.menuItemId);

    const totalPrice = item.price * dto.quantity;

    const [order] = await this.dbService.db
      .insert(orders)
      .values({
        customerName: dto.customerName,
        menuItemId: dto.menuItemId,
        itemName: item.name,
        itemPrice: String(item.price),
        quantity: dto.quantity,
        totalPrice: String(totalPrice),
        street: dto.street,
        area: dto.area,
        status: 'pending',
      })
      .returning();

    console.log(`Order saved to DB: ${order.id}`);

    this.kitchenClient.emit('order_created', {
      orderId: order.id,
      customerName: order.customerName,
      itemName: order.itemName,
      quantity: order.quantity,
      street: order.street,
      area: order.area,
    });

    console.log('Event emitted to kitchen queue');

    return { success: true, orderId: order.id };
  }

  private async fetchItem(menuItemId: string): Promise<MenuItem> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<MenuItem>(`/items/${menuItemId}`),
      );
      return response.data;
    } catch {
      throw new NotFoundException(`Menu item with ID ${menuItemId} not found`);
    }
  }
}
