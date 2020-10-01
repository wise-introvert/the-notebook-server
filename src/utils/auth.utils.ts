import { verify } from "jsonwebtoken";
import { isEmpty } from "lodash";
import { AuthChecker } from "type-graphql";
import { User } from "../modules";
import { UserRegistrationInput } from "../modules/user/inputs";
import { GQLRuntimeContext, Roles } from "./types";

export const customAuthChecker: AuthChecker<GQLRuntimeContext> = async (
  {
    context,
    args
  }: { root: any; args: any; context: GQLRuntimeContext; info: any },
  roles: any[]
): Promise<any> => {
  /*
   * |- if no at and rt
   * |   |- don't allow
   * |- else if not able to decode
   * |   | don't allow
   * |- else
   * |   |- if decoded user's role in given roles
   * |   |   |- allow
   * |   |- else
   * |   |   |- don't allow
   */
  const at: string = context.req.cookies[process.env.AT_COOKIE];

  if (!at) {
    return false;
  }

  const data: any = verify(at, process.env.AT_SECRET);

  if (isEmpty(data)) {
    return false;
  }

  const user: User = await User.findOne(data.id);

  if (isEmpty(user) || roles.indexOf(user.role) < 0) {
    return false;
  }

  return true;
};
