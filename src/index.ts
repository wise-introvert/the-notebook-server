import "reflect-metadata";
import * as express from "express";
import { createConnection } from "typeorm";
import {
  ObjectType,
  Field,
  ID,
  Resolver,
  Query,
  Mutation,
  Arg,
  Ctx,
  Authorized,
  buildSchema
} from "type-graphql";
import { ApolloServer } from "apollo-server-express";

import { User } from "./entity/User";
import { GraphQLSchema } from "graphql";

@ObjectType()
class Recipe {
  @Field(type => ID)
  id: string;

  @Field()
  title: string;

  @Field({ nullable: true })
  description?: string;

  @Field()
  creationDate: Date;

  @Field(type => [String])
  ingredients: string[];
}

@Resolver(Recipe)
class RecipeResolver {
  @Query(() => Recipe)
  async recipe(): Promise<Recipe> {
    const r: Recipe = new Recipe();
    r.ingredients = ["a", "b"];
    r.id = "someId";
    r.description = "somederklajdfk j";
    r.title = "Some Title";

    return Promise.resolve(r);
  }
}

createConnection().then(async connection => {
  const schema: GraphQLSchema = await buildSchema({
    resolvers: [RecipeResolver]
  });
  const app: express.Application = express();
  const server: ApolloServer = new ApolloServer({
    schema
  });
  server.applyMiddleware({ app });

  console.log("Inserting a new user into the database...");
  const user = new User();
  user.firstName = "Timber";
  user.lastName = "Saw";
  user.age = 25;
  await connection.manager.save(user);
  console.log("Saved a new user with id: " + user.id);

  console.log("Loading users from the database...");
  const users = await connection.manager.find(User);
  console.log("Loaded users: ", users);

  app.listen({ port: 4000 }, () => {
    console.log(
      `🚀 Server ready at http://localhost:4000${server.graphqlPath}`
    );
  });
});
