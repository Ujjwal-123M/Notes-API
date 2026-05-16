import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(email: string, password: string): Promise<void> {
    await this.usersService.create(email, password);
  }

  async login(email: string, password: string): Promise<string> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException({
        message: 'Invalid email or password',
      });
    }

    const valid = await this.usersService.validatePassword(user, password);
    if (!valid) {
      throw new UnauthorizedException({
        message: 'Invalid email or password',
      });
    }

    return this.jwtService.sign({
      sub: user.id,
      email: user.email,
    });
  }
}
