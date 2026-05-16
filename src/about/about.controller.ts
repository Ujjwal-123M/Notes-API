import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

@ApiTags('about')
@Controller()
export class AboutController {
  constructor(private readonly configService: ConfigService) {}

  @Get('about')
  getAbout() {
    return {
      name: this.configService.get<string>('ABOUT_NAME', 'Your Name'),
      email: this.configService.get<string>('ABOUT_EMAIL', 'your.email@example.com'),
      'my features': {
        'Pin important notes':
          'Lets users pin notes so they stay at the top of their list. I chose this because quick access to key notes mirrors how people use Keep or Apple Notes every day.',
        'Optional pagination on GET /notes':
          'Supports page and limit query params for larger note libraries without changing the default response shape.',
      },
    };
  }
}
