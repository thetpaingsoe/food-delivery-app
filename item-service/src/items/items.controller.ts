import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ItemsService } from './items.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { AuthGuard } from '../auth/auth.guard';

@Controller()
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Get('categories')
  listCategories() {
    return this.itemsService.listCategories();
  }

  @Post('categories')
  @UseGuards(AuthGuard)
  createCategory(@Body() dto: CreateCategoryDto) {
    return this.itemsService.createCategory(dto);
  }

  @Patch('categories/:id')
  @UseGuards(AuthGuard)
  updateCategory(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.itemsService.updateCategory(id, dto);
  }

  @Delete('categories/:id')
  @UseGuards(AuthGuard)
  deleteCategory(@Param('id', ParseUUIDPipe) id: string) {
    return this.itemsService.deleteCategory(id);
  }

  @Get('items')
  listItems(@Query('category_id') categoryId?: string) {
    return this.itemsService.listItems(categoryId);
  }

  @Get('items/:id')
  getItem(@Param('id', ParseUUIDPipe) id: string) {
    return this.itemsService.getItem(id);
  }

  @Post('items')
  @UseGuards(AuthGuard)
  createItem(@Body() dto: CreateItemDto) {
    return this.itemsService.createItem(dto);
  }

  @Patch('items/:id')
  @UseGuards(AuthGuard)
  updateItem(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateItemDto,
  ) {
    return this.itemsService.updateItem(id, dto);
  }

  @Delete('items/:id')
  @UseGuards(AuthGuard)
  deleteItem(@Param('id', ParseUUIDPipe) id: string) {
    return this.itemsService.deleteItem(id);
  }
}
