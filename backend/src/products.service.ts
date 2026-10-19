import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { CreateProductDto, UpdateProductDto } from './dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async list(q?: string, categoryId?: string, status?: string, page = 1, limit = 20) {
    const where: Prisma.ProductWhereInput = { archivedAt: null };
    if (q) where.OR = [{ name: { contains: q, mode: 'insensitive' } }, { sku: { contains: q, mode: 'insensitive' } }];
    if (categoryId) where.categoryId = categoryId;
    if (status === 'OUT') where.quantity = 0;
    
    if (status === 'LOW') {
      const all = await this.prisma.product.findMany({ where, include: { category: true }, orderBy: { updatedAt: 'desc' } });
      const low = all.filter((p) => p.quantity > 0 && p.quantity <= p.minStockLevel);
      return { items: low.slice((page - 1) * limit, page * limit), total: low.length, page, limit };
    }
    const [items, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({ where, include: { category: true }, orderBy: { updatedAt: 'desc' }, skip: (page - 1) * limit, take: limit }),
      this.prisma.product.count({ where }),
    ]);
    return { items, total, page, limit };
  }

  async get(id: string) {
    const product = await this.prisma.product.findUnique({ where: { id }, include: { category: true, movements: { orderBy: { createdAt: 'desc' }, take: 20 } } });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async create(dto: CreateProductDto) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const product = await tx.product.create({
          data: {
            sku: dto.sku.trim(), name: dto.name.trim(), description: dto.description,
            categoryId: dto.categoryId, unit: dto.unit ?? 'pcs',
            costPrice: new Prisma.Decimal(dto.costPrice),
            quantity: 0, minStockLevel: dto.minStockLevel ?? 0,
          },
          include: { category: true },
        });
        const initial = dto.quantity ?? 0;
        if (initial > 0) {
          await tx.product.update({ where: { id: product.id }, data: { quantity: initial } });
          await tx.stockMovement.create({ data: { productId: product.id, type: 'ADJUSTMENT', quantity: initial, quantityBefore: 0, quantityAfter: initial, note: 'Initial stock' } });
        }
        return tx.product.findUniqueOrThrow({ where: { id: product.id }, include: { category: true } });
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') throw new ConflictException('SKU already exists');
      throw e;
    }
  }

  async update(id: string, dto: UpdateProductDto) {
    await this.get(id);
    return this.prisma.product.update({ where: { id }, data: { ...dto, costPrice: dto.costPrice === undefined ? undefined : new Prisma.Decimal(dto.costPrice) }, include: { category: true } });
  }

  async archive(id: string) {
    await this.get(id);
    return this.prisma.product.update({ where: { id }, data: { archivedAt: new Date() } });
  }
}
