import { IsEmail, IsNotEmpty } from 'class-validator';

export class ShareNoteDto {
  @IsEmail()
  @IsNotEmpty()
  share_with_email: string;
}
