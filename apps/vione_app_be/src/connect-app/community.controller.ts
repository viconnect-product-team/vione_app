import { Controller, Get, Post, Body, Request, UseGuards, Param, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ConnectAppService } from './connect-app.service';

@Controller('community')
@UseGuards(JwtAuthGuard)
export class CommunityController {
  constructor(private readonly connectAppService: ConnectAppService) {}

  @Get('list')
  async getMyCommunities(@Request() req) {
    return this.connectAppService.getMyCommunities(req.user.id);
  }

  @Get(':communityId')
  async getCommunityDetail(@Request() req, @Param('communityId') communityId: string) {
    return this.connectAppService.getCommunityDetail(req.user.id, communityId);
  }

  @Get(':communityId/activity-preview')
  async getCommunityActivityPreview(@Request() req, @Param('communityId') communityId: string) {
    return this.connectAppService.getCommunityActivityPreview(req.user.id, communityId);
  }

  @Get(':communityId/members')
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

  @Get(':communityId/member/:memberRef')
  async getCommunityMemberProfile(
    @Request() req,
    @Param('communityId') communityId: string,
    @Param('memberRef') memberRef: string,
  ) {
    return this.connectAppService.getCommunityMemberProfile(req.user.id, communityId, memberRef);
  }

  @Post(':communityId/member/:memberRef/connect')
  async connectCommunityMember(
    @Request() req,
    @Param('communityId') communityId: string,
    @Param('memberRef') memberRef: string,
  ) {
    return this.connectAppService.connectCommunityMember(req.user.id, communityId, memberRef);
  }

  @Post(':communityId/member/:memberRef/role')
  async updateCommunityMemberRole(
    @Request() req,
    @Param('communityId') communityId: string,
    @Param('memberRef') memberRef: string,
    @Body('role') role: string,
  ) {
    return this.connectAppService.updateCommunityMemberRole(req.user.id, communityId, memberRef, role);
  }

  // --- Community News ---
  @Get('news/list')
  async listCommunityNews(
    @Request() req,
    @Query('communityId') communityId: string,
    @Query('offset') offset?: string,
  ) {
    return this.connectAppService.listCommunityNews(
      req.user.id,
      communityId,
      offset ? parseInt(offset, 10) : 0,
    );
  }

  @Get('news/detail')
  async getCommunityNewsDetail(
    @Request() req,
    @Query('communityId') communityId: string,
    @Query('newsRef') newsRef: string,
  ) {
    return this.connectAppService.getCommunityNewsDetail(req.user.id, communityId, newsRef);
  }

  // --- Community Join Requests ---
  @Get('join/list')
  async listJoinableCommunities(@Request() req) {
    return this.connectAppService.listJoinableCommunities(req.user.id);
  }

  @Post('join/request')
  async requestCommunityJoin(@Request() req, @Body() body: { communityId: string; note?: string | null }) {
    return this.connectAppService.requestCommunityJoin(req.user.id, body);
  }

  @Post('join/cancel')
  async cancelCommunityJoin(@Request() req, @Body() body: { communityId: string; cancelReason?: string | null }) {
    return this.connectAppService.cancelCommunityJoin(req.user.id, body);
  }

  @Get('join/history')
  async listCommunityJoinHistory(@Request() req) {
    return this.connectAppService.listCommunityJoinHistory(req.user.id);
  }

  @Post('join/sync-decisions')
  async syncCommunityJoinDecisions(@Request() req) {
    return this.connectAppService.syncCommunityJoinDecisions(req.user.id);
  }

  @Get('join/admin-requests')
  async listCommunityJoinAdminRequests(@Request() req) {
    return this.connectAppService.listCommunityJoinAdminRequests(req.user.id);
  }

  // --- Community Invites ---
  @Get('invite/list')
  async listCommunityInvites(@Request() req, @Query('communityId') communityId: string) {
    return this.connectAppService.listCommunityInvites(req.user.id, communityId);
  }

  @Post('invite/create')
  async createCommunityInvite(@Request() req, @Body() body: any) {
    return this.connectAppService.createCommunityInvite(req.user.id, body);
  }

  @Get('invite/templates')
  async listCommunityInviteTemplates(@Request() req, @Query('communityId') communityId: string) {
    return this.connectAppService.listCommunityInviteTemplates(req.user.id, communityId);
  }

  @Post('invite/save-template')
  async saveCommunityInviteTemplate(@Request() req, @Body() body: any) {
    return this.connectAppService.saveCommunityInviteTemplate(req.user.id, body);
  }

  @Post('invite/reset-template')
  async resetCommunityInviteTemplate(@Request() req, @Body() body: any) {
    return this.connectAppService.resetCommunityInviteTemplate(req.user.id, body);
  }

  @Post('invite/cancel')
  async cancelCommunityInvite(@Request() req, @Body() body: { inviteRef: string }) {
    return this.connectAppService.cancelCommunityInvite(req.user.id, body.inviteRef);
  }

  @Post('invite/resend')
  async resendCommunityInvite(@Request() req, @Body() body: { inviteRef: string; locale?: string }) {
    return this.connectAppService.resendCommunityInvite(req.user.id, body.inviteRef, body.locale);
  }

  @Get('invite/by-token')
  async getCommunityInviteByToken(@Request() req, @Query('token') token: string) {
    return this.connectAppService.getCommunityInviteByToken(req.user.id, token);
  }

  @Post('invite/accept')
  async acceptCommunityInvite(@Request() req, @Body() body: { token: string; email: string }) {
    return this.connectAppService.acceptCommunityInvite(req.user.id, body.token, body.email);
  }

  @Post('invite/update-role')
  async updateAcceptedInviteRole(@Request() req, @Body() body: { inviteRef: string; role: 'admin' | 'member' }) {
    return this.connectAppService.updateAcceptedInviteRole(req.user.id, body.inviteRef, body.role);
  }

  @Get('invite/role-history')
  async listInviteRoleHistory(@Request() req, @Query('inviteRef') inviteRef: string) {
    return this.connectAppService.listInviteRoleHistory(req.user.id, inviteRef);
  }

  // --- Community Activity ---
  @Get('activity/events/list')
  async listCommunityEvents(
    @Request() req,
    @Query('communityId') communityId: string,
    @Query('tab') tab: 'upcoming' | 'registered',
    @Query('offset') offset?: string,
  ) {
    return this.connectAppService.listCommunityEvents(
      req.user.id,
      communityId,
      tab,
      offset ? parseInt(offset, 10) : 0,
    );
  }

  @Get('activity/events/detail')
  async getCommunityEventDetail(
    @Request() req,
    @Query('communityId') communityId: string,
    @Query('eventRef') eventRef: string,
  ) {
    return this.connectAppService.getCommunityEventDetail(req.user.id, communityId, eventRef);
  }

  @Post('activity/events/register')
  async registerCommunityEvent(@Request() req, @Body() body: { communityId: string; eventRef: string }) {
    return this.connectAppService.registerCommunityEvent(req.user.id, body.communityId, body.eventRef);
  }

  @Post('activity/events/cancel-registration')
  async cancelCommunityEventRegistration(@Request() req, @Body() body: { communityId: string; eventRef: string }) {
    return this.connectAppService.cancelCommunityEventRegistration(req.user.id, body.communityId, body.eventRef);
  }

  @Get('activity/opportunities/list')
  async listCommunityOpportunities(
    @Request() req,
    @Query('communityId') communityId: string,
    @Query('query') query?: string,
    @Query('offset') offset?: string,
  ) {
    return this.connectAppService.listCommunityOpportunities(
      req.user.id,
      communityId,
      query || '',
      offset ? parseInt(offset, 10) : 0,
    );
  }

  @Get('activity/opportunities/detail')
  async getCommunityOpportunityDetail(
    @Request() req,
    @Query('communityId') communityId: string,
    @Query('opportunityRef') opportunityRef: string,
  ) {
    return this.connectAppService.getCommunityOpportunityDetail(req.user.id, communityId, opportunityRef);
  }

  @Post('activity/opportunities/express-interest')
  async expressCommunityOpportunityInterest(
    @Request() req,
    @Body() body: { communityId: string; opportunityRef: string; interestLevel?: 'high' | 'low' },
  ) {
    return this.connectAppService.expressCommunityOpportunityInterest(
      req.user.id,
      body.communityId,
      body.opportunityRef,
      body.interestLevel,
    );
  }

  @Post('activity/opportunities/withdraw-interest')
  async withdrawCommunityOpportunityInterest(
    @Request() req,
    @Body() body: { communityId: string; opportunityRef: string },
  ) {
    return this.connectAppService.withdrawCommunityOpportunityInterest(req.user.id, body.communityId, body.opportunityRef);
  }

  @Post('activity/opportunities/schedule-followup')
  async scheduleCommunityOpportunityFollowUp(
    @Request() req,
    @Body() body: { communityId: string; opportunityRef: string; inDays: number },
  ) {
    return this.connectAppService.scheduleCommunityOpportunityFollowUp(
      req.user.id,
      body.communityId,
      body.opportunityRef,
      body.inDays,
    );
  }

  @Post('activity/opportunities/update-followup')
  async updateCommunityOpportunityFollowUp(
    @Request() req,
    @Body() body: { communityId: string; opportunityRef: string; action: 'done' | 'cancel' },
  ) {
    return this.connectAppService.updateCommunityOpportunityFollowUp(
      req.user.id,
      body.communityId,
      body.opportunityRef,
      body.action,
    );
  }

  @Post('activity/opportunities/save-progress')
  async saveCommunityOpportunityProgress(
    @Request() req,
    @Body() body: { communityId: string; opportunityRef: string; progress: string; note?: string },
  ) {
    return this.connectAppService.saveCommunityOpportunityProgress(
      req.user.id,
      body.communityId,
      body.opportunityRef,
      body.progress,
      body.note || '',
    );
  }

  @Post('activity/opportunities/add-attachment')
  async addCommunityOpportunityAttachment(@Request() req, @Body() body: any) {
    return this.connectAppService.addCommunityOpportunityAttachment(req.user.id, body);
  }

  @Post('activity/opportunities/remove-attachment')
  async removeCommunityOpportunityAttachment(@Request() req, @Body() body: { attachmentId: string }) {
    return this.connectAppService.removeCommunityOpportunityAttachment(req.user.id, body.attachmentId);
  }
}
