import { Resolver, Query, Mutation } from '@nestjs/graphql';
import { Market } from './markets.model';
import { MarketService } from './markets.service';

@Resolver(() => Market)
export class MarketResolver {
  constructor(private readonly marketService: MarketService) {}

  @Query(() => [Market]) // Получаем все рынки
  async getAllMarkets() {
    return this.marketService.getAllMarkets();
  }

  @Mutation(() => String) // для ручного запуска обновления
  async refreshMarkets() {
    await this.marketService.fetchMarkets();
    return 'Markets updated!';
  }
}
