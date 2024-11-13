import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import axios from 'axios';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class MarketService {
  constructor(private prisma: PrismaService) {}

  @Cron('*/1 * * * *')
  async fetchMarkets() {
    try {
      const response = await axios.get('https://api.ston.fi/v1/markets');
      const pairs = response.data.pairs;

      const markets = pairs.map((pair) => ({
        pairSale: pair[0],
        purChase: pair[1],
      }));

      await this.prisma.market.deleteMany();
      await this.prisma.market.createMany({ data: markets });

      console.log('Markets fetched and saved!', new Date());
    } catch (error) {
      console.error('Error fetching markets:', error);
    }
  }

  async getAllMarkets() {
    return this.prisma.market.findMany();
  }
}
