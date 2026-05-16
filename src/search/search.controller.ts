import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { toNoteResponse } from '../common/note.serializer';
import { User } from '../users/user.entity';
import { SearchService } from './search.service';

interface AuthenticatedRequest {
  user: User;
}

@ApiTags('search')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  // Stretch goal: full-text search across owned notes
  @Get('search')
  @ApiQuery({ name: 'q', required: true, type: String })
  async search(
    @Req() req: AuthenticatedRequest,
    @Query('q') query: string,
  ) {
    const notes = await this.searchService.searchNotes(req.user.id, query);
    return notes.map((note) => toNoteResponse(note));
  }
}
