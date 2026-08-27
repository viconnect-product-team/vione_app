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
}
