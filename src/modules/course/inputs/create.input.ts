import { InputType, Field } from "type-graphql";
import { ArrayNotEmpty, IsString } from "class-validator";

@InputType()
export class CreateCourseInput {
  @Field()
  @IsString()
  name: string;

  @Field(() => [String!]!)
  @ArrayNotEmpty()
  departments: string[];
}
