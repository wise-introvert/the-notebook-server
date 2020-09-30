import { BaseEntity, CreateDateColumn, Entity, PrimaryColumn } from "typeorm";

@Entity("refreshtokens")
export class RefreshToken extends BaseEntity {
  @PrimaryColumn("text")
  token: string;

  @CreateDateColumn()
  created: Date;
}
