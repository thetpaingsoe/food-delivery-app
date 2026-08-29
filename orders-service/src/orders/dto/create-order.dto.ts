import { IsInt, IsString, IsUUID, Min } from 'class-validator';

export class CreateOrderDto {
  @IsString()
  customerName!: string;

  @IsUUID()
  menuItemId!: string;

  @IsInt()
  @Min(1)
  quantity!: number;

  @IsString()
  street!: string;

  @IsString()
  area!: string;
}
