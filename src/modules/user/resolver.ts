import { Resolver, Arg, Query, Mutation, Ctx, Authorized } from "type-graphql";
import * as bcrypt from "bcrypt";
import * as _ from "lodash";
import * as fe from "easygraphql-format-error";
import * as jwt from "jsonwebtoken";

import { User } from "./entity";
import { UserRegistrationInput, UserLoginInput } from "./inputs";
import {
  RefreshTokenPayload,
  AuthTokenPayload,
  GQLRuntimeContext,
  Roles
} from "../../utils";
import { RefreshToken } from "./utils";

const FormatError: fe = new fe();

@Resolver(User)
export class UserResolver {
  @Authorized([Roles.ADMIN, Roles.TEACHER, Roles.CR])
  @Query(() => [User])
  async users(): Promise<User[]> {
    const users: User[] = await User.find({});
    if (_.isEmpty(users)) {
      throw new Error(FormatError.errorName.NOT_FOUND);
    }

    return users;
  }

  @Authorized([Roles.ADMIN, Roles.TEACHER, Roles.CR])
  @Query(() => User)
  async user(@Arg("id") id: string): Promise<User> {
    const user: User | undefined = await User.findOne(id);
    if (_.isEmpty(user)) {
      throw new Error(FormatError.errorName.NOT_FOUND);
    }
    return user;
  }

  @Mutation(() => Boolean)
  async logout(@Ctx() { res }: GQLRuntimeContext): Promise<boolean> {
    try {
      res.clearCookie(process.env.AT_COOKIE);
      res.clearCookie(process.env.RT_COOKIE);
      res.clearCookie("session");
      return true;
    } catch {
      return false;
    }
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

  @Mutation(() => Boolean, { nullable: true })
  async refresh(@Ctx() { req, res }: GQLRuntimeContext): Promise<boolean> {
    const rt: string = req.cookies[process.env.RT_COOKIE];

    // check if in db
    const existing: RefreshToken[] | undefined = await RefreshToken.find({
      where: { token: rt }
    });
    if (_.isEmpty(existing)) {
      throw new Error(FormatError.errorName.UNAUTHORIZED);
    }

    // check if expired
    const decoded: any = jwt.verify(rt, process.env.RT_SECRET);
    if (_.isEmpty(decoded)) {
      throw new Error(FormatError.errorName.UNAUTHORIZED);
    }

    const { id } = decoded;

    const user: User = await User.findOne(id);
    if (_.isEmpty(user)) {
      throw new Error(FormatError.errorName.UNAUTHORIZED);
    }

    const authTokenPayload: AuthTokenPayload = _.pick(user, [
      "id",
      "username",
      "email",
      "name"
    ]);

    const at: string = jwt.sign(authTokenPayload, process.env.AT_SECRET, {
      expiresIn: "1h"
    });

    res.cookie(process.env.AT_COOKIE, at, {
      expires: new Date(new Date().getTime() + 60 * 60 * 1000),
      httpOnly: process.env.NODE_ENV === "production",
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict"
    });

    return true;
  }

  @Mutation(() => User)
  async login(
    @Arg("input") input: UserLoginInput,
    @Ctx() { res }: GQLRuntimeContext
  ): Promise<User> {
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

    const authTokenPayload: AuthTokenPayload = _.pick(user, [
      "id",
      "username",
      "email",
      "name"
    ]);
    const refreshTokenPayload: RefreshTokenPayload = _.pick(user, ["id"]);

    const at: string = jwt.sign(authTokenPayload, process.env.AT_SECRET, {
      expiresIn: "1h"
    });

    const rt: string = jwt.sign(refreshTokenPayload, process.env.RT_SECRET, {
      expiresIn: "7d"
    });

    await RefreshToken.create({ token: rt }).save();

    res.cookie(process.env.AT_COOKIE || "qidat", at, {
      expires: new Date(new Date().getTime() + 60 * 60 * 1000),
      httpOnly: process.env.NODE_ENV === "production",
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict"
    });
    res.cookie(process.env.RT_COOKIE || "qidrt", rt, {
      expires: new Date(new Date().getTime() + 24 * 7 * 60 * 60 * 1000),
      httpOnly: process.env.NODE_ENV === "production",
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict"
    });

    return user;
  }
}
