import { Resolver, Arg, Query, Mutation, Authorized } from "type-graphql";
import * as _ from "lodash";
import * as fe from "easygraphql-format-error";

import { Course } from "./entity";
import { CreateCourseInput } from "./inputs";
import { GetUser, Roles } from "../../utils";
import { User } from "../user";

const FormatError: fe = new fe();

@Resolver(Course)
export class CourseResolver {
  @Authorized([Roles.ADMIN, Roles.TEACHER])
  @Query(() => [Course])
  async courses(@Arg("id", { nullable: true }) id?: string): Promise<Course[]> {
    const courses: Course[] = await Course.find(id ? { where: { id } } : {});
    if (_.isEmpty(courses)) {
      throw new Error(FormatError.errorName.NOT_FOUND);
    }

    return courses;
  }

  @Authorized([Roles.ADMIN, Roles.TEACHER])
  @Mutation(() => Course)
  async createCourse(
    @GetUser() user: User,
    @Arg("input") input: CreateCourseInput
  ): Promise<Course> {
    const existing: Course[] = await Course.find({
      where: { name: input.name },
      select: ["id"]
    });
    if (!_.isEmpty(existing)) {
      throw new Error(FormatError.errorName.CONFLICT);
    }

    const course: Course = await Course.create({
      ...input,
      createdBy: user,
      updatedBy: user
    }).save();
    return course;
  }
}