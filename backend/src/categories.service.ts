import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from './prisma.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}
  list(q?: string) {
    return this.prisma.category.findMany({
      where: q ? { name: { contains: q, mode: 'insensitive' } } : {},
      include: { _count: { select: { products: { where: { archivedAt: null } } } } },
      orderBy: { name: 'asc' },
    });
  }
  async create(dto: CreateCategoryDto) {
    try { return await this.prisma.category.create({ data: { name: dto.name.trim() } }); }
    catch (e) { if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') throw new ConflictException('Category already exists'); throw e; }
  }
  async update(id: string, dto: UpdateCategoryDto) {
    if (!await this.prisma.category.findUnique({ where: { id } })) throw new NotFoundException('Category not found');
    try { return await this.prisma.category.update({ where: { id }, data: dto.name ? { name: dto.name.trim() } : {} }); }
    catch (e) { if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') throw new ConflictException('Category already exists'); throw e; }
  }
  async remove(id: string) {
    const category = await this.prisma.category.findUnique({ where: { id }, include: { _count: { select: { products: true } } } });
    if (!category) throw new NotFoundException('Category not found');
    if (category._count.products) throw new ConflictException('Category still has products');
    await this.prisma.category.delete({ where: { id } });
    return { success: true };
  }
}
