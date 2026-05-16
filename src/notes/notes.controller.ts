import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { toNoteResponse } from '../common/note.serializer';
import { User } from '../users/user.entity';
import { CreateNoteDto } from './dto/create-note.dto';
import { PinNoteDto } from './dto/pin-note.dto';
import { ShareNoteDto } from './dto/share-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { NotesService } from './notes.service';

interface AuthenticatedRequest {
  user: User;
}

@ApiTags('notes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  // List notes owned by the authenticated user (pinned first)
  @Get()
  @ApiOperation({ summary: 'Get all notes for authenticated user' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAll(
    @Req() req: AuthenticatedRequest,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : undefined;
    const limitNum = limit ? parseInt(limit, 10) : undefined;

    if (page && (!pageNum || pageNum < 1)) {
      throw new BadRequestException('page must be a positive integer');
    }
    if (limit && (!limitNum || limitNum < 1 || limitNum > 100)) {
      throw new BadRequestException('limit must be between 1 and 100');
    }

    const notes = await this.notesService.findAllForUser(
      req.user.id,
      pageNum,
      limitNum,
    );
    return notes.map((note) => toNoteResponse(note));
  }

  @Get(':id')
  async findOne(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const note = await this.notesService.findOneAccessible(id, req.user.id);
    return toNoteResponse(note);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateNoteDto,
  ) {
    const note = await this.notesService.create(req.user.id, dto);
    return toNoteResponse(note);
  }

  @Put(':id')
  async update(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateNoteDto,
  ) {
    const note = await this.notesService.update(id, req.user.id, dto);
    return toNoteResponse(note);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    await this.notesService.remove(id, req.user.id);
  }

  // Grant read access to another registered user by email
  @Post(':id/share')
  @HttpCode(HttpStatus.OK)
  async share(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ShareNoteDto,
  ) {
    await this.notesService.share(id, req.user.id, dto.share_with_email);
    return { message: 'Note shared successfully' };
  }

  // Custom feature: pin or unpin a note for quick access
  @Patch(':id/pin')
  async pin(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: PinNoteDto,
  ) {
    const note = await this.notesService.setPinned(id, req.user.id, dto.pinned);
    return toNoteResponse(note, true);
  }
}
