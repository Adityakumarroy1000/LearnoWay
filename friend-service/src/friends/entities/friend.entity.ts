import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';


@Index(['userId', 'friendId'], { unique: true })
@Entity()
export class Friend {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  friendId: string;

  @CreateDateColumn()
  createdAt: Date;
}
