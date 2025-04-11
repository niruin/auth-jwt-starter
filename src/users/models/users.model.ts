import { Column, DataType, Model, Table } from 'sequelize-typescript';
import { DataTypes } from 'sequelize';

import { EnumUserRole } from '../interfaces/users.interface';

export interface IUser {
  id: number;
  email: string;
  password: string;
  role: EnumUserRole;
}

@Table({
  tableName: 'users',
  timestamps: true,
})
export class User extends Model implements IUser {
  @Column({ type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true })
  id: number;
  @Column({ type: DataTypes.STRING })
  email: string;
  @Column({ type: DataTypes.STRING })
  password: string;
  @Column({ type: DataType.ENUM(...Object.values(EnumUserRole)) })
  role: EnumUserRole;
}
