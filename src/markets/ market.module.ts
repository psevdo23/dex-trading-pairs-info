import { Module } from '@nestjs/common';

import { PrismaService } from '../prisma.service';
import { MarketResolver } from './markets.resolver';
import { MarketService } from './markets.service';

@Module({
  providers: [MarketService, MarketResolver, PrismaService],
  exports: [MarketService],
})
export class MarketModule {}
