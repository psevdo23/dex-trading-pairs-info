import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class Market {
  @Field(() => Int)
  id: number;

  @Field()
  pairSale: string;

  @Field()
  purChase: string;
}
