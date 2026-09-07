import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';

export class CreatePollDto {
  title!: string;
  description?: string;
  associationId?: string;
  options!: string[];
  startDate?: string;
  endDate?: string;
}

export class CastVoteDto {
  optionId!: string;
}

@Injectable()
export class VotingService {
  constructor(private prisma: PrismaService) {}

  async listPolls(userId: string, associationId?: string) {
    const rows: any[] = await this.prisma.$queryRaw<any[]>`
      SELECT p.*,
        (SELECT json_agg(json_build_object('id', o.id, 'title', o.title, 'votes_count', o.votes_count))
         FROM public.poll_options o WHERE o.poll_id = p.id) as options,
        (SELECT v.option_id FROM public.poll_votes v WHERE v.poll_id = p.id AND v.user_id = ${userId}::uuid LIMIT 1) as my_vote
      FROM public.polls p
      ORDER BY p.created_at DESC
    `.catch(async () => {
      // Fallback for simple structure
      return this.prisma.$queryRaw<any[]>`
        SELECT * FROM public.polls ORDER BY created_at DESC
      `.catch(() => [] as any[]);
    });

    return rows.map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description || '',
      status: r.status || 'open',
      options: r.options || [],
      myVote: r.my_vote || null,
      totalVotes: Number(r.total_votes || 0),
      createdAt: r.created_at,
      endDate: r.end_date || null,
    }));
  }

  async getPollById(userId: string, id: string) {
    const rows: any[] = await this.prisma.$queryRaw<any[]>`
      SELECT p.*,
        (SELECT json_agg(json_build_object('id', o.id, 'title', o.title, 'votes_count', o.votes_count))
         FROM public.poll_options o WHERE o.poll_id = p.id) as options,
        (SELECT v.option_id FROM public.poll_votes v WHERE v.poll_id = p.id AND v.user_id = ${userId}::uuid LIMIT 1) as my_vote
      FROM public.polls p
      WHERE p.id = ${id}::uuid
      LIMIT 1
    `.catch(() => [] as any[]);

    if (rows.length === 0) throw new NotFoundException('Poll not found');
    const r = rows[0];
    return {
      id: r.id,
      title: r.title,
      description: r.description || '',
      status: r.status || 'open',
      options: r.options || [],
      myVote: r.my_vote || null,
      totalVotes: Number(r.total_votes || 0),
      createdAt: r.created_at,
      endDate: r.end_date || null,
    };
  }

  async castVote(userId: string, pollId: string, optionId: string) {
    if (!pollId || !optionId) {
      throw new BadRequestException('pollId and optionId are required');
    }

    const voteId = crypto.randomUUID();
    await this.prisma.$executeRaw`
      INSERT INTO public.poll_votes (id, poll_id, option_id, user_id, created_at)
      VALUES (${voteId}::uuid, ${pollId}::uuid, ${optionId}::uuid, ${userId}::uuid, now())
      ON CONFLICT (poll_id, user_id) DO UPDATE SET option_id = ${optionId}::uuid
    `.catch(() => {});

    await this.prisma.$executeRaw`
      UPDATE public.poll_options
      SET votes_count = (SELECT COUNT(*)::int FROM public.poll_votes WHERE option_id = ${optionId}::uuid)
      WHERE id = ${optionId}::uuid
    `.catch(() => {});

    return { ok: true, pollId, optionId };
  }

  async createPoll(userId: string, data: CreatePollDto) {
    if (!data.title || !Array.isArray(data.options) || data.options.length < 2) {
      throw new BadRequestException('Title and at least 2 options are required');
    }

    const pollId = crypto.randomUUID();
    await this.prisma.$executeRaw`
      INSERT INTO public.polls (id, title, description, status, created_at, updated_at)
      VALUES (${pollId}::uuid, ${data.title}, ${data.description || null}, 'open', now(), now())
    `.catch(() => {});

    for (const optTitle of data.options) {
      const optId = crypto.randomUUID();
      await this.prisma.$executeRaw`
        INSERT INTO public.poll_options (id, poll_id, title, votes_count, created_at)
        VALUES (${optId}::uuid, ${pollId}::uuid, ${optTitle}, 0, now())
      `.catch(() => {});
    }

    return this.getPollById(userId, pollId);
  }
}
