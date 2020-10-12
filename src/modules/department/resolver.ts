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

import { Department } from "./entity";
import { CreateDepartmentInput, UpdateDepartmentInput } from "./inputs";
import { formatDepartmentName } from "./utils";
import { GetUser, Roles } from "../../utils";
import { User } from "../user";
import { Course } from "../course";

const FormatError: fe = new fe();

@Resolver(Department)
export class DepartmentResolver {
  @Query(() => [Department])
  async departments(
    @Arg("id", { nullable: true }) id?: string
  ): Promise<Department[]> {
    const departments: Department[] = await Department.find(
      id ? { where: { id } } : {}
    );
    if (_.isEmpty(departments)) {
      throw new Error(FormatError.errorName.NOT_FOUND);
    }

    return departments;
  }

  @FieldResolver()
  async courses(@Root() department: Department) {
    let promises: any[] = [];
    if (!department.courses.length) {
      return [];
    }
    department.courses.forEach((courseID: string) => {
      promises.push(Course.findOne(courseID));
    });
    const courses: Course[] = await Promise.all(promises);
    return courses;
  }

  @Authorized([Roles.ADMIN, Roles.TEACHER])
  @Mutation(() => Department!)
  async updateDepartment(
    @Arg("id") id: string,
    @Arg("input") input: UpdateDepartmentInput
  ): Promise<Department> {
    await Department.update(id, input);
    return Department.findOne(id);
  }

  @Authorized([Roles.ADMIN, Roles.TEACHER])
  @Mutation(() => Department)
  async createDepartment(
    @GetUser() user: User,
    @Arg("input") input: CreateDepartmentInput
  ): Promise<Department> {
    const existing: Department[] = await Department.find({
      where: { name: formatDepartmentName(input.name) },
      select: ["id"]
    });
    if (!_.isEmpty(existing)) {
      throw new Error(FormatError.errorName.CONFLICT);
    }

    const department: Department = await Department.create({
      ...input,
      createdBy: user,
      updatedBy: user
    }).save();
    return department;
  }
}
