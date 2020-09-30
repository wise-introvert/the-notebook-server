export type GQLError = {
  path: string;
  message: string;
};

export type Errors = {
  errors: GQLError[];
};
