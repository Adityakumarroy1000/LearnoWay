import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  djangoUserId: number;

  @Column()
  email: string;

   // 🔥 NEW
  @Column({ nullable: true })
  fullName: string;

  @Column({ nullable: false })
  username: string;

  @Column({ nullable: true })
  avatar: string;
}
