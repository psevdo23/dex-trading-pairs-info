import { Resolver, Query, Mutation } from '@nestjs/graphql';
import { DedustInfo } from './dedustInfo.model';
import { DedustInfoService } from './dedustInfo.service';

@Resolver(() => DedustInfo)
export class DedustInfoResolver {
  constructor(private readonly DedustInfoervice: DedustInfoService) {}

  @Query(() => [DedustInfo]) // Получаем все пулы
  async getAllDedustInfo() {
    return this.DedustInfoervice.getAllDedustInfo();
  }

  @Mutation(() => String) // Для ручного запуска обновления пулов
  async refreshDedustInfo() {
    await this.DedustInfoervice.fetchDedustInfo();
    return 'DedustInfo updated!';
  }
}
