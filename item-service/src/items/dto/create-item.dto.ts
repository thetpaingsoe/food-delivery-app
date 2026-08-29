import {
  IsString,
  IsNumber,
  IsUUID,
  IsBoolean,
  IsOptional,
  MinLength,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateItemDto {
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name!: string;

  @IsString()
  @MinLength(1)
  description!: string;

  @IsNumber()
  @Min(1)
  price!: number;

  @IsUUID()
  categoryId!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(500)
  imageUrl!: string;

  @IsOptional()
  @IsBoolean()
  available?: boolean;
}
