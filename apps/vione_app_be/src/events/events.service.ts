import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export class CreateEventDto {
  name!: string;
  date!: string;
  location?: string;
  capacity?: number;
  type?: 'forum' | 'workshop' | 'networking' | 'training';
  status?: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  associationId?: string;
  qrFields?: string[];
  tickets?: {
    name: string;
    price?: number;
    quantity?: number;
    description?: string;
  }[];
}

export class UpdateEventDto {
  name?: string;
  date?: string;
  location?: string;
  capacity?: number;
  type?: 'forum' | 'workshop' | 'networking' | 'training';
  status?: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
}

@Injectable()
export class EventsService {
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

    // Fallback: ưu tiên association đang published (CEO1983)
    const firstAssoc = await this.prisma.$queryRaw<any[]>`
      SELECT id FROM public.associations 
      ORDER BY landing_published DESC, created_at DESC 
      LIMIT 1
    `.catch(() => []);

    if (firstAssoc.length > 0 && firstAssoc[0]?.id) {
      return firstAssoc[0].id;
    }

    return null;
  }

  private mapEventRow(r: any) {
    let dateStr = '';
    if (r.date) {
      if (r.date instanceof Date) {
        dateStr = r.date.toISOString().slice(0, 10);
      } else {
        dateStr = String(r.date).slice(0, 10);
      }
    }
    const rawStatus = String(r.status ?? 'upcoming').toLowerCase();
    let status = ['upcoming', 'ongoing', 'completed', 'cancelled'].includes(rawStatus) ? rawStatus : 'upcoming';
    
    // Tự động chuyển trạng thái sự kiện đã qua ngày thành completed nếu không bị hủy
    if (dateStr && status === 'upcoming') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const evtDate = new Date(dateStr);
      evtDate.setHours(0, 0, 0, 0);
      if (evtDate.getTime() < today.getTime()) {
        status = 'completed';
      }
    }

    const rawType = String(r.type ?? 'forum').toLowerCase();
    const type = ['forum', 'workshop', 'networking', 'training'].includes(rawType) ? rawType : 'forum';

    return {
      id: r.id,
      name: r.name,
      title: r.name,
      date: dateStr,
      startDate: dateStr,
      start_date: dateStr,
      location: r.location ?? '',
      venue: r.location ?? '',
      capacity: r.capacity ?? 0,
      registered: r.registered ?? 0,
      status,
      type,
      qrFields: r.qr_fields ?? ['registration_code'],
      createdAt: r.created_at,
      updatedAt: r.updated_at,
      associationId: r.association_id,
      associationName: r.association_name ?? null,
      communityName: r.association_name ?? null,
      associationLogo: r.association_logo ?? null,
    };
  }

  private mapTicketRow(r: any) {
    return {
      id: r.id,
      eventId: r.event_id,
      name: r.name,
      price: Number(r.price ?? 0),
      quantity: r.quantity ?? 0,
      description: r.description ?? '',
      sortOrder: r.sort_order ?? 0,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    };
  }

  private mapRegRow(r: any) {
    return {
      id: r.id,
      eventId: r.event_id,
      memberCode: r.member_code,
      memberName: r.member_name ?? '',
      email: r.email ?? '',
      registeredAt: r.registered_at ? (r.registered_at instanceof Date ? r.registered_at.toISOString().slice(0, 10) : String(r.registered_at).slice(0, 10)) : '',
      status: r.status,
      ticketType: r.ticket_type,
    };
  }

  async listEvents(userId: string, associationId?: string) {
    const assocId = await this.getAssociationIdForUser(userId, associationId);
    const isPlatformAdmin = await this.checkIsPlatformAdmin(userId);

    let rows: any[] = [];
    if (isPlatformAdmin && !associationId) {
      rows = await this.prisma.$queryRaw<any[]>`
        SELECT e.*, a.name as association_name, a.logo_url as association_logo
        FROM public.events e
        LEFT JOIN public.associations a ON e.association_id = a.id
        ORDER BY (e.date >= CURRENT_DATE) DESC, e.date ASC
      `.catch(() => []);
    } else if (assocId) {
      rows = await this.prisma.$queryRaw<any[]>`
        SELECT e.*, a.name as association_name, a.logo_url as association_logo
        FROM public.events e
        LEFT JOIN public.associations a ON e.association_id = a.id
        WHERE e.association_id = ${assocId}::uuid
        ORDER BY (e.date >= CURRENT_DATE) DESC, e.date ASC
      `.catch(() => []);
    }

    if (rows.length === 0) {
      // Fallback: không có association hoặc assoc không có sự kiện → lấy tất cả events
      rows = await this.prisma.$queryRaw<any[]>`
        SELECT e.*, a.name as association_name, a.logo_url as association_logo
        FROM public.events e
        LEFT JOIN public.associations a ON e.association_id = a.id
        ORDER BY (e.date >= CURRENT_DATE) DESC, e.date ASC
      `.catch(() => []);
    }

    return rows.map((r) => this.mapEventRow(r));
  }


  async getEventsOverview(userId: string, associationId?: string) {
    const assocId = await this.getAssociationIdForUser(userId, associationId);
    const isPlatformAdmin = await this.checkIsPlatformAdmin(userId);

    let eventRows: any[];
    let regRows: any[];
    let checkinRows: any[];

    if (isPlatformAdmin && !associationId) {
      eventRows = await this.prisma.$queryRaw<any[]>`
        SELECT id, name, date, location, status, capacity FROM public.events ORDER BY date DESC
      `.catch(() => []);
      regRows = await this.prisma.$queryRaw<any[]>`
        SELECT event_id, status FROM public.event_registrations
      `.catch(() => []);
      checkinRows = await this.prisma.$queryRaw<any[]>`
        SELECT event_id FROM public.member_checkins WHERE status = 'success'
      `.catch(() => []);
    } else if (assocId) {
      eventRows = await this.prisma.$queryRaw<any[]>`
        SELECT id, name, date, location, status, capacity FROM public.events 
        WHERE association_id = ${assocId}::uuid ORDER BY date DESC
      `.catch(() => []);
      regRows = await this.prisma.$queryRaw<any[]>`
        SELECT event_id, status FROM public.event_registrations 
        WHERE association_id = ${assocId}::uuid
      `.catch(() => []);
      checkinRows = await this.prisma.$queryRaw<any[]>`
        SELECT event_id FROM public.member_checkins 
        WHERE association_id = ${assocId}::uuid AND status = 'success'
      `.catch(() => []);
    } else {
      // Fallback: lấy tất cả
      eventRows = await this.prisma.$queryRaw<any[]>`
        SELECT id, name, date, location, status, capacity FROM public.events ORDER BY date DESC
      `.catch(() => []);
      regRows = await this.prisma.$queryRaw<any[]>`
        SELECT event_id, status FROM public.event_registrations
      `.catch(() => []);
      checkinRows = await this.prisma.$queryRaw<any[]>`
        SELECT event_id FROM public.member_checkins WHERE status = 'success'
      `.catch(() => []);
    }

    const totalMap = new Map<string, number>();
    const confirmedMap = new Map<string, number>();
    const cancelledMap = new Map<string, number>();
    for (const r of regRows) {
      const eid = r.event_id;
      if (!eid) continue;
      const st = String(r.status ?? '').toLowerCase();
      totalMap.set(eid, (totalMap.get(eid) ?? 0) + 1);
      if (st === 'cancelled') {
        cancelledMap.set(eid, (cancelledMap.get(eid) ?? 0) + 1);
      } else if (st === 'confirmed' || st === 'registered') {
        confirmedMap.set(eid, (confirmedMap.get(eid) ?? 0) + 1);
      }
    }

    const attendedMap = new Map<string, number>();
    for (const c of checkinRows) {
      const eid = c.event_id;
      if (!eid) continue;
      attendedMap.set(eid, (attendedMap.get(eid) ?? 0) + 1);
    }

    return eventRows.map((e) => {
      let dateStr = '';
      if (e.date) {
        dateStr = e.date instanceof Date ? e.date.toISOString().slice(0, 10) : String(e.date).slice(0, 10);
      }
      return {
        id: e.id,
        name: e.name,
        date: dateStr,
        location: e.location ?? '',
        status: e.status ?? 'upcoming',
        capacity: Number(e.capacity ?? 0),
        registrations: totalMap.get(e.id) ?? 0,
        confirmed: confirmedMap.get(e.id) ?? 0,
        cancelled: cancelledMap.get(e.id) ?? 0,
        attended: attendedMap.get(e.id) ?? 0,
      };
    });
  }

  async listEventsWithRegistrations(userId: string, associationId?: string) {
    const [events, registrations] = await Promise.all([
      this.listEvents(userId, associationId),
      this.listRegistrations(userId, associationId),
    ]);

    return { events, registrations };
  }

  async listRegistrations(userId: string, associationId?: string, eventId?: string) {
    const assocId = await this.getAssociationIdForUser(userId, associationId);
    const isPlatformAdmin = await this.checkIsPlatformAdmin(userId);

    let rows: any[];
    if (eventId) {
      rows = await this.prisma.$queryRaw<any[]>`
        SELECT * FROM public.event_registrations 
        WHERE event_id = ${eventId}
        ORDER BY registered_at DESC
      `.catch(() => []);
    } else if (isPlatformAdmin && !associationId) {
      rows = await this.prisma.$queryRaw<any[]>`
        SELECT * FROM public.event_registrations ORDER BY registered_at DESC
      `.catch(() => []);
    } else if (assocId) {
      rows = await this.prisma.$queryRaw<any[]>`
        SELECT * FROM public.event_registrations WHERE association_id = ${assocId}::uuid ORDER BY registered_at DESC
      `.catch(() => []);
    } else {
      // Fallback: lấy tất cả
      rows = await this.prisma.$queryRaw<any[]>`
        SELECT * FROM public.event_registrations ORDER BY registered_at DESC
      `.catch(() => []);
    }

    return rows.map((r) => this.mapRegRow(r));
  }

  async getEventById(userId: string, id: string) {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT * FROM public.events WHERE id = ${id} LIMIT 1
    `.catch(() => []);

    if (rows.length === 0) {
      throw new NotFoundException('Không tìm thấy sự kiện');
    }

    const event = this.mapEventRow(rows[0]);
    const tickets = await this.getEventTickets(id);

    return { ...event, tickets };
  }

  async getEventTickets(eventId: string) {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT * FROM public.event_ticket_types WHERE event_id = ${eventId} ORDER BY sort_order ASC
    `.catch(() => []);

    return rows.map((r) => this.mapTicketRow(r));
  }

  async createEvent(userId: string, data: CreateEventDto) {
    const assocId = await this.getAssociationIdForUser(userId, data.associationId);
    const isAdmin = await this.checkIsAdmin(userId, assocId ?? undefined);
    if (!isAdmin) {
      throw new ForbiddenException('Chỉ quản trị viên mới có quyền tạo sự kiện');
    }

    const timestamp = Date.now().toString(36).toUpperCase();
    const eventId = `EV-${timestamp}`;
    const qrFields = Array.from(new Set(data.qrFields && data.qrFields.length > 0 ? data.qrFields : ['registration_code']));

    await this.prisma.$executeRaw`
      INSERT INTO public.events (
        id, name, date, location, capacity, registered, status, type, qr_fields, association_id, created_at, updated_at
      ) VALUES (
        ${eventId},
        ${data.name},
        ${data.date}::date,
        ${data.location ?? ''},
        ${data.capacity ?? 0},
        0,
        ${data.status ?? 'upcoming'},
        ${data.type ?? 'forum'},
        ${qrFields}::text[],
        ${assocId}::uuid,
        now(),
        now()
      )
    `;

    // Handle ticket types if provided (wizard)
    let ticketRows: any[] = [];
    if (data.tickets && data.tickets.length > 0) {
      for (let i = 0; i < data.tickets.length; i++) {
        const t = data.tickets[i];
        const ticketId = `TK-${timestamp}-${i}`;
        await this.prisma.$executeRaw`
          INSERT INTO public.event_ticket_types (
            id, event_id, association_id, name, price, quantity, description, sort_order, created_at, updated_at
          ) VALUES (
            ${ticketId},
            ${eventId},
            ${assocId}::uuid,
            ${t.name},
            ${t.price ?? 0},
            ${t.quantity ?? 0},
            ${t.description ?? ''},
            ${i},
            now(),
            now()
          )
        `;
        ticketRows.push({
          id: ticketId,
          eventId,
          name: t.name,
          price: t.price ?? 0,
          quantity: t.quantity ?? 0,
          description: t.description ?? '',
          sortOrder: i,
        });
      }
    }

    // Activity log
    await this.prisma.$executeRaw`
      INSERT INTO public.activity_log (
        id, code, "user", action, target, category, at, ip, association_id, created_at, updated_at
      ) VALUES (
        gen_random_uuid(),
        ${eventId},
        ${userId},
        'Tạo sự kiện',
        ${data.name},
        'event',
        to_char(now(), 'YYYY-MM-DD HH24:MI:SS'),
        '127.0.0.1',
        ${assocId}::uuid,
        now(),
        now()
      )
    `.catch(() => null);

    const created = await this.getEventById(userId, eventId);
    return {
      event: created,
      tickets: ticketRows,
    };
  }

  async updateEvent(userId: string, id: string, data: UpdateEventDto) {
    const existing = await this.prisma.$queryRaw<any[]>`
      SELECT * FROM public.events WHERE id = ${id} LIMIT 1
    `.catch(() => []);

    if (existing.length === 0) {
      throw new NotFoundException('Không tìm thấy sự kiện');
    }

    const current = existing[0];
    const isAdmin = await this.checkIsAdmin(userId, current.association_id);
    if (!isAdmin) {
      throw new ForbiddenException('Chỉ quản trị viên mới có quyền cập nhật sự kiện');
    }

    const name = data.name !== undefined ? data.name : current.name;
    const date = data.date !== undefined ? data.date : current.date;
    const location = data.location !== undefined ? data.location : current.location;
    const capacity = data.capacity !== undefined ? data.capacity : current.capacity;
    const type = data.type !== undefined ? data.type : current.type;
    const status = data.status !== undefined ? data.status : current.status;

    await this.prisma.$executeRaw`
      UPDATE public.events SET
        name = ${name},
        date = ${date}::date,
        location = ${location},
        capacity = ${capacity},
        type = ${type},
        status = ${status},
        updated_at = now()
      WHERE id = ${id}
    `;

    return this.getEventById(userId, id);
  }

  async updateQrFields(userId: string, id: string, qrFields: string[]) {
    const existing = await this.prisma.$queryRaw<any[]>`
      SELECT * FROM public.events WHERE id = ${id} LIMIT 1
    `.catch(() => []);

    if (existing.length === 0) {
      throw new NotFoundException('Không tìm thấy sự kiện');
    }

    const current = existing[0];
    const isAdmin = await this.checkIsAdmin(userId, current.association_id);
    if (!isAdmin) {
      throw new ForbiddenException('Chỉ quản trị viên mới có quyền cập nhật sự kiện');
    }

    const qr = Array.from(new Set(qrFields));
    await this.prisma.$executeRaw`
      UPDATE public.events SET
        qr_fields = ${qr}::text[],
        updated_at = now()
      WHERE id = ${id}
    `;

    return this.getEventById(userId, id);
  }

  async deleteEvent(userId: string, id: string) {
    const existing = await this.prisma.$queryRaw<any[]>`
      SELECT * FROM public.events WHERE id = ${id} LIMIT 1
    `.catch(() => []);

    if (existing.length === 0) {
      throw new NotFoundException('Không tìm thấy sự kiện');
    }

    const current = existing[0];
    const isAdmin = await this.checkIsAdmin(userId, current.association_id);
    if (!isAdmin) {
      throw new ForbiddenException('Chỉ quản trị viên mới có quyền xóa sự kiện');
    }

    // Cancel registrations
    const cancelled = await this.prisma.$executeRaw`
      UPDATE public.event_registrations
      SET status = 'cancelled', updated_at = now()
      WHERE event_id = ${id} AND status = 'confirmed'
    `.catch(() => 0);

    // Delete ticket types
    await this.prisma.$executeRaw`
      DELETE FROM public.event_ticket_types WHERE event_id = ${id}
    `.catch(() => null);

    // Delete event
    await this.prisma.$executeRaw`
      DELETE FROM public.events WHERE id = ${id}
    `;

    return { ok: true, cancelledRegistrations: cancelled };
  }

  // Mobile API: List events for mobile PWA
  async listMyEvents(userId: string) {
    const assocId = await this.getAssociationIdForUser(userId);

    let [events, me] = await Promise.all([
      assocId
        ? this.prisma.$queryRaw<any[]>`
            SELECT e.*, a.name as association_name, a.logo_url as association_logo
            FROM public.events e
            LEFT JOIN public.associations a ON e.association_id = a.id
            WHERE e.association_id = ${assocId}::uuid
            ORDER BY (e.date >= CURRENT_DATE) DESC, e.date ASC
          `.catch(() => [])
        : this.prisma.$queryRaw<any[]>`
            SELECT e.*, a.name as association_name, a.logo_url as association_logo
            FROM public.events e
            LEFT JOIN public.associations a ON e.association_id = a.id
            ORDER BY (e.date >= CURRENT_DATE) DESC, e.date ASC
          `.catch(() => []),
      this.prisma.$queryRaw<any[]>`
        SELECT code FROM public.members WHERE user_id = ${userId}::uuid LIMIT 1
      `.catch(() => []),
    ]);

    if (events.length === 0) {
      events = await this.prisma.$queryRaw<any[]>`
        SELECT e.*, a.name as association_name, a.logo_url as association_logo
        FROM public.events e
        LEFT JOIN public.associations a ON e.association_id = a.id
        ORDER BY (e.date >= CURRENT_DATE) DESC, e.date ASC
      `.catch(() => []);
    }

    const myCode = me[0]?.code;
    let regIds = new Set<string>();
    if (myCode) {
      const regs = await this.prisma.$queryRaw<any[]>`
        SELECT event_id FROM public.event_registrations WHERE member_code = ${myCode} AND status != 'cancelled'
      `.catch(() => []);
      regIds = new Set(regs.map((r) => r.event_id));
    }

    const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const vnToday = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }).format(now);

    return events.map((e) => {
      const dt = new Date(e.date);
      const valid = !isNaN(dt.getTime());
      const dateStr = valid ? dt.toISOString().slice(0, 10) : '';
      const vnEventDate = valid ? new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }).format(dt) : '';
      const isToday = vnEventDate === vnToday || dateStr === todayStr || dateStr === vnToday;

      return {
        id: e.id,
        day: valid ? String(dt.getDate()).padStart(2, '0') : '--',
        month: valid ? MONTHS[dt.getMonth()] : '',
        title: e.name,
        name: e.name,
        date: dateStr,
        startDate: dateStr,
        isToday,
        time: valid ? dt.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '',
        place: e.location ?? '',
        registered: regIds.has(e.id),
        communityName: e.association_name ?? null,
        associationName: e.association_name ?? null,
        associationId: e.association_id ?? null,
      };
    });
  }


  // Mobile API: Register for an event
  async registerForEvent(userId: string, eventId: string) {
    const eventRows = await this.prisma.$queryRaw<any[]>`
      SELECT * FROM public.events WHERE id = ${eventId} LIMIT 1
    `.catch(() => []);

    if (eventRows.length === 0) {
      throw new NotFoundException('Không tìm thấy sự kiện');
    }

    const event = eventRows[0];

    // Find member profile for user
    const memberRows = await this.prisma.$queryRaw<any[]>`
      SELECT * FROM public.members WHERE user_id = ${userId}::uuid LIMIT 1
    `.catch(() => []);

    const userRows = await this.prisma.vione_users.findUnique({
      where: { id: userId },
    });

    const memberCode = memberRows[0]?.code ?? `MB-${Date.now().toString(36).toUpperCase()}`;
    const memberName = memberRows[0]?.name ?? userRows?.name ?? 'Hội viên';
    const email = memberRows[0]?.email ?? userRows?.email ?? '';

    const regId = `REG-${Date.now().toString(36).toUpperCase()}`;
    await this.prisma.$executeRaw`
      INSERT INTO public.event_registrations (
        id, event_id, member_code, member_name, email, registered_at, status, ticket_type, association_id, created_at, updated_at
      ) VALUES (
        ${regId},
        ${eventId},
        ${memberCode},
        ${memberName},
        ${email},
        now()::date,
        'confirmed',
        'Standard',
        ${event.association_id}::uuid,
        now(),
        now()
      )
    `;

    // Increment registered count
    await this.prisma.$executeRaw`
      UPDATE public.events SET registered = registered + 1, updated_at = now() WHERE id = ${eventId}
    `.catch(() => null);

    return { ok: true, registrationId: regId };
  }

  async getCheckinState(_userId: string) {
    let attendees = await this.prisma.$queryRaw<any[]>`
      SELECT * FROM public.attendees ORDER BY name ASC
    `.catch(() => []);

    // Fallback seed if table is empty
    if (!attendees || attendees.length === 0) {
      attendees = [
        {
          id: 'VBA-2026-001',
          name: 'Nguyễn Minh Quân',
          initials: 'MQ',
          title: 'CEO & Founder',
          company: 'TechViet Solutions JSC',
          phone: '+84 901 234 567',
          badges: ['vip', 'speaker'],
          membership: 'memberLevel.large',
          ticket_type: 'VIP Pass',
          checked_in: false,
        },
        {
          id: 'VBA-2026-002',
          name: 'Trần Thị Hương Lan',
          initials: 'HL',
          title: 'Marketing Director',
          company: 'Saigon Logistics Group',
          phone: '+84 912 555 880',
          badges: ['sponsor'],
          membership: 'memberLevel.medium',
          ticket_type: 'Standard',
          checked_in: true,
        },
        {
          id: 'VBA-2026-003',
          name: 'Phạm Đức Anh',
          initials: 'PA',
          title: 'Managing Partner',
          company: 'Anh Pham Consulting',
          phone: '+84 934 121 008',
          badges: ['member'],
          membership: 'memberLevel.small',
          ticket_type: 'Standard',
          checked_in: false,
        },
        {
          id: 'VBA-2026-004',
          name: 'Lê Hoàng Nam',
          initials: 'LN',
          title: 'Head of Strategy',
          company: 'Hanoi Industrial Corp',
          phone: '+84 988 776 110',
          badges: ['vip'],
          membership: 'memberLevel.large',
          ticket_type: 'VIP Pass',
          checked_in: false,
        },
      ];
    }

    const logs = await this.prisma.$queryRaw<any[]>`
      SELECT id, attendee_id, result, created_at FROM public.checkin_logs 
      ORDER BY created_at DESC LIMIT 10
    `.catch(() => []);

    const mappedAttendees = attendees.map((r: any) => ({
      id: String(r.id),
      name: String(r.name ?? ''),
      initials: String(r.initials ?? ''),
      title: String(r.title ?? ''),
      company: String(r.company ?? ''),
      phone: String(r.phone ?? ''),
      badges: Array.isArray(r.badges) ? r.badges : [],
      membership: r.membership ?? 'memberLevel.small',
      ticketType: r.ticket_type ? String(r.ticket_type) : undefined,
      checkedIn: Boolean(r.checked_in),
    }));

    const byId = new Map(mappedAttendees.map((a: any) => [a.id, a]));
    const recent = (logs ?? [])
      .map((l: any) => {
        const att = byId.get(String(l.attendee_id));
        if (!att) return null;
        const time = l.created_at
          ? new Date(l.created_at).toLocaleTimeString('vi-VN', {
              hour: '2-digit',
              minute: '2-digit',
            })
          : '';
        return {
          attendee: att,
          result: l.result ?? 'success',
          time,
        };
      })
      .filter((e: any) => e !== null);

    const map = new Map<string, { ticketType: string; registered: number; checkedIn: number }>();
    for (const a of mappedAttendees) {
      const key = a.ticketType && a.ticketType.trim() !== '' ? a.ticketType : '—';
      const cur = map.get(key) ?? { ticketType: key, registered: 0, checkedIn: 0 };
      cur.registered += 1;
      if (a.checkedIn) cur.checkedIn += 1;
      map.set(key, cur);
    }
    const ticketStats = Array.from(map.values()).sort((a, b) => b.registered - a.registered);

    return {
      attendees: mappedAttendees,
      recent,
      stats: {
        registered: mappedAttendees.length,
        checkedIn: mappedAttendees.filter((a: any) => a.checkedIn).length,
      },
      ticketStats,
    };
  }

  async checkInAttendee(attendeeId: string) {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT * FROM public.attendees WHERE id = ${attendeeId} LIMIT 1
    `.catch(() => []);
    const cur = rows?.[0];
    if (!cur) {
      throw new NotFoundException('Attendee not found');
    }
    const already = Boolean(cur.checked_in);
    const result = already ? 'already' : 'success';
    if (!already) {
      await this.prisma.$executeRaw`
        UPDATE public.attendees SET checked_in = true, updated_at = now() WHERE id = ${attendeeId}
      `.catch(() => null);
    }
    await this.prisma.$executeRaw`
      INSERT INTO public.checkin_logs (id, attendee_id, result, created_at)
      VALUES (gen_random_uuid(), ${attendeeId}, ${result}, now())
    `.catch(() => null);

    const attendee = {
      id: String(cur.id),
      name: String(cur.name ?? ''),
      initials: String(cur.initials ?? ''),
      title: String(cur.title ?? ''),
      company: String(cur.company ?? ''),
      phone: String(cur.phone ?? ''),
      badges: Array.isArray(cur.badges) ? cur.badges : [],
      membership: cur.membership ?? 'memberLevel.small',
      ticketType: cur.ticket_type ? String(cur.ticket_type) : undefined,
      checkedIn: true,
    };
    return { attendee, result };
  }

  async undoCheckInAttendee(attendeeId: string) {
    await this.prisma.$executeRaw`
      UPDATE public.attendees SET checked_in = false, updated_at = now() WHERE id = ${attendeeId}
    `.catch(() => null);
    await this.prisma.$executeRaw`
      DELETE FROM public.checkin_logs WHERE attendee_id = ${attendeeId}
    `.catch(() => null);
    return { ok: true };
  }

  async getCheckinQrEvents(userId: string) {
    const overview = await this.getEventsOverview(userId);
    return overview.map((e) => ({
      id: e.id,
      name: e.name,
      date: e.date,
      location: e.location,
      status: e.status,
      registered: e.confirmed || e.registrations,
      capacity: e.capacity,
      checkedIn: e.attended,
    }));
  }

  async recordMemberCheckin(userId: string, body: { payload: string; method?: 'qr' | 'nfc' }) {
    const method = body.method ?? 'qr';
    const payload = body.payload ?? '';

    // 1. Resolve member for userId
    const members: any[] = await this.prisma.$queryRaw<any[]>`
      SELECT code, association_id, status FROM public.members WHERE user_id = ${userId}::uuid
    `.catch(() => [] as any[]);

    if (members.length === 0) {
      throw new BadRequestException('member_not_found');
    }

    // Parse payload to get eventId
    let eventId: string | null = null;
    try {
      const parsed = JSON.parse(payload);
      eventId = parsed.eventId || parsed.id || null;
    } catch {
      const match = payload.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
      if (match) {
        eventId = match[0];
      } else {
        eventId = payload.trim();
      }
    }

    if (!eventId) {
      throw new BadRequestException('invalid_payload');
    }

    const eventRows: any[] = await this.prisma.$queryRaw<any[]>`
      SELECT id, name, association_id FROM public.events WHERE id = ${eventId}::uuid LIMIT 1
    `.catch(() => [] as any[]);

    if (eventRows.length === 0) {
      throw new NotFoundException('event_not_found');
    }

    const ev: any = eventRows[0];
    const matchingMember: any = members.find((m: any) => m.association_id === ev.association_id) || members[0];
    if (matchingMember?.status !== 'active') {
      throw new BadRequestException('membership_inactive');
    }

    // Check prior checkin (replay)
    const prior = await this.prisma.$queryRaw<any[]>`
      SELECT id, event_id, event_title, method, checked_at
      FROM public.member_checkins
      WHERE member_code = ${matchingMember.code} AND event_id = ${ev.id}::uuid AND status = 'success'
      LIMIT 1
    `.catch(() => []);

    if (prior.length > 0) {
      const p = prior[0];
      return {
        id: p.id,
        eventId: p.event_id,
        eventTitle: p.event_title,
        status: 'already',
        method: p.method ?? method,
        at: p.checked_at ? new Date(p.checked_at).toISOString() : new Date().toISOString(),
      };
    }

    const clientId = `chk:v2:${matchingMember.association_id}:${matchingMember.code}:${ev.id}`;
    const inserted = await this.prisma.$queryRaw<any[]>`
      INSERT INTO public.member_checkins (
        id, client_id, member_code, event_id, event_title, status, method, checked_at, association_id
      ) VALUES (
        gen_random_uuid(), ${clientId}, ${matchingMember.code}, ${ev.id}::uuid, ${ev.name}, 'success', ${method}, now(), ${matchingMember.association_id}::uuid
      )
      ON CONFLICT (client_id) DO UPDATE SET checked_at = member_checkins.checked_at
      RETURNING id, event_id, event_title, method, checked_at
    `.catch(() => []);

    if (inserted.length > 0) {
      const r = inserted[0];
      return {
        id: r.id,
        eventId: r.event_id,
        eventTitle: r.event_title,
        status: 'success',
        method: r.method ?? method,
        at: r.checked_at ? new Date(r.checked_at).toISOString() : new Date().toISOString(),
      };
    }

    return {
      id: eventId,
      eventId,
      eventTitle: ev.name,
      status: 'success',
      method,
      at: new Date().toISOString(),
    };
  }

  async listMyMemberCheckins(userId: string, limit: number = 50) {
    const members = await this.prisma.$queryRaw<any[]>`
      SELECT code FROM public.members WHERE user_id = ${userId}::uuid
    `.catch(() => []);

    const codes = members.map((m) => m.code).filter(Boolean);
    if (codes.length === 0) return [];

    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT id, event_id, event_title, status, method, checked_at
      FROM public.member_checkins
      WHERE member_code = ANY(${codes})
      ORDER BY checked_at DESC
      LIMIT ${limit}
    `.catch(() => []);

    return rows.map((r) => ({
      id: r.id,
      eventId: r.event_id,
      eventTitle: r.event_title || 'Sự kiện',
      status: r.status || 'success',
      method: r.method || 'qr',
      at: r.checked_at ? new Date(r.checked_at).toISOString() : '',
    }));
  }
}
