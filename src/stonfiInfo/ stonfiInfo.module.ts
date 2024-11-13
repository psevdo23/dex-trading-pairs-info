import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { StonfiInfoResolver } from './stonfiInfo.resolver';
import { StonfiInfoService } from './stonfiInfo.service';

@Module({
  providers: [StonfiInfoService, StonfiInfoResolver, PrismaService],
  exports: [StonfiInfoService],
})
export class StonfiInfoModule {}
