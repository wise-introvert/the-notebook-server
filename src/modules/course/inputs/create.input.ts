import { InputType, Field } from "type-graphql";
import { IsString } from "class-validator";

@InputType()
export class CreateCourseInput {
  @Field()
  @IsString()
  name: string;
}
