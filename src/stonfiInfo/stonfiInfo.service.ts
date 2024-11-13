import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from 'src/prisma.service';
import { convertFeeToPercentage } from 'src/helper/helper';

@Injectable()
export class StonfiInfoService {
  private readonly logger = new Logger(StonfiInfoService.name);
  isStonfiFetching = false; //статус загрузки
  isInitNamesToStonfiInfosFetching = false; //статус загрузки
  isUpdateStonfiInfosFetching = false; //статус загрузки
  private readonly MAX_RETRIES = 5; // макс попыток
  private readonly REQUEST_DELAY = 200; // Задержка между запросами

  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_10_SECONDS) // Запрос каждые 10 сек
  async fetchStonfiInfos() {
    // получение пулов
    if (this.isStonfiFetching) {
      return;
    }
    try {
      this.isStonfiFetching = true;
      const response = await axios.get('https://api.ston.fi/v1/pools');
      const infos = response.data.pool_list;

      const stonfiInfos = [];

      for (const info of infos) {
        const stonfiInfo = await this.prisma.stonfiInfo.findUnique({
          // проверка на наличее пула в базе данных
          where: { pool_addr: info.address },
        });
        if (!stonfiInfo) {
          stonfiInfos.push(info);
        }
      }

      const stonfiInfosResult = stonfiInfos.map((info) => ({
        pool_addr: info.address,
        token_0_address: info.token0_address, //аддрес первого токена
        token_1_address: info.token1_address, //аддрес второго токена
        token_0_reserve: info.reserve0, //баланс первого токена
        token_1_reserve: info.reserve1, //баланс второго токена
        lpFee: convertFeeToPercentage(info.lp_fee), // комиссия постовщеку ликвидности
        protocolFee: convertFeeToPercentage(info.protocol_fee), // комисия протоколу
        refFee: convertFeeToPercentage(info.ref_fee), // рефиральная комиссия
      }));
      //проверка что бы не записывать пустой массив
      if (stonfiInfos.length === 0) {
        return;
      }
      await this.prisma.stonfiInfo.createMany({ data: stonfiInfosResult }); // добовление в базу
      this.logger.log('StonfiInfo fetched and saved!', new Date()); //сообщение об успешном сохранение
    } catch (error) {
      this.logger.error('Error fetching StonfiInfo:', error); // сообщение об ошибке
    } finally {
      this.isStonfiFetching = false;
    }
  }

  @Cron(CronExpression.EVERY_10_SECONDS)
  // заполнение нехватающих названий жетонов
  async initNamesToStonfiInfos() {
    if (this.isInitNamesToStonfiInfosFetching) {
      return;
    }
    try {
      this.isInitNamesToStonfiInfosFetching = true;
      const stonfiInfo = await this.prisma.stonfiInfo.findMany({
        // проверка на наличее незаполниных пулов по названию жетонов
        where: { OR: [{ token_0_name: null }, { token_1_name: null }] },
      });
      // проверка отсутствие совподений
      if (!stonfiInfo) {
        return;
      }
      for (const element of stonfiInfo) {
        try {
          await this.prisma.stonfiInfo.update({
            where: {
              pool_addr: element.pool_addr,
            },

            data: {
              token_0_name: await this.getTokenInfo(element.token_0_address),
              token_1_name: await this.getTokenInfo(element.token_1_address),
            },
          });
          await this.delay(this.REQUEST_DELAY);
        } catch (error) {
          this.logger.error(error);
          continue;
        }
      }
    } catch (error) {
      this.logger.error(error);
    } finally {
      this.isInitNamesToStonfiInfosFetching = false;
    }
  }

  @Cron(CronExpression.EVERY_10_SECONDS)
  // обнавление балансов
  async updateStonfiInfos() {
    if (this.isUpdateStonfiInfosFetching) {
      return;
    }
    try {
      this.isUpdateStonfiInfosFetching = true;
      const stonfiInfo = await this.prisma.stonfiInfo.findMany({
        // проверка на заполнение для оптимизации запросов
        where: {
          AND: [
            { token_0_name: { not: null } },
            { token_1_name: { not: null } },
          ],
        },
      });
      // проверка отсутствие совподений
      if (!stonfiInfo) {
        return;
      }
      for (const element of stonfiInfo) {
        try {
          const pool = await this.getPoolInfo(element.pool_addr);

          await this.prisma.stonfiInfo.update({
            where: {
              pool_addr: element.pool_addr,
            },
            data: {
              token_0_reserve: pool?.reserve0 || '0',
              token_1_reserve: pool?.reserve1 || '0',
              lpFee: convertFeeToPercentage(pool?.lp_fee) || '0',
              protocolFee: convertFeeToPercentage(pool?.protocol_fee) || '0',
              refFee: convertFeeToPercentage(pool?.ref_fee) || '0',
            },
          });
          await this.delay(this.REQUEST_DELAY);
        } catch (error) {
          this.logger.error(error);
          continue;
        }
      }
    } catch (error) {
      this.logger.error(error);
    } finally {
      this.isUpdateStonfiInfosFetching = false;
    }
  }
  // запрос название жетона
  async getTokenInfo(address: string) {
    const fetchFunction = async () => {
      //проверка являетсья ли адрес нативным для изменения адресса запроса
      if (address === 'EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c') {
        return await axios.get(`https://api.ston.fi/v1/assets/${address}`);
      }
      return await axios.get(`https://tonapi.io/v2/jettons/${address}`);
    };

    const type =
      address === 'EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c'
        ? 'native'
        : 'jetton';

    return await this.fetchWithRetries(type, fetchFunction);
  }
  // запрос пулов для обновления
  async getPoolInfo(address: string) {
    const fetchFunction = async () => {
      return await axios.get(`https://api.ston.fi/v1/pools/${address}`);
    };

    return await this.fetchWithRetries('poll', fetchFunction);
  }

  private async fetchWithRetries(
    type: 'poll' | 'native' | 'jetton',
    fetchFunction: () => Promise<any>,
    retries: number = this.MAX_RETRIES,
  ) {
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const response = await fetchFunction();
        if (type === 'poll') {
          return response.data.pool;
        }
        if (type === 'native') {
          return response.data.asset.display_name;
        }
        if (type === 'jetton') {
          return response.data.metadata.name;
        }
      } catch (error) {
        if (error.response && error.response.status === 429) {
          const waitTime = Math.pow(2, attempt) * 1000; //  задержка
          this.logger.warn(
            `Rate limit exceeded. Waiting for ${waitTime} ms before retrying...`,
          );
          await this.delay(waitTime);
        } else {
          this.logger.error(`Error fetching StonFe: ${error.message}`);
          throw error;
        }
      }
    }
    throw new Error('Max retries reached');
  }

  private delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms)); // зядержка если 429 ошибки
  }

  async getAllStonfiInfos() {
    return this.prisma.stonfiInfo.findMany(); // Получение всех пулов из базы данных
  }
}
