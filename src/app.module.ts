import { Module } from '@nestjs/common';
import { CategoryService } from './category/category.service';
import { HealthController } from './health/health.controller';
import { CategoryController } from './category/category.controller';
import { PrismaService } from './prisma/prisma.service';

@Module({
  imports: [],
  controllers: [CategoryController, HealthController],
  providers: [CategoryService, PrismaService],
})
export class AppModule {}
