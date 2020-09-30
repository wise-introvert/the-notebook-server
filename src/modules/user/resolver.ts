import { Resolver, Arg, Query, Mutation } from "type-graphql";
import * as bcrypt from "bcrypt";
import * as fe from "easygraphql-format-error";

import { User } from "./entity";
import { UserRegistrationInput, UserLoginInput } from "./inputs";

const FormatError: fe = new fe();

@Resolver(User)
export class UserResolver {
  @Query(() => [User])
  async users(): Promise<User[]> {
    return User.find({});
  }

  @Query(() => User)
  async user(@Arg("id", { nullable: true }) id?: string): Promise<User> {
    const user: User | undefined = await User.findOne(id);
    return user;
  }

  @Mutation(() => User)
  async register(@Arg("input") input: UserRegistrationInput): Promise<User> {
    const user: User = await User.create(input).save();

    return user;
  }

  @Mutation(() => User)
  async login(@Arg("input") input: UserLoginInput): Promise<User> {
    const user: User | undefined = await User.findOne({
      where: { username: input.username }
    });
    const valid: boolean = await bcrypt.compare(input.password, user.password);
    if (!valid) {
      throw new Error("Invalid username/password");
    }

    return user;
  }
}
