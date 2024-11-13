import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaService } from './prisma.service';
import { MarketModule } from './markets/ market.module';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { StonfiInfoModule } from './stonfiInfo/ stonfiInfo.module';
import { DedustInfoModule } from './dedustInfo/ dedustInfo.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
    }),
    MarketModule,
    StonfiInfoModule,
    DedustInfoModule,
  ],
  providers: [PrismaService],
})
export class AppModule {}
