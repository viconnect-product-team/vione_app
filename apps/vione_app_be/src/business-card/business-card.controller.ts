import { Controller, Get, Post, Body, Param, UseGuards, Request, Patch, Delete } from '@nestjs/common';
import { BusinessCardService } from './business-card.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('business-cards')
export class BusinessCardController {
  constructor(private readonly businessCardService: BusinessCardService) {}

  @Get('public/:slug')
  getPublicCard(@Param('slug') slug: string) {
    return this.businessCardService.getPublicBySlug(slug);
  }

  @UseGuards(AuthGuard)
  @Get()
  listMyCards(@Request() req: any) {
    return this.businessCardService.listMyCards(req.user.sub);
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  getMyCard(@Request() req: any, @Param('id') id: string) {
    return this.businessCardService.getMyCard(req.user.sub, id);
  }

  @UseGuards(AuthGuard)
  @Post()
  saveCard(@Request() req: any, @Body() data: any) {
    return this.businessCardService.saveCard(req.user.sub, data);
  }

  @UseGuards(AuthGuard)
  @Patch(':id/status')
  setStatus(@Request() req: any, @Param('id') id: string, @Body('status') status: string) {
    return this.businessCardService.setStatus(req.user.sub, id, status);
  }
  @UseGuards(AuthGuard)
  @Get('preview/:slug')
  getPreviewBySlug(@Param('slug') slug: string) {
    return this.businessCardService.getPreviewBySlug(slug);
  }

  @Get('public-slugs')
  listPublicProfileSlugs() {
    return this.businessCardService.listPublicProfileSlugs();
  }

  @UseGuards(AuthGuard)
  @Post(':id/primary')
  setPrimary(@Request() req: any, @Param('id') id: string) {
    return this.businessCardService.setPrimary(req.user.sub, id);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  deleteCard(@Request() req: any, @Param('id') id: string) {
    return this.businessCardService.deleteCard(req.user.sub, id);
  }

  // --- Leads ---

  @UseGuards(AuthGuard)
  @Get('leads/me')
  listMyLeads(@Request() req: any) {
    return this.businessCardService.listMyLeads(req.user.sub);
  }

  @UseGuards(AuthGuard)
  @Patch('leads/:id/status')
  updateLeadStatus(@Request() req: any, @Param('id') id: string, @Body() body: any) {
    return this.businessCardService.updateLeadStatus(req.user.sub, id, body.status, body.note);
  }

  @UseGuards(AuthGuard)
  @Post('leads/:id/reply')
  sendLeadReply(@Request() req: any, @Param('id') id: string, @Body() body: any) {
    return this.businessCardService.sendLeadReply(req.user.sub, id, body);
  }

  @UseGuards(AuthGuard)
  @Post('leads/:id/workflow')
  processLeadWorkflow(@Request() req: any, @Param('id') id: string, @Body() body: any) {
    return this.businessCardService.processLeadWorkflow(req.user.sub, id, body.status, body.note);
  }

  @UseGuards(AuthGuard)
  @Get('leads/stats')
  getLeadStats(@Request() req: any) {
    // Assuming days is passed as a query param
    const days = req.query.days ? parseInt(req.query.days, 10) : 30;
    return this.businessCardService.getLeadStats(req.user.sub, days);
  }
}

