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

  // ── INVOICES / FEES MANAGEMENT ──────────────────────────────────────────────

  private mapInvoiceRow(r: any) {
    const dueDate = r.due_date instanceof Date ? r.due_date.toISOString().slice(0, 10) : String(r.due_date || '');
    const paidAt = r.paid_at ? (r.paid_at instanceof Date ? r.paid_at.toISOString().slice(0, 10) : String(r.paid_at).slice(0, 10)) : null;

    let member: any = null;
    if (r.member_id) {
      member = {
        id: r.member_id,
        code: r.member_code || '',
        name: r.member_name || '',
        contact: r.member_contact || '',
        email: r.member_email || '',
        phone: r.member_phone || '',
        type: r.member_type || 'company',
        level: r.member_level || 'memberLevel.medium',
        industry: r.member_industry || 'ind.trade',
        region: r.member_region || 'region.north',
        status: r.member_status || 'active',
        joinedAt: r.member_joined_at,
        feeYear: Number(r.member_fee_year ?? r.year),
        feePaid: Boolean(r.member_fee_paid),
        address: r.member_address || '',
        website: r.member_website,
        taxCode: r.member_tax_code,
        employees: r.member_employees,
        about: r.member_about || '',
        termEnd: r.member_term_end,
        reminderCount: Number(r.member_reminder_count ?? 0),
        lastReminder: r.member_last_reminder,
        renewedAt: r.member_renewed_at,
        newTermEnd: r.member_new_term_end,
      };
    }

    return {
      id: r.id,
      memberId: r.member_id,
      invoiceNo: r.invoice_no,
      year: Number(r.year),
      amount: Number(r.amount ?? 0),
      dueDate,
      paidAt,
      status: r.status || 'unpaid',
      method: r.method || null,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
      member,
    };
  }

  async listInvoices() {
    try {
      const rows = await this.prisma.$queryRaw<any[]>`
        SELECT 
          i.*,
          m.code as member_code,
          m.name as member_name,
          m.contact as member_contact,
          m.email as member_email,
          m.phone as member_phone,
          m.type as member_type,
          m.level as member_level,
          m.industry as member_industry,
          m.region as member_region,
          m.status as member_status,
          m.joined_at as member_joined_at,
          m.fee_year as member_fee_year,
          m.fee_paid as member_fee_paid,
          m.address as member_address,
          m.website as member_website,
          m.tax_code as member_tax_code,
          m.employees as member_employees,
          m.about as member_about,
          m.term_end as member_term_end,
          m.reminder_count as member_reminder_count,
          m.last_reminder as member_last_reminder,
          m.renewed_at as member_renewed_at,
          m.new_term_end as member_new_term_end
        FROM public.invoices i
        LEFT JOIN public.members m ON i.member_id = m.id
        ORDER BY i.invoice_no ASC, i.created_at DESC
      `;
      return (rows || []).map((r) => this.mapInvoiceRow(r));
    } catch (err) {
      console.error('[AdminService] listInvoices error:', err);
      return [];
    }
  }

  async getInvoiceById(id: string) {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT 
        i.*,
        m.code as member_code,
        m.name as member_name,
        m.contact as member_contact,
        m.email as member_email,
        m.phone as member_phone,
        m.type as member_type,
        m.level as member_level,
        m.industry as member_industry,
        m.region as member_region,
        m.status as member_status,
        m.joined_at as member_joined_at,
        m.fee_year as member_fee_year,
        m.fee_paid as member_fee_paid,
        m.address as member_address,
        m.website as member_website,
        m.tax_code as member_tax_code,
        m.employees as member_employees,
        m.about as member_about,
        m.term_end as member_term_end,
        m.reminder_count as member_reminder_count,
        m.last_reminder as member_last_reminder,
        m.renewed_at as member_renewed_at,
        m.new_term_end as member_new_term_end
      FROM public.invoices i
      LEFT JOIN public.members m ON i.member_id = m.id
      WHERE i.id = ${id}
      LIMIT 1
    `;
    if (!rows || rows.length === 0) {
      throw new NotFoundException(`Invoice ${id} not found`);
    }

    const reminders = await this.prisma.$queryRaw<any[]>`
      SELECT * FROM public.invoice_reminders
      WHERE invoice_id = ${id}
      ORDER BY sent_at DESC
    `.catch(() => []);

    return {
      invoice: this.mapInvoiceRow(rows[0]),
      reminders: (reminders || []).map((rem) => ({
        id: rem.id,
        invoiceId: rem.invoice_id,
        channel: rem.channel,
        sentAt: rem.sent_at,
        byName: rem.by_name || '',
        note: rem.note || null,
        createdAt: rem.created_at,
      })),
    };
  }

  async markInvoicePaid(id: string, method: 'bank' | 'card' | 'cash' | 'ewallet' = 'bank') {
    const today = new Date().toISOString().slice(0, 10);
    const existing = await this.getInvoiceById(id);

    await this.prisma.$executeRaw`
      UPDATE public.invoices
      SET status = 'paid', paid_at = ${today}::date, method = ${method}, updated_at = NOW()
      WHERE id = ${id}
    `;

    if (existing.invoice.memberId) {
      await this.prisma.$executeRaw`
        UPDATE public.members
        SET fee_paid = true, updated_at = NOW()
        WHERE id = ${existing.invoice.memberId}
      `.catch(() => null);
    }

    const updated = await this.getInvoiceById(id);
    return updated.invoice;
  }

  async updateInvoiceMethod(id: string, method: 'bank' | 'card' | 'cash' | 'ewallet') {
    await this.prisma.$executeRaw`
      UPDATE public.invoices
      SET method = ${method}, updated_at = NOW()
      WHERE id = ${id}
    `;
    const updated = await this.getInvoiceById(id);
    return updated.invoice;
  }

  async addInvoiceReminder(id: string, data: { channel: string; byName?: string; note?: string }) {
    const byName = data.byName || 'Hệ thống';
    const channel = data.channel || 'email';
    const note = data.note || '';

    await this.prisma.$executeRaw`
      INSERT INTO public.invoice_reminders (id, invoice_id, channel, sent_at, by_name, note, created_at, updated_at)
      VALUES (gen_random_uuid(), ${id}, ${channel}, NOW(), ${byName}, ${note}, NOW(), NOW())
    `;

    // Cập nhật số lần nhắc trên member
    const existing = await this.getInvoiceById(id);
    if (existing.invoice.memberId) {
      await this.prisma.$executeRaw`
        UPDATE public.members
        SET reminder_count = COALESCE(reminder_count, 0) + 1, last_reminder = NOW(), updated_at = NOW()
        WHERE id = ${existing.invoice.memberId}
      `.catch(() => null);
    }

    return this.getInvoiceById(id);
  }

  async createInvoice(data: { memberId: string; year?: number; amount?: number; dueDate?: string }) {
    const year = data.year || new Date().getFullYear();
    const amount = BigInt(Math.round(data.amount || 15000000));
    const dueDate = data.dueDate || `${year}-12-31`;
    const id = `INV-${year}-${Date.now().toString(36).toUpperCase()}`;

    await this.prisma.$executeRaw`
      INSERT INTO public.invoices (id, member_id, invoice_no, year, amount, due_date, status, created_at, updated_at)
      VALUES (${id}, ${data.memberId}, ${id}, ${year}, ${amount}, ${dueDate}::date, 'unpaid', NOW(), NOW())
    `;

    const created = await this.getInvoiceById(id);
    return created.invoice;
  }
}
