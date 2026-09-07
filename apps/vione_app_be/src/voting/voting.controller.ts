import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { VotingService, CreatePollDto, CastVoteDto } from './voting.service';

@Controller('voting')
@UseGuards(JwtAuthGuard)
export class VotingController {
  constructor(private readonly votingService: VotingService) {}

  @Get('polls')
  async listPolls(@Request() req: any, @Query('associationId') associationId?: string) {
    return this.votingService.listPolls(req.user.id || req.user.sub, associationId);
  }

  @Get('polls/:id')
  async getPollById(@Request() req: any, @Param('id') id: string) {
    return this.votingService.getPollById(req.user.id || req.user.sub, id);
  }

  @Post('polls')
  async createPoll(@Request() req: any, @Body() body: CreatePollDto) {
    return this.votingService.createPoll(req.user.id || req.user.sub, body);
  }

  @Post('polls/:id/vote')
  async castVote(
    @Request() req: any,
    @Param('id') id: string,
    @Body() body: CastVoteDto,
  ) {
    return this.votingService.castVote(req.user.id || req.user.sub, id, body.optionId);
  }
}
