import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MeetingsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Summary view for Meeting Workspace
   */
  async getWorkspaceSummary(userId: string) {
    try {
      // 1. Get counts
      const countsRaw = await this.prisma.$queryRaw<any[]>`
        SELECT 
          COUNT(DISTINCT m.id) FILTER (WHERE m.status IN ('confirmed', 'scheduled')) as upcoming,
          COUNT(DISTINCT m.id) FILTER (WHERE m.status = 'draft' OR m.confirmed_proposal_id IS NULL) as unscheduled,
          COUNT(DISTINCT m.id) FILTER (WHERE p.response_status = 'pending' AND m.status != 'cancelled') as needs_action,
          COUNT(DISTINCT m.id) FILTER (WHERE m.status IN ('completed', 'cancelled')) as history
        FROM public.business_meetings m
        JOIN public.business_meeting_participants p ON p.meeting_id = m.id
        WHERE p.user_id = ${userId}::uuid
      `.catch(() => []);

      const counts = {
        upcoming: Number(countsRaw[0]?.upcoming ?? 0),
        unscheduled: Number(countsRaw[0]?.unscheduled ?? 0),
        needsAction: Number(countsRaw[0]?.needs_action ?? 0),
        history: Number(countsRaw[0]?.history ?? 0),
      };

      // 2. Fetch upcoming meetings
      const upcomingMeetings = await this.prisma.$queryRaw<any[]>`
        SELECT 
          m.id, m.title, m.description, m.meeting_type, m.status, m.timezone,
          m.created_at, m.updated_at, p.role as viewer_role
        FROM public.business_meetings m
        JOIN public.business_meeting_participants p ON p.meeting_id = m.id
        WHERE p.user_id = ${userId}::uuid
          AND m.status IN ('confirmed', 'scheduled')
        ORDER BY m.created_at DESC
        LIMIT 5
      `.catch(() => []);

      // 3. Fetch needs-action meetings
      const needsActionMeetings = await this.prisma.$queryRaw<any[]>`
        SELECT 
          m.id, m.title, m.description, m.meeting_type, m.status, m.timezone,
          m.created_at, m.updated_at, p.role as viewer_role
        FROM public.business_meetings m
        JOIN public.business_meeting_participants p ON p.meeting_id = m.id
        WHERE p.user_id = ${userId}::uuid
          AND p.response_status = 'pending'
          AND m.status != 'cancelled'
        ORDER BY m.created_at DESC
        LIMIT 5
      `.catch(() => []);

      return {
        counts,
        upcomingMeetings: upcomingMeetings.map(this.formatMeetingItem),
        needsActionMeetings: needsActionMeetings.map(this.formatMeetingItem),
      };
    } catch (err) {
      console.error('getWorkspaceSummary error:', err);
      return {
        counts: { upcoming: 0, unscheduled: 0, needsAction: 0, history: 0 },
        upcomingMeetings: [],
        needsActionMeetings: [],
      };
    }
  }

  /**
   * List meetings by workspace bucket
   */
  async listWorkspaceMeetings(userId: string, filters: any) {
    const limit = Math.min(Math.max(Number(filters.limit || 20), 1), 50);
    const bucket = filters.bucket || 'upcoming';

    try {
      let statusFilter = `m.status IN ('confirmed', 'scheduled')`;
      if (bucket === 'unscheduled') {
        statusFilter = `(m.status = 'draft' OR m.confirmed_proposal_id IS NULL)`;
      } else if (bucket === 'needs_action') {
        statusFilter = `(p.response_status = 'pending' AND m.status != 'cancelled')`;
      } else if (bucket === 'history') {
        statusFilter = `m.status IN ('completed', 'cancelled')`;
      }

      const rows = await this.prisma.$queryRawUnsafe<any[]>(`
        SELECT 
          m.id, m.title, m.description, m.meeting_type, m.status, m.timezone,
          m.created_at, m.updated_at, p.role as viewer_role
        FROM public.business_meetings m
        JOIN public.business_meeting_participants p ON p.meeting_id = m.id
        WHERE p.user_id = '${userId}'::uuid
          AND ${statusFilter}
        ORDER BY m.created_at DESC
        LIMIT ${limit}
      `).catch(() => []);

      const items = await Promise.all(
        rows.map(async (row) => {
          const outcome = await this.getOutcome(row.id);
          const followUps = await this.listFollowUps(row.id);
          return {
            meeting: {
              id: row.id,
              title: row.title,
              description: row.description,
              meetingType: row.meeting_type,
              status: row.status,
              timezone: row.timezone,
              createdAt: row.created_at,
              updatedAt: row.updated_at,
            },
            viewerRole: row.viewer_role,
            outcome,
            followUps,
          };
        })
      );

      return {
        items,
        nextCursor: null,
      };
    } catch (err) {
      console.error('listWorkspaceMeetings error:', err);
      return { items: [], nextCursor: null };
    }
  }

  /**
   * Single meeting detail in workspace shape
   */
  async getMeetingWorkspaceDetail(userId: string, meetingId: string) {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT 
        m.id, m.title, m.description, m.meeting_type, m.status, m.timezone,
        m.created_at, m.updated_at, p.role as viewer_role
      FROM public.business_meetings m
      JOIN public.business_meeting_participants p ON p.meeting_id = m.id
      WHERE m.id = ${meetingId}::uuid AND p.user_id = ${userId}::uuid
      LIMIT 1
    `.catch(() => []);

    if (!rows.length) {
      throw new NotFoundException('Meeting not found or access denied');
    }

    const row = rows[0];
    const outcome = await this.getOutcome(meetingId);
    const followUps = await this.listFollowUps(meetingId);

    return {
      meeting: {
        id: row.id,
        title: row.title,
        description: row.description,
        meetingType: row.meeting_type,
        status: row.status,
        timezone: row.timezone,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      },
      viewerRole: row.viewer_role,
      outcome,
      followUps,
    };
  }

  /**
   * Outcome handling
   */
  async getOutcome(meetingId: string) {
    try {
      const rows = await this.prisma.$queryRaw<any[]>`
        SELECT *
        FROM public.business_meeting_outcomes
        WHERE meeting_id = ${meetingId}::uuid
        LIMIT 1
      `.catch(() => []);
      return rows[0] || null;
    } catch {
      return null;
    }
  }

  async saveOutcome(userId: string, meetingId: string, data: any) {
    const outcomeType = data.outcomeType || 'positive_progress';
    const outcomeStatus = data.outcomeStatus || 'draft';
    const summary = data.summary || '';
    const finalizedAt = outcomeStatus === 'finalized' ? new Date().toISOString() : null;

    await this.prisma.$queryRawUnsafe(`
      INSERT INTO public.business_meeting_outcomes (
        meeting_id, recorded_by_user_id, outcome_type, outcome_status, summary, finalized_at
      ) VALUES (
        '${meetingId}'::uuid,
        '${userId}'::uuid,
        '${outcomeType}',
        '${outcomeStatus}',
        '${summary.replace(/'/g, "''")}',
        ${finalizedAt ? `'${finalizedAt}'::timestamptz` : 'NULL'}
      )
      ON CONFLICT (meeting_id) DO UPDATE SET
        outcome_type = EXCLUDED.outcome_type,
        outcome_status = EXCLUDED.outcome_status,
        summary = EXCLUDED.summary,
        finalized_at = EXCLUDED.finalized_at,
        updated_at = now()
    `);

    return this.getOutcome(meetingId);
  }

  /**
   * Follow-ups handling
   */
  async listFollowUps(meetingId: string) {
    try {
      return await this.prisma.$queryRaw<any[]>`
        SELECT *
        FROM public.business_meeting_follow_ups
        WHERE meeting_id = ${meetingId}::uuid
        ORDER BY created_at ASC
      `.catch(() => []);
    } catch {
      return [];
    }
  }

  async createFollowUp(userId: string, meetingId: string, data: any) {
    const title = data.title || 'Follow-up task';
    const description = data.description || '';
    const dueDate = data.dueDate ? `'${data.dueDate}'::timestamptz` : 'NULL';

    const rows = await this.prisma.$queryRawUnsafe<any[]>(`
      INSERT INTO public.business_meeting_follow_ups (
        meeting_id, assigned_to_user_id, created_by_user_id, title, description, due_date, status
      ) VALUES (
        '${meetingId}'::uuid,
        '${userId}'::uuid,
        '${userId}'::uuid,
        '${title.replace(/'/g, "''")}',
        '${description.replace(/'/g, "''")}',
        ${dueDate},
        'pending'
      )
      RETURNING *
    `);

    return rows[0];
  }

  async updateFollowUpStatus(userId: string, followUpId: string, status: string) {
    const rows = await this.prisma.$queryRaw<any[]>`
      UPDATE public.business_meeting_follow_ups
      SET status = ${status}, updated_at = now()
      WHERE id = ${followUpId}::uuid
      RETURNING *
    `;
    return rows[0];
  }

  private formatMeetingItem(row: any) {
    return {
      meeting: {
        id: row.id,
        title: row.title,
        description: row.description,
        meetingType: row.meeting_type,
        status: row.status,
        timezone: row.timezone,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      },
      viewerRole: row.viewer_role,
    };
  }
}
