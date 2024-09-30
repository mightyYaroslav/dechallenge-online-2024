import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CategoryService } from './category/category.service';
import { HealthController } from './health/health.controller';
import { CategoryController } from './category/category.controller';
import { PrismaService } from './prisma/prisma.service';

@Module({
  imports: [],
  controllers: [AppController, CategoryController, HealthController],
  providers: [AppService, CategoryService, PrismaService],
})
export class AppModule {}
