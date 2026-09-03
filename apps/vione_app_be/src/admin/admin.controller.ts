import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { AdminService } from './admin.service';

@Controller('admin')
@UseGuards(AuthGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('demo-leads')
  async listDemoLeads(
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.adminService.listDemoLeads({ status, search, from, to });
  }

  @Patch('demo-leads/:id')
  async updateDemoLead(
    @Param('id') id: string,
    @Body() data: { status?: string; adminNotes?: string | null },
  ) {
    return this.adminService.updateDemoLead(id, data);
  }
}
