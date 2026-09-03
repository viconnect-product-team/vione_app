import { Controller, Get, Post, Delete, Body, Request, UseGuards, Param, BadRequestException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ConnectAppService } from './connect-app.service';

@Controller('dm')
@UseGuards(JwtAuthGuard)
export class DmController {
  constructor(private readonly connectAppService: ConnectAppService) {}

  @Get('threads')
  async listMyDmThreads(@Request() req) {
    return this.connectAppService.listMyDmThreads(req.user.id);
  }

  @Post('threads')
  async openMyDmThread(
    @Request() req,
    @Body('counterpartUserId') counterpartUserId?: string,
    @Body('personId') personId?: string,
  ) {
    let cleanId = counterpartUserId;
    if (personId && personId.startsWith('u:')) {
      cleanId = personId.substring(2);
    }
    if (!cleanId) {
      throw new BadRequestException('counterpart_user_id_required');
    }
    return this.connectAppService.openMyDmThread(req.user.id, cleanId);
  }

  @Get('threads/:threadId')
  async getMyDmThreadDetail(@Request() req, @Param('threadId') threadId: string) {
    return this.connectAppService.getMyDmThreadDetail(req.user.id, threadId);
  }

  @Post('threads/:threadId/messages')
  async sendMyDmMessage(
    @Request() req,
    @Param('threadId') threadId: string,
    @Body() data: { body: string; clientToken: string },
  ) {
    return this.connectAppService.sendMyDmMessage(req.user.id, threadId, data);
  }

  @Post('threads/:threadId/read')
  async markMyDmThreadRead(@Request() req, @Param('threadId') threadId: string) {
    return this.connectAppService.markMyDmThreadRead(req.user.id, threadId);
  }

  @Delete('messages/:messageId')
  async retractMyDmMessage(@Request() req, @Param('messageId') messageId: string) {
    return this.connectAppService.retractMyDmMessage(req.user.id, messageId);
  }
}
