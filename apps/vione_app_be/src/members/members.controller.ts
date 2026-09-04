import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  MembersService,
  CreateMemberDto,
  UpdateMemberDto,
  UpdateMemberContactDto,
} from './members.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('members')
@UseGuards(JwtAuthGuard)
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Get('directory')
  async listDirectory(@Request() req: any) {
    return this.membersService.listDirectory(req.user.id);
  }

  @Get('me')
  async getMyMember(@Request() req: any) {
    return this.membersService.getMyMember(req.user.id);
  }

  @Get('me/context')
  async getMyMemberContext(@Request() req: any) {
    return this.membersService.getMyMemberContext(req.user.id);
  }

  @Get('me/membership')
  async getMyMembership(@Request() req: any) {
    return this.membersService.getMyMembership(req.user.id);
  }

  @Get('me/history')
  async getMyMemberHistory(@Request() req: any) {
    return this.membersService.getMyMemberHistory(req.user.id);
  }

  @Get('me/renewal-history')
  async getMyRenewalHistory(@Request() req: any) {
    return this.membersService.getMyRenewalHistory(req.user.id);
  }

  @Get('me/renewal-quote')
  async getRenewalQuote(@Request() req: any) {
    return this.membersService.getRenewalQuote(req.user.id);
  }

  @Post('me/renewal-payment')
  async payMyRenewal(@Request() req: any, @Body() body: any) {
    return this.membersService.payMyRenewal(req.user.id, body);
  }

  @Get('me/renewal-audit')
  async getMyRenewalAuditLog(@Request() req: any) {
    return this.membersService.getMyRenewalAuditLog(req.user.id);
  }

  @Get('me/linkable')
  async listLinkableMembers(@Request() req: any) {
    return this.membersService.listLinkableMembers(req.user.id);
  }

  @Post('me/link')
  async linkMyMemberProfile(@Request() req: any, @Body('memberId') memberId: string) {
    return this.membersService.linkMyMemberProfile(req.user.id, memberId);
  }

  @Post('me/unlink')
  async unlinkMyMemberProfile(@Request() req: any, @Body('memberId') memberId: string) {
    return this.membersService.unlinkMyMemberProfile(req.user.id, memberId);
  }

  @Get('brand')
  async getMyAssociationBrand(@Request() req: any) {
    return this.membersService.getMyAssociationBrand(req.user.id);
  }

  @Get('benefits')
  async getMyBenefits(@Request() req: any) {
    return this.membersService.getMyBenefits(req.user.id);
  }

  @Get('active-association-id')
  async getActiveAssociationId(@Request() req: any) {
    return this.membersService.getActiveAssociationId(req.user.id);
  }

  @Get('account-statuses')
  async getAccountStatuses() {
    return this.membersService.getAccountStatuses();
  }

  @Get()
  async listMembers(
    @Request() req: any,
    @Query('q') q?: string,
    @Query('type') type?: string,
    @Query('industry') industry?: string,
    @Query('region') region?: string,
    @Query('status') status?: string,
    @Query('associationId') associationId?: string,
  ) {
    return this.membersService.listMembers(req.user.id, {
      q,
      type,
      industry,
      region,
      status,
      associationId,
    });
  }

  @Get(':id/history')
  async getMemberHistory(@Request() req: any, @Param('id') id: string) {
    return this.membersService.getMemberHistory(req.user.id, id);
  }

  @Get(':id')
  async getMemberById(@Request() req: any, @Param('id') id: string) {
    return this.membersService.getMemberById(req.user.id, id);
  }

  @Post()
  async createMember(@Request() req: any, @Body() body: CreateMemberDto) {
    return this.membersService.createMember(req.user.id, body);
  }

  @Put(':id')
  async updateMember(
    @Request() req: any,
    @Param('id') id: string,
    @Body() body: UpdateMemberDto,
  ) {
    return this.membersService.updateMember(req.user.id, id, body);
  }

  @Patch(':id/contact')
  async updateMemberContact(
    @Request() req: any,
    @Param('id') id: string,
    @Body() body: UpdateMemberContactDto,
  ) {
    return this.membersService.updateMemberContact(req.user.id, id, body);
  }

  @Patch(':id/renew')
  async renewMember(@Request() req: any, @Param('id') id: string) {
    return this.membersService.renewMember(req.user.id, id);
  }

  @Patch(':id/remind')
  async sendReminder(@Request() req: any, @Param('id') id: string) {
    return this.membersService.sendRenewalReminder(req.user.id, id);
  }

  @Delete(':id')
  async deleteMember(@Request() req: any, @Param('id') id: string) {
    return this.membersService.deleteMember(req.user.id, id);
  }
}
