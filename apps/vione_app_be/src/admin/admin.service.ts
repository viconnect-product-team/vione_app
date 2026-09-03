import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export const DEMO_LEAD_STATUSES = [
  'new',
  'contacted',
  'scheduled',
  'completed',
  'cancelled',
] as const;

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async listDemoLeads(query: {
    status?: string;
    search?: string;
    from?: string;
    to?: string;
  }) {
    let whereConditions: string[] = ['1=1'];

    if (query.status && query.status !== 'all') {
      whereConditions.push(`status = '${query.status}'`);
    }

    if (query.from) {
      whereConditions.push(`created_at >= '${query.from}T00:00:00Z'::timestamptz`);
    }

    if (query.to) {
      whereConditions.push(`created_at <= '${query.to}T23:59:59Z'::timestamptz`);
    }

    if (query.search?.trim()) {
      const s = query.search.trim().replace(/'/g, "''");
      whereConditions.push(
        `(name ILIKE '%${s}%' OR email ILIKE '%${s}%' OR organization ILIKE '%${s}%')`
      );
    }

    const whereClause = whereConditions.join(' AND ');

    const rows = await this.prisma.$queryRawUnsafe<any[]>(`
      SELECT 
        id, name, email, organization, phone, job_title, preferred_date,
        preferred_slot, timezone, notes, locale, status, admin_notes,
        status_changed_at, created_at
      FROM public.demo_requests
      WHERE ${whereClause}
      ORDER BY created_at DESC
      LIMIT 500
    `).catch(() => []);

    const leads = rows.map((r) => ({
      id: r.id,
      name: r.name,
      email: r.email,
      organization: r.organization,
      phone: r.phone,
      jobTitle: r.job_title,
      preferredDate: r.preferred_date,
      preferredSlot: r.preferred_slot ? String(r.preferred_slot).slice(0, 5) : null,
      timezone: r.timezone,
      notes: r.notes,
      locale: r.locale,
      status: DEMO_LEAD_STATUSES.includes(r.status) ? r.status : 'new',
      adminNotes: r.admin_notes,
      statusChangedAt: r.status_changed_at,
      createdAt: r.created_at,
    }));

    // Calculate status counts
    const counts: Record<string, number> = { all: leads.length };
    for (const s of DEMO_LEAD_STATUSES) counts[s] = 0;
    for (const l of leads) counts[l.status] = (counts[l.status] ?? 0) + 1;

    return { leads, counts };
  }

  async updateDemoLead(id: string, data: { status?: string; adminNotes?: string | null }) {
    const updates: string[] = ['updated_at = now()'];

    if (data.status) {
      updates.push(`status = '${data.status}'`);
      updates.push(`status_changed_at = now()`);
    }

    if (data.adminNotes !== undefined) {
      if (data.adminNotes === null) {
        updates.push(`admin_notes = NULL`);
      } else {
        updates.push(`admin_notes = '${data.adminNotes.replace(/'/g, "''")}'`);
      }
    }

    const setClause = updates.join(', ');

    const rows = await this.prisma.$queryRawUnsafe<any[]>(`
      UPDATE public.demo_requests
      SET ${setClause}
      WHERE id = '${id}'::uuid
      RETURNING *
    `);

    if (!rows.length) {
      throw new NotFoundException('Demo lead not found');
    }

    const r = rows[0];
    return {
      id: r.id,
      name: r.name,
      email: r.email,
      organization: r.organization,
      phone: r.phone,
      jobTitle: r.job_title,
      preferredDate: r.preferred_date,
      preferredSlot: r.preferred_slot,
      timezone: r.timezone,
      notes: r.notes,
      locale: r.locale,
      status: r.status,
      adminNotes: r.admin_notes,
      statusChangedAt: r.status_changed_at,
      createdAt: r.created_at,
    };
  }
}
