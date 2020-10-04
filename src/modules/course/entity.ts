import {
  BaseEntity,
  Entity,
  PrimaryColumn,
  ManyToOne,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert
} from "typeorm";
import { ObjectType, Field, ID } from "type-graphql";
import { v4 as uuid } from "uuid";

import { User, Subject } from "..";

@Entity("courses")
@ObjectType()
export class Course extends BaseEntity {
  @PrimaryColumn("uuid")
  @Field(() => ID)
  id: string;

  @Column("varchar", { length: 255 })
  @Field()
  name: string;

  @Column("text", { array: true, nullable: true })
  @Field(() => [Subject!])
  subjects?: string[];

  @ManyToOne(() => User, { eager: true })
  @Field(() => User)
  createdBy: User;

  @ManyToOne(() => User, { eager: true })
  @Field(() => User)
  updatedBy: User;

  @CreateDateColumn()
  created: Date;

  @UpdateDateColumn()
  updated: Date;

  @BeforeInsert()
  async setup(): Promise<void> {
    this.id = uuid();
  }
}
