import { Module } from '@nestjs/common';
import { CategoryService } from './category/category.service';
import { HealthController } from './health/health.controller';
import { CategoryController } from './category/category.controller';
import { PrismaService } from './prisma/prisma.service';
import { CallController } from './call/call.controller';
import { CallService } from './call/call.service';
import { GraphileModule } from './graphile.module';

@Module({
  imports: [GraphileModule],
  controllers: [CategoryController, HealthController, CallController],
  providers: [CategoryService, PrismaService, CallService],
})
export class AppModule {}
