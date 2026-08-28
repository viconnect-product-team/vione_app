import { Controller, Post, Body, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ConnectAppService } from './connect-app.service';

@Controller('connect-app/dm')
@UseGuards(JwtAuthGuard)
export class DmController {
  constructor(private readonly connectAppService: ConnectAppService) {}

  @Post('threads')
  async listMyDmThreads(@Request() req) {
    return this.connectAppService.listMyDmThreads(req.user.id);
  }

  @Post('thread/open')
  async openMyDmThread(@Request() req, @Body('counterpartUserId') counterpartUserId: string) {
    return this.connectAppService.openMyDmThread(req.user.id, counterpartUserId);
  }

  @Post('thread/messages')
  async listMyDmThreadMessages(@Request() req, @Body('threadId') threadId: string) {
    return this.connectAppService.listMyDmThreadMessages(req.user.id, threadId);
  }

  @Post('message/send')
  async sendMyDmMessage(@Request() req, @Body() data: { threadId: string; body: string; clientToken: string }) {
    return this.connectAppService.sendMyDmMessage(req.user.id, data.threadId, data);
  }

  @Post('thread/mark-read')
  async markMyDmThreadRead(@Request() req, @Body('threadId') threadId: string) {
    return this.connectAppService.markMyDmThreadRead(req.user.id, threadId);
  }

  @Post('message/retract')
  async retractMyDmMessage(@Request() req, @Body('messageId') messageId: string) {
    return this.connectAppService.retractMyDmMessage(req.user.id, messageId);
  }
}
