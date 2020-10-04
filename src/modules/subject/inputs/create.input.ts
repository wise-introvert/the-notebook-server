import { InputType, Field } from "type-graphql";
import { IsString, ArrayNotEmpty } from "class-validator";

@InputType()
export class CreateSubjectInput {
  @Field()
  @IsString()
  name: string;

  @Field(() => [String!]!)
  @ArrayNotEmpty()
  courses: string[];
}
