import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Note } from './note.entity';

@Entity('note_shares')
@Unique(['noteId', 'sharedWithUserId'])
export class NoteShare {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'note_id' })
  noteId: string;

  @ManyToOne(() => Note, (note) => note.shares, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'note_id' })
  note: Note;

  @Column({ name: 'shared_with_user_id' })
  sharedWithUserId: string;

  @ManyToOne(() => User, (user) => user.sharedNotes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'shared_with_user_id' })
  sharedWith: User;

  @Column({ name: 'shared_by_user_id' })
  sharedByUserId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
