import { Controller, Get, Param } from '@nestjs/common';
import { ConnectAppService } from './connect-app.service';

@Controller('public')
export class PublicController {
  constructor(private readonly connectAppService: ConnectAppService) {}

  @Get('identity/:token')
  async getPublicIdentityByToken(@Param('token') token: string) {
    return this.connectAppService.getPublicIdentityByToken(token);
  }
}
