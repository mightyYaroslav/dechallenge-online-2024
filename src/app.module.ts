import { Module } from '@nestjs/common';
import { CategoryService } from './category/category.service';
import { HealthController } from './health/health.controller';
import { CategoryController } from './category/category.controller';
import { PrismaService } from './prisma/prisma.service';
import { CallController } from './call/call.controller';
import { CallService } from './call/call.service';
import { AnalyzerService } from './analyzer/analyzer.service';
import { GraphileModule } from './graphile.module';

@Module({
  imports: [
    GraphileModule.register({
      databaseUrl: process.env.DATABASE_URL,
      concurrency: 5,
      pollInterval: 1000,
    }),
  ],
  controllers: [CategoryController, HealthController, CallController],
  providers: [CategoryService, PrismaService, CallService, AnalyzerService],
})
export class AppModule {}
