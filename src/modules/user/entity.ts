import {
  BaseEntity,
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert
} from "typeorm";
import { ObjectType, Field, ID, Authorized } from "type-graphql";
import { v4 as uuid } from "uuid";
import * as bcrypt from "bcrypt";
import * as i from "i";
import { Roles } from "../../utils";

const inflect = i();

@Entity("users")
@ObjectType()
export class User extends BaseEntity {
  @PrimaryColumn("uuid")
  @Field(() => ID)
  id: string;

  @Column("varchar", { length: 255, unique: true })
  @Field()
  username: string;

  @Authorized(Roles.ADMIN)
  @Column("varchar", { length: 255 })
  @Field()
  password: string;

  @Column("varchar", { length: 255 })
  @Field()
  name: string;

  @Authorized([Roles.ADMIN, Roles.TEACHER])
  @Column("varchar", { default: Roles.STUDENT })
  @Field(() => Roles, { nullable: true })
  role: Roles;

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
    this.name = inflect.titleize(this.name).replace(/\//gi, ".");
    this.password = await bcrypt.hash(this.password, bcrypt.genSaltSync(12));
  }
}
