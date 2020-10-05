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

createConnection(
  process.env.NODE_ENV === "production"
    ? {
        name: "production",
        type: "postgres",
        host: "ec2-54-157-234-29.compute-1.amazonaws.com",
        port: 5432,
        username: "fyamyeyloondsp",
        password:
          "878528b7fc51c33aa4db386bcc42034e09d3eae8c33621a81e7577d33ed359e3",
        database: "d49uka4qa8bklo",
        synchronize: true,
        logging: false,
        entities: ["src/modules/**/*entity.*"],
        migrations: ["src/migration/**/*.ts"],
        subscribers: ["src/subscriber/**/*.ts"],
        cli: {
          entitiesDir: "src/modules/**/entity.*",
          migrationsDir: "src/migration",
          subscribersDir: "src/subscriber"
        }
      }
    : {
        name: "default",
        type: "postgres",
        host: "localhost",
        port: 4444,
        username: "postgres",
        password: "thepassword",
        database: "thenotebookdev",
        synchronize: true,
        logging: false,
        entities: ["src/modules/**/*entity.*"],
        migrations: ["src/migration/**/*.ts"],
        subscribers: ["src/subscriber/**/*.ts"],
        cli: {
          entitiesDir: "src/modules/**/entity.*",
          migrationsDir: "src/migration",
          subscribersDir: "src/subscriber"
        }
      }
).then(async () => {
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

  app.listen({ port: process.env.PORT || 4000 }, () => {
    console.log(
      `🚀 Server ready at http://localhost:${process.env.PORT || 4000}${
        server.graphqlPath
      }`
    );
  });
});
