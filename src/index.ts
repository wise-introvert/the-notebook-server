import "dotenv/config";
import "reflect-metadata";
import * as express from "express";
import {
  ConnectionOptions,
  createConnection,
  getConnectionOptions
} from "typeorm";
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

const getOptions = async () => {
  let connectionOptions: ConnectionOptions;
  connectionOptions = {
    type: "postgres",
    synchronize: true,
    logging: false,
    entities: ["dist/entity/*.*"]
  };
  if (process.env.DATABASE_URL) {
    Object.assign(connectionOptions, { url: process.env.DATABASE_URL });
  } else {
    // gets your default configuration
    // you could get a specific config by name getConnectionOptions('production')
    // or getConnectionOptions(process.env.NODE_ENV)
    connectionOptions = await getConnectionOptions();
  }

  return connectionOptions;
};

const connect = async (): Promise<void> => {
  const typeormconfig = await getOptions();
  await createConnection(typeormconfig);
};
connect().then(async () => {
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
