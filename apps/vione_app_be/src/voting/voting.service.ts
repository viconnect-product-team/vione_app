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

  private computeOptionsWithStats(rawOptions: any[]): any[] {
    const opts = (rawOptions || []).map((o) => ({
      id: String(o.id),
      title: String(o.title || ''),
      votesCount: Number(o.votes_count || 0),
      percentage: 0,
      isLeading: false,
    }));

    const totalVotes = opts.reduce((sum, o) => sum + o.votesCount, 0);
    const maxVotes = opts.length > 0 ? Math.max(...opts.map((o) => o.votesCount)) : 0;

    return opts.map((o) => ({
      ...o,
      percentage: totalVotes > 0 ? Number(((o.votesCount / totalVotes) * 100).toFixed(1)) : 0,
      isLeading: totalVotes > 0 && o.votesCount === maxVotes && maxVotes > 0,
    }));
  }

  async listPolls(userId: string, associationId?: string) {
    const rows: any[] = await this.prisma.$queryRaw<any[]>`
      SELECT p.*,
        (SELECT json_agg(json_build_object(
          'id', o.id,
          'title', o.title,
          'votes_count', (SELECT COUNT(*)::int FROM public.poll_votes pv WHERE pv.option_id = o.id)
        ))
         FROM public.poll_options o WHERE o.poll_id = p.id) as options,
        (SELECT v.option_id FROM public.poll_votes v WHERE v.poll_id = p.id AND v.user_id = ${userId}::uuid LIMIT 1) as my_vote,
        (SELECT COUNT(*)::int FROM public.poll_votes pv WHERE pv.poll_id = p.id) as calculated_total_votes
      FROM public.polls p
      ORDER BY p.created_at DESC
    `.catch(async () => {
      return this.prisma.$queryRaw<any[]>`
        SELECT * FROM public.polls ORDER BY created_at DESC
      `.catch(() => [] as any[]);
    });

    return rows.map((r) => {
      const options = this.computeOptionsWithStats(r.options || []);
      const totalVotes = options.reduce((sum, o) => sum + o.votesCount, 0);
      return {
        id: r.id,
        title: r.title,
        description: r.description || '',
        status: r.status || 'open',
        options,
        myVote: r.my_vote || null,
        totalVotes,
        createdAt: r.created_at,
        endDate: r.end_date || null,
      };
    });
  }

  async getPollById(userId: string, id: string) {
    const rows: any[] = await this.prisma.$queryRaw<any[]>`
      SELECT p.*,
        (SELECT json_agg(json_build_object(
          'id', o.id,
          'title', o.title,
          'votes_count', (SELECT COUNT(*)::int FROM public.poll_votes pv WHERE pv.option_id = o.id)
        ))
         FROM public.poll_options o WHERE o.poll_id = p.id) as options,
        (SELECT v.option_id FROM public.poll_votes v WHERE v.poll_id = p.id AND v.user_id = ${userId}::uuid LIMIT 1) as my_vote,
        (SELECT COUNT(*)::int FROM public.poll_votes pv WHERE pv.poll_id = p.id) as calculated_total_votes
      FROM public.polls p
      WHERE p.id = ${id}::uuid
      LIMIT 1
    `.catch(() => [] as any[]);

    if (rows.length === 0) throw new NotFoundException('Poll not found');
    const r = rows[0];
    const options = this.computeOptionsWithStats(r.options || []);
    const totalVotes = options.reduce((sum, o) => sum + o.votesCount, 0);

    return {
      id: r.id,
      title: r.title,
      description: r.description || '',
      status: r.status || 'open',
      options,
      myVote: r.my_vote || null,
      totalVotes,
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
      ON CONFLICT (poll_id, user_id) DO UPDATE SET option_id = ${optionId}::uuid, created_at = now()
    `.catch(async () => {
      // If table lacks unique constraint on (poll_id, user_id), delete old vote first
      await this.prisma.$executeRaw`
        DELETE FROM public.poll_votes WHERE poll_id = ${pollId}::uuid AND user_id = ${userId}::uuid
      `.catch(() => {});
      await this.prisma.$executeRaw`
        INSERT INTO public.poll_votes (id, poll_id, option_id, user_id, created_at)
        VALUES (${voteId}::uuid, ${pollId}::uuid, ${optionId}::uuid, ${userId}::uuid, now())
      `.catch(() => {});
    });

    // Recalculate votes_count for all options in this poll
    await this.prisma.$executeRaw`
      UPDATE public.poll_options
      SET votes_count = (SELECT COUNT(*)::int FROM public.poll_votes WHERE option_id = public.poll_options.id)
      WHERE poll_id = ${pollId}::uuid
    `.catch(() => {});

    return this.getPollById(userId, pollId);
  }

  async createPoll(userId: string, data: CreatePollDto) {
    if (!data.title || !Array.isArray(data.options) || data.options.length < 2) {
      throw new BadRequestException('Title and at least 2 options are required');
    }

    const pollId = crypto.randomUUID();
    const startDate = (data as any).startsAt || data.startDate || null;
    const endDate = (data as any).endsAt || data.endDate || null;

    try {
      await this.prisma.$executeRaw`
        INSERT INTO public.polls (id, title, description, status, start_date, end_date, created_at, updated_at)
        VALUES (${pollId}::uuid, ${data.title}, ${data.description || null}, 'open', ${startDate ? new Date(startDate) : null}, ${endDate ? new Date(endDate) : null}, now(), now())
      `;
    } catch (e: any) {
      await this.prisma.$executeRaw`
        INSERT INTO public.polls (id, title, description, status, created_at, updated_at)
        VALUES (${pollId}::uuid, ${data.title}, ${data.description || null}, 'open', now(), now())
      `.catch(() => {});
    }

    const createdOptions: Array<{ id: string; title: string }> = [];
    for (const optTitle of data.options) {
      const optId = crypto.randomUUID();
      await this.prisma.$executeRaw`
        INSERT INTO public.poll_options (id, poll_id, title, votes_count, created_at)
        VALUES (${optId}::uuid, ${pollId}::uuid, ${optTitle}, 0, now())
      `.catch(() => {});
      createdOptions.push({ id: optId, title: optTitle });
    }

    // Broadcast in-app interactive poll notification to all members and users
    try {
      const users = await this.prisma.$queryRaw<any[]>`
        SELECT DISTINCT u.id FROM (
          SELECT id FROM public.vione_users
          UNION
          SELECT user_id as id FROM public.members WHERE user_id IS NOT NULL
        ) u
      `.catch(() => [] as any[]);

      const notifTitle = `[Biểu quyết mới] ${data.title}`;
      const notifBody = data.description || 'Tham gia biểu quyết ý kiến ngay trên ứng dụng.';
      const safeDisplayData = JSON.stringify({
        title: data.title,
        body: notifBody,
        pollId,
        options: createdOptions,
        type: 'poll',
        targetRoute: '/voting',
      });

      for (const u of users) {
        const dedupeKey = `poll-notif-${pollId}-${u.id}`;
        await this.prisma.$executeRawUnsafe(`
          INSERT INTO public.business_notifications (
            id, recipient_user_id, source_domain, source_record_id, event_kind, notification_kind,
            title_key, body_key, safe_display_data, priority, status, dedupe_key, app_scope, target_app, created_at, updated_at
          ) VALUES (
            gen_random_uuid(), $1, 'voting', $2, 'poll_created', 'interactive_poll',
            $3, $4, $5::jsonb, 'high', 'delivered', $6, 'all', 'all', NOW(), NOW()
          )
        `, u.id, pollId, notifTitle, notifBody, safeDisplayData, dedupeKey).catch(() => {});

        await this.prisma.$executeRawUnsafe(`
          INSERT INTO public.member_notifications (
            id, recipient_id, title, body, read, dismissed, ref_type, ref_id, created_at
          ) VALUES (
            gen_random_uuid(), $1, $2, $3, false, false, 'poll', $4, NOW()
          )
        `, u.id, notifTitle, notifBody, pollId).catch(() => {});
      }
    } catch (err: any) {
      console.warn('[VotingService] Error broadcasting poll notification:', err?.message);
    }

    return this.getPollById(userId, pollId);
  }

  async updatePoll(userId: string, id: string, data: any) {
    if (!id) throw new BadRequestException('ID is required');
    await this.prisma.$executeRaw`
      UPDATE public.polls
      SET title = COALESCE(${data.title}, title),
          description = COALESCE(${data.description || null}, description),
          updated_at = now()
      WHERE id = ${id}::uuid
    `.catch(() => {});
    return this.getPollById(userId, id);
  }

  async deletePoll(userId: string, id: string) {
    if (!id) throw new BadRequestException('ID is required');
    await this.prisma.$executeRaw`
      DELETE FROM public.poll_votes WHERE poll_id = ${id}::uuid
    `.catch(() => {});
    await this.prisma.$executeRaw`
      DELETE FROM public.poll_options WHERE poll_id = ${id}::uuid
    `.catch(() => {});
    await this.prisma.$executeRaw`
      DELETE FROM public.polls WHERE id = ${id}::uuid
    `.catch(() => {});
    return { ok: true, id };
  }
}
