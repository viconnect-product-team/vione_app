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
}
