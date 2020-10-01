import { InputType, Field } from "type-graphql";
import {
  IsString,
  IsEmail,
  Min,
  Max,
  IsOptional,
  IsEnum
} from "class-validator";
import { Roles } from "../../../utils";

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

  @Field(() => Roles, { nullable: true })
  @IsOptional()
  @IsEnum(Roles)
  role: Roles;

  @Field({ nullable: true })
  @IsOptional()
  @IsEmail()
  email?: string;
}
