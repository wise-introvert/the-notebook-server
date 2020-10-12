import {
  Resolver,
  Arg,
  Query,
  Mutation,
  Authorized,
  FieldResolver,
  Root
} from "type-graphql";
import * as _ from "lodash";
import * as fe from "easygraphql-format-error";

import { Course } from "./entity";
import { CreateCourseInput } from "./inputs";
import { GetUser, Roles } from "../../utils";
import { User } from "../user";
import { Department } from "../department";
import { Subject } from "../subject";

const FormatError: fe = new fe();
const updateDepartmentCoursesArray = async (
  departmentID: string,
  courseID: string
): Promise<Department> => {
  const department: Department = await Department.findOne(departmentID);
  const courses: string[] = department?.courses || [];
  courses.push(courseID);
  await Department.update(departmentID, {
    ...department,
    courses
  });
  return {
    ...department,
    courses
  } as Department;
};

@Resolver(Course)
export class CourseResolver {
  @Query(() => [Course])
  async courses(@Arg("id", { nullable: true }) id?: string): Promise<Course[]> {
    const courses: Course[] = await Course.find(id ? { where: { id } } : {});
    if (_.isEmpty(courses)) {
      throw new Error(FormatError.errorName.NOT_FOUND);
    }

    return courses;
  }

  @FieldResolver()
  async subjects(@Root() course: Course): Promise<Subject[]> {
    let promises: any[] = [];
    if (!course.subjects.length) {
      return [];
    }
    course.subjects.forEach((subjectID: string) => {
      promises.push(Subject.findOne(subjectID));
    });
    const subjects: Subject[] = await Promise.all(promises);
    return subjects;
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

    let promises: Promise<Department>[] = [];
    input.departments.map((departmentID: string) => {
      promises.push(updateDepartmentCoursesArray(departmentID, course.id));
    });

    await Promise.all(promises);

    return course;
  }
}
