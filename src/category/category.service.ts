import { Injectable } from '@nestjs/common';
import { Category, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}

  async getCategories(): Promise<Category[]> {
    return this.prisma.category.findMany();
  }

  async createCategory(data: Prisma.CategoryCreateInput): Promise<Category> {
    return this.prisma.category.create({ data });
  }
}
