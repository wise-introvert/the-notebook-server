import { InputType, Field } from "type-graphql";
import { IsString } from "class-validator";

@InputType()
export class CreateSubjectInput {
  @Field()
  @IsString()
  name: string;
}
