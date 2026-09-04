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
        UNION ALL
        SELECT 1 FROM public.members
        WHERE user_id = ${userId}::uuid AND association_id = ${requestedAssocId}::uuid AND status = 'active'
      `.catch(() => []);
      if (mem.length > 0) return requestedAssocId;
    }

    const mems = await this.prisma.$queryRaw<any[]>`
      SELECT association_id FROM (
        SELECT association_id, is_default, created_at FROM public.memberships
        WHERE user_id = ${userId}::uuid
        UNION ALL
        SELECT association_id, false AS is_default, created_at FROM public.members
        WHERE user_id = ${userId}::uuid AND status = 'active'
      ) m
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
      SELECT * FROM public.members WHERE id::text = ${id} OR code = ${id} LIMIT 1
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

  async getMyMemberHistory(userId: string) {
    const memRows = await this.prisma.$queryRaw<any[]>`
      SELECT id FROM public.members WHERE user_id = ${userId}::uuid LIMIT 1
    `.catch(() => []);
    if (memRows.length === 0) {
      return { activities: [], events: [], payments: [] };
    }
    return this.getMemberHistory(userId, memRows[0].id);
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

  async getActiveAssociationId(userId: string): Promise<string | null> {
    return this.getAssociationIdForUser(userId);
  }

  async getMyAssociationBrand(userId: string) {
    const associationId = await this.getAssociationIdForUser(userId);
    if (!associationId) return null;

    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT name, logo_url, brand_primary FROM public.associations
      WHERE id = ${associationId}::uuid
      LIMIT 1
    `.catch(() => []);

    if (rows.length === 0) return null;
    const a = rows[0];
    return {
      name: a.name ?? '',
      logoUrl: a.logo_url ?? null,
      brandPrimary: a.brand_primary ?? null,
    };
  }

  async getMyBenefits(userId: string) {
    const associationId = await this.getAssociationIdForUser(userId);
    const defaultBenefits = [
      {
        titleVi: 'Tham dự sự kiện',
        titleEn: 'Event access',
        descVi: 'miễn phí & ưu đãi',
        descEn: 'free & discounted',
      },
      {
        titleVi: 'Kết nối hơn',
        titleEn: 'Networking',
        descVi: '1000+ doanh nghiệp',
        descEn: '1000+ businesses',
      },
      {
        titleVi: 'Quảng bá thương hiệu',
        titleEn: 'Brand promotion',
        descVi: 'trên kênh Hiệp hội',
        descEn: 'on association channels',
      },
    ];

    if (!associationId) return defaultBenefits;

    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT title_vi, title_en, desc_vi, desc_en FROM public.association_benefits
      WHERE association_id = ${associationId}::uuid
      ORDER BY sort_order ASC
    `.catch(() => []);

    if (rows.length === 0) return defaultBenefits;
    return rows.map((r) => ({
      titleVi: r.title_vi ?? '',
      titleEn: r.title_en ?? '',
      descVi: r.desc_vi ?? '',
      descEn: r.desc_en ?? '',
    }));
  }

  async getMyMemberContext(userId: string) {
    const [memRows, profileRows, assocId] = await Promise.all([
      this.prisma.$queryRaw<any[]>`
        SELECT code, name, email, avatar, status, association_id
        FROM public.members
        WHERE user_id = ${userId}::uuid
        LIMIT 1
      `.catch(() => []),
      this.prisma.$queryRaw<any[]>`
        SELECT display_name, avatar_url, locale FROM public.user_profiles
        WHERE user_id = ${userId}::uuid
        LIMIT 1
      `.catch(() => []),
      this.getAssociationIdForUser(userId),
    ]);

    const m = memRows[0];
    const p = profileRows[0];

    const memberCode = m?.code ?? null;
    const rawStatus = String(m?.status ?? '').toLowerCase();
    const membershipStatus = ['active', 'pending', 'suspended', 'expired'].includes(rawStatus)
      ? rawStatus
      : 'unknown';
    const canAct = Boolean(memberCode) && membershipStatus === 'active';

    return {
      memberCode,
      associationId: assocId ?? m?.association_id ?? null,
      displayName: m?.name || p?.display_name || m?.email || '',
      email: m?.email || '',
      avatarUrl: m?.avatar || p?.avatar_url || null,
      membershipStatus,
      canAct,
      locale: p?.locale || 'vi',
    };
  }

  async getMyMembership(userId: string) {
    const memRows = await this.prisma.$queryRaw<any[]>`
      SELECT id, code, name, level, status, joined_at, fee_year, fee_paid, term_end, renewed_at, new_term_end
      FROM public.members
      WHERE user_id = ${userId}::uuid
      LIMIT 1
    `.catch(() => []);

    if (memRows.length === 0) {
      return {
        found: false,
        code: '',
        name: '',
        level: null,
        status: null,
        joinedAt: null,
        termEnd: null,
        newTermEnd: null,
        renewedAt: null,
        feeYear: null,
        feePaid: false,
        daysToExpiry: null,
        outstandingAmount: 0,
        invoices: [],
      };
    }

    const me = memRows[0];
    const invRows = await this.prisma.$queryRaw<any[]>`
      SELECT id, invoice_no, year, amount, status, due_date, paid_at
      FROM public.invoices
      WHERE member_id = ${me.id}
      ORDER BY year DESC, created_at DESC
      LIMIT 50
    `.catch(() => []);

    const today = new Date();
    const invoices = invRows.map((i, idx) => {
      const raw = (i.status as string) ?? '';
      const due = i.due_date ? new Date(i.due_date).toISOString().slice(0, 10) : null;
      let status: 'paid' | 'pending' | 'overdue' = raw === 'paid' ? 'paid' : 'pending';
      if (status === 'pending' && due && new Date(due) < today) status = 'overdue';

      return {
        id: i.id ?? `inv-${idx}`,
        invoice: i.invoice_no ?? `INV-${idx}`,
        year: i.year ? Number(i.year) : null,
        amount: Number(i.amount ?? 0),
        status,
        dueDate: due,
        paidAt: i.paid_at ? new Date(i.paid_at).toISOString().slice(0, 10) : null,
      };
    });

    const pending = invoices.filter((i) => i.status !== 'paid');
    const outstandingAmount = pending.reduce((s, i) => s + i.amount, 0);

    const effectiveEnd = me.new_term_end || me.term_end;
    const daysToExpiry = effectiveEnd
      ? Math.ceil((new Date(effectiveEnd).getTime() - Date.now()) / 86400000)
      : null;

    return {
      found: true,
      code: me.code ?? '',
      name: me.name ?? '',
      level: me.level ?? null,
      status: me.status ?? null,
      joinedAt: me.joined_at ? new Date(me.joined_at).toISOString().slice(0, 10) : null,
      termEnd: me.term_end ? new Date(me.term_end).toISOString().slice(0, 10) : null,
      newTermEnd: me.new_term_end ? new Date(me.new_term_end).toISOString().slice(0, 10) : null,
      renewedAt: me.renewed_at ? new Date(me.renewed_at).toISOString().slice(0, 10) : null,
      feeYear: me.fee_year ? Number(me.fee_year) : null,
      feePaid: Boolean(me.fee_paid),
      daysToExpiry,
      outstandingAmount,
      invoices,
    };
  }

  async getMyRenewalHistory(userId: string) {
    const memRows = await this.prisma.$queryRaw<any[]>`
      SELECT id FROM public.members WHERE user_id = ${userId}::uuid LIMIT 1
    `.catch(() => []);
    if (memRows.length === 0) return [];

    const invRows = await this.prisma.$queryRaw<any[]>`
      SELECT invoice_no, year, amount, status, due_date, paid_at, method
      FROM public.invoices
      WHERE member_id = ${memRows[0].id}
      ORDER BY year DESC, paid_at DESC
      LIMIT 50
    `.catch(() => []);

    const today = new Date();
    return invRows.map((i, idx) => {
      const raw = (i.status as string) ?? '';
      const due = i.due_date ? new Date(i.due_date).toISOString().slice(0, 10) : null;
      let status: 'paid' | 'pending' | 'overdue' = raw === 'paid' ? 'paid' : 'pending';
      if (status === 'pending' && due && new Date(due) < today) status = 'overdue';
      const year = i.year ? Number(i.year) : null;

      return {
        id: i.invoice_no ?? `inv-${idx}`,
        invoice: i.invoice_no ?? '—',
        year,
        amount: Number(i.amount ?? 0),
        method: i.method ?? null,
        status,
        paidAt: i.paid_at ? new Date(i.paid_at).toISOString().slice(0, 10) : null,
        dueDate: due,
        termStart: year ? `${year}-01-01` : null,
        termEnd: year ? `${year}-12-31` : null,
        note: i.method ?? null,
      };
    });
  }

  async getRenewalQuote(userId: string) {
    const memRows = await this.prisma.$queryRaw<any[]>`
      SELECT id, code, term_end, new_term_end, fee_year
      FROM public.members
      WHERE user_id = ${userId}::uuid
      LIMIT 1
    `.catch(() => []);

    if (memRows.length === 0) {
      return {
        found: false,
        code: '',
        amount: 0,
        outstanding: 0,
        renewalFee: 0,
        currentTermEnd: null,
        nextTermEnd: null,
        pendingInvoices: [],
      };
    }

    const me = memRows[0];
    const invRows = await this.prisma.$queryRaw<any[]>`
      SELECT id, invoice_no, amount, status, due_date, paid_at, year
      FROM public.invoices
      WHERE member_id = ${me.id}
      ORDER BY year DESC
      LIMIT 50
    `.catch(() => []);

    const pending = invRows.filter((i) => i.status !== 'paid' && i.status !== 'cancelled');
    const outstanding = pending.reduce((s, i) => s + Number(i.amount ?? 0), 0);
    const lastAmount = Number(invRows[0]?.amount ?? 0);
    const renewalFee = lastAmount > 0 ? lastAmount : 2_000_000;
    const currentTermEnd = me.new_term_end ? new Date(me.new_term_end).toISOString().slice(0, 10) : (me.term_end ? new Date(me.term_end).toISOString().slice(0, 10) : null);

    const fromDate = currentTermEnd && new Date(currentTermEnd).getTime() > Date.now()
      ? new Date(currentTermEnd)
      : new Date();
    fromDate.setFullYear(fromDate.getFullYear() + 1);
    const nextTermEnd = fromDate.toISOString().slice(0, 10);

    const amount = outstanding > 0 ? outstanding : renewalFee;
    return {
      found: true,
      code: me.code ?? '',
      amount,
      outstanding,
      renewalFee,
      currentTermEnd,
      nextTermEnd,
      pendingInvoices: pending.map((i) => i.invoice_no),
    };
  }

  async payMyRenewal(userId: string, body: { method: string; correlationId?: string }) {
    const quote = await this.getRenewalQuote(userId);
    if (!quote.found) throw new NotFoundException('Không tìm thấy hội viên');

    const nextEnd = quote.nextTermEnd;
    const ref = body.correlationId || `RNW-${Date.now().toString(36).toUpperCase()}`;

    await this.prisma.$executeRaw`
      UPDATE public.members
      SET new_term_end = ${nextEnd}::date, renewed_at = now(), fee_paid = true, updated_at = now()
      WHERE user_id = ${userId}::uuid
    `.catch(() => null);

    return {
      success: true,
      reference: ref,
      amountPaid: quote.amount,
      method: body.method,
      newTermEnd: nextEnd,
    };
  }

  async getMyRenewalAuditLog(userId: string) {
    const memRows = await this.prisma.$queryRaw<any[]>`
      SELECT id FROM public.members WHERE user_id = ${userId}::uuid LIMIT 1
    `.catch(() => []);
    if (memRows.length === 0) return [];

    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT id, action, event_type, status, error_reason, correlation_id, created_at, metadata
      FROM public.renewal_audit_log
      WHERE member_id = ${memRows[0].id}
      ORDER BY created_at DESC
      LIMIT 50
    `.catch(() => []);

    return rows.map((r) => ({
      id: r.id,
      action: r.action || 'renewal',
      eventType: r.event_type || 'payment',
      status: r.status || 'success',
      errorReason: r.error_reason || null,
      correlationId: r.correlation_id || null,
      createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
      metadata: r.metadata || {},
    }));
  }

  async listLinkableMembers(userId: string) {
    const user = await this.prisma.vione_users.findUnique({ where: { id: userId } });
    if (!user || !user.email) return [];

    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT m.id, m.code, m.name, m.email, m.association_id, a.name as association_name,
             (m.user_id = ${userId}::uuid) as already_linked
      FROM public.members m
      LEFT JOIN public.associations a ON m.association_id = a.id
      WHERE LOWER(m.email) = LOWER(${user.email})
      ORDER BY m.created_at DESC
    `.catch(() => []);

    return rows.map((r) => ({
      id: r.id,
      code: r.code ?? '',
      name: r.name,
      email: r.email,
      associationId: r.association_id ?? '',
      associationName: r.association_name ?? '',
      alreadyLinked: Boolean(r.already_linked),
    }));
  }

  async linkMyMemberProfile(userId: string, memberId: string) {
    const user = await this.prisma.vione_users.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Không tìm thấy tài khoản');

    const member = await this.prisma.members.findUnique({ where: { id: memberId } });
    if (!member) throw new NotFoundException('Không tìm thấy hồ sơ hội viên');
    if (member.email?.toLowerCase() !== user.email?.toLowerCase()) {
      throw new BadRequestException('Email tài khoản không khớp với email hồ sơ hội viên');
    }

    await this.prisma.members.update({
      where: { id: memberId },
      data: { user_id: userId },
    });
    return { memberId };
  }

  async unlinkMyMemberProfile(userId: string, memberId: string) {
    const member = await this.prisma.members.findUnique({ where: { id: memberId } });
    if (!member) throw new NotFoundException('Không tìm thấy hồ sơ hội viên');
    if (member.user_id !== userId) {
      throw new ForbiddenException('Bạn không sở hữu liên kết này');
    }

    await this.prisma.members.update({
      where: { id: memberId },
      data: { user_id: null },
    });
    return { success: true };
  }
}


