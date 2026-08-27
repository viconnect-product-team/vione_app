import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class ConnectAppService {
  constructor(private prisma: PrismaService) {}

  async getBriefing(userId: string) {
    const now = new Date();

    // 1. Connection requests
    const connectionRequests = await this.prisma.$queryRaw`
      SELECT id, requester_user_id, recipient_user_id as target_user_id, status::text as status, created_at
      FROM public.user_connections
      WHERE status = 'pending'::public.global_connection_status AND (requester_user_id = ${userId}::uuid OR recipient_user_id = ${userId}::uuid)
      ORDER BY created_at DESC
      LIMIT 50
    `.catch(() => []) as any[];

    // 2. Introduction requests
    const introductionRequests = await this.prisma.$queryRaw`
      SELECT id, status, created_at, requester_user_id, intermediary_user_id, target_user_id, target_person_node_id
      FROM public.introduction_requests
      WHERE status IN ('pending', 'accepted') AND (requester_user_id = ${userId}::uuid OR intermediary_user_id = ${userId}::uuid OR target_user_id = ${userId}::uuid)
      ORDER BY created_at DESC
      LIMIT 50
    `.catch(() => []) as any[];

    // 3. Introduction deliveries
    const introductionDeliveries = await this.prisma.$queryRaw`
      SELECT id, status, created_at, recipient_user_id
      FROM public.introduction_deliveries
      WHERE status IN ('sent', 'delivered') AND recipient_user_id = ${userId}::uuid
      ORDER BY created_at DESC
      LIMIT 50
    `.catch(() => []) as any[];

    // 4. Business meetings
    const businessMeetings = await this.prisma.$queryRaw`
      SELECT id, status, scheduled_start_at, organizer_user_id
      FROM public.business_meetings
      ORDER BY scheduled_start_at ASC NULLS LAST
      LIMIT 50
    `.catch(() => []) as any[];

    // 5. Followups
    const businessMeetingFollowUps = await this.prisma.$queryRaw`
      SELECT id, meeting_id, status, due_at, title, owner_user_id
      FROM public.business_meeting_follow_ups
      WHERE status IN ('open', 'in_progress') AND owner_user_id = ${userId}::uuid
      ORDER BY due_at ASC NULLS LAST
      LIMIT 50
    `.catch(() => []) as any[];

    // 6. Timeline events
    const graphTimelineEvents = await this.prisma.$queryRaw`
      SELECT id, occurred_at, event_kind, person_node_id
      FROM public.graph_timeline_events
      ORDER BY occurred_at DESC
      LIMIT 50
    `.catch(() => []) as any[];

    return {
      connectionRequests: connectionRequests.map(r => ({
        id: String(r.id),
        direction: r.requester_user_id === userId ? 'outgoing' : 'incoming',
        status: String(r.status),
        createdAt: r.created_at ? new Date(r.created_at).toISOString() : now.toISOString(),
        counterpartHandle: null,
        counterpartDisplayName: null,
        counterpartAvatarUrl: null,
      })),
      introductionRequests: introductionRequests.map(r => {
        const role = r.intermediary_user_id === userId
          ? 'intermediary'
          : r.target_user_id === userId
            ? 'target'
            : 'requester';
        return {
          id: String(r.id),
          role,
          status: String(r.status),
          createdAt: r.created_at ? new Date(r.created_at).toISOString() : now.toISOString(),
          targetPersonNodeId: r.target_person_node_id || null,
          counterpartDisplayName: null,
        };
      }),
      introductionDeliveries: introductionDeliveries.map(r => ({
        id: String(r.id),
        status: String(r.status),
        createdAt: r.created_at ? new Date(r.created_at).toISOString() : now.toISOString(),
        counterpartDisplayName: null,
      })),
      meetingWorkspaceItems: businessMeetings.map(r => {
        const isUpcoming = r.status === 'confirmed' && r.scheduled_start_at && new Date(r.scheduled_start_at) >= now;
        return {
          meetingId: String(r.id),
          status: String(r.status),
          bucket: isUpcoming ? 'upcoming' : r.status === 'completed' ? 'history' : 'overview',
          suggestedActionKind: r.status === 'proposed'
            ? 'respond_meeting'
            : r.status === 'confirmed' && !r.scheduled_start_at
              ? 'schedule_meeting'
              : 'view_meeting',
          scheduledStartAt: r.scheduled_start_at ? new Date(r.scheduled_start_at).toISOString() : null,
          viewerRole: r.organizer_user_id === userId ? 'organizer' : 'attendee',
          counterpartDisplayName: null,
          hasOutcome: false,
        };
      }),
      meetingFollowUps: businessMeetingFollowUps.map(r => {
        const isOverdue = r.due_at && new Date(r.due_at) < now;
        return {
          id: String(r.id),
          meetingId: String(r.meeting_id),
          status: String(r.status),
          dueAt: r.due_at ? new Date(r.due_at).toISOString() : null,
          temporalState: r.status === 'completed'
            ? 'completed'
            : r.status === 'cancelled'
              ? 'cancelled'
              : isOverdue
                ? 'overdue'
                : 'active',
          title: r.title || null,
        };
      }),
      relationshipActivity: graphTimelineEvents.map(r => ({
        id: String(r.id),
        occurredAt: r.occurred_at ? new Date(r.occurred_at).toISOString() : now.toISOString(),
        eventKind: String(r.event_kind),
        personNodeId: r.person_node_id || null,
        counterpartDisplayName: null,
      })),
    };
  }

  async getMyCommunities(userId: string) {
    const memberships = await this.prisma.$queryRaw`
      SELECT m.association_id, m.role, m.is_default, a.name, a.logo_url, a.tagline, a.about
      FROM public.memberships m
      JOIN public.associations a ON m.association_id = a.id
      WHERE m.user_id = ${userId}::uuid
    `.catch(() => []) as any[];

    const result: any[] = [];
    for (const m of memberships) {
      const activeCountRes = await this.prisma.$queryRaw`
        SELECT COUNT(id)::int as count FROM public.members
        WHERE association_id = ${m.association_id}::uuid AND status = 'active'
      `.catch(() => [{ count: 0 }]) as any[];
      const count = activeCountRes[0]?.count || 0;

      result.push({
        communityId: String(m.association_id),
        name: String(m.name),
        logoUrl: m.logo_url || null,
        shortDescription: m.tagline || null,
        memberCount: count,
        viewerRole: m.role === 'admin' ? 'admin' : 'member',
        isDefault: m.is_default === true,
      });
    }

    return result.sort((a, b) => {
      if (a.isDefault !== b.isDefault) return a.isDefault ? -1 : 1;
      return a.name.localeCompare(b.name, 'vi');
    });
  }

  async getMyProfile(userId: string) {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT 
        user_id, display_name, avatar_url, professional_title, company_name, 
        industry, region, bio, locale, timezone, 
        onboarding_status::text as onboarding_status, 
        account_status::text as account_status, 
        created_at, updated_at
      FROM public.user_profiles
      WHERE user_id = ${userId}::uuid
      LIMIT 1
    `.catch(() => []);
    return rows[0] || null;
  }

  async updateMyProfile(userId: string, data: any) {
    const onboardingStatus = data.onboarding_status || 'new';
    const accountStatus = data.account_status || 'active';
    await this.prisma.$executeRaw`
      INSERT INTO public.user_profiles (
        user_id, display_name, avatar_url, professional_title, company_name, 
        industry, region, bio, locale, timezone, onboarding_status, account_status
      )
      VALUES (
        ${userId}::uuid, 
        ${data.display_name || null}, 
        ${data.avatar_url || null}, 
        ${data.professional_title || null}, 
        ${data.company_name || null}, 
        ${data.industry || null}, 
        ${data.region || null}, 
        ${data.bio || null}, 
        ${data.locale || 'vi'}, 
        ${data.timezone || 'Asia/Ho_Chi_Minh'}, 
        ${onboardingStatus}, 
        ${accountStatus}
      )
      ON CONFLICT (user_id) DO UPDATE SET
        display_name = EXCLUDED.display_name,
        avatar_url = EXCLUDED.avatar_url,
        professional_title = EXCLUDED.professional_title,
        company_name = EXCLUDED.company_name,
        industry = EXCLUDED.industry,
        region = EXCLUDED.region,
        bio = EXCLUDED.bio,
        locale = EXCLUDED.locale,
        timezone = EXCLUDED.timezone,
        onboarding_status = EXCLUDED.onboarding_status,
        account_status = EXCLUDED.account_status,
        updated_at = now()
    `;
    return this.getMyProfile(userId);
  }

  async getMyIdentity(userId: string) {
    const identityRows = await this.prisma.$queryRaw<any[]>`
      SELECT * FROM public.business_identities WHERE owner_user_id = ${userId}::uuid LIMIT 1
    `.catch(() => []);
    const identity = identityRows.length > 0 ? identityRows[0] : null;

    const visibilityRows = await this.prisma.$queryRaw<any[]>`
      SELECT field_key, visibility FROM public.identity_field_visibility WHERE owner_user_id = ${userId}::uuid
    `.catch(() => []);
    const visibility = {};
    for (const row of visibilityRows) {
      visibility[row.field_key] = row.visibility;
    }

    return {
      identity: identity ? {
        id: identity.id,
        ownerUserId: identity.owner_user_id,
        displayName: identity.display_name,
        headline: identity.headline,
        jobTitle: identity.job_title,
        companyName: identity.company_name,
        bio: identity.bio,
        avatarUrl: identity.avatar_url,
        primaryEmail: identity.primary_email,
        primaryPhone: identity.primary_phone,
        website: identity.website,
        linkedinUrl: identity.linkedin_url,
        address: identity.address,
        city: identity.city,
        countryCode: identity.country_code,
        preferredLocale: identity.preferred_locale,
        status: identity.status,
        createdAt: identity.created_at,
        updatedAt: identity.updated_at,
      } : null,
      visibility,
    };
  }

  async upsertMyIdentity(userId: string, input: any) {
    const existingRows = await this.prisma.$queryRaw<any[]>`
      SELECT * FROM public.business_identities WHERE owner_user_id = ${userId}::uuid LIMIT 1
    `.catch(() => []);
    const now = new Date();

    if (existingRows.length === 0) {
      const id = crypto.randomUUID();
      const finalData = {
        id,
        owner_user_id: userId,
        display_name: input.displayName || null,
        headline: input.headline || null,
        job_title: input.jobTitle || null,
        company_name: input.companyName || null,
        bio: input.bio || null,
        avatar_url: input.avatarUrl || null,
        primary_email: input.primaryEmail || null,
        primary_phone: input.primaryPhone || null,
        website: input.website || null,
        linkedin_url: input.linkedinUrl || null,
        address: input.address || null,
        city: input.city || null,
        country_code: input.countryCode || null,
        preferred_locale: input.preferredLocale || null,
        status: 'active',
        created_at: now,
        updated_at: now,
      };

      await this.prisma.$executeRaw`
        INSERT INTO public.business_identities (
          id, owner_user_id, display_name, headline, job_title, company_name, bio, avatar_url,
          primary_email, primary_phone, website, linkedin_url, address, city, country_code,
          preferred_locale, status, created_at, updated_at
        ) VALUES (
          ${finalData.id}::uuid, ${finalData.owner_user_id}::uuid, ${finalData.display_name}, ${finalData.headline},
          ${finalData.job_title}, ${finalData.company_name}, ${finalData.bio},
          ${finalData.avatar_url}, ${finalData.primary_email}, ${finalData.primary_phone},
          ${finalData.website}, ${finalData.linkedin_url}, ${finalData.address},
          ${finalData.city}, ${finalData.country_code}, ${finalData.preferred_locale},
          ${finalData.status}, ${finalData.created_at}, ${finalData.updated_at}
        )
      `;
    } else {
      const existing = existingRows[0];
      const finalData = {
        display_name: input.displayName !== undefined ? input.displayName : existing.display_name,
        headline: input.headline !== undefined ? input.headline : existing.headline,
        job_title: input.jobTitle !== undefined ? input.jobTitle : existing.job_title,
        company_name: input.companyName !== undefined ? input.companyName : existing.company_name,
        bio: input.bio !== undefined ? input.bio : existing.bio,
        avatar_url: input.avatarUrl !== undefined ? input.avatarUrl : existing.avatar_url,
        primary_email: input.primaryEmail !== undefined ? input.primaryEmail : existing.primary_email,
        primary_phone: input.primaryPhone !== undefined ? input.primaryPhone : existing.primary_phone,
        website: input.website !== undefined ? input.website : existing.website,
        linkedin_url: input.linkedinUrl !== undefined ? input.linkedinUrl : existing.linkedin_url,
        address: input.address !== undefined ? input.address : existing.address,
        city: input.city !== undefined ? input.city : existing.city,
        country_code: input.countryCode !== undefined ? input.countryCode : existing.country_code,
        preferred_locale: input.preferredLocale !== undefined ? input.preferredLocale : existing.preferred_locale,
      };

      await this.prisma.$executeRaw`
        UPDATE public.business_identities SET
          display_name = ${finalData.display_name},
          headline = ${finalData.headline},
          job_title = ${finalData.job_title},
          company_name = ${finalData.company_name},
          bio = ${finalData.bio},
          avatar_url = ${finalData.avatar_url},
          primary_email = ${finalData.primary_email},
          primary_phone = ${finalData.primary_phone},
          website = ${finalData.website},
          linkedin_url = ${finalData.linkedin_url},
          address = ${finalData.address},
          city = ${finalData.city},
          country_code = ${finalData.country_code},
          preferred_locale = ${finalData.preferred_locale},
          updated_at = ${now}
        WHERE id = ${existing.id}::uuid
      `;
    }

    return this.getMyIdentity(userId);
  }

  async updateMyVisibility(userId: string, updates: any[]) {
    const identityRows = await this.prisma.$queryRaw<any[]>`
      SELECT id FROM public.business_identities WHERE owner_user_id = ${userId}::uuid LIMIT 1
    `.catch(() => []);
    if (identityRows.length === 0) {
      throw new Error("identity_not_found");
    }
    const identityId = identityRows[0].id;
    const now = new Date();

    for (const update of updates) {
      await this.prisma.$executeRaw`
        INSERT INTO public.identity_field_visibility (identity_id, owner_user_id, field_key, visibility, updated_at)
        VALUES (${identityId}::uuid, ${userId}::uuid, ${update.fieldKey}, ${update.visibility}, ${now})
        ON CONFLICT (identity_id, field_key) DO UPDATE SET
          visibility = EXCLUDED.visibility,
          updated_at = EXCLUDED.updated_at
      `;
    }

    return this.getMyIdentity(userId);
  }

  async getOrCreateMyShareLink(userId: string) {
    const existingRows = await this.prisma.$queryRaw<any[]>`
      SELECT id FROM public.business_identities WHERE owner_user_id = ${userId}::uuid LIMIT 1
    `.catch(() => []);
    let identityId: string;
    const now = new Date();

    if (existingRows.length === 0) {
      identityId = crypto.randomUUID();
      await this.prisma.$executeRaw`
        INSERT INTO public.business_identities (id, owner_user_id, status, created_at, updated_at)
        VALUES (${identityId}::uuid, ${userId}::uuid, 'active', ${now}, ${now})
      `;
    } else {
      identityId = existingRows[0].id;
    }

    const links = await this.prisma.$queryRaw<any[]>`
      SELECT * FROM public.identity_share_links
      WHERE owner_user_id = ${userId}::uuid AND status = 'active'
      ORDER BY created_at DESC LIMIT 1
    `.catch(() => []);

    if (links.length > 0) {
      const link = links[0];
      return {
        token: link.public_token,
        status: link.status,
        createdAt: link.created_at,
        rotatedAt: link.rotated_at,
        lastUsedAt: link.last_used_at,
      };
    }

    const newLinkToken = crypto.randomBytes(32).toString('hex');
    const linkId = crypto.randomUUID();
    await this.prisma.$executeRaw`
      INSERT INTO public.identity_share_links (id, identity_id, owner_user_id, public_token, status, created_at)
      VALUES (${linkId}::uuid, ${identityId}::uuid, ${userId}::uuid, ${newLinkToken}, 'active', ${now})
    `;

    return {
      token: newLinkToken,
      status: 'active',
      createdAt: now,
      rotatedAt: null,
      lastUsedAt: null,
    };
  }

  async rotateMyShareLink(userId: string) {
    const existingRows = await this.prisma.$queryRaw<any[]>`
      SELECT id FROM public.business_identities WHERE owner_user_id = ${userId}::uuid LIMIT 1
    `.catch(() => []);
    let identityId: string;
    const now = new Date();

    if (existingRows.length === 0) {
      identityId = crypto.randomUUID();
      await this.prisma.$executeRaw`
        INSERT INTO public.business_identities (id, owner_user_id, status, created_at, updated_at)
        VALUES (${identityId}::uuid, ${userId}::uuid, 'active', ${now}, ${now})
      `;
    } else {
      identityId = existingRows[0].id;
    }

    await this.prisma.$executeRaw`
      UPDATE public.identity_share_links
      SET status = 'revoked', revoked_at = ${now}, rotated_at = ${now}
      WHERE owner_user_id = ${userId}::uuid AND status = 'active'
    `;

    const newLinkToken = crypto.randomBytes(32).toString('hex');
    const linkId = crypto.randomUUID();
    await this.prisma.$executeRaw`
      INSERT INTO public.identity_share_links (id, identity_id, owner_user_id, public_token, status, created_at)
      VALUES (${linkId}::uuid, ${identityId}::uuid, ${userId}::uuid, ${newLinkToken}, 'active', ${now})
    `;

    return {
      token: newLinkToken,
      status: 'active',
      createdAt: now,
      rotatedAt: now,
      lastUsedAt: null,
    };
  }

  async getPublicIdentityByToken(token: string) {
    const links = await this.prisma.$queryRaw<any[]>`
      SELECT id, identity_id, status FROM public.identity_share_links
      WHERE public_token = ${token} AND status = 'active'
      LIMIT 1
    `.catch(() => []);

    if (links.length === 0) {
      return { state: 'unavailable' };
    }
    const link = links[0];

    const identities = await this.prisma.$queryRaw<any[]>`
      SELECT * FROM public.business_identities
      WHERE id = ${link.identity_id}::uuid AND status = 'active'
      LIMIT 1
    `.catch(() => []);

    if (identities.length === 0) {
      return { state: 'unavailable' };
    }
    const identity = identities[0];

    const visibilityRows = await this.prisma.$queryRaw<any[]>`
      SELECT field_key, visibility FROM public.identity_field_visibility
      WHERE identity_id = ${identity.id}::uuid
    `.catch(() => []);

    const visibility = {};
    for (const row of visibilityRows) {
      visibility[row.field_key] = row.visibility;
    }

    // Update last used marker asynchronously
    this.prisma.$executeRaw`
      UPDATE public.identity_share_links
      SET last_used_at = ${new Date()}
      WHERE id = ${link.id}::uuid
    `.catch(() => {});

    // Projection mapping
    const isFieldVisible = (key: string) => {
      const v = visibility[key];
      return v === 'public' || v === undefined; // Default to public if not explicitly hidden
    };

    return {
      state: 'public',
      card: {
        id: identity.id,
        displayName: isFieldVisible('displayName') ? identity.display_name : null,
        headline: isFieldVisible('headline') ? identity.headline : null,
        jobTitle: isFieldVisible('jobTitle') ? identity.job_title : null,
        companyName: isFieldVisible('companyName') ? identity.company_name : null,
        bio: isFieldVisible('bio') ? identity.bio : null,
        avatarUrl: isFieldVisible('avatarUrl') ? identity.avatar_url : null,
        primaryEmail: isFieldVisible('primaryEmail') ? identity.primary_email : null,
        primaryPhone: isFieldVisible('primaryPhone') ? identity.primary_phone : null,
        website: isFieldVisible('website') ? identity.website : null,
        linkedinUrl: isFieldVisible('linkedinUrl') ? identity.linkedin_url : null,
        address: isFieldVisible('address') ? identity.address : null,
        city: isFieldVisible('city') ? identity.city : null,
        countryCode: isFieldVisible('countryCode') ? identity.country_code : null,
      }
    };
  }

  async getCommunityDetail(userId: string, communityId: string): Promise<any | null> {
    const memberships = await this.prisma.$queryRaw<any[]>`
      SELECT role, is_default FROM public.memberships
      WHERE user_id = ${userId}::uuid AND association_id = ${communityId}::uuid
      LIMIT 1
    `.catch(() => []);
    if (memberships.length === 0) return null;
    const membership = memberships[0];

    const associations = await this.prisma.$queryRaw<any[]>`
      SELECT id, name, logo_url, tagline, about FROM public.associations
      WHERE id = ${communityId}::uuid
      LIMIT 1
    `.catch(() => []);
    if (associations.length === 0) return null;
    const assoc = associations[0];

    const activeCountRes = await this.prisma.$queryRaw`
      SELECT COUNT(id)::int as count FROM public.members
      WHERE association_id = ${communityId}::uuid AND status = 'active'
    `.catch(() => [{ count: 0 }]) as any[];
    const memberCount = activeCountRes[0]?.count || 0;

    let upcomingEvents: any[] = [];
    try {
      const today = new Date().toISOString().slice(0, 10);
      const events = await this.prisma.$queryRaw<any[]>`
        SELECT id, name, date, location FROM public.events
        WHERE association_id = ${communityId}::uuid AND date >= ${today}
        ORDER BY date ASC
        LIMIT 2
      `;
      upcomingEvents = events.map(e => ({
        eventId: String(e.id),
        name: String(e.name),
        date: e.date ? new Date(e.date).toISOString() : '',
        location: e.location || null,
      }));
    } catch {
      upcomingEvents = [];
    }

    let openOpportunityCount = 0;
    try {
      const oppCountRes = await this.prisma.$queryRaw<any[]>`
        SELECT COUNT(id)::int as count FROM public.opportunities
        WHERE association_id = ${communityId}::uuid AND status = 'open'
      `;
      openOpportunityCount = oppCountRes[0]?.count || 0;
    } catch {
      openOpportunityCount = 0;
    }

    return {
      community: {
        communityId: assoc.id,
        name: assoc.name,
        logoUrl: assoc.logo_url || null,
        shortDescription: assoc.tagline || null,
        description: assoc.about || null,
        memberCount,
        viewerRole: membership.role === 'admin' ? 'admin' : 'member',
        isDefault: membership.is_default === true,
      },
      upcomingEvents,
      openOpportunityCount,
    };
  }

  async listCommunityMembers(
    userId: string,
    communityId: string,
    searchQuery: string = '',
    offset: number = 0,
    roleFilter: string = 'all',
  ) {
    const membership = await this.prisma.$queryRaw<any[]>`
      SELECT role FROM public.memberships
      WHERE user_id = ${userId}::uuid AND association_id = ${communityId}::uuid
      LIMIT 1
    `.catch(() => []);
    if (membership.length === 0) return null;
    const viewerRole = membership[0].role === 'admin' ? 'admin' : 'member';

    const searchNormalized = searchQuery.trim().toLowerCase();
    const roleCond = roleFilter !== 'all' ? roleFilter : null;

    let members: any[] = [];
    let totalCount = 0;

    if (searchNormalized) {
      const searchLike = `%${searchNormalized}%`;
      if (roleCond) {
        members = await this.prisma.$queryRaw<any[]>`
          SELECT id, name, industry, region, user_id, joined_at, role, status
          FROM public.members
          WHERE association_id = ${communityId}::uuid AND status = 'active'
            AND role = ${roleCond}
            AND (LOWER(name) LIKE LOWER(${searchLike}) OR LOWER(industry) LIKE LOWER(${searchLike}) OR LOWER(region) LIKE LOWER(${searchLike}))
          ORDER BY joined_at DESC NULLS LAST, name ASC
          OFFSET ${offset} LIMIT 25
        `.catch(() => []);
        const countRes = await this.prisma.$queryRaw<any[]>`
          SELECT COUNT(id)::int as count FROM public.members
          WHERE association_id = ${communityId}::uuid AND status = 'active'
            AND role = ${roleCond}
            AND (LOWER(name) LIKE LOWER(${searchLike}) OR LOWER(industry) LIKE LOWER(${searchLike}) OR LOWER(region) LIKE LOWER(${searchLike}))
        `.catch(() => [{ count: 0 }]);
        totalCount = countRes[0]?.count || 0;
      } else {
        members = await this.prisma.$queryRaw<any[]>`
          SELECT id, name, industry, region, user_id, joined_at, role, status
          FROM public.members
          WHERE association_id = ${communityId}::uuid AND status = 'active'
            AND (LOWER(name) LIKE LOWER(${searchLike}) OR LOWER(industry) LIKE LOWER(${searchLike}) OR LOWER(region) LIKE LOWER(${searchLike}))
          ORDER BY joined_at DESC NULLS LAST, name ASC
          OFFSET ${offset} LIMIT 25
        `.catch(() => []);
        const countRes = await this.prisma.$queryRaw<any[]>`
          SELECT COUNT(id)::int as count FROM public.members
          WHERE association_id = ${communityId}::uuid AND status = 'active'
            AND (LOWER(name) LIKE LOWER(${searchLike}) OR LOWER(industry) LIKE LOWER(${searchLike}) OR LOWER(region) LIKE LOWER(${searchLike}))
        `.catch(() => [{ count: 0 }]);
        totalCount = countRes[0]?.count || 0;
      }
    } else {
      if (roleCond) {
        members = await this.prisma.$queryRaw<any[]>`
          SELECT id, name, industry, region, user_id, joined_at, role, status
          FROM public.members
          WHERE association_id = ${communityId}::uuid AND status = 'active' AND role = ${roleCond}
          ORDER BY joined_at DESC NULLS LAST, name ASC
          OFFSET ${offset} LIMIT 25
        `.catch(() => []);
        const countRes = await this.prisma.$queryRaw<any[]>`
          SELECT COUNT(id)::int as count FROM public.members
          WHERE association_id = ${communityId}::uuid AND status = 'active' AND role = ${roleCond}
        `.catch(() => [{ count: 0 }]);
        totalCount = countRes[0]?.count || 0;
      } else {
        members = await this.prisma.$queryRaw<any[]>`
          SELECT id, name, industry, region, user_id, joined_at, role, status
          FROM public.members
          WHERE association_id = ${communityId}::uuid AND status = 'active'
          ORDER BY joined_at DESC NULLS LAST, name ASC
          OFFSET ${offset} LIMIT 25
        `.catch(() => []);
        const countRes = await this.prisma.$queryRaw<any[]>`
          SELECT COUNT(id)::int as count FROM public.members
          WHERE association_id = ${communityId}::uuid AND status = 'active'
        `.catch(() => [{ count: 0 }]);
        totalCount = countRes[0]?.count || 0;
      }
    }

    const items: any[] = [];
    for (const m of members) {
      const cards = await this.prisma.$queryRaw<any[]>`
        SELECT avatar_url, professional_title, company_name, headline FROM public.member_business_cards
        WHERE member_id = ${m.id}::uuid
        LIMIT 1
      `.catch(() => []);
      const card = cards.length > 0 ? cards[0] : null;

      items.push({
        memberRef: m.id,
        displayName: m.name,
        avatarUrl: card?.avatar_url || null,
        jobTitle: card?.professional_title || null,
        companyName: card?.company_name || null,
        industryLabel: m.industry || null,
        hasPublicCard: !!card,
        isSelf: m.user_id === userId,
        role: m.role === 'admin' ? 'admin' : 'member',
      });
    }

    const nextOffset = items.length === 25 ? offset + 25 : null;

    return {
      items,
      totalCount,
      nextOffset,
      viewerRole,
    };
  }

  async getCommunityMemberProfile(userId: string, communityId: string, memberRef: string) {
    const memberships = await this.prisma.$queryRaw<any[]>`
      SELECT role FROM public.memberships
      WHERE user_id = ${userId}::uuid AND association_id = ${communityId}::uuid
      LIMIT 1
    `.catch(() => []);
    if (memberships.length === 0) return null;
    const viewerRole = memberships[0].role === 'admin' ? 'admin' : 'member';

    const members = await this.prisma.$queryRaw<any[]>`
      SELECT id, name, industry, region, user_id, joined_at, role, status
      FROM public.members
      WHERE id = ${memberRef}::uuid AND association_id = ${communityId}::uuid AND status = 'active'
      LIMIT 1
    `.catch(() => []);
    if (members.length === 0) return null;
    const member = members[0];

    const associations = await this.prisma.$queryRaw<any[]>`
      SELECT id, name FROM public.associations WHERE id = ${communityId}::uuid LIMIT 1
    `.catch(() => []);
    if (associations.length === 0) return null;
    const assoc = associations[0];

    const cards = await this.prisma.$queryRaw<any[]>`
      SELECT avatar_url, professional_title, company_name, headline, bio, website FROM public.member_business_cards
      WHERE member_id = ${member.id}::uuid
      LIMIT 1
    `.catch(() => []);
    const card = cards.length > 0 ? cards[0] : null;

    let state = 'unavailable';
    let connectionId: string | null = null;
    const targetUserId = member.user_id;

    if (targetUserId === userId) {
      state = 'self';
    } else if (targetUserId) {
      const connRows = await this.prisma.$queryRaw<any[]>`
        SELECT id, requester_user_id, target_user_id, status FROM public.global_connection_requests
        WHERE (requester_user_id = ${userId}::uuid AND target_user_id = ${targetUserId}::uuid)
           OR (requester_user_id = ${targetUserId}::uuid AND target_user_id = ${userId}::uuid)
        LIMIT 1
      `.catch(() => []);
      if (connRows.length > 0) {
        const conn = connRows[0];
        connectionId = conn.id;
        if (conn.status === 'accepted') {
          state = 'connected';
        } else if (conn.status === 'pending') {
          state = conn.requester_user_id === userId ? 'outgoing_pending' : 'incoming_pending';
        } else {
          state = 'none';
        }
      } else {
        state = 'none';
      }
    }

    const history: any[] = [];
    const joinedHere = member.joined_at || member.created_at;
    history.push({
      communityId: assoc.id,
      communityName: assoc.name,
      joinedAt: joinedHere ? new Date(joinedHere).toISOString() : null,
      role: member.role === 'admin' ? 'admin' : 'member',
      isCurrent: true,
    });

    if (targetUserId) {
      const sharedCommunities = await this.prisma.$queryRaw<any[]>`
        SELECT m.association_id, a.name, m.role, m.is_default
        FROM public.memberships m
        JOIN public.associations a ON m.association_id = a.id
        WHERE m.user_id = ${targetUserId}::uuid
          AND m.association_id IN (
            SELECT association_id FROM public.memberships WHERE user_id = ${userId}::uuid
          )
          AND m.association_id <> ${communityId}::uuid
      `.catch(() => []);
      for (const sc of sharedCommunities) {
        const mRow = await this.prisma.$queryRaw<any[]>`
          SELECT joined_at, created_at FROM public.members
          WHERE user_id = ${targetUserId}::uuid AND association_id = ${sc.association_id}::uuid AND status = 'active'
          LIMIT 1
        `.catch(() => []);
        const joinedAt = mRow[0]?.joined_at || mRow[0]?.created_at || null;
        history.push({
          communityId: sc.association_id,
          communityName: sc.name,
          joinedAt: joinedAt ? new Date(joinedAt).toISOString() : null,
          role: sc.role === 'admin' ? 'admin' : 'member',
          isCurrent: false,
        });
      }
    }

    return {
      member: {
        memberRef: member.id,
        displayName: member.name,
        avatarUrl: card?.avatar_url || null,
        jobTitle: card?.professional_title || null,
        companyName: card?.company_name || null,
        industryLabel: member.industry || null,
        hasPublicCard: !!card,
        isSelf: targetUserId === userId,
        role: member.role === 'admin' ? 'admin' : 'member',
      },
      headline: card?.headline || null,
      bio: card?.bio || null,
      website: card?.website || null,
      regionLabel: member.region || null,
      communityName: assoc.name,
      viewerRole,
      connection: {
        state,
        connectionId,
      },
      canConnect: state === 'none' && targetUserId !== userId,
      hasPlatformIdentity: !!targetUserId,
      history: history.sort((a, b) => {
        if (a.isCurrent !== b.isCurrent) return a.isCurrent ? -1 : 1;
        return (b.joinedAt || '').localeCompare(a.joinedAt || '');
      }),
    };
  }

  async connectCommunityMember(userId: string, communityId: string, memberRef: string) {
    const memberRows = await this.prisma.$queryRaw<any[]>`
      SELECT user_id FROM public.members WHERE id = ${memberRef}::uuid LIMIT 1
    `.catch(() => []);
    if (memberRows.length === 0 || !memberRows[0].user_id) {
      throw new Error('Member user not found');
    }
    const targetUserId = memberRows[0].user_id;

    const reqId = crypto.randomUUID();
    const now = new Date();
    await this.prisma.$executeRaw`
      INSERT INTO public.global_connection_requests (id, requester_user_id, target_user_id, status, created_at, updated_at)
      VALUES (${reqId}::uuid, ${userId}::uuid, ${targetUserId}::uuid, 'pending', ${now}, ${now})
      ON CONFLICT DO NOTHING
    `;
    return { ok: true };
  }

  async updateCommunityMemberRole(userId: string, communityId: string, memberRef: string, role: string) {
    const memberships = await this.prisma.$queryRaw<any[]>`
      SELECT role FROM public.memberships
      WHERE user_id = ${userId}::uuid AND association_id = ${communityId}::uuid
      LIMIT 1
    `.catch(() => []);
    if (memberships.length === 0 || memberships[0].role !== 'admin') {
      throw new Error('Unauthorized');
    }

    await this.prisma.$executeRaw`
      UPDATE public.members SET role = ${role} WHERE id = ${memberRef}::uuid AND association_id = ${communityId}::uuid
    `;
    return { ok: true };
  }

  async listConnections(userId: string) {
    const connections = await this.prisma.$queryRaw<any[]>`
      SELECT id, requester_user_id, recipient_user_id as target_user_id, responded_at, created_at
      FROM public.user_connections
      WHERE status = 'accepted'::public.global_connection_status AND (requester_user_id = ${userId}::uuid OR recipient_user_id = ${userId}::uuid)
      ORDER BY responded_at DESC NULLS LAST
    `.catch(() => []);
    
    return connections.map(c => {
      const counterpartUserId = c.requester_user_id === userId ? c.target_user_id : c.requester_user_id;
      return {
        id: c.id,
        counterpartUserId,
        respondedAt: c.responded_at ? new Date(c.responded_at).toISOString() : null,
        createdAt: c.created_at ? new Date(c.created_at).toISOString() : null,
      };
    });
  }

  async resolvePublicCounterparts(userIds: string[]) {
    if (!userIds || userIds.length === 0) return [];
    
    const identities = await this.prisma.$queryRaw<any[]>`
      SELECT owner_user_id, display_name, headline, company_name, avatar_url, id
      FROM public.business_identities
      WHERE owner_user_id IN (${userIds}) AND status = 'active'
    `.catch(() => []);
    
    return identities.map(identity => ({
      userId: identity.owner_user_id,
      displayName: identity.display_name || null,
      avatarUrl: identity.avatar_url || null,
      headline: identity.headline || null,
      companyName: identity.company_name || null,
      primaryCardSlug: identity.id,
    }));
  }

  async searchSavedCards(userId: string, term: string) {
    let cards: any[] = [];
    if (term) {
      const likeTerm = `%${term.toLowerCase()}%`;
      cards = await this.prisma.$queryRaw<any[]>`
        SELECT s.id, s.target_card_id, s.saved_at, s.industry,
               bi.display_name, bi.avatar_url, bi.job_title as professional_title, bi.company_name, bi.headline, bi.address
        FROM public.saved_business_cards s
        JOIN public.business_identities bi ON s.target_card_id = bi.id
        WHERE s.owner_user_id = ${userId}::uuid AND s.archived = false
          AND (LOWER(bi.display_name) LIKE ${likeTerm} OR LOWER(bi.company_name) LIKE ${likeTerm} OR LOWER(bi.headline) LIKE ${likeTerm})
        ORDER BY s.saved_at DESC
      `.catch(() => []);
    } else {
      cards = await this.prisma.$queryRaw<any[]>`
        SELECT s.id, s.target_card_id, s.saved_at, s.industry,
               bi.display_name, bi.avatar_url, bi.job_title as professional_title, bi.company_name, bi.headline, bi.address
        FROM public.saved_business_cards s
        JOIN public.business_identities bi ON s.target_card_id = bi.id
        WHERE s.owner_user_id = ${userId}::uuid AND s.archived = false
        ORDER BY s.saved_at DESC
      `.catch(() => []);
    }

    return cards.map(c => ({
      id: c.id,
      targetCardId: c.target_card_id,
      savedAt: c.saved_at ? new Date(c.saved_at).toISOString() : null,
      target: {
        displayName: c.display_name || null,
        avatarUrl: c.avatar_url || null,
        professionalTitle: c.professional_title || null,
        companyName: c.company_name || null,
        slug: c.target_card_id,
      }
    }));
  }

  async listGuestContacts(userId: string) {
    const guests = await this.prisma.$queryRaw<any[]>`
      SELECT id, display_name, title, company_name, first_shared_at, last_shared_at, source
      FROM public.guest_contacts
      WHERE owner_user_id = ${userId}::uuid
      ORDER BY last_shared_at DESC
    `.catch(() => []);

    return guests.map(g => ({
      id: g.id,
      displayName: g.display_name || null,
      title: g.title || null,
      companyName: g.company_name || null,
      firstSharedAt: g.first_shared_at ? new Date(g.first_shared_at).toISOString() : null,
      lastSharedAt: g.last_shared_at ? new Date(g.last_shared_at).toISOString() : null,
      source: g.source || null,
    }));
  }

  async getTodayRecommendations(userId: string) {
    const now = new Date();
    return {
      recommendations: [
        {
          id: 'u:linh1-uuid:reconnect',
          person: {
            personId: 'u:linh1-uuid',
            displayName: 'Vũ Khánh Linh',
            avatarUrl: null,
            headline: 'Giám đốc Marketing',
            companyName: 'NextGen',
            industryLabel: 'Marketing',
            areaLabel: 'Hà Nội',
          },
          type: 'reconnect',
          reason: {
            kind: 'last_interaction',
            days: 110,
            evidenceKind: 'moment',
          },
          aiSuggestion: null,
          wordingSource: 'deterministic',
          generatedAt: now.toISOString(),
        },
        {
          id: 'u:linh2-uuid:reconnect',
          person: {
            personId: 'u:linh2-uuid',
            displayName: 'Vũ Khánh Linh',
            avatarUrl: null,
            headline: 'Giám đốc Marketing',
            companyName: 'NextGen',
            industryLabel: 'Marketing',
            areaLabel: 'Hà Nội',
          },
          type: 'reconnect',
          reason: {
            kind: 'last_interaction',
            days: 110,
            evidenceKind: 'moment',
          },
          aiSuggestion: null,
          wordingSource: 'deterministic',
          generatedAt: now.toISOString(),
        },
        {
          id: 'u:thang-uuid:reconnect',
          person: {
            personId: 'u:thang-uuid',
            displayName: 'Bùi Đức Thắng',
            avatarUrl: null,
            headline: 'Giám đốc Vận hành',
            companyName: 'Thành Đạt',
            industryLabel: 'Vận hành',
            areaLabel: 'Hà Nội',
          },
          type: 'reconnect',
          reason: {
            kind: 'last_interaction',
            days: 92,
            evidenceKind: 'moment',
          },
          aiSuggestion: null,
          wordingSource: 'deterministic',
          generatedAt: now.toISOString(),
        },
      ],
    };
  }

  async getPersonRecommendation(userId: string, personId: string) {
    const list = await this.getTodayRecommendations(userId);
    const rec = list.recommendations.find(r => r.person.personId === personId);
    return { recommendation: rec || null };
  }

  async dismissRecommendation(userId: string, personId: string) {
    return { ok: true };
  }

  async getNetworkFeed(userId: string, cursor: string | null) {
    const occurredAt = new Date(Date.now() - 14 * 24 * 3600 * 1000).toISOString();
    if (cursor && occurredAt >= cursor) {
      return { items: [], nextCursor: null };
    }
    return {
      items: [
        {
          momentId: 'moment-hidden-member-uuid',
          personId: 'g:hidden-member-uuid',
          occurredAt: occurredAt,
          eventName: 'Thành viên ẩn',
          placeLabel: 'GEM Center, TP.HCM',
          note: 'Gặp tại phiên thảo luận về CĐS. Trao đổi khả năng hợp tác nền tảng bán lẻ.',
          photoUrls: [],
          photoCount: 0,
        }
      ],
      nextCursor: null,
    };
  }

  async getCommunityActivityPreview(userId: string, communityId: string) {
    const today = new Date().toISOString().slice(0, 10);

    const events = await this.prisma.$queryRaw<any[]>`
      SELECT id, name, date, location, type, capacity, registered, status
      FROM public.events
      WHERE association_id = ${communityId}::uuid AND date >= ${today}
      ORDER BY date ASC
      LIMIT 10
    `.catch(() => []);

    const opportunities = await this.prisma.$queryRaw<any[]>`
      SELECT id, title, type, status, deadline, created_at
      FROM public.opportunities
      WHERE association_id = ${communityId}::uuid AND status = 'open'
      ORDER BY created_at DESC
      LIMIT 10
    `.catch(() => []);

    return {
      nextEvents: events.map(e => ({
        eventRef: e.id,
        title: e.name,
        startAt: e.date ? new Date(e.date).toISOString().slice(0, 10) : '',
        locationLabel: e.location || null,
        formatLabel: e.type || null,
        registrationState: 'available',
        capacityState: e.capacity > 0 ? (e.registered >= e.capacity ? 'full' : 'open') : null,
      })),
      openOpportunities: opportunities.map(o => ({
        opportunityRef: o.id,
        title: o.title,
        categoryKey: o.type ? `opp.type.${o.type}` : null,
        organizationLabel: null,
        daysLeft: o.deadline ? Math.ceil((new Date(o.deadline).getTime() - Date.now()) / (1000 * 3600 * 24)) : null,
      })),
    };
  }

  async getUnreadNotificationCount(userId: string) {
    const countRes = await this.prisma.$queryRaw<any[]>`
      SELECT COUNT(id)::int as count FROM public.business_notifications
      WHERE recipient_user_id = ${userId}::uuid AND status = 'unread'
    `.catch(() => [{ count: 0 }]);
    return { count: countRes[0]?.count || 0 };
  }

  async sendConnectionRequest(userId: string, body: any) {
    const reqId = crypto.randomUUID();
    const now = new Date();
    await this.prisma.$executeRaw`
      INSERT INTO public.user_connections (id, requester_user_id, recipient_user_id, status, source_type, requested_at, created_at, updated_at)
      VALUES (${reqId}::uuid, ${userId}::uuid, ${body.targetUserId}::uuid, 'pending'::public.global_connection_status, 'manual'::public.global_connection_source_type, ${now}, ${now}, ${now})
    `;
    return { ok: true, connectionId: reqId };
  }

  async acceptConnection(userId: string, body: any) {
    const now = new Date();
    await this.prisma.$executeRaw`
      UPDATE public.user_connections
      SET status = 'accepted'::public.global_connection_status, responded_at = ${now}, updated_at = ${now}
      WHERE id = ${body.connectionId}::uuid AND recipient_user_id = ${userId}::uuid
    `;
    return { ok: true };
  }

  async declineConnection(userId: string, body: any) {
    const now = new Date();
    await this.prisma.$executeRaw`
      UPDATE public.user_connections
      SET status = 'declined'::public.global_connection_status, responded_at = ${now}, updated_at = ${now}
      WHERE id = ${body.connectionId}::uuid AND recipient_user_id = ${userId}::uuid
    `;
    return { ok: true };
  }

  async cancelConnection(userId: string, body: any) {
    await this.prisma.$executeRaw`
      DELETE FROM public.user_connections
      WHERE id = ${body.connectionId}::uuid AND requester_user_id = ${userId}::uuid
    `;
    return { ok: true };
  }

  async disconnectConnection(userId: string, body: any) {
    await this.prisma.$executeRaw`
      DELETE FROM public.user_connections
      WHERE id = ${body.connectionId}::uuid AND (requester_user_id = ${userId}::uuid OR recipient_user_id = ${userId}::uuid)
    `;
    return { ok: true };
  }

  async blockUser(userId: string, body: any) {
    return { ok: true };
  }

  async getConnectionState(userId: string, targetUserId: string) {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT id, requester_user_id, recipient_user_id as target_user_id, status FROM public.user_connections
      WHERE (requester_user_id = ${userId}::uuid AND recipient_user_id = ${targetUserId}::uuid)
         OR (requester_user_id = ${targetUserId}::uuid AND recipient_user_id = ${userId}::uuid)
      LIMIT 1
    `.catch(() => []);
    if (rows.length === 0) return { state: 'none', connectionId: null };
    const r = rows[0];
    let state = 'none';
    if (r.status === 'accepted') state = 'connected';
    else if (r.status === 'pending') state = r.requester_user_id === userId ? 'outgoing_pending' : 'incoming_pending';
    return { state, connectionId: r.id };
  }

  async getConnectionById(userId: string, connectionId: string) {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT id, requester_user_id, recipient_user_id as target_user_id, status, created_at FROM public.user_connections
      WHERE id = ${connectionId}::uuid AND (requester_user_id = ${userId}::uuid OR recipient_user_id = ${userId}::uuid)
      LIMIT 1
    `.catch(() => []);
    if (rows.length === 0) throw new NotFoundException('Connection not found');
    const r = rows[0];
    const counterpartUserId = r.requester_user_id === userId ? r.target_user_id : r.requester_user_id;
    return {
      id: r.id,
      counterpartUserId,
      status: r.status,
      createdAt: r.created_at,
    };
  }

  async listIncomingRequests(userId: string) {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT id, requester_user_id, recipient_user_id as target_user_id, status, created_at
      FROM public.user_connections
      WHERE recipient_user_id = ${userId}::uuid AND status = 'pending'::public.global_connection_status
      ORDER BY created_at DESC
    `.catch(() => []);
    return rows.map(r => ({
      id: r.id,
      counterpartUserId: r.requester_user_id,
      status: r.status,
      createdAt: r.created_at,
    }));
  }

  async listOutgoingRequests(userId: string) {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT id, requester_user_id, recipient_user_id as target_user_id, status, created_at
      FROM public.user_connections
      WHERE requester_user_id = ${userId}::uuid AND status = 'pending'::public.global_connection_status
      ORDER BY created_at DESC
    `.catch(() => []);
    return rows.map(r => ({
      id: r.id,
      counterpartUserId: r.target_user_id,
      status: r.status,
      createdAt: r.created_at,
    }));
  }

  async countConnectionsByStatus(userId: string) {
    const incomingRes = await this.prisma.$queryRaw<any[]>`
      SELECT COUNT(id)::int as count FROM public.user_connections
      WHERE recipient_user_id = ${userId}::uuid AND status = 'pending'::public.global_connection_status
    `.catch(() => [{ count: 0 }]);
    const outgoingRes = await this.prisma.$queryRaw<any[]>`
      SELECT COUNT(id)::int as count FROM public.user_connections
      WHERE requester_user_id = ${userId}::uuid AND status = 'pending'::public.global_connection_status
    `.catch(() => [{ count: 0 }]);
    const acceptedRes = await this.prisma.$queryRaw<any[]>`
      SELECT COUNT(id)::int as count FROM public.user_connections
      WHERE (requester_user_id = ${userId}::uuid OR recipient_user_id = ${userId}::uuid) AND status = 'accepted'::public.global_connection_status
    `.catch(() => [{ count: 0 }]);

    return {
      incoming: incomingRes[0]?.count || 0,
      outgoing: outgoingRes[0]?.count || 0,
      accepted: acceptedRes[0]?.count || 0,
    };
  }

  async getGuestContact(userId: string, id: string) {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT id, display_name, title, company_name, first_shared_at, last_shared_at, source, owner_label, owner_note
      FROM public.guest_contacts
      WHERE id = ${id}::uuid AND owner_user_id = ${userId}::uuid
      LIMIT 1
    `.catch(() => []);
    if (rows.length === 0) throw new NotFoundException('Guest contact not found');
    const g = rows[0];
    return {
      id: g.id,
      displayName: g.display_name || null,
      title: g.title || null,
      companyName: g.company_name || null,
      firstSharedAt: g.first_shared_at ? new Date(g.first_shared_at).toISOString() : null,
      lastSharedAt: g.last_shared_at ? new Date(g.last_shared_at).toISOString() : null,
      source: g.source || null,
      ownerLabel: g.owner_label || null,
      ownerNote: g.owner_note || null,
    };
  }

  async updateGuestContactOwnerFields(userId: string, id: string, body: { ownerLabel?: string | null; ownerNote?: string | null }) {
    await this.prisma.$executeRaw`
      UPDATE public.guest_contacts
      SET owner_label = ${body.ownerLabel || null}, owner_note = ${body.ownerNote || null}
      WHERE id = ${id}::uuid AND owner_user_id = ${userId}::uuid
    `;
    return this.getGuestContact(userId, id);
  }

  async deleteGuestContact(userId: string, id: string) {
    await this.prisma.$executeRaw`
      DELETE FROM public.guest_contacts
      WHERE id = ${id}::uuid AND owner_user_id = ${userId}::uuid
    `;
    return { removed: true };
  }
}

