import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class DedustInfoService {
  private readonly logger = new Logger(DedustInfoService.name);
  isStonfiFetching = false; //статус загрузки
  isInitNamesToDedustInfoFetching = false; //статус загрузки
  isUpdateDedustInfoFetching = false; //статус загрузки
  private readonly MAX_RETRIES = 5; // макс попыток
  private readonly REQUEST_DELAY = 200; // Задержка между запросами

  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_10_SECONDS) // Запрос каждые 10 сек
  async fetchDedustInfo() {
    // получение пулов
    if (this.isStonfiFetching) {
      return;
    }

    try {
      this.isStonfiFetching = true;
      const response = await axios.get('https://api.dedust.io/v2/pools');
      const infos = response.data;
      const DedustInfos = [];

      for (let index = 0; index < infos.length; index++) {
        const info = infos[index];
        const DedustInfo = await this.prisma.dedustInf.findUnique({
          // проверка на наличее пула в базе данных
          where: { pool_addr: info.address },
        });
        if (!DedustInfo) {
          DedustInfos.push(info);
        }
      }
      const DedustInfoResult = DedustInfos.map((info) => ({
        pool_addr: info.address,
        token_0_address:
          info.assets[0].type === 'native' ? 'native' : info.assets[0].address, //аддрес первого токена
        token_1_address:
          info.assets[1].type === 'native' ? 'native' : info.assets[1].address, //аддрес второго токена
        token_0_name: info.assets[0].metadata
          ? info.assets[0].metadata.name
          : null,
        token_1_name: info.assets[1].metadata
          ? info.assets[1].metadata.name
          : null,
        token_0_type: info.assets[0].type,
        token_1_type: info.assets[1].type,
        token_0_reserve: info.reserves[0], //баланс первого токена
        token_1_reserve: info.reserves[1], //баланс второго токена
        fee: info.tradeFee, //коммисия
      }));
      //проверка что бы не записывать пустой массив
      if (DedustInfos.length === 0) {
        return;
      }
      // await this.prisma.DedustInfo.deleteMany(); // Очистка
      await this.prisma.dedustInf.createMany({ data: DedustInfoResult }); // добовление в базу
      this.logger.log('DedustInfo fetched and saved!', new Date()); //сообщение об успешном сохранение
    } catch (error) {
      this.logger.error('Error fetching DedustInfo:', error); // сообщение об ошибке
    } finally {
      this.isStonfiFetching = false;
    }
  }
  @Cron(CronExpression.EVERY_10_SECONDS)
  // заполнение нехватающих названий жетонов
  async initNamesToDedustInfo() {
    if (this.isStonfiFetching) {
      return;
    }
    try {
      this.isInitNamesToDedustInfoFetching = true;
      const DedustInfo = await this.prisma.dedustInf.findMany({
        // проверка на наличее незаполниных пулов по названию жетонов
        where: { OR: [{ token_0_name: null }, { token_1_name: null }] },
      });
      // проверка отсутствие совподений
      if (!DedustInfo) {
        return;
      }
      for (let index = 0; index < DedustInfo.length; index++) {
        try {
          const element = DedustInfo[index];
          await this.prisma.dedustInf.update({
            where: {
              pool_addr: element.pool_addr,
            },
            data: {
              token_0_name:
                element.token_0_name === null
                  ? await this.getMetodataJettton(element.token_0_address)
                  : element.token_0_name,
              token_1_name:
                element.token_1_name === null
                  ? await this.getMetodataJettton(element.token_1_address)
                  : element.token_1_name,
            },
          });
          await this.delay(this.REQUEST_DELAY);
        } catch (error) {
          this.logger.error(error, 'initNamesToDedustInfo error');
          continue;
        }
      }
    } catch (error) {
      this.logger.error(error, 'init NamesToDedustInfo error');
    } finally {
      this.isInitNamesToDedustInfoFetching = false;
    }
  }

  @Cron(CronExpression.EVERY_10_SECONDS)
  // обнавление балансов
  async updateDedustInfo() {
    if (this.isStonfiFetching) {
      return;
    }
    const pools = await this.getPoolsInfo();
    try {
      this.isUpdateDedustInfoFetching = true;
      const DedustInfo = await this.prisma.dedustInf.findMany({
        // проверка на заполнение для оптимизации запросов
        where: {
          AND: [
            { token_0_name: { not: null } },
            { token_1_name: { not: null } },
          ],
        },
      });
      // проверка отсутствие совподений
      if (!DedustInfo) {
        return;
      }
      for (let index = 0; index < DedustInfo.length; index++) {
        try {
          const element = DedustInfo[index];
          const pool = pools.find((info) => info.address === element.pool_addr);

          if (!pool) {
            this.logger.warn(
              `Pool not found for address: ${element.pool_addr}`,
            );
            continue;
          }

          await this.prisma.dedustInf.update({
            where: {
              pool_addr: element.pool_addr,
            },
            data: {
              token_0_reserve: pool.reserve0, //баланс первого токена
              token_1_reserve: pool.reserve1, //баланс второго токена
            },
          });
        } catch (error) {
          this.logger.error(error, 'update DedustInfo error');
          continue;
        }
      }
    } catch (error) {
      this.logger.error(error, 'updateDedustInfo error');
    } finally {
      this.isUpdateDedustInfoFetching = false;
    }
  }
  // запрос название жетона
  getMetodataJettton = async (address: string) => {
    const fetchFunction = async () => {
      return await await axios.get(`https://tonapi.io/v2/jettons/${address}`);
    };
    return await this.fetchWithRetries(fetchFunction);
  };
  private async fetchWithRetries(
    fetchFunction: () => Promise<any>,
    retries: number = this.MAX_RETRIES,
  ) {
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const response = await fetchFunction();

        return response.data.name;
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
  // запрос пулов для обновления
  async getPoolsInfo() {
    try {
      const response = await axios.get('https://api.dedust.io/v2/pools');
      const infos = response.data;
      return infos;
    } catch (error) {
      console.error(
        'Error fetching pools for address',

        ':',
        error.message,
      );
      return null;
    }
  }
  async getAllDedustInfo() {
    return this.prisma.dedustInf.findMany(); // Получение всех пулов из базы данных
  }
}
