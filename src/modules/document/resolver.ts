import { Resolver, Arg, Query, Mutation, Authorized } from "type-graphql";
import * as _ from "lodash";
import * as fe from "easygraphql-format-error";

import { Document } from "./entity";
import { CreateDocumentInput } from "./inputs";
import { GetUser, Roles } from "../../utils";
import { User, Subject } from "..";

const FormatError: fe = new fe();
const updateSubjectDocumentsArray = async (
  subjectID: string,
  documentID: string
): Promise<Subject> => {
  const subject: Subject = await Subject.findOne(subjectID);
  const documents: string[] = subject?.documents || [];
  documents.push(documentID);
  await Subject.update(subjectID, {
    ...subject,
    documents
  });
  return {
    ...subject,
    documents
  } as Subject;
};

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
    @GetUser() user: User,
    @Arg("input") input: CreateDocumentInput
  ): Promise<Document> {
    const existing: Document[] = await Document.find({
      where: { name: input.name },
      select: ["id"]
    });
    if (!_.isEmpty(existing)) {
      throw new Error(FormatError.errorName.CONFLICT);
    }

    const document: Document = await Document.create({
      ...input,
      createdBy: user,
      updatedBy: user
    }).save();

    let promises: Promise<Subject>[] = [];
    input.subjects.map((subjectID: string) => {
      promises.push(updateSubjectDocumentsArray(subjectID, document.id));
    });

    await Promise.all(promises);
    return document;
  }
}
