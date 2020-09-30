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
import * as bcrypt from "bcrypt";

@Entity("users")
@ObjectType()
export class User extends BaseEntity {
  @PrimaryColumn("uuid")
  @Field(() => ID)
  id: string;

  @Column("varchar", { length: 255, unique: true })
  @Field()
  username: string;

  @Column("varchar", { length: 255 })
  @Field()
  password: string;

  @Column("varchar", { length: 255, nullable: true })
  @Field()
  email?: string;

  @CreateDateColumn()
  created: Date;

  @UpdateDateColumn()
  updated: Date;

  @BeforeInsert()
  async setup(): Promise<void> {
    this.id = uuid();
    this.password = await bcrypt.hash(this.password, bcrypt.genSaltSync(12));
  }
}
