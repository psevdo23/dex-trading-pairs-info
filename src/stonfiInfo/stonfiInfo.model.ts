import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class StonfiInfo {
  fetchStonfiInfo() {
    throw new Error('Method not implemented.');
  }
  getAllStonfiInfo() {
    throw new Error('Method not implemented.');
  }
  @Field(() => Int)
  id: number;

  @Field()
  pool_addr: string;

  @Field()
  token_0_address: string;

  @Field()
  token_0_name: string;

  @Field()
  token_1_name: string;

  @Field()
  token_1_address: string;

  @Field()
  token_0_reserve: string;

  @Field()
  token_1_reserve: string;

  @Field()
  lpFee: string;

  @Field()
  protocolFee: string;

  @Field()
  refFee: string;
}
