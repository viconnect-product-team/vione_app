import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ConnectAppService } from './connect-app.service';

@Controller('content')
@UseGuards(JwtAuthGuard)
export class ContentController {
  constructor(private readonly connectAppService: ConnectAppService) {}

  @Get('news')
  async listNews() {
    return this.connectAppService.listPublishedNews();
  }

  @Get('perks')
  async listPerks() {
    return this.connectAppService.listActivePerks();
  }

  @Get('perks/:id')
  async getPerk(@Param('id') id: string) {
    return this.connectAppService.getPerkById(id);
  }
}
