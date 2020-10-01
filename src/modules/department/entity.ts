import {
  BaseEntity,
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert
} from "typeorm";
import { ObjectType, Field, ID } from "type-graphql";
import { v4 as uuid } from "uuid";

import { formatDepartmentName } from "./utils";
import { User } from "../user";

@Entity("departments")
@ObjectType()
export class Department extends BaseEntity {
  @PrimaryColumn("uuid")
  @Field(() => ID)
  id: string;

  @Column("varchar", { length: 255 })
  @Field()
  name: string;

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
    this.name = formatDepartmentName(this.name.toLowerCase());
  }
}
