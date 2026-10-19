import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { MovementQueryDto, StockOperationDto } from './dto';

@Controller('inventory')
export class InventoryController {
  constructor(private service: InventoryService) {}
  @Post('stock-in') stockIn(@Body() dto: StockOperationDto) { return this.service.operate('IN', dto); }
  @Post('stock-out') stockOut(@Body() dto: StockOperationDto) { return this.service.operate('OUT', dto); }
  @Post('adjustments') adjust(@Body() dto: StockOperationDto) { return this.service.adjust(dto); }
  @Get('movements') movements(@Query() query: MovementQueryDto) { return this.service.movements(query); }
}
