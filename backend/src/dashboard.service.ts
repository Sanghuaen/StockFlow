import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}
  async summary() {
    const products = await this.prisma.product.findMany({ where: { archivedAt: null }, select: { quantity: true, minStockLevel: true, costPrice: true } });
    const movements = await this.prisma.stockMovement.findMany({
      where: { createdAt: { gte: new Date(Date.now() - 7 * 86400000) } },
      select: { type: true, quantity: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    });
    return {
      totalProducts: products.length,
      totalUnits: products.reduce((sum, p) => sum + p.quantity, 0),
      lowStock: products.filter((p) => p.quantity > 0 && p.quantity <= p.minStockLevel).length,
      outOfStock: products.filter((p) => p.quantity === 0).length,
      estimatedInventoryValue: products.reduce((sum, p) => sum + p.quantity * Number(p.costPrice), 0),
      movements: movements.map((m) => ({ ...m, quantity: m.quantity })),
      recentMovements: await this.prisma.stockMovement.findMany({ include: { product: { select: { sku: true, name: true, unit: true } } }, orderBy: { createdAt: 'desc' }, take: 8 }),
      lowStockProducts: (await this.prisma.product.findMany({ where: { archivedAt: null }, include: { category: true }, orderBy: { quantity: 'asc' } })).filter((p) => p.quantity > 0 && p.quantity <= p.minStockLevel).slice(0, 8),
    };
  }
}
