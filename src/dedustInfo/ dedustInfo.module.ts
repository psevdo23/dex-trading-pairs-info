import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { DedustInfoResolver } from './dedustInfo.resolver';
import { DedustInfoService } from './dedustInfo.service';

@Module({
  providers: [DedustInfoService, DedustInfoResolver, PrismaService],
  exports: [DedustInfoService],
})
export class DedustInfoModule {}
