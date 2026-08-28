import { Controller, Post, Body, Request, UseGuards, Get, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ConnectAppService } from './connect-app.service';

@Controller('connect-app/customer')
@UseGuards(JwtAuthGuard)
export class CustomerController {
  constructor(private readonly connectAppService: ConnectAppService) {}

  @Post('list')
  async listBcCustomers(@Request() req) {
    return this.connectAppService.listBcCustomers(req.user.id);
  }

  @Post('create')
  async createBcCustomer(@Request() req, @Body() data: any) {
    return this.connectAppService.createBcCustomer(req.user.id, data);
  }

  @Post('update')
  async updateBcCustomer(@Request() req, @Body() data: any) {
    return this.connectAppService.updateBcCustomer(req.user.id, data);
  }

  @Post('delete')
  async deleteBcCustomer(@Request() req, @Body('customerId') customerId: string) {
    return this.connectAppService.deleteBcCustomer(req.user.id, customerId);
  }

  @Post('logs')
  async listBcCustomerLogs(@Request() req, @Body('customerId') customerId: string) {
    return this.connectAppService.listBcCustomerLogs(req.user.id, customerId);
  }

  @Post('log-add')
  async addBcCustomerLog(@Request() req, @Body() data: any) {
    return this.connectAppService.addBcCustomerLog(req.user.id, data);
  }

  @Post('tags')
  async listBcCustomerTags(@Request() req) {
    return this.connectAppService.listBcCustomerTags(req.user.id);
  }

  @Post('tag-create')
  async createBcCustomerTag(@Request() req, @Body('name') name: string) {
    return this.connectAppService.createBcCustomerTag(req.user.id, name);
  }

  @Post('tag-rename')
  async renameBcCustomerTag(@Request() req, @Body() data: { tagId: string; name: string }) {
    return this.connectAppService.renameBcCustomerTag(req.user.id, data.tagId, data.name);
  }

  @Post('tag-delete')
  async deleteBcCustomerTag(@Request() req, @Body('tagId') tagId: string) {
    return this.connectAppService.deleteBcCustomerTag(req.user.id, tagId);
  }

  @Post('set-tags')
  async setBcCustomerTags(@Request() req, @Body() data: { customerId: string; names: string[] }) {
    return this.connectAppService.setBcCustomerTags(req.user.id, data.customerId, data.names);
  }

  @Post('needs')
  async listBcCustomerNeeds(@Request() req, @Body('customerId') customerId: string) {
    return this.connectAppService.listBcCustomerNeeds(req.user.id, customerId);
  }

  @Post('need-add')
  async addBcCustomerNeed(@Request() req, @Body() data: any) {
    return this.connectAppService.addBcCustomerNeed(req.user.id, data);
  }

  @Post('need-update')
  async updateBcCustomerNeed(@Request() req, @Body() data: any) {
    return this.connectAppService.updateBcCustomerNeed(req.user.id, data);
  }

  @Post('need-delete')
  async deleteBcCustomerNeed(@Request() req, @Body('needId') needId: string) {
    return this.connectAppService.deleteBcCustomerNeed(req.user.id, needId);
  }

  // --- AI Tag Suggestions ---
  @Post('tag-suggest')
  async suggestCustomerTags(@Request() req, @Body('customerId') customerId: string) {
    return this.connectAppService.suggestCustomerTags(req.user.id, customerId);
  }

  @Get('tag-suggest-history')
  async listCustomerTagSuggestHistory(@Request() req, @Query('customerId') customerId: string) {
    return this.connectAppService.listCustomerTagSuggestHistory(req.user.id, customerId);
  }

  @Post('tag-suggest-feedback')
  async saveCustomerTagSuggestFeedback(@Request() req, @Body() data: any) {
    return this.connectAppService.saveCustomerTagSuggestFeedback(req.user.id, data);
  }

  @Get('tag-suggest-feedback-list')
  async listCustomerTagSuggestFeedback(@Request() req, @Query('customerId') customerId: string) {
    return this.connectAppService.listCustomerTagSuggestFeedback(req.user.id, customerId);
  }
}
