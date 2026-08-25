import { Injectable, BadRequestException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findByUsername(username);
    if (!user || !user.password) {
      return null;
    }
    
    const isMatch = await bcrypt.compare(pass, user.password);
    
    if (isMatch) {
      const { password, ...result } = user;
      return {
        ...result,
        id: result.id.toString(),
      };
    }
    return null;
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }

  async register(data: any) {
    const existingUser = await this.usersService.findByUsername(data.username);
    if (existingUser) {
      throw new BadRequestException('Username already exists');
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(data.password, salt);

    const newUser = await this.usersService.createUser({
      username: data.username,
      password: hashedPassword,
    });

    const { password, ...result } = newUser;
    return {
      message: 'Registration successful',
      user: {
        ...result,
        id: result.id.toString(),
      },
    };
  }
}
