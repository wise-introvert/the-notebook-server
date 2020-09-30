import { InputType, Field } from "type-graphql";
import { IsString } from "class-validator";

@InputType()
export class CreateDepartmentInput {
  @Field()
  @IsString()
  name: string;
}
