import { Controller, Get, Post, Body, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ConnectAppService } from './connect-app.service';

@Controller('opportunities')
@UseGuards(JwtAuthGuard)
export class OpportunityController {
  constructor(private readonly connectAppService: ConnectAppService) {}

  @Get('my-opportunities')
  async listMyOpportunities(@Request() req: any) {
    return this.connectAppService.listMyOpportunities(req.user.id);
  }

  @Post('express-interest')
  async expressInterest(@Request() req: any, @Body() body: { opportunityId: string; message?: string }) {
    return this.connectAppService.expressOpportunityInterest(req.user.id, body.opportunityId, body.message);
  }
}
