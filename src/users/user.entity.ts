import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Note } from '../notes/note.entity';
import { NoteShare } from '../notes/note-share.entity';

@Entity('users')
@Unique(['email'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  email: string;

  @Column({ name: 'password_hash' })
  passwordHash: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToMany(() => Note, (note) => note.owner)
  notes: Note[];

  @OneToMany(() => NoteShare, (share) => share.sharedWith)
  sharedNotes: NoteShare[];
}
