import { InputType, Field } from "type-graphql";
import { IsString, IsUrl } from "class-validator";

@InputType()
export class CreateDocumentInput {
  @Field()
  @IsString()
  name: string;

  @Field()
  @IsUrl()
  url: string;
}
