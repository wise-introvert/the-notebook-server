import "reflect-metadata";
import * as express from "express";
import { createConnection } from "typeorm";
import { buildSchema } from "type-graphql";
import { GraphQLSchema } from "graphql";
import { ApolloServer } from "apollo-server-express";

import { UserResolver } from "./modules";

createConnection().then(async () => {
  const schema: GraphQLSchema = await buildSchema({
    resolvers: [UserResolver]
  });
  const app: express.Application = express();
  const server: ApolloServer = new ApolloServer({
    schema
  });
  server.applyMiddleware({ app });

  app.listen({ port: 4000 }, () => {
    console.log(
      `🚀 Server ready at http://localhost:4000${server.graphqlPath}`
    );
  });
});
