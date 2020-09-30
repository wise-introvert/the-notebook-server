import { InputType, Field } from "type-graphql";
import { IsString, IsEmail, Min, Max, IsOptional } from "class-validator";

@InputType()
export class UserRegistrationInput {
  @Field()
  @IsString()
  username: string;

  @Field()
  @IsString()
  password: string;

  @Field()
  @IsString()
  name: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsEmail()
  email?: string;
}
