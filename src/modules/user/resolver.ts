import { Resolver, Arg, Query, Mutation } from "type-graphql";
import * as bcrypt from "bcrypt";
import * as _ from "lodash";
import * as fe from "easygraphql-format-error";

import { User } from "./entity";
import { UserRegistrationInput, UserLoginInput } from "./inputs";

const FormatError: fe = new fe();

@Resolver(User)
export class UserResolver {
  @Query(() => [User])
  async users(): Promise<User[]> {
    const users: User[] = await User.find({});
    if (_.isEmpty(users)) {
      throw new Error(FormatError.errorName.NOT_FOUND);
    }

    return users;
  }

  @Query(() => User)
  async user(@Arg("id", { nullable: true }) id?: string): Promise<User> {
    const user: User | undefined = await User.findOne(id);
    if (_.isEmpty(user)) {
      throw new Error(FormatError.errorName.NOT_FOUND);
    }
    return user;
  }

  @Mutation(() => User)
  async register(@Arg("input") input: UserRegistrationInput): Promise<User> {
    const existing: User[] = await User.find({
      where: { username: input.username },
      select: ["id"]
    });
    if (!_.isEmpty(existing)) {
      throw new Error(FormatError.errorName.CONFLICT);
    }

    const user: User = await User.create(input).save();
    return user;
  }

  @Mutation(() => User)
  async login(@Arg("input") input: UserLoginInput): Promise<User> {
    const user: User | undefined = await User.findOne({
      where: { username: input.username }
    });
    if (_.isEmpty(user)) {
      throw new Error(FormatError.errorName.NOT_FOUND);
    }
    const valid: boolean = await bcrypt.compare(input.password, user.password);
    if (!valid) {
      throw new Error(FormatError.errorName.UNAUTHORIZED);
    }

    return user;
  }
}
