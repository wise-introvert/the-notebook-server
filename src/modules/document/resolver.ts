import { Resolver, Arg, Query, Mutation, Authorized } from "type-graphql";
import * as _ from "lodash";
import * as fe from "easygraphql-format-error";

import { Document } from "./entity";
import { CreateDocumentInput } from "./inputs";
import { Roles } from "../../utils";

const FormatError: fe = new fe();

@Resolver(Document)
export class DocumentResolver {
  @Authorized([Roles.ADMIN, Roles.TEACHER])
  @Query(() => [Document])
  async documents(
    @Arg("id", { nullable: true }) id?: string
  ): Promise<Document[]> {
    const documents: Document[] = await Document.find(
      id ? { where: { id } } : {}
    );
    if (_.isEmpty(documents)) {
      throw new Error(FormatError.errorName.NOT_FOUND);
    }

    return documents;
  }

  @Authorized([Roles.ADMIN, Roles.TEACHER])
  @Mutation(() => Document)
  async createDocument(
    @Arg("input") input: CreateDocumentInput
  ): Promise<Document> {
    const existing: Document[] = await Document.find({
      where: { name: input.name },
      select: ["id"]
    });
    if (!_.isEmpty(existing)) {
      throw new Error(FormatError.errorName.CONFLICT);
    }

    const document: Document = await Document.create(input).save();
    return document;
  }
}
