import { BaseEntity, Column, Entity, ObjectIdColumn, OneToMany } from 'typeorm';
import { Token } from './Token';

@Entity('users')
export class User extends BaseEntity {
  @ObjectIdColumn()
  id: number;

  @Column('text', { unique: true })
  email: string;

  @Column()
  password: string;

  @Column('int', { default: 0 })
  tokenVersion: number;

  @Column()
  refreshToken: string;

  @OneToMany((type) => Token, (token) => token.user)
  token: Token[];
}
