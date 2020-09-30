import { Response, Request } from "express";

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
