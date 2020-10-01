import {
  BaseEntity,
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert
} from "typeorm";
import { ObjectType, Field, ID } from "type-graphql";
import { v4 as uuid } from "uuid";

@Entity("subjects")
@ObjectType()
export class Subject extends BaseEntity {
  @PrimaryColumn("uuid")
  @Field(() => ID)
  id: string;

  @Column("varchar", { length: 255 })
  @Field()
  name: string;

  @CreateDateColumn()
  created: Date;

  @UpdateDateColumn()
  updated: Date;

  @BeforeInsert()
  async setup(): Promise<void> {
    this.id = uuid();
  }
}
