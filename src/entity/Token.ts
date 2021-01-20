import { BaseEntity, Column, Entity, ManyToOne, ObjectIdColumn } from 'typeorm';
import { User } from './User';

@Entity('tokens')
export class Token extends BaseEntity {
  @ObjectIdColumn()
  id: number;

  @Column('text', { primary: true })
  refreshToken: string;

  @Column()
  accessToken: string;

  @ManyToOne((type) => User, (user) => user.token)
  user: User;
}
