import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BusinessCardService {
  constructor(private prisma: PrismaService) {}

  async listMyCards(userId: string) {
    return this.prisma.member_business_cards.findMany({
      where: { owner_user_id: userId },
      orderBy: { updated_at: 'desc' },
    });
  }

  async getMyCard(userId: string, id: string) {
    const card = await this.prisma.member_business_cards.findUnique({
      where: { id },
      include: {
        skills: { orderBy: { sort_order: 'asc' } },
        services: { orderBy: { sort_order: 'asc' } },
        needs: { orderBy: { sort_order: 'asc' } },
      },
    });

    if (!card) throw new NotFoundException('Card not found');
    if (card.owner_user_id !== userId)
      throw new UnauthorizedException('Not your card');

    return card;
  }

  async getPublicBySlug(slug: string) {
    return this.prisma.member_business_cards.findUnique({
      where: { slug },
      include: {
        skills: { orderBy: { sort_order: 'asc' } },
        services: { orderBy: { sort_order: 'asc' } },
        needs: { orderBy: { sort_order: 'asc' } },
      },
    });
  }

  async saveCard(userId: string, data: any) {
    const { id, skills, services, needs, ...cardData } = data;

    if (id) {
      const existing = await this.prisma.member_business_cards.findUnique({
        where: { id },
      });
      if (!existing || existing.owner_user_id !== userId) {
        throw new UnauthorizedException('Not authorized');
      }

      await this.prisma.business_card_skills.deleteMany({
        where: { card_id: id },
      });
      await this.prisma.business_card_services.deleteMany({
        where: { card_id: id },
      });
      await this.prisma.business_card_needs.deleteMany({
        where: { card_id: id },
      });

      return this.prisma.member_business_cards.update({
        where: { id },
        data: {
          ...cardData,
          skills: { create: skills || [] },
          services: { create: services || [] },
          needs: { create: needs || [] },
        },
      });
    } else {
      return this.prisma.member_business_cards.create({
        data: {
          ...cardData,
          owner_user_id: userId,
          skills: { create: skills || [] },
          services: { create: services || [] },
          needs: { create: needs || [] },
        },
      });
    }
  }

  async setStatus(userId: string, id: string, status: string) {
    const existing = await this.prisma.member_business_cards.findUnique({
      where: { id },
    });
    if (!existing || existing.owner_user_id !== userId) {
      throw new UnauthorizedException('Not authorized');
    }

    return this.prisma.member_business_cards.update({
      where: { id },
      data: { status },
    });
  }
  async getPreviewBySlug(slug: string) {
    return this.prisma.member_business_cards.findUnique({
      where: { slug },
      include: {
        skills: { orderBy: { sort_order: 'asc' } },
        services: { orderBy: { sort_order: 'asc' } },
        needs: { orderBy: { sort_order: 'asc' } },
      },
    });
  }

  async listPublicProfileSlugs() {
    const cards = await this.prisma.member_business_cards.findMany({
      where: { public_mode: 'public', status: 'published' },
      select: { slug: true, updated_at: true },
    });
    return cards.map((c) => ({
      slug: c.slug,
      updatedAt: c.updated_at.toISOString(),
    }));
  }

  async setPrimary(userId: string, id: string) {
    const existing = await this.prisma.member_business_cards.findUnique({
      where: { id },
    });
    if (!existing || existing.owner_user_id !== userId) {
      throw new UnauthorizedException('Not authorized');
    }

    // Demote all others
    await this.prisma.member_business_cards.updateMany({
      where: { owner_user_id: userId, id: { not: id } },
      data: { card_kind: 'secondary' },
    });

    // Promote this one
    await this.prisma.member_business_cards.update({
      where: { id },
      data: { card_kind: 'primary' },
    });

    return { ok: true };
  }

  async deleteCard(userId: string, id: string) {
    const existing = await this.prisma.member_business_cards.findUnique({
      where: { id },
    });
    if (!existing || existing.owner_user_id !== userId) {
      throw new UnauthorizedException('Not authorized');
    }

    await this.prisma.member_business_cards.delete({ where: { id } });
    return { ok: true };
  }

  // --- Leads ---

  async listMyLeads(userId: string) {
    return this.prisma.business_card_leads.findMany({
      where: { owner_member_id: userId },
      orderBy: { created_at: 'desc' },
      include: {
        card: { select: { slug: true, display_name: true } },
      },
    });
  }

  async updateLeadStatus(
    userId: string,
    id: string,
    status: string,
    note?: string,
  ) {
    const existing = await this.prisma.business_card_leads.findUnique({
      where: { id },
    });
    if (!existing || existing.owner_member_id !== userId) {
      throw new UnauthorizedException('Not authorized');
    }

    const updateData: any = { status };
    if (note) {
      const metadata = (existing.metadata as any) || {};
      metadata.note = note;
      updateData.metadata = metadata;
    }

    await this.prisma.business_card_leads.update({
      where: { id },
      data: updateData,
    });
    return { ok: true };
  }

  async sendLeadReply(userId: string, id: string, body: any) {
    const existing = await this.prisma.business_card_leads.findUnique({
      where: { id },
    });
    if (!existing || existing.owner_member_id !== userId) {
      throw new UnauthorizedException('Not authorized');
    }

    const metadata = (existing.metadata as any) || {};
    const history = metadata.history || [];
    history.push({
      channel: body.channel,
      body: body.body,
      sentAt: new Date().toISOString(),
    });
    metadata.history = history;

    await this.prisma.business_card_leads.update({
      where: { id },
      data: {
        status: body.markResponded ? 'responded' : existing.status,
        metadata,
      },
    });

    return { ok: true };
  }

  async processLeadWorkflow(
    userId: string,
    id: string,
    status: string,
    note?: string,
  ) {
    return this.updateLeadStatus(userId, id, status, note);
  }

  async getLeadStats(userId: string, days: number) {
    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - days);

    const leads = await this.prisma.business_card_leads.findMany({
      where: {
        owner_member_id: userId,
        created_at: { gte: sinceDate },
      },
      select: { status: true, created_at: true },
    });

    const myCards = await this.prisma.member_business_cards.findMany({
      where: { owner_user_id: userId },
      select: { id: true },
    });
    const cardIds = myCards.map((c) => c.id);

    let interactions: { interaction_type: string; created_at: Date }[] = [];
    if (cardIds.length > 0) {
      interactions = await this.prisma.business_card_interactions.findMany({
        where: {
          card_id: { in: cardIds },
          created_at: { gte: sinceDate },
        },
        select: { interaction_type: true, created_at: true },
      });
    }

    return {
      leads,
      interactions,
      summary: {
        totalLeads: leads.length,
        totalInteractions: interactions.length,
      },
    };
  }

  async getCardSettings(userId: string) {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT display_name, display_company, photo_url, show_name, show_company, show_photo,
             show_email, show_phone, show_address
      FROM public.card_settings
      WHERE user_id = ${userId}::uuid
      LIMIT 1
    `.catch(() => []);

    if (rows.length === 0) {
      return {
        displayName: null,
        displayCompany: null,
        photoUrl: null,
        showName: true,
        showCompany: true,
        showPhoto: true,
        showEmail: false,
        showPhone: false,
        showAddress: false,
      };
    }

    const data = rows[0];
    return {
      displayName: data.display_name ?? null,
      displayCompany: data.display_company ?? null,
      photoUrl: data.photo_url ?? null,
      showName: data.show_name !== false,
      showCompany: data.show_company !== false,
      showPhoto: data.show_photo !== false,
      showEmail: Boolean(data.show_email),
      showPhone: Boolean(data.show_phone),
      showAddress: Boolean(data.show_address),
    };
  }

  async saveCardSettings(userId: string, data: any) {
    await this.prisma.$executeRaw`
      INSERT INTO public.card_settings (
        user_id, display_name, display_company, photo_url,
        show_name, show_company, show_photo, show_email, show_phone, show_address, updated_at
      )
      VALUES (
        ${userId}::uuid,
        ${data.displayName ?? null},
        ${data.displayCompany ?? null},
        ${data.photoUrl ?? null},
        ${data.showName ?? true},
        ${data.showCompany ?? true},
        ${data.showPhoto ?? true},
        ${Boolean(data.showEmail)},
        ${Boolean(data.showPhone)},
        ${Boolean(data.showAddress)},
        now()
      )
      ON CONFLICT (user_id) DO UPDATE SET
        display_name = EXCLUDED.display_name,
        display_company = EXCLUDED.display_company,
        photo_url = EXCLUDED.photo_url,
        show_name = EXCLUDED.show_name,
        show_company = EXCLUDED.show_company,
        show_photo = EXCLUDED.show_photo,
        show_email = EXCLUDED.show_email,
        show_phone = EXCLUDED.show_phone,
        show_address = EXCLUDED.show_address,
        updated_at = now()
    `.catch(() => null);

    return { ok: true };
  }

  async getPublicCardByCode(code: string) {
    const memRows = await this.prisma.$queryRaw<any[]>`
      SELECT m.id, m.user_id, m.code, m.name, m.contact, m.email, m.phone, m.type, m.status,
             m.industry, m.region, m.address, m.website, m.joined_at, m.term_end, m.association_id,
             a.public_card_enabled, a.public_card_requires_active_member
      FROM public.members m
      LEFT JOIN public.associations a ON m.association_id = a.id
      WHERE m.code = ${code}
      LIMIT 1
    `.catch(() => []);

    const notFound = {
      found: false,
      code,
      name: "",
      company: "",
      type: "company",
      status: "",
      verified: false,
      validUntil: null,
      joinedAt: null,
      title: null,
      email: null,
      phone: null,
      taxCode: null,
      industry: null,
      region: null,
      address: null,
      website: null,
      photoUrl: null,
    };

    if (memRows.length === 0) return notFound;
    const m = memRows[0];

    if (m.public_card_enabled === false) return notFound;
    const isActive = m.status === 'active' || m.status === 'memberStatus.active';
    if (m.public_card_requires_active_member !== false && !isActive) return notFound;

    let settings: any = null;
    if (m.user_id) {
      const sRows = await this.prisma.$queryRaw<any[]>`
        SELECT * FROM public.card_settings WHERE user_id = ${m.user_id}::uuid LIMIT 1
      `.catch(() => []);
      if (sRows.length > 0) settings = sRows[0];
    }

    const showName = settings ? settings.show_name !== false : true;
    const showCompany = settings ? settings.show_company !== false : true;
    const showPhoto = settings ? settings.show_photo !== false : true;
    const showEmail = settings ? Boolean(settings.show_email) : false;
    const showPhone = settings ? Boolean(settings.show_phone) : false;
    const showAddress = settings ? Boolean(settings.show_address) : false;

    return {
      found: true,
      code: m.code,
      name: showName ? (settings?.display_name || m.contact || m.name) : "",
      company: showCompany ? (settings?.display_company || m.name) : "",
      type: m.type || "company",
      status: m.status || "",
      verified: isActive,
      validUntil: m.term_end ? new Date(m.term_end).toISOString() : null,
      joinedAt: m.joined_at ? new Date(m.joined_at).toISOString() : null,
      title: showName ? (m.contact || null) : null,
      email: showEmail ? (m.email || null) : null,
      phone: showPhone ? (m.phone || null) : null,
      taxCode: null,
      industry: showCompany ? (m.industry || null) : null,
      region: showCompany ? (m.region || null) : null,
      address: showAddress ? (m.address || null) : null,
      website: showCompany ? (m.website || null) : null,
      photoUrl: showPhoto ? (settings?.photo_url || null) : null,
    };
  }

  async saveCardAiHistory(userId: string, data: any) {
    const rows = await this.prisma.$queryRaw<any[]>`
      INSERT INTO public.card_ai_import_history (
        user_id, thumbnail, suggestion, template_id, qr_background, applied_at, note, created_at
      )
      VALUES (
        ${userId}::uuid,
        ${data.thumbnail},
        ${JSON.stringify(data.suggestion)}::jsonb,
        ${data.templateId ?? null},
        ${data.qrBackground ?? null},
        ${data.applied ? new Date() : null},
        ${data.note ?? null},
        now()
      )
      RETURNING *
    `.catch(() => []);

    if (rows.length === 0) {
      return {
        id: `ai-${Date.now()}`,
        thumbnail: data.thumbnail,
        suggestion: data.suggestion,
        templateId: data.templateId ?? null,
        qrBackground: data.qrBackground ?? null,
        appliedAt: data.applied ? new Date().toISOString() : null,
        note: data.note ?? null,
        createdAt: new Date().toISOString(),
      };
    }
    const r = rows[0];
    return {
      id: r.id,
      thumbnail: r.thumbnail,
      suggestion: r.suggestion,
      templateId: r.template_id,
      qrBackground: r.qr_background,
      appliedAt: r.applied_at ? new Date(r.applied_at).toISOString() : null,
      note: r.note,
      createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
    };
  }

  async listCardAiHistory(userId: string) {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT * FROM public.card_ai_import_history
      WHERE user_id = ${userId}::uuid
      ORDER BY created_at DESC
      LIMIT 50
    `.catch(() => []);

    return rows.map((r) => ({
      id: r.id,
      thumbnail: r.thumbnail,
      suggestion: r.suggestion,
      templateId: r.template_id,
      qrBackground: r.qr_background,
      appliedAt: r.applied_at ? new Date(r.applied_at).toISOString() : null,
      note: r.note,
      createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
    }));
  }

  async deleteCardAiHistory(userId: string, id: string) {
    await this.prisma.$executeRaw`
      DELETE FROM public.card_ai_import_history
      WHERE id = ${id}::uuid AND user_id = ${userId}::uuid
    `.catch(() => null);
    return { ok: true };
  }

  async getBcAdminLevel(userId: string): Promise<string> {
    const roles = await this.prisma.user_roles.findMany({ where: { user_id: userId } }).catch(() => []) as any[];
    if (roles.some((r: any) => r.role === 'platform_admin')) return 'full';

    const memberships = await this.prisma.$queryRaw<any[]>`
      SELECT role FROM public.memberships WHERE user_id = ${userId}::uuid AND role = 'admin'
    `.catch(() => []);
    if (memberships.length > 0) return 'full';

    return 'none';
  }

  async listAllAdminCards(userId: string) {
    const level = await this.getBcAdminLevel(userId);
    if (level === 'none') return [];

    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT c.id, c.slug, c.card_kind, c.status, c.public_mode, c.display_name, c.professional_title,
             c.company_name, c.avatar_url, c.updated_at, c.created_at, c.member_id, c.association_id,
             m.name as member_name, m.code as member_code, a.name as association_name
      FROM public.member_business_cards c
      LEFT JOIN public.members m ON c.member_id = m.id
      LEFT JOIN public.associations a ON c.association_id = a.id
      ORDER BY c.created_at DESC
      LIMIT 1000
    `.catch(() => []);

    return rows.map((r) => ({
      id: r.id,
      slug: r.slug,
      cardKind: r.card_kind || 'primary',
      status: r.status || 'draft',
      publicMode: r.public_mode || 'members_only',
      displayName: r.display_name || null,
      professionalTitle: r.professional_title || null,
      companyName: r.company_name || null,
      avatarUrl: r.avatar_url || null,
      updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : new Date().toISOString(),
      createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
      memberId: r.member_id || '',
      memberName: r.member_name || null,
      memberCode: r.member_code || null,
      associationId: r.association_id || '',
      associationName: r.association_name || null,
    }));
  }

  async adminSetCardStatus(userId: string, id: string, status: string) {
    const level = await this.getBcAdminLevel(userId);
    if (level === 'none') throw new UnauthorizedException('Forbidden');

    await this.prisma.$executeRaw`
      UPDATE public.member_business_cards
      SET status = ${status}, updated_at = now()
      WHERE id = ${id}
    `;
    return { ok: true };
  }

  async adminSetCardsStatus(userId: string, ids: string[], status: string) {
    const level = await this.getBcAdminLevel(userId);
    if (level === 'none') throw new UnauthorizedException('Forbidden');

    let count = 0;
    for (const id of ids) {
      await this.prisma.$executeRaw`
        UPDATE public.member_business_cards
        SET status = ${status}, updated_at = now()
        WHERE id = ${id}
      `;
      count++;
    }
    return count;
  }
}
