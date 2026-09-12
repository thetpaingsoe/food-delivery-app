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
import { AdminGuard } from '../auth/admin.guard';

@Controller()
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Get('categories')
  listCategories() {
    return this.itemsService.listCategories();
  }

  @Post('categories')
  @UseGuards(AdminGuard)
  createCategory(@Body() dto: CreateCategoryDto) {
    return this.itemsService.createCategory(dto);
  }

  @Patch('categories/:id')
  @UseGuards(AdminGuard)
  updateCategory(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.itemsService.updateCategory(id, dto);
  }

  @Delete('categories/:id')
  @UseGuards(AdminGuard)
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
  @UseGuards(AdminGuard)
  createItem(@Body() dto: CreateItemDto) {
    return this.itemsService.createItem(dto);
  }

  @Patch('items/:id')
  @UseGuards(AdminGuard)
  updateItem(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateItemDto,
  ) {
    return this.itemsService.updateItem(id, dto);
  }

  @Delete('items/:id')
  @UseGuards(AdminGuard)
  deleteItem(@Param('id', ParseUUIDPipe) id: string) {
    return this.itemsService.deleteItem(id);
  }
}
