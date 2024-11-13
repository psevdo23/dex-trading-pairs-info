import { Resolver, Query, Mutation } from '@nestjs/graphql';
import { StonfiInfo } from './stonfiInfo.model';
import { StonfiInfoService } from './stonfiInfo.service';

@Resolver(() => StonfiInfo)
export class StonfiInfoResolver {
  constructor(private readonly stonfiInfoService: StonfiInfoService) {}

  @Query(() => [StonfiInfo]) // Получаем все пулы
  async getAllStonfiInfo() {
    return this.stonfiInfoService.getAllStonfiInfos();
  }

  @Mutation(() => String) // Для ручного запуска обновления пулов
  async refreshStonfiInfo() {
    await this.stonfiInfoService.fetchStonfiInfos();
    return 'StonfiInfo updated!';
  }
}
