import { Controller, Get, Post, Body, Request, UseGuards, Param, Query, Delete } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ConnectAppService } from './connect-app.service';

@Controller('connect-app')
@UseGuards(JwtAuthGuard)
export class ConnectAppController {
  constructor(private readonly connectAppService: ConnectAppService) {}

  @Get('briefing')
  async getBriefing(@Request() req) {
    return this.connectAppService.getBriefing(req.user.id);
  }

  @Get('community/list')
  async getMyCommunities(@Request() req) {
    return this.connectAppService.getMyCommunities(req.user.id);
  }

  @Get('me/profile')
  async getMyProfile(@Request() req) {
    return this.connectAppService.getMyProfile(req.user.id);
  }

  @Post('me/profile')
  async updateMyProfile(@Request() req, @Body() data: any) {
    return this.connectAppService.updateMyProfile(req.user.id, data);
  }

  @Get('me/identity')
  async getMyIdentity(@Request() req) {
    return this.connectAppService.getMyIdentity(req.user.id);
  }

  @Post('me/identity')
  async upsertMyIdentity(@Request() req, @Body() data: any) {
    return this.connectAppService.upsertMyIdentity(req.user.id, data);
  }

  @Post('me/identity/visibility')
  async updateMyVisibility(@Request() req, @Body() updates: any[]) {
    return this.connectAppService.updateMyVisibility(req.user.id, updates);
  }

  @Post('me/identity/share-link')
  async getOrCreateMyShareLink(@Request() req) {
    return this.connectAppService.getOrCreateMyShareLink(req.user.id);
  }

  @Post('me/identity/share-link/rotate')
  async rotateMyShareLink(@Request() req) {
    return this.connectAppService.rotateMyShareLink(req.user.id);
  }

  @Get('community/:communityId')
  async getCommunityDetail(@Request() req, @Param('communityId') communityId: string) {
    return this.connectAppService.getCommunityDetail(req.user.id, communityId);
  }

  @Get('community/:communityId/activity-preview')
  async getCommunityActivityPreview(@Request() req, @Param('communityId') communityId: string) {
    return this.connectAppService.getCommunityActivityPreview(req.user.id, communityId);
  }

  @Get('community/:communityId/members')
  async listCommunityMembers(
    @Request() req,
    @Param('communityId') communityId: string,
    @Query('query') query?: string,
    @Query('offset') offset?: string,
    @Query('roleFilter') roleFilter?: string,
  ) {
    return this.connectAppService.listCommunityMembers(
      req.user.id,
      communityId,
      query || '',
      offset ? parseInt(offset, 10) : 0,
      roleFilter || 'all',
    );
  }

  @Get('community/:communityId/member/:memberRef')
  async getCommunityMemberProfile(
    @Request() req,
    @Param('communityId') communityId: string,
    @Param('memberRef') memberRef: string,
  ) {
    return this.connectAppService.getCommunityMemberProfile(req.user.id, communityId, memberRef);
  }

  @Post('community/:communityId/member/:memberRef/connect')
  async connectCommunityMember(
    @Request() req,
    @Param('communityId') communityId: string,
    @Param('memberRef') memberRef: string,
  ) {
    return this.connectAppService.connectCommunityMember(req.user.id, communityId, memberRef);
  }

  @Post('community/:communityId/member/:memberRef/role')
  async updateCommunityMemberRole(
    @Request() req,
    @Param('communityId') communityId: string,
    @Param('memberRef') memberRef: string,
    @Body('role') role: string,
  ) {
    return this.connectAppService.updateCommunityMemberRole(req.user.id, communityId, memberRef, role);
  }

  @Get('network/connections')
  async listConnections(@Request() req) {
    return this.connectAppService.listConnections(req.user.id);
  }

  @Post('network/resolve-counterparts')
  async resolvePublicCounterparts(@Body('userIds') userIds: string[]) {
    return this.connectAppService.resolvePublicCounterparts(userIds);
  }

  @Get('network/saved-cards')
  async searchSavedCards(@Request() req, @Query('term') term?: string) {
    return this.connectAppService.searchSavedCards(req.user.id, term || '');
  }

  @Get('network/guest-contacts')
  async listGuestContacts(@Request() req) {
    return this.connectAppService.listGuestContacts(req.user.id);
  }

  @Get('network/guest-contacts/:id')
  async getGuestContact(@Request() req, @Param('id') id: string) {
    return this.connectAppService.getGuestContact(req.user.id, id);
  }

  @Post('network/guest-contacts/:id/owner-fields')
  async updateGuestContactOwnerFields(
    @Request() req,
    @Param('id') id: string,
    @Body() body: { ownerLabel?: string | null; ownerNote?: string | null },
  ) {
    return this.connectAppService.updateGuestContactOwnerFields(req.user.id, id, body);
  }

  @Delete('network/guest-contacts/:id')
  async deleteGuestContact(@Request() req, @Param('id') id: string) {
    return this.connectAppService.deleteGuestContact(req.user.id, id);
  }

  @Get('network/recommendations/today')
  async getTodayRecommendations(@Request() req) {
    return this.connectAppService.getTodayRecommendations(req.user.id);
  }

  @Get('network/recommendations/person/:personId')
  async getPersonRecommendation(@Request() req, @Param('personId') personId: string) {
    return this.connectAppService.getPersonRecommendation(req.user.id, personId);
  }

  @Post('network/recommendations/dismiss')
  async dismissRecommendation(@Request() req, @Body('personId') personId: string) {
    return this.connectAppService.dismissRecommendation(req.user.id, personId);
  }

  @Get('network/feed')
  async getNetworkFeed(@Request() req, @Query('cursor') cursor?: string) {
    return this.connectAppService.getNetworkFeed(req.user.id, cursor || null);
  }

  @Get('notifications/unread-count')
  async getUnreadNotificationCount(@Request() req) {
    return this.connectAppService.getUnreadNotificationCount(req.user.id);
  }

  @Post('network/requests/send')
  async sendConnectionRequest(@Request() req, @Body() body: any) {
    return this.connectAppService.sendConnectionRequest(req.user.id, body);
  }

  @Post('network/requests/accept')
  async acceptConnection(@Request() req, @Body() body: any) {
    return this.connectAppService.acceptConnection(req.user.id, body);
  }

  @Post('network/requests/decline')
  async declineConnection(@Request() req, @Body() body: any) {
    return this.connectAppService.declineConnection(req.user.id, body);
  }

  @Post('network/requests/cancel')
  async cancelConnection(@Request() req, @Body() body: any) {
    return this.connectAppService.cancelConnection(req.user.id, body);
  }

  @Post('network/requests/disconnect')
  async disconnectConnection(@Request() req, @Body() body: any) {
    return this.connectAppService.disconnectConnection(req.user.id, body);
  }

  @Post('network/block')
  async blockUser(@Request() req, @Body() body: any) {
    return this.connectAppService.blockUser(req.user.id, body);
  }

  @Get('network/state')
  async getConnectionState(@Request() req, @Query('targetUserId') targetUserId: string) {
    return this.connectAppService.getConnectionState(req.user.id, targetUserId);
  }

  @Get('network/connection/:connectionId')
  async getConnectionById(@Request() req, @Param('connectionId') connectionId: string) {
    return this.connectAppService.getConnectionById(req.user.id, connectionId);
  }

  @Get('network/requests/incoming')
  async listIncomingRequests(@Request() req) {
    return this.connectAppService.listIncomingRequests(req.user.id);
  }

  @Get('network/requests/outgoing')
  async listOutgoingRequests(@Request() req) {
    return this.connectAppService.listOutgoingRequests(req.user.id);
  }

  @Get('network/connections/status-counts')
  async countConnectionsByStatus(@Request() req) {
    return this.connectAppService.countConnectionsByStatus(req.user.id);
  }
}

@Controller('connect-app/public')
export class ConnectAppPublicController {
  constructor(private readonly connectAppService: ConnectAppService) {}

  @Get('identity/:token')
  async getPublicIdentityByToken(@Param('token') token: string) {
    return this.connectAppService.getPublicIdentityByToken(token);
  }
}
