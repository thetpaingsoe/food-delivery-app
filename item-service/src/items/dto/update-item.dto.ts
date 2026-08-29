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

export class UpdateItemDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  price?: number;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  imageUrl?: string;

  @IsOptional()
  @IsBoolean()
  available?: boolean;
}
