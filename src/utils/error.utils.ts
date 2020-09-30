import { GraphQLError } from "graphql";
import * as fe from "easygraphql-format-error";

const FormatError: fe = new fe();

export const formatError = (error: GraphQLError) => {
  return FormatError.getError(error);
};
