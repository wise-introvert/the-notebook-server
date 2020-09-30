import { InputType, Field } from "type-graphql";
import { IsString, Min, Max } from "class-validator";

@InputType()
export class UserLoginInput {
  @Field()
  @IsString()
  username: string;

  @Field()
  @IsString()
  password: string;
}
