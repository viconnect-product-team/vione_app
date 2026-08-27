import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
  Get,
  InternalServerErrorException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @Post('register')
  async register(@Body() registerDto: Record<string, any>) {
    return this.authService.register(registerDto);
  }

  @Post('google')
  @HttpCode(HttpStatus.OK)
  async googleLogin(@Body('token') token: string) {
    return this.authService.googleLogin(token);
  }

  @Post('apple')
  @HttpCode(HttpStatus.OK)
  async appleLogin(
    @Body('identityToken') identityToken: string,
    @Body('authorizationCode') authorizationCode?: string,
    @Body('fullName') fullName?: any,
    @Body('email') email?: string,
  ) {
    return this.authService.appleLogin({
      identityToken,
      authorizationCode,
      fullName,
      email,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@Request() req) {
    return req.user;
  }
}
