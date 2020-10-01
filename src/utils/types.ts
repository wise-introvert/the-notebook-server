import { Response, Request } from "express";
import { registerEnumType } from "type-graphql";

export interface AuthTokenPayload {
  id: string;
  username: string;
  name: string;
  email?: string;
}

export interface RefreshTokenPayload {
  id: string;
}

export interface GQLRuntimeContext {
  req: Request;
  res: Response;
}

export enum Roles {
  ADMIN = "ADMIN",
  TEACHER = "TEACHER",
  CR = "CR",
  STUDENT = "STUDENT"
}

registerEnumType(Roles, {
  name: "Roles",
  description: "Authorization roles"
});
