import { Controller, Get } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private service: DashboardService) {}
  @Get('summary') summary() { return this.service.summary(); }
  @Get('stock-movements') async stockMovements() { return (await this.service.summary()).movements; }
  @Get('low-stock') async lowStock() { return (await this.service.summary()).lowStockProducts; }
}
