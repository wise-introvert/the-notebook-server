import { Resolver, Arg, Query, Mutation, Authorized } from "type-graphql";
import * as _ from "lodash";
import * as fe from "easygraphql-format-error";

import { Subject } from "./entity";
import { CreateSubjectInput } from "./inputs";
import { GetUser, Roles } from "../../utils";
import { User } from "../user";
import { Course } from "../course";

const FormatError: fe = new fe();
const updateCourseSubjectArray = async (
  courseID: string,
  subjectID: string
): Promise<Course> => {
  const course: Course = await Course.findOne(courseID);
  const subjects: string[] = course?.subjects || [];
  subjects.push(subjectID);
  await Course.update(courseID, {
    ...course,
    subjects
  });
  return {
    ...course,
    subjects
  } as Course;
};

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

    let promises: Promise<Course>[] = [];
    input.courses.map((courseID: string) => {
      promises.push(updateCourseSubjectArray(courseID, subject.id));
    });

    await Promise.all(promises);
    return subject;
  }
}
