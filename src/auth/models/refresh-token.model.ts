import { Column, Model, Table, ForeignKey, DataType } from 'sequelize-typescript';

import { User } from 'users/models/users.model';

@Table({
  tableName: 'refresh_tokens',
})
export class RefreshToken extends Model {
  @ForeignKey(() => User)
  @Column
  userId: number;

  @Column({ type: DataType.TEXT })
  token: string;

  @Column({ type: DataType.TEXT })
  tokenVersion: string;

  @Column({ type: DataType.DATE, allowNull: false })
  expiresAt: Date;
}
