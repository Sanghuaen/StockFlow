import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto } from './dto';

@Controller('products')
export class ProductsController {
  constructor(private service: ProductsService) {}
  @Get() list(@Query('q') q?: string, @Query('categoryId') categoryId?: string, @Query('status') status?: string, @Query('page') page = '1', @Query('limit') limit = '20') {
    return this.service.list(q, categoryId, status, Math.max(1, Number(page) || 1), Math.min(100, Math.max(1, Number(limit) || 20)));
  }
  @Get(':id') get(@Param('id') id: string) { return this.service.get(id); }
  @Post() create(@Body() dto: CreateProductDto) { return this.service.create(dto); }
  @Patch(':id') update(@Param('id') id: string, @Body() dto: UpdateProductDto) { return this.service.update(id, dto); }
  @Post(':id/archive') archive(@Param('id') id: string) { return this.service.archive(id); }
}
