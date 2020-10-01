import { Resolver, Arg, Query, Mutation, Authorized } from "type-graphql";
import * as _ from "lodash";
import * as fe from "easygraphql-format-error";

import { Department } from "./entity";
import { CreateDepartmentInput } from "./inputs";
import { formatDepartmentName } from "./utils";
import { GetUser, Roles } from "../../utils";
import { User } from "../user";

const FormatError: fe = new fe();

@Resolver(Department)
export class DepartmentResolver {
  @Authorized([Roles.ADMIN, Roles.TEACHER])
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

  @Authorized([Roles.ADMIN, Roles.TEACHER])
  @Mutation(() => Department)
  async createDepartment(
    @GetUser() user: User,
    @Arg("input") input: CreateDepartmentInput
  ): Promise<Department> {
    console.log("user: ", JSON.stringify(user));
    const existing: Department[] = await Department.find({
      where: { name: formatDepartmentName(input.name) },
      select: ["id"]
    });
    if (!_.isEmpty(existing)) {
      throw new Error(FormatError.errorName.CONFLICT);
    }

    const department: Department = await Department.create(input).save();
    return department;
  }
}
