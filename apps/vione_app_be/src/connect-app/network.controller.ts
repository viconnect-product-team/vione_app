import { Controller, Get, Post, Body, Request, UseGuards, Param, Query, Delete } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ConnectAppService } from './connect-app.service';

@Controller('network')
@UseGuards(JwtAuthGuard)
export class NetworkController {
  constructor(private readonly connectAppService: ConnectAppService) {}

  @Get('connections')
  async listConnections(@Request() req) {
    return this.connectAppService.listConnections(req.user.id);
  }

  @Post('resolve-counterparts')
  async resolvePublicCounterparts(@Body('userIds') userIds: string[]) {
    return this.connectAppService.resolvePublicCounterparts(userIds);
  }

  @Get('saved-cards')
  async searchSavedCards(@Request() req, @Query('term') term?: string) {
    return this.connectAppService.searchSavedCards(req.user.id, term || '');
  }

  @Get('guest-contacts')
  async listGuestContacts(@Request() req) {
    return this.connectAppService.listGuestContacts(req.user.id);
  }

  @Get('guest-contacts/:id')
  async getGuestContact(@Request() req, @Param('id') id: string) {
    return this.connectAppService.getGuestContact(req.user.id, id);
  }

  @Post('guest-contacts/:id/owner-fields')
  async updateGuestContactOwnerFields(
    @Request() req,
    @Param('id') id: string,
    @Body() body: { ownerLabel?: string | null; ownerNote?: string | null },
  ) {
    return this.connectAppService.updateGuestContactOwnerFields(req.user.id, id, body);
  }

  @Delete('guest-contacts/:id')
  async deleteGuestContact(@Request() req, @Param('id') id: string) {
    return this.connectAppService.deleteGuestContact(req.user.id, id);
  }

  @Get('recommendations/today')
  async getTodayRecommendations(@Request() req) {
    return this.connectAppService.getTodayRecommendations(req.user.id);
  }

  @Get('recommendations/person/:personId')
  async getPersonRecommendation(@Request() req, @Param('personId') personId: string) {
    return this.connectAppService.getPersonRecommendation(req.user.id, personId);
  }

  @Post('recommendations/dismiss')
  async dismissRecommendation(@Request() req, @Body('personId') personId: string) {
    return this.connectAppService.dismissRecommendation(req.user.id, personId);
  }

  @Get('feed')
  async getNetworkFeed(@Request() req, @Query('cursor') cursor?: string) {
    return this.connectAppService.getNetworkFeed(req.user.id, cursor || null);
  }

  @Post('requests/send')
  async sendConnectionRequest(@Request() req, @Body() body: any) {
    return this.connectAppService.sendConnectionRequest(req.user.id, body);
  }

  @Post('requests/accept')
  async acceptConnection(@Request() req, @Body() body: any) {
    return this.connectAppService.acceptConnection(req.user.id, body);
  }

  @Post('requests/decline')
  async declineConnection(@Request() req, @Body() body: any) {
    return this.connectAppService.declineConnection(req.user.id, body);
  }

  @Post('requests/cancel')
  async cancelConnection(@Request() req, @Body() body: any) {
    return this.connectAppService.cancelConnection(req.user.id, body);
  }

  @Post('requests/disconnect')
  async disconnectConnection(@Request() req, @Body() body: any) {
    return this.connectAppService.disconnectConnection(req.user.id, body);
  }

  @Post('block')
  async blockUser(@Request() req, @Body() body: any) {
    return this.connectAppService.blockUser(req.user.id, body);
  }

  @Get('state')
  async getConnectionState(@Request() req, @Query('targetUserId') targetUserId: string) {
    return this.connectAppService.getConnectionState(req.user.id, targetUserId);
  }

  @Get('token-state/:token')
  async getConnectionStateByToken(@Request() req, @Param('token') token: string) {
    return this.connectAppService.getConnectionStateByToken(req.user.id, token);
  }

  @Post('token-connect')
  async sendConnectionRequestByToken(@Request() req, @Body('token') token: string, @Body('mutationKey') mutationKey?: string) {
    return this.connectAppService.sendConnectionRequestByToken(req.user.id, token, mutationKey);
  }

  @Get('connection/:connectionId')
  async getConnectionById(@Request() req, @Param('connectionId') connectionId: string) {
    return this.connectAppService.getConnectionById(req.user.id, connectionId);
  }

  @Get('requests/incoming')
  async listIncomingRequests(@Request() req) {
    return this.connectAppService.listIncomingRequests(req.user.id);
  }

  @Get('requests/outgoing')
  async listOutgoingRequests(@Request() req) {
    return this.connectAppService.listOutgoingRequests(req.user.id);
  }

  @Get('connections/status-counts')
  async countConnectionsByStatus(@Request() req) {
    return this.connectAppService.countConnectionsByStatus(req.user.id);
  }

  @Post('abuse/report')
  async reportUser(@Request() req, @Body() data: any) {
    return this.connectAppService.reportUser(req.user.id, data);
  }
}
