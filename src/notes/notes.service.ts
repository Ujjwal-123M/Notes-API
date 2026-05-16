import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { UsersService } from '../users/users.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { NoteShare } from './note-share.entity';
import { Note } from './note.entity';

@Injectable()
export class NotesService {
  constructor(
    @InjectRepository(Note)
    private readonly notesRepository: Repository<Note>,
    @InjectRepository(NoteShare)
    private readonly sharesRepository: Repository<NoteShare>,
    private readonly usersService: UsersService,
  ) {}

  async findAllForUser(
    userId: string,
    page?: number,
    limit?: number,
  ): Promise<Note[]> {
    const qb = this.notesRepository
      .createQueryBuilder('note')
      .where('note.owner_id = :userId', { userId })
      .orderBy('note.pinned', 'DESC')
      .addOrderBy('note.updated_at', 'DESC');

    if (page && limit) {
      qb.skip((page - 1) * limit).take(limit);
    }

    return qb.getMany();
  }

  async findOneAccessible(noteId: string, userId: string): Promise<Note> {
    const note = await this.notesRepository.findOne({ where: { id: noteId } });
    if (!note) {
      throw new NotFoundException('Note not found');
    }

    if (note.ownerId === userId) {
      return note;
    }

    const share = await this.sharesRepository.findOne({
      where: { noteId, sharedWithUserId: userId },
    });
    if (!share) {
      throw new NotFoundException('Note not found');
    }

    return note;
  }

  async create(userId: string, dto: CreateNoteDto): Promise<Note> {
    const note = this.notesRepository.create({
      title: dto.title.trim(),
      content: dto.content,
      ownerId: userId,
    });
    return this.notesRepository.save(note);
  }

  async update(
    noteId: string,
    userId: string,
    dto: UpdateNoteDto,
  ): Promise<Note> {
    const note = await this.findOwnedNote(noteId, userId);
    note.title = dto.title.trim();
    note.content = dto.content;
    return this.notesRepository.save(note);
  }

  async remove(noteId: string, userId: string): Promise<void> {
    const note = await this.findOwnedNote(noteId, userId);
    await this.notesRepository.remove(note);
  }

  async share(
    noteId: string,
    ownerId: string,
    shareWithEmail: string,
  ): Promise<void> {
    const note = await this.findOwnedNote(noteId, ownerId);
    const recipient = await this.usersService.findByEmail(shareWithEmail);

    if (!recipient) {
      throw new NotFoundException('Recipient user not found');
    }

    if (recipient.id === ownerId) {
      throw new BadRequestException('You cannot share a note with yourself');
    }

    const existing = await this.sharesRepository.findOne({
      where: { noteId: note.id, sharedWithUserId: recipient.id },
    });
    if (existing) {
      return;
    }

    const share = this.sharesRepository.create({
      noteId: note.id,
      sharedWithUserId: recipient.id,
      sharedByUserId: ownerId,
    });
    await this.sharesRepository.save(share);
  }

  async setPinned(
    noteId: string,
    userId: string,
    pinned: boolean,
  ): Promise<Note> {
    const note = await this.findOwnedNote(noteId, userId);
    note.pinned = pinned;
    return this.notesRepository.save(note);
  }

  private async findOwnedNote(noteId: string, userId: string): Promise<Note> {
    const note = await this.notesRepository.findOne({ where: { id: noteId } });
    if (!note || note.ownerId !== userId) {
      throw new NotFoundException('Note not found');
    }
    return note;
  }
}
