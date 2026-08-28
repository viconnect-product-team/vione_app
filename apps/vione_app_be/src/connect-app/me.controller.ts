import { Controller, Get, Post, Delete, Body, Request, UseGuards, Query, Param } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ConnectAppService } from './connect-app.service';

@Controller('me')
@UseGuards(JwtAuthGuard)
export class MeController {
  constructor(private readonly connectAppService: ConnectAppService) {}

  @Get('profile')
  async getMyProfile(@Request() req) {
    return this.connectAppService.getMyProfile(req.user.id);
  }

  @Post('profile')
  async updateMyProfile(@Request() req, @Body() data: any) {
    return this.connectAppService.updateMyProfile(req.user.id, data);
  }

  @Get('identity')
  async getMyIdentity(@Request() req) {
    return this.connectAppService.getMyIdentity(req.user.id);
  }

  @Post('identity')
  async upsertMyIdentity(@Request() req, @Body() data: any) {
    return this.connectAppService.upsertMyIdentity(req.user.id, data);
  }

  @Post('identity/visibility')
  async updateMyVisibility(@Request() req, @Body() updates: any[]) {
    return this.connectAppService.updateMyVisibility(req.user.id, updates);
  }

  @Post('identity/share-link')
  async getOrCreateMyShareLink(@Request() req) {
    return this.connectAppService.getOrCreateMyShareLink(req.user.id);
  }

  @Post('identity/share-link/rotate')
  async rotateMyShareLink(@Request() req) {
    return this.connectAppService.rotateMyShareLink(req.user.id);
  }

  @Get('briefing')
  async getBriefing(@Request() req) {
    return this.connectAppService.getBriefing(req.user.id);
  }

  @Get('notifications')
  async listNotifications(@Request() req, @Query('limit') limit?: string) {
    const lim = limit ? parseInt(limit, 10) : 30;
    return this.connectAppService.listNotifications(req.user.id, lim);
  }

  @Get('notifications/unread-count')
  async getUnreadNotificationCount(@Request() req) {
    return this.connectAppService.getUnreadNotificationCount(req.user.id);
  }

  @Post('notifications/mark-read')
  async markNotificationsRead(@Request() req, @Body('ids') ids?: string[]) {
    return this.connectAppService.markNotificationsRead(req.user.id, ids);
  }

  @Get('notifications/prefs')
  async getNotificationPrefs(@Request() req) {
    return this.connectAppService.getNotificationPrefs(req.user.id);
  }

  @Post('notifications/prefs')
  async setNotificationPrefs(@Request() req, @Body() prefs: any) {
    return this.connectAppService.setNotificationPrefs(req.user.id, prefs);
  }

  @Get('showcase')
  async getMyShowcase(@Request() req) {
    return this.connectAppService.getMyShowcase(req.user.id);
  }

  @Post('showcase')
  async addShowcaseItem(@Request() req, @Body() data: any) {
    return this.connectAppService.addShowcaseItem(req.user.id, data);
  }

  @Delete('showcase/:id')
  async deleteShowcaseItem(@Request() req, @Param('id') id: string) {
    return this.connectAppService.deleteShowcaseItem(req.user.id, id);
  }
}
