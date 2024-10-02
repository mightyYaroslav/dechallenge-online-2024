import { Injectable } from '@nestjs/common';
import { Call, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CallService {
  constructor(private prisma: PrismaService) {}

  async getCall(where: Prisma.CallWhereUniqueInput): Promise<Call | null> {
    return this.prisma.call.findFirst({ where });
  }

  async createCall(data: Prisma.CallCreateInput): Promise<Call> {
    return this.prisma.call.create({ data });
  }

  async updateCall(
    where: Prisma.CallWhereUniqueInput,
    data: Prisma.CallUpdateInput,
  ): Promise<Call> {
    return this.prisma.call.update({ where, data });
  }
}
