import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ConnectAppService } from './connect-app.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('public')
export class PublicController {
  constructor(private readonly connectAppService: ConnectAppService) {}

  @Get('identity/:token')
  async getPublicIdentityByToken(@Param('token') token: string) {
    return this.connectAppService.getPublicIdentityByToken(token);
  }

  /** Anonymous guest shares their contact back to the card owner. No auth required. */
  @Post('card/:slug/contact')
  async shareGuestContact(@Param('slug') slug: string, @Body() body: any) {
    return this.connectAppService.shareGuestContact(slug, body);
  }

  /** Admin renewal audit scope — requires JWT. */
  @Get('admin/renewal-scope')
  @UseGuards(JwtAuthGuard)
  async getAdminRenewalScope(@Request() req) {
    return this.connectAppService.getAdminRenewalScope(req.user.id);
  }

  /** Admin renewal audit search — requires JWT. */
  @Post('admin/renewal-audit')
  @UseGuards(JwtAuthGuard)
  async searchRenewalAuditLog(@Request() req, @Body() body: any) {
    return this.connectAppService.searchRenewalAuditLog(req.user.id, body);
  }
}
