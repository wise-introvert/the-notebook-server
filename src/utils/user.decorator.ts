import { createParamDecorator } from "type-graphql";
import { verify } from "jsonwebtoken";

import { GQLRuntimeContext } from "./types";
import { User } from "../modules";

export function GetUser(): ParameterDecorator {
  return createParamDecorator(
    async ({ context }: { context: GQLRuntimeContext }): Promise<User> => {
      const { req } = context;
      const at: string = req.cookies[process.env.AT_COOKIE];
      const data: any = verify(at, process.env.AT_SECRET);
      const user: User = await User.findOne(data.id);
      return user;
    }
  );
}
