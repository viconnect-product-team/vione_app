import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export class CreateMemberDto {
  name!: string;
  contact?: string;
  email?: string;
  phone?: string;
  type?: 'company' | 'individual';
  level?: string;
  industry?: string;
  region?: string;
  status?: 'active' | 'pending' | 'expired';
  address?: string;
  website?: string;
  taxCode?: string;
  employees?: number;
  about?: string;
  associationId?: string;
}

export class UpdateMemberDto {
  name?: string;
  contact?: string;
  email?: string;
  phone?: string;
  type?: 'company' | 'individual';
  level?: string;
  industry?: string;
  region?: string;
  status?: 'active' | 'pending' | 'expired';
  address?: string;
  website?: string;
  taxCode?: string;
  employees?: number;
  about?: string;
}

export class UpdateMemberContactDto {
  email?: string;
  phone?: string;
  address?: string;
}

@Injectable()
export class MembersService {
  constructor(private prisma: PrismaService) {}

  private async checkIsPlatformAdmin(userId: string): Promise<boolean> {
    if (userId === 'mock-admin-id' || userId === '00000000-0000-0000-0000-000000000000') {
      return true;
    }
    const roles = await this.prisma.user_roles
      .findMany({ where: { user_id: userId } })
      .catch(() => [] as any[]);
    return roles.some(
      (r: any) => r.role === 'platform_admin' || r.role === 'tenant_admin',
    );
  }

  async checkIsAdmin(userId: string, assocId?: string): Promise<boolean> {
    if (await this.checkIsPlatformAdmin(userId)) return true;

    try {
      let mems: any[] = [];
      if (assocId) {
        mems = await this.prisma.$queryRaw<any[]>`
          SELECT role FROM public.memberships 
          WHERE user_id = ${userId}::uuid AND association_id = ${assocId}::uuid
        `;
      } else {
        mems = await this.prisma.$queryRaw<any[]>`
          SELECT role FROM public.memberships 
          WHERE user_id = ${userId}::uuid
        `;
      }

      return mems.some(
        (m: any) => m.role === 'admin' || m.role === 'association_admin' || m.role === 'owner',
      );
    } catch {
      return false;
    }
  }

  async getAssociationIdForUser(userId: string, requestedAssocId?: string): Promise<string | null> {
    if (requestedAssocId) {
      const isPlatformAdmin = await this.checkIsPlatformAdmin(userId);
      if (isPlatformAdmin) return requestedAssocId;
      const mem = await this.prisma.$queryRaw<any[]>`
        SELECT 1 FROM public.memberships 
        WHERE user_id = ${userId}::uuid AND association_id = ${requestedAssocId}::uuid
      `.catch(() => []);
      if (mem.length > 0) return requestedAssocId;
    }

    const mems = await this.prisma.$queryRaw<any[]>`
      SELECT association_id FROM public.memberships
      WHERE user_id = ${userId}::uuid
      ORDER BY is_default DESC, created_at ASC
      LIMIT 1
    `.catch(() => []);

    if (mems.length > 0 && mems[0]?.association_id) {
      return mems[0].association_id;
    }

    // Fallback: lấy association đầu tiên trong DB thay vì UUID cứng
    const firstAssoc = await this.prisma.$queryRaw<any[]>`
      SELECT id FROM public.associations ORDER BY created_at ASC LIMIT 1
    `.catch(() => []);

    if (firstAssoc.length > 0 && firstAssoc[0]?.id) {
      return firstAssoc[0].id;
    }

    return null; // Không có association nào
  }

  private mapMemberRow(r: any) {
    let joinedStr = '';
    if (r.joined_at) {
      if (r.joined_at instanceof Date) {
        joinedStr = r.joined_at.toISOString().slice(0, 10);
      } else {
        joinedStr = String(r.joined_at).slice(0, 10);
      }
    }
    return {
      id: r.id,
      code: r.code ?? '',
      name: r.name,
      contact: r.contact ?? '',
      email: r.email ?? '',
      phone: r.phone ?? '',
      type: r.type ?? 'company',
      level: r.level ?? 'memberLevel.medium',
      industry: r.industry ?? 'ind.trade',
      region: r.region ?? 'region.north',
      status: r.status ?? 'pending',
      joinedAt: joinedStr,
      feeYear: r.fee_year ?? new Date().getFullYear(),
      feePaid: Boolean(r.fee_paid),
      address: r.address ?? '',
      website: r.website ?? '',
      taxCode: r.tax_code ?? '',
      employees: r.employees ?? 0,
      about: r.about ?? '',
      associationId: r.association_id,
      userId: r.user_id,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    };
  }

  async listMembers(
    userId: string,
    filters?: {
      q?: string;
      type?: string;
      industry?: string;
      region?: string;
      status?: string;
      associationId?: string;
    },
  ) {
    const isPlatformAdmin = await this.checkIsPlatformAdmin(userId);
    const assocId = await this.getAssociationIdForUser(userId, filters?.associationId);

    let rows: any[];
    if (isPlatformAdmin && !filters?.associationId) {
      // Platform admin không chỉ định assoc → thấy tất cả
      rows = await this.prisma.$queryRaw<any[]>`
        SELECT * FROM public.members ORDER BY created_at DESC
      `.catch(() => []);
    } else if (assocId) {
      // User có association → lấy theo assoc
      rows = await this.prisma.$queryRaw<any[]>`
        SELECT * FROM public.members WHERE association_id = ${assocId}::uuid ORDER BY created_at DESC
      `.catch(() => []);
    } else {
      // Không có association nào → lấy tất cả (fallback cho môi trường dev)
      rows = await this.prisma.$queryRaw<any[]>`
        SELECT * FROM public.members ORDER BY created_at DESC
      `.catch(() => []);
    }

    let items = rows.map((r) => this.mapMemberRow(r));

    if (filters?.q) {
      const ql = filters.q.trim().toLowerCase();
      items = items.filter(
        (m) =>
          m.name.toLowerCase().includes(ql) ||
          m.code.toLowerCase().includes(ql) ||
          m.email.toLowerCase().includes(ql) ||
          m.contact.toLowerCase().includes(ql),
      );
    }
    if (filters?.type && filters.type !== 'all') {
      items = items.filter((m) => m.type === filters.type);
    }
    if (filters?.industry && filters.industry !== 'all') {
      items = items.filter((m) => m.industry === filters.industry);
    }
    if (filters?.region && filters.region !== 'all') {
      items = items.filter((m) => m.region === filters.region);
    }
    if (filters?.status && filters.status !== 'all') {
      items = items.filter((m) => m.status === filters.status);
    }

    return items;
  }

  // Mobile API: member directory
  async listDirectory(userId: string) {
    const assocId = await this.getAssociationIdForUser(userId);

    let rows: any[];
    if (assocId) {
      rows = await this.prisma.$queryRaw<any[]>`
        SELECT code, name, industry, region, type, status 
        FROM public.members 
        WHERE association_id = ${assocId}::uuid AND status = 'active'
        ORDER BY name ASC
      `.catch(() => []);
    } else {
      rows = await this.prisma.$queryRaw<any[]>`
        SELECT code, name, industry, region, type, status 
        FROM public.members 
        WHERE status = 'active'
        ORDER BY name ASC
      `.catch(() => []);
    }

    return rows.map((m) => ({
      code: m.code ?? '',
      name: m.name,
      industry: m.industry ?? '',
      region: m.region ?? '',
      type: m.type === 'individual' ? 'individual' : 'company',
      verified: m.status === 'active',
    }));
  }

  // Mobile API: get current user member info for profile
  async getMyMember(userId: string) {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT * FROM public.members WHERE user_id = ${userId}::uuid LIMIT 1
    `.catch(() => []);

    const user = await this.prisma.vione_users.findUnique({
      where: { id: userId },
    });

    if (rows.length > 0) {
      const m = rows[0];
      return {
        code: m.code ?? '',
        name: m.name,
        status: m.status ?? 'active',
        validUntil: m.term_end ? (m.term_end instanceof Date ? m.term_end.toISOString().slice(0, 10) : String(m.term_end).slice(0, 10)) : null,
        verified: m.status === 'active',
        type: m.type === 'individual' ? 'individual' : 'company',
        title: m.contact ?? 'Hội viên',
        email: m.email ?? user?.email ?? '',
        phone: m.phone ?? '',
        taxCode: m.tax_code ?? null,
        industry: m.industry ?? '',
        region: m.region ?? '',
        address: m.address ?? '',
        website: m.website ?? null,
        joinedAt: m.joined_at ? (m.joined_at instanceof Date ? m.joined_at.toISOString().slice(0, 10) : String(m.joined_at).slice(0, 10)) : null,
        avatar: user?.avatar_url ?? null,
      };
    }

    // Fallback: If no member row exists for this user, return non-member identity
    return {
      code: `GUEST-${userId.slice(0, 6).toUpperCase()}`,
      name: user?.name || user?.username || 'Thành viên mới',
      status: 'guest',
      validUntil: null,
      verified: false,
      type: 'individual',
      title: 'Chưa là hội viên chính thức',
      email: user?.email || '',
      phone: '',
      taxCode: null,
      industry: '',
      region: '',
      address: '',
      website: null,
      joinedAt: null,
      avatar: user?.avatar_url ?? null,
    };
  }

  async getAccountStatuses() {
    const profiles = await this.prisma.user_profiles.findMany({
      select: { user_id: true, account_status: true },
    }).catch(() => [] as any[]);

    const map: Record<string, string> = {};
    for (const p of profiles) {
      map[p.user_id] = p.account_status;
    }
    return map;
  }

  async getMemberById(userId: string, id: string) {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT * FROM public.members WHERE id = ${id} LIMIT 1
    `.catch(() => []);

    if (rows.length === 0) {
      throw new NotFoundException('Không tìm thấy hội viên');
    }

    return this.mapMemberRow(rows[0]);
  }

  async getMemberHistory(userId: string, id: string) {
    const member = await this.getMemberById(userId, id);

    // 1. Activities from activity_log
    const actRows = await this.prisma.$queryRaw<any[]>`
      SELECT code, "user", action, target, category, at, created_at 
      FROM public.activity_log 
      WHERE target = ${member.code} OR target = ${member.name}
      ORDER BY created_at DESC 
      LIMIT 50
    `.catch(() => []);

    const activities = actRows.map((r) => {
      const c = (r.category ?? '').toLowerCase();
      const a = (r.action ?? '').toLowerCase();
      let type = 'note';
      if (c === 'fee' || a.includes('thanh toán') || a.includes('payment')) type = 'payment';
      else if (c === 'event' || a.includes('sự kiện') || a.includes('event')) type = 'event';
      else if (a.includes('email') || a.includes('bản tin')) type = 'email';
      else if (a.includes('gọi') || a.includes('call')) type = 'call';
      else if (a.includes('họp') || a.includes('meeting')) type = 'meeting';

      return {
        id: r.code,
        type,
        title: r.action,
        by: r.user ?? '—',
        detail: r.target ?? undefined,
        date: r.created_at ? (r.created_at instanceof Date ? r.created_at.toISOString() : String(r.created_at)) : new Date().toISOString(),
      };
    });

    // 2. Events from event_registrations + events
    let events: any[] = [];
    if (member.code) {
      const regRows = await this.prisma.$queryRaw<any[]>`
        SELECT r.id, r.event_id, r.registered_at, r.status, r.ticket_type,
               e.name as event_name, e.date as event_date, e.registered as event_registered
        FROM public.event_registrations r
        LEFT JOIN public.events e ON r.event_id = e.id
        WHERE r.member_code = ${member.code}
        ORDER BY r.registered_at DESC
        LIMIT 50
      `.catch(() => []);

      events = regRows.map((r) => {
        let role = 'attendee';
        const t = (r.ticket_type ?? '').toLowerCase();
        if (t === 'sponsor') role = 'sponsor';
        else if (t === 'speaker') role = 'speaker';
        else if (t === 'partner') role = 'partner';

        const d = r.event_date || r.registered_at;
        const dateStr = d instanceof Date ? d.toISOString() : (d ? String(d) : new Date().toISOString());

        return {
          id: r.id,
          name: r.event_name || r.event_id || '—',
          date: dateStr,
          role,
          checkedIn: r.status === 'checked-in' || r.status === 'attended',
          attendees: Number(r.event_registered ?? 0),
        };
      });
    }

    // 3. Payments from invoices
    const invRows = await this.prisma.$queryRaw<any[]>`
      SELECT invoice_no, year, amount, due_date, paid_at, status, method 
      FROM public.invoices 
      WHERE member_id = ${member.id}
      ORDER BY created_at DESC 
      LIMIT 50
    `.catch(() => []);

    const payments = invRows.map((i, idx) => {
      let m = (i.method ?? '').toLowerCase();
      let method = 'bank';
      if (m === 'card') method = 'card';
      else if (m === 'cash') method = 'cash';
      else if (m === 'evoucher') method = 'evoucher';

      let s = (i.status ?? '').toLowerCase();
      let status = 'pending';
      if (s === 'paid') status = 'paid';
      else if (s === 'refunded') status = 'refunded';

      const d = i.paid_at || i.due_date;
      const dateStr = d instanceof Date ? d.toISOString() : (d ? String(d) : new Date().toISOString());

      return {
        id: i.invoice_no ?? `inv-${idx}`,
        invoice: i.invoice_no ?? '—',
        date: dateStr,
        kind: 'fee',
        description: `Hội phí ${i.year ?? ''}`.trim(),
        amount: Number(i.amount ?? 0),
        method,
        status,
      };
    });

    return {
      activities,
      events,
      payments,
    };
  }

  async createMember(userId: string, data: CreateMemberDto) {
    const assocId = await this.getAssociationIdForUser(userId, data.associationId);
    const isAdmin = await this.checkIsAdmin(userId, assocId ?? undefined);
    if (!isAdmin) {
      throw new ForbiddenException('Chỉ quản trị viên mới có quyền thêm hội viên');
    }

    const now = new Date();
    const id = `MB${now.getTime().toString(36).toUpperCase()}`;
    const feeYear = now.getFullYear();
    const joinedAt = now.toISOString().slice(0, 10);

    // Insert into public.members. The DB trigger trg_set_member_code will automatically
    // assign the sequential code (e.g. HV-00000x or PREFIX-00000x) if code is empty!
    await this.prisma.$executeRaw`
      INSERT INTO public.members (
        id, code, name, contact, email, phone, type, level, industry, region, status,
        joined_at, fee_year, fee_paid, address, website, tax_code, employees, about,
        association_id, created_at, updated_at
      ) VALUES (
        ${id},
        '',
        ${data.name},
        ${data.contact ?? ''},
        ${data.email ?? ''},
        ${data.phone ?? ''},
        ${data.type ?? 'company'},
        ${data.level ?? 'memberLevel.medium'},
        ${data.industry ?? 'ind.trade'},
        ${data.region ?? 'region.north'},
        ${data.status ?? 'pending'},
        ${joinedAt}::date,
        ${feeYear},
        false,
        ${data.address ?? ''},
        ${data.website ?? null},
        ${data.taxCode ?? null},
        ${data.employees ?? null},
        ${data.about ?? ''},
        ${assocId}::uuid,
        now(),
        now()
      )
    `;

    // Activity log
    await this.prisma.$executeRaw`
      INSERT INTO public.activity_log (
        id, code, "user", action, target, category, at, ip, association_id, created_at, updated_at
      ) VALUES (
        gen_random_uuid(),
        ${id},
        ${userId},
        'Thêm hội viên',
        ${data.name},
        'member',
        to_char(now(), 'YYYY-MM-DD HH24:MI:SS'),
        '127.0.0.1',
        ${assocId}::uuid,
        now(),
        now()
      )
    `.catch(() => null);

    return this.getMemberById(userId, id);
  }

  async updateMember(userId: string, id: string, data: UpdateMemberDto) {
    const existing = await this.prisma.$queryRaw<any[]>`
      SELECT * FROM public.members WHERE id = ${id} LIMIT 1
    `.catch(() => []);

    if (existing.length === 0) {
      throw new NotFoundException('Không tìm thấy hội viên');
    }

    const current = existing[0];
    const isAdmin = await this.checkIsAdmin(userId, current.association_id);
    if (!isAdmin) {
      throw new ForbiddenException('Chỉ quản trị viên mới có quyền cập nhật hội viên');
    }

    const name = data.name !== undefined ? data.name : current.name;
    const contact = data.contact !== undefined ? data.contact : current.contact;
    const email = data.email !== undefined ? data.email : current.email;
    const phone = data.phone !== undefined ? data.phone : current.phone;
    const type = data.type !== undefined ? data.type : current.type;
    const level = data.level !== undefined ? data.level : current.level;
    const industry = data.industry !== undefined ? data.industry : current.industry;
    const region = data.region !== undefined ? data.region : current.region;
    const status = data.status !== undefined ? data.status : current.status;
    const address = data.address !== undefined ? data.address : current.address;
    const website = data.website !== undefined ? data.website : current.website;
    const taxCode = data.taxCode !== undefined ? data.taxCode : current.tax_code;
    const employees = data.employees !== undefined ? data.employees : current.employees;
    const about = data.about !== undefined ? data.about : current.about;

    await this.prisma.$executeRaw`
      UPDATE public.members SET
        name = ${name},
        contact = ${contact},
        email = ${email},
        phone = ${phone},
        type = ${type},
        level = ${level},
        industry = ${industry},
        region = ${region},
        status = ${status},
        address = ${address},
        website = ${website},
        tax_code = ${taxCode},
        employees = ${employees},
        about = ${about},
        updated_at = now()
      WHERE id = ${id}
    `;

    return this.getMemberById(userId, id);
  }

  async updateMemberContact(userId: string, id: string, data: UpdateMemberContactDto) {
    const existing = await this.prisma.$queryRaw<any[]>`
      SELECT * FROM public.members WHERE id = ${id} LIMIT 1
    `.catch(() => []);

    if (existing.length === 0) {
      throw new NotFoundException('Không tìm thấy hội viên');
    }

    const current = existing[0];
    const isAdmin = await this.checkIsAdmin(userId, current.association_id);
    if (!isAdmin) {
      throw new ForbiddenException('Chỉ quản trị viên mới có quyền cập nhật hội viên');
    }

    const email = data.email !== undefined ? data.email : current.email;
    const phone = data.phone !== undefined ? data.phone : current.phone;
    const address = data.address !== undefined ? data.address : current.address;

    await this.prisma.$executeRaw`
      UPDATE public.members SET
        email = ${email},
        phone = ${phone},
        address = ${address},
        updated_at = now()
      WHERE id = ${id}
    `;

    return this.getMemberById(userId, id);
  }

  async deleteMember(userId: string, id: string) {
    const existing = await this.prisma.$queryRaw<any[]>`
      SELECT * FROM public.members WHERE id = ${id} LIMIT 1
    `.catch(() => []);

    if (existing.length === 0) {
      throw new NotFoundException('Không tìm thấy hội viên');
    }

    const current = existing[0];
    const isAdmin = await this.checkIsAdmin(userId, current.association_id);
    if (!isAdmin) {
      throw new ForbiddenException('Chỉ quản trị viên mới có quyền xóa hội viên');
    }

    await this.prisma.$executeRaw`
      DELETE FROM public.members WHERE id = ${id}
    `;

    return { ok: true };
  }

  async renewMember(userId: string, id: string) {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT * FROM public.members WHERE id = ${id} LIMIT 1
    `.catch(() => []);

    if (rows.length === 0) throw new NotFoundException('Không tìm thấy hội viên');
    const current = rows[0];

    const isAdmin = await this.checkIsAdmin(userId, current.association_id);
    if (!isAdmin) throw new ForbiddenException('Chỉ quản trị viên mới có quyền gia hạn');

    const base = current.term_end ? new Date(current.term_end as string) : new Date();
    const newEnd = new Date(base);
    newEnd.setFullYear(newEnd.getFullYear() + 1);
    const newEndStr = newEnd.toISOString().slice(0, 10);
    const today = new Date().toISOString().slice(0, 10);

    await this.prisma.$executeRaw`
      UPDATE public.members SET
        fee_paid   = true,
        renewed_at = ${today},
        new_term_end = ${newEndStr},
        updated_at = now()
      WHERE id = ${id}
    `;

    return this.getMemberById(userId, id);
  }

  async sendRenewalReminder(userId: string, id: string) {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT * FROM public.members WHERE id = ${id} LIMIT 1
    `.catch(() => []);

    if (rows.length === 0) throw new NotFoundException('Không tìm thấy hội viên');
    const current = rows[0];

    const isAdmin = await this.checkIsAdmin(userId, current.association_id);
    if (!isAdmin) throw new ForbiddenException('Chỉ quản trị viên mới có quyền gửi nhắc nhở');

    const today = new Date().toISOString().slice(0, 10);
    const newCount = ((current.reminder_count as number) ?? 0) + 1;

    await this.prisma.$executeRaw`
      UPDATE public.members SET
        reminder_count = ${newCount},
        last_reminder  = ${today},
        updated_at     = now()
      WHERE id = ${id}
    `;

    return this.getMemberById(userId, id);
  }
}

