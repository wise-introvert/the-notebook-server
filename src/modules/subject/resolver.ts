import { Resolver, Arg, Query, Mutation, Authorized } from "type-graphql";
import * as _ from "lodash";
import * as fe from "easygraphql-format-error";

import { Subject } from "./entity";
import { CreateSubjectInput } from "./inputs";
import { GetUser, Roles } from "../../utils";
import { User } from "../user";

const FormatError: fe = new fe();

@Resolver(Subject)
export class SubjectResolver {
  @Authorized([Roles.ADMIN, Roles.TEACHER])
  @Query(() => [Subject])
  async subjects(
    @Arg("id", { nullable: true }) id?: string
  ): Promise<Subject[]> {
    const subjects: Subject[] = await Subject.find(id ? { where: { id } } : {});
    if (_.isEmpty(subjects)) {
      throw new Error(FormatError.errorName.NOT_FOUND);
    }

    return subjects;
  }

  @Authorized([Roles.ADMIN, Roles.TEACHER])
  @Mutation(() => Subject)
  async createSubject(
    @GetUser() user: User,
    @Arg("input") input: CreateSubjectInput
  ): Promise<Subject> {
    const existing: Subject[] = await Subject.find({
      where: { name: input.name },
      select: ["id"]
    });
    if (!_.isEmpty(existing)) {
      throw new Error(FormatError.errorName.CONFLICT);
    }

    const subject: Subject = await Subject.create({
      ...input,
      createdBy: user,
      updatedBy: user
    }).save();
    return subject;
  }
}
