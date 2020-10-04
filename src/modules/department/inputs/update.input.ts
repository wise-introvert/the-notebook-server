import { InputType, Field } from "type-graphql";
import { IsString, IsOptional } from "class-validator";

@InputType()
export class UpdateDepartmentInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  name?: string;
}
