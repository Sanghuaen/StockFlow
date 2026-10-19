import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from './prisma.service';
import { MovementQueryDto, StockOperationDto } from './dto';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  async operate(type: 'IN' | 'OUT', dto: StockOperationDto) {
    return this.prisma.$transaction(async (tx) => {
      const product = await tx.product.findFirst({ where: { id: dto.productId, archivedAt: null } });
      if (!product) throw new NotFoundException('Active product not found');
      const before = product.quantity;
      const after = type === 'IN' ? before + dto.quantity : before - dto.quantity;
      if (after < 0) throw new BadRequestException('Insufficient stock');
      // Conditional update makes the read-check-write safe against concurrent stock-outs.
      const update = await tx.product.updateMany({
        where: { id: product.id, archivedAt: null, quantity: type === 'OUT' ? { gte: dto.quantity } : before },
        data: { quantity: type === 'IN' ? { increment: dto.quantity } : { decrement: dto.quantity } },
      });
      if (update.count !== 1) throw new BadRequestException('Stock changed concurrently; refresh and retry');
      const refreshed = await tx.product.findUniqueOrThrow({ where: { id: product.id } });
      const quantityBefore = type === 'IN' ? refreshed.quantity - dto.quantity : refreshed.quantity + dto.quantity;
      return tx.stockMovement.create({
        data: { productId: product.id, type, quantity: dto.quantity, quantityBefore, quantityAfter: refreshed.quantity, note: dto.note?.trim() || null },
        include: { product: true },
      });
    }, { isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted });
  }

  async adjust(dto: StockOperationDto) {
    return this.prisma.$transaction(async (tx) => {
      const product = await tx.product.findFirst({ where: { id: dto.productId, archivedAt: null } });
      if (!product) throw new NotFoundException('Active product not found');
      const before = product.quantity;
      const update = await tx.product.updateMany({
        where: { id: product.id, archivedAt: null, quantity: before },
        data: { quantity: dto.quantity },
      });
      if (update.count !== 1) throw new BadRequestException('Stock changed concurrently; refresh and retry');
      return tx.stockMovement.create({
        data: { productId: product.id, type: 'ADJUSTMENT', quantity: Math.abs(dto.quantity - before) || 1, quantityBefore: before, quantityAfter: dto.quantity, note: dto.note?.trim() || 'Stock adjustment' },
        include: { product: true },
      });
    });
  }

  async movements(query: MovementQueryDto) {
    const where: Prisma.StockMovementWhereInput = {};
    if (query.productId) where.productId = query.productId;
    if (query.type && ['IN', 'OUT', 'ADJUSTMENT'].includes(query.type)) where.type = query.type as 'IN' | 'OUT' | 'ADJUSTMENT';
    const [items, total] = await this.prisma.$transaction([
      this.prisma.stockMovement.findMany({ 
        where, 
        include: { 
          product: {
             select: {
               id: true,
               sku: true, 
               name: true, 
               unit: true 
              },
             },
          },
          orderBy: { createdAt: 'desc' }, 
          skip: (query.page - 1) * query.limit, 
          take: Math.min(query.limit, 100) 
      }),

      this.prisma.stockMovement.count({ where }),
      
    ]);
    return { items, total, page: query.page, limit: query.limit };
  }
}
