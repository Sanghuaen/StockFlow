import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './prisma.service';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { HealthController } from './health.controller';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  controllers: [ProductsController, CategoriesController, InventoryController, DashboardController, HealthController],
  providers: [PrismaService, ProductsService, CategoriesService, InventoryService, DashboardService],
})
export class AppModule {}
