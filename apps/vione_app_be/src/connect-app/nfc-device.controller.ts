import { Controller, Post, Body, Request, UseGuards, Headers } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ConnectAppService } from './connect-app.service';

@Controller('connect-app')
@UseGuards(JwtAuthGuard)
export class NfcDeviceController {
  constructor(private readonly connectAppService: ConnectAppService) {}

  // --- NFC Tags ---
  @Post('me/nfc/list')
  async listMyNfcTags(@Request() req) {
    return this.connectAppService.listMyNfcTags(req.user.id);
  }

  @Post('me/nfc/register')
  async registerMyNfcTag(@Request() req, @Body() data: any) {
    return this.connectAppService.registerMyNfcTag(req.user.id, data);
  }

  @Post('me/nfc/revoke')
  async revokeMyNfcTag(@Request() req, @Body('tagId') tagId: string) {
    return this.connectAppService.revokeMyNfcTag(req.user.id, tagId);
  }

  @Post('me/nfc/rename')
  async renameMyNfcTag(@Request() req, @Body() data: any) {
    return this.connectAppService.renameMyNfcTag(req.user.id, data);
  }

  // --- Active Sessions ---
  @Post('me/sessions/list')
  async listMyDeviceSessions(@Request() req, @Headers('x-device-key') currentKey?: string) {
    return this.connectAppService.listMyDeviceSessions(req.user.id, currentKey || null);
  }

  @Post('me/sessions/touch')
  async touchMyDeviceSession(@Request() req, @Body() data: any) {
    return this.connectAppService.touchMyDeviceSession(req.user.id, data);
  }

  @Post('me/sessions/revoke')
  async revokeMyDeviceSession(
    @Request() req,
    @Body('sessionId') sessionId: string,
    @Headers('x-device-key') currentKey?: string,
  ) {
    return this.connectAppService.revokeMyDeviceSession(req.user.id, sessionId, currentKey || null);
  }
}
