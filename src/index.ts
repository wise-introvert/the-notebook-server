import "dotenv/config";
import "reflect-metadata";
import * as express from "express";
import { createConnection } from "typeorm";
import { buildSchema } from "type-graphql";
import { GraphQLSchema } from "graphql";
import { ApolloServer } from "apollo-server-express";
import * as cookieParser from "cookie-parser";

import {
  UserResolver,
  DepartmentResolver,
  CourseResolver,
  SubjectResolver,
  DocumentResolver
} from "./modules";
import { customAuthChecker, formatError, GQLRuntimeContext } from "./utils";

createConnection().then(async () => {
  const schema: GraphQLSchema = await buildSchema({
    resolvers: [
      UserResolver,
      DepartmentResolver,
      CourseResolver,
      SubjectResolver,
      DocumentResolver
    ],
    authChecker: customAuthChecker
  });
  const app: express.Application = express();
  app.use(cookieParser());
  const server: ApolloServer = new ApolloServer({
    schema,
    formatError,
    context: ({ req, res }: GQLRuntimeContext): GQLRuntimeContext => ({
      req,
      res
    })
  });
  server.applyMiddleware({ app });

  app.listen({ port: 4000 }, () => {
    console.log(
      `🚀 Server ready at http://localhost:4000${server.graphqlPath}`
    );
  });
});
