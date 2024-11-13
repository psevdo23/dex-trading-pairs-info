import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class DedustInfo {
  fetchDedustInfo() {
    throw new Error('Method not implemented.');
  }
  getAllDedustInfo() {
    throw new Error('Method not implemented.');
  }
  @Field(() => Int)
  id: number;

  @Field()
  token_0_address: string;

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
