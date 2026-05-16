import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Note } from '../notes/note.entity';

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(Note)
    private readonly notesRepository: Repository<Note>,
  ) {}

  async searchNotes(userId: string, query: string): Promise<Note[]> {
    const keyword = query?.trim();
    if (!keyword) {
      throw new BadRequestException('Search query q is required');
    }

    return this.notesRepository
      .createQueryBuilder('note')
      .where('note.owner_id = :userId', { userId })
      .andWhere('(note.title ILIKE :q OR note.content ILIKE :q)', {
        q: `%${keyword}%`,
      })
      .orderBy('note.updated_at', 'DESC')
      .getMany();
  }
}
