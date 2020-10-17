import { InputType, Field } from "type-graphql";
import { ArrayNotEmpty, IsString, IsArray } from "class-validator";

@InputType()
export class CreateDocumentInput {
  @Field()
  @IsString()
  name: string;

  @Field(() => [String])
  @IsArray()
  urls: string[];

  @Field(() => [String!]!)
  @ArrayNotEmpty()
  subjects: string[];
}
