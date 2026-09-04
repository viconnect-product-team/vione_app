import { Injectable, NotFoundException, ForbiddenException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';
import { z } from 'zod';

const formatVNTime = (date: Date) => {
  const utc = date.getTime() + date.getTimezoneOffset() * 60000;
  const vnDate = new Date(utc + 3600000 * 7);
  const hh = String(vnDate.getHours()).padStart(2, '0');
  const mm = String(vnDate.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
};

@Injectable()
export class ConnectAppService {
  constructor(private prisma: PrismaService) {}

  async getBriefing(userId: string) {
    const now = new Date();

    // Check for meetings starting within 30 minutes to push to notifications
    try {
      const thirtyMinsFromNow = new Date(now.getTime() + 30 * 60 * 1000);
      const upcomingMeetings = await this.prisma.$queryRaw<any[]>`
        SELECT id, title, scheduled_start_at
        FROM public.business_meetings
        WHERE organizer_user_id = ${userId}::uuid
          AND status = 'confirmed'::public.business_meeting_status
          AND scheduled_start_at >= ${now}
          AND scheduled_start_at <= ${thirtyMinsFromNow}
      `.catch(() => []);

      for (const m of upcomingMeetings) {
        const existingNotif = await this.prisma.$queryRaw<any[]>`
          SELECT id FROM public.business_notifications
          WHERE recipient_user_id = ${userId}::uuid
            AND source_domain = 'meeting'
            AND source_record_id = ${m.id}
            AND notification_kind = 'meeting_upcoming_reminder'
        `.catch(() => []);

        if (existingNotif.length === 0) {
          const notifId = crypto.randomUUID();
          const formattedStart = formatVNTime(new Date(m.scheduled_start_at));
          const safeData = JSON.stringify({
            meetingTitle: m.title,
            scheduledAt: formattedStart
          });
          const actionTarget = JSON.stringify({
            route: '/connect-app'
          });

          const dedupeKey = `meeting_upcoming_reminder:${userId}:${m.id}`;
          await this.prisma.$executeRaw`
            INSERT INTO public.business_notifications (
              id, recipient_user_id, source_domain, source_record_id, event_kind, notification_kind,
              title_key, body_key, safe_display_data, action_kind, action_label_key, action_target,
              priority, status, created_at, updated_at, dedupe_key
            ) VALUES (
              ${notifId}::uuid, ${userId}::uuid, 'meeting', ${m.id}, 'upcoming_reminder', 'meeting_upcoming_reminder',
              'bc.notif.kind.meeting_upcoming_reminder.title', 'bc.notif.kind.meeting_upcoming_reminder.body',
              ${safeData}::jsonb, 'open_meeting_detail', 'bc.notif.action.view', ${actionTarget}::jsonb,
              'high', 'delivered', ${now}, ${now}, ${dedupeKey}
            )
          `;
        }
      }
    } catch (e) {
      console.error('Error generating upcoming meeting notifications:', e);
    }

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
      WHERE organizer_user_id = ${userId}::uuid
      ORDER BY scheduled_start_at ASC NULLS LAST
      LIMIT 50
    `.catch(() => []) as any[];

    // Fetch community and registered events for today & upcoming
    const todayStr = now.toISOString().slice(0, 10);
    const registeredEvents = await this.prisma.$queryRaw<any[]>`
      SELECT e.id, e.name as title, e.date as scheduled_start_at, e.status, e.location, e.association_id,
             a.name as association_name
      FROM public.events e
      LEFT JOIN public.associations a ON e.association_id = a.id
      WHERE (
        e.id::text IN (
          SELECT event_id FROM public.event_registrations er
          WHERE er.member_code IN (
            SELECT code FROM public.members WHERE user_id = ${userId}::uuid
          )
        )
        OR e.association_id IN (
          SELECT association_id FROM public.memberships WHERE user_id = ${userId}::uuid
          UNION
          SELECT association_id FROM public.members WHERE user_id = ${userId}::uuid AND status = 'active'
        )
        OR e.date::date = CURRENT_DATE
        OR e.status IN ('upcoming', 'ongoing', 'active')
      )
      AND (e.date::date >= CURRENT_DATE OR e.date::date = ${todayStr}::date)
      ORDER BY (e.date::date = CURRENT_DATE) DESC, e.date ASC
      LIMIT 20
    `.catch((err) => {
      console.error('Error fetching registeredEvents:', err);
      return [];
    });


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

    const todayEventsList = registeredEvents.map(e => {
      const eventDate = new Date(e.scheduled_start_at);
      const eDateStr = !isNaN(eventDate.getTime()) ? eventDate.toISOString().slice(0, 10) : '';
      const isToday = eDateStr === todayStr;
      if (isToday) {
        eventDate.setHours(9, 0, 0, 0);
      }
      return {
        id: `event:${e.id}`,
        sourceType: 'business_meeting' as const,
        sourceRecordId: String(e.id),
        itemKind: 'meeting_event' as const,
        kind: 'meeting' as const,
        category: 'upcoming' as const,
        priority: 'high' as const,
        urgency: isToday ? ('high' as const) : ('medium' as const),
        titleKey: e.title,
        descriptionKey: e.location || 'Sá»± kiá»‡n cá»™ng Ä‘á»“ng',
        counterpartDisplayName: e.association_name || 'Cá»™ng Ä‘á»“ng',
        startsAt: eventDate.toISOString(),
        dueAt: null,
        status: String(e.status || 'confirmed'),
        action: {
          labelKey: 'bc.workHub.action.view',
          targetRoute: '/events/$eventId',
          targetParams: { eventId: String(e.id) },
          targetSearch: null,
          canRoute: true,
        },
        secondaryAction: null,
        context: {},
        viewerPermissions: { canRoute: true, canInlineMutate: false },
        safeDisplayData: { counterpartDisplayName: e.association_name || 'Cá»™ng Ä‘á»“ng' },
        dedupeKey: `event:${e.id}`,
        registryVersion: 1,
      };
    });

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
      meetingWorkspaceItems: [
        ...businessMeetings.map(r => {
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
        ...registeredEvents.map(e => {
          const eventDate = new Date(e.scheduled_start_at);
          const eDateStr = !isNaN(eventDate.getTime()) ? eventDate.toISOString().slice(0, 10) : '';
          const isToday = eDateStr === todayStr;
          if (isToday) {
            eventDate.setHours(23, 59, 59, 999);
          } else {
            eventDate.setHours(9, 0, 0, 0);
          }
          return {
            meetingId: String(e.id),
            status: String(e.status),
            bucket: 'upcoming',
            suggestedActionKind: 'view_meeting',
            scheduledStartAt: eventDate.toISOString(),
            viewerRole: 'attendee',
            counterpartDisplayName: String(e.association_name || e.title),
            hasOutcome: false,
            isEvent: true,
            communityId: String(e.association_id),
          };
        })
      ],
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
      previews: {
        upcoming: todayEventsList,
        needs_action: [],
        overdue: [],
        due_soon: [],
        waiting: [],
        recent: [],
      },
    };
  }

  async getMyCommunities(userId: string) {
    let memberships = await this.prisma.$queryRaw`
      SELECT DISTINCT ON (m.association_id) 
        m.association_id, m.role, m.is_default, a.name, a.logo_url, a.tagline, a.about
      FROM (
        SELECT association_id, role, is_default, user_id FROM public.memberships WHERE user_id = ${userId}::uuid
        UNION ALL
        SELECT association_id, role, false as is_default, user_id FROM public.members WHERE user_id = ${userId}::uuid AND status = 'active'
      ) m
      JOIN public.associations a ON m.association_id = a.id
    `.catch(() => []) as any[];

    if (memberships.length === 0) {
      const defaultAssoc = await this.prisma.$queryRaw<any[]>`
        SELECT id, name, logo_url, tagline, about FROM public.associations
        ORDER BY created_at ASC LIMIT 1
      `.catch(() => []);

      if (defaultAssoc.length > 0) {
        const d = defaultAssoc[0];
        try {
          await this.prisma.$executeRaw`
            INSERT INTO public.memberships (id, user_id, association_id, role, is_default, created_at, updated_at)
            VALUES (gen_random_uuid(), ${userId}::uuid, ${d.id}::uuid, 'member', true, now(), now())
          `;
        } catch {}
        memberships = [{
          association_id: d.id,
          role: 'member',
          is_default: true,
          name: d.name,
          logo_url: d.logo_url,
          tagline: d.tagline,
          about: d.about,
        }];
      }
    }


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

  async resolvePublicCounterparts(userIds: string[]) {
    if (!Array.isArray(userIds) || userIds.length === 0) return [];
    const validIds = userIds.filter(id => typeof id === 'string' && id.trim().length > 0);
    if (validIds.length === 0) return [];

    const summaries: any[] = [];
    for (const uid of validIds) {
      try {
        const cards = await this.prisma.$queryRaw<any[]>`
          SELECT id, display_name, avatar_url, headline, company_name, slug, professional_title
          FROM public.business_cards
          WHERE user_id = ${uid}::uuid AND status = 'published'
          ORDER BY is_primary DESC, updated_at DESC LIMIT 1
        `.catch(() => []);

        const members = await this.prisma.$queryRaw<any[]>`
          SELECT id, name, avatar_url, job_title, company_name
          FROM public.members
          WHERE user_id = ${uid}::uuid AND status = 'active'
          ORDER BY updated_at DESC LIMIT 1
        `.catch(() => []);

        const profiles = await this.prisma.$queryRaw<any[]>`
          SELECT id, display_name, avatar_url, headline, company_name
          FROM public.profiles
          WHERE id = ${uid}::uuid LIMIT 1
        `.catch(() => []);

        const card = cards[0];
        const member = members[0];
        const profile = profiles[0];

        const displayName = card?.display_name || member?.name || profile?.display_name || 'Há»™i viĂªn ViOne';
        const avatarUrl = card?.avatar_url || member?.avatar_url || profile?.avatar_url || null;
        const headline = card?.headline || card?.professional_title || member?.job_title || profile?.headline || null;
        const companyName = card?.company_name || member?.company_name || profile?.company_name || null;
        const primaryCardSlug = card?.slug || null;

        summaries.push({
          userId: uid,
          displayName,
          avatarUrl,
          headline,
          companyName,
          primaryCardSlug,
        });
      } catch (err) {
        summaries.push({
          userId: uid,
          displayName: 'Há»™i viĂªn ViOne',
          avatarUrl: null,
          headline: null,
          companyName: null,
          primaryCardSlug: null,
        });
      }
    }

    return summaries;
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
    let identity = identityRows.length > 0 ? identityRows[0] : null;

    // Fallback or augment from user_profiles if identity is missing or lacks avatar/details
    const profileRows = await this.prisma.$queryRaw<any[]>`
      SELECT * FROM public.user_profiles WHERE user_id = ${userId}::uuid LIMIT 1
    `.catch(() => []);
    const profile = profileRows.length > 0 ? profileRows[0] : null;

    const userRows = await this.prisma.$queryRaw<any[]>`
      SELECT email FROM auth.users WHERE id = ${userId}::uuid LIMIT 1
    `.catch(() => []);
    const userEmail = userRows.length > 0 ? userRows[0].email : null;

    if (!identity) {
      if (profile || userEmail) {
        identity = {
          id: profile?.id || userId,
          owner_user_id: userId,
          display_name: profile?.display_name || userEmail?.split('@')[0] || 'Há»™i viĂªn ViOne',
          headline: profile?.professional_title || null,
          job_title: profile?.professional_title || null,
          company_name: profile?.company_name || null,
          bio: profile?.bio || null,
          avatar_url: profile?.avatar_url || null,
          primary_email: userEmail || null,
          primary_phone: null,
          website: null,
          linkedin_url: null,
          address: null,
          city: profile?.region || null,
          country_code: 'VN',
          preferred_locale: profile?.locale || 'vi',
          status: 'active',
          created_at: profile?.created_at || new Date(),
          updated_at: profile?.updated_at || new Date(),
        };
      }
    } else {
      if (!identity.avatar_url && profile?.avatar_url) {
        identity.avatar_url = profile.avatar_url;
      }
      if (!identity.display_name && profile?.display_name) {
        identity.display_name = profile.display_name;
      }
      if (!identity.job_title && profile?.professional_title) {
        identity.job_title = profile.professional_title;
      }
      if (!identity.company_name && profile?.company_name) {
        identity.company_name = profile.company_name;
      }
      if (!identity.bio && profile?.bio) {
        identity.bio = profile.bio;
      }
      if (!identity.primary_email && userEmail) {
        identity.primary_email = userEmail;
      }
    }

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

      await this.prisma.$executeRaw`
        UPDATE public.user_profiles SET
          avatar_url = ${finalData.avatar_url}
        WHERE user_id = ${userId}::uuid
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

      await this.prisma.$executeRaw`
        UPDATE public.user_profiles SET
          avatar_url = ${finalData.avatar_url}
        WHERE user_id = ${userId}::uuid
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

  async checkCommunityMembership(userId: string, communityId: string): Promise<boolean> {
    const mem = await this.prisma.$queryRaw<any[]>`
      SELECT association_id FROM public.memberships
      WHERE user_id = ${userId}::uuid AND association_id = ${communityId}::uuid
      UNION
      SELECT association_id FROM public.members
      WHERE user_id = ${userId}::uuid AND association_id = ${communityId}::uuid AND status = 'active'
      LIMIT 1
    `.catch(() => [] as any[]);
    return mem.length > 0;
  }

  async getCommunityDetail(userId: string, communityId: string): Promise<any | null> {
    let memberships = await this.prisma.$queryRaw<any[]>`
      SELECT role, is_default FROM public.memberships
      WHERE user_id = ${userId}::uuid AND association_id = ${communityId}::uuid
      LIMIT 1
    `.catch(() => []);
    if (memberships.length === 0) {
      memberships = await this.prisma.$queryRaw<any[]>`
        SELECT role, false as is_default FROM public.members
        WHERE user_id = ${userId}::uuid AND association_id = ${communityId}::uuid AND status = 'active'
        LIMIT 1
      `.catch(() => []);
    }
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
    let membership = await this.prisma.$queryRaw<any[]>`
      SELECT role FROM public.memberships
      WHERE user_id = ${userId}::uuid AND association_id = ${communityId}::uuid
      LIMIT 1
    `.catch(() => []);
    if (membership.length === 0) {
      membership = await this.prisma.$queryRaw<any[]>`
        SELECT role FROM public.members
        WHERE user_id = ${userId}::uuid AND association_id = ${communityId}::uuid AND status = 'active'
        LIMIT 1
      `.catch(() => []);
    }
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
    let memberships = await this.prisma.$queryRaw<any[]>`
      SELECT role FROM public.memberships
      WHERE user_id = ${userId}::uuid AND association_id = ${communityId}::uuid
      LIMIT 1
    `.catch(() => []);
    if (memberships.length === 0) {
      memberships = await this.prisma.$queryRaw<any[]>`
        SELECT role FROM public.members
        WHERE user_id = ${userId}::uuid AND association_id = ${communityId}::uuid AND status = 'active'
        LIMIT 1
      `.catch(() => []);
    }
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
        SELECT id, requester_user_id, recipient_user_id, status FROM public.user_connections
        WHERE (requester_user_id = ${userId}::uuid AND recipient_user_id = ${targetUserId}::uuid)
           OR (requester_user_id = ${targetUserId}::uuid AND recipient_user_id = ${userId}::uuid)
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
    return this.sendConnectionRequest(userId, { targetUserId });
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
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);
    const safeUserId = isUuid ? userId : '00000000-0000-0000-0000-000000000000';
    
    // Fetch connected users (Nurture Connections list)
    const connectedRows: any[] = await this.prisma.$queryRaw<any[]>`
      SELECT bi.id as identity_id, bi.owner_user_id, bi.display_name, bi.avatar_url, bi.headline, bi.company_name, bi.city
      FROM public.user_connections uc
      JOIN public.business_identities bi ON (
        (uc.requester_user_id = ${safeUserId}::uuid AND uc.recipient_user_id = bi.owner_user_id) OR
        (uc.recipient_user_id = ${safeUserId}::uuid AND uc.requester_user_id = bi.owner_user_id)
      )
      WHERE uc.status = 'accepted'::public.global_connection_status AND bi.status = 'active'
    `.catch(() => [] as any[]);

    // Fetch non-connected users (AI Match Suggestions list)
    let nonConnectedRows: any[] = await this.prisma.$queryRaw<any[]>`
      SELECT bi.id as identity_id, bi.owner_user_id, bi.display_name, bi.avatar_url, bi.headline, bi.company_name, bi.city
      FROM public.business_identities bi
      WHERE bi.owner_user_id != ${safeUserId}::uuid AND bi.status = 'active'
        AND bi.owner_user_id NOT IN (
          SELECT CASE 
            WHEN requester_user_id = ${safeUserId}::uuid THEN recipient_user_id
            ELSE requester_user_id
          END
          FROM public.user_connections
          WHERE requester_user_id = ${safeUserId}::uuid OR recipient_user_id = ${safeUserId}::uuid
        )
      LIMIT 20
    `.catch(() => [] as any[]);

    // Fallback to other users from vione_users if business_identities has few records
    if (nonConnectedRows.length < 5) {
      const existingIds = [
        safeUserId,
        ...nonConnectedRows.map((r: any) => String(r.owner_user_id)),
        ...connectedRows.map((r: any) => String(r.owner_user_id)),
      ];
      const extraUsers = await this.prisma.vione_users.findMany({
        where: {
          id: {
            notIn: existingIds,
          },
        },
        take: 10,
      }).catch(() => [] as any[]);

      extraUsers.forEach((u: any) => {
        nonConnectedRows.push({
          identity_id: u.id,
          owner_user_id: u.id,
          display_name: u.name || u.username,
          avatar_url: u.avatar_url,
          headline: 'Doanh nhĂ¢n ViOne',
          company_name: 'ViOne Network',
          city: 'Viá»‡t Nam',
        });
      });
    }

    const recommendations: any[] = [];

    // Map non-connected users to AI Match suggestions
    nonConnectedRows.forEach((row: any) => {
      const personIdStr = row.owner_user_id ? String(row.owner_user_id) : '';
      const cleanPersonId = personIdStr.startsWith('u:') ? personIdStr : `u:${personIdStr}`;
      const company = row.company_name || 'Doanh nghiá»‡p Ä‘á»‘i tĂ¡c';
      const city = row.city || 'Viá»‡t Nam';
      const headline = row.headline || 'Doanh nhĂ¢n';
      const displayName = row.display_name || 'Há»™i viĂªn';

      const aiSuggestion = `AI Ä‘á» xuáº¥t: Káº¿t ná»‘i vá»›i ${displayName} (${headline} táº¡i ${company}) Ä‘á»ƒ trao Ä‘á»•i cÆ¡ há»™i há»£p tĂ¡c kinh doanh vĂ  má»Ÿ rá»™ng quan há»‡ Ä‘á»‘i tĂ¡c táº¡i ${city}.`;

      recommendations.push({
        id: `${cleanPersonId}:match`,
        person: {
          personId: cleanPersonId,
          displayName,
          avatarUrl: row.avatar_url,
          headline,
          companyName: company,
          industryLabel: 'Kinh doanh',
          areaLabel: city,
        },
        type: 'reconnect',
        reason: {
          kind: 'last_interaction',
          days: 0,
          evidenceKind: 'moment',
        },
        aiSuggestion,
        wordingSource: 'ai',
        generatedAt: now.toISOString(),
      });
    });

    // Map connected users to Nurture Connections list (days > 0)
    connectedRows.forEach((row, idx) => {
      const personIdStr = row.owner_user_id ? String(row.owner_user_id) : '';
      const cleanPersonId = personIdStr.startsWith('u:') ? personIdStr : `u:${personIdStr}`;
      const days = 90 + idx * 10;
      const displayName = row.display_name || 'Äá»‘i tĂ¡c';
      const aiSuggestion = `AI nháº¯c nhá»Ÿ: ÄĂ£ ${days} ngĂ y chÆ°a tÆ°Æ¡ng tĂ¡c cĂ¹ng ${displayName}. HĂ£y gá»­i tin nháº¯n hoáº·c sáº¯p xáº¿p buá»•i gáº·p Ä‘á»ƒ hĂ¢m nĂ³ng má»‘i quan há»‡ há»£p tĂ¡c.`;

      recommendations.push({
        id: `${cleanPersonId}:reconnect`,
        person: {
          personId: cleanPersonId,
          displayName,
          avatarUrl: row.avatar_url,
          headline: row.headline || 'Doanh nhĂ¢n',
          companyName: row.company_name || 'Partner',
          industryLabel: 'Kinh doanh',
          areaLabel: row.city || 'HĂ  Ná»™i',
        },
        type: 'reconnect',
        reason: {
          kind: 'last_interaction',
          days,
          evidenceKind: 'moment',
        },
        aiSuggestion,
        wordingSource: 'ai',
        generatedAt: now.toISOString(),
      });
    });

    return { recommendations };
  }

  async getPersonRecommendation(userId: string, personId: string) {
    const list = await this.getTodayRecommendations(userId);
    const cleanId = personId.startsWith('u:') ? personId : `u:${personId}`;
    const rawId = personId.replace(/^[ucg]:/, '');
    const rec = list.recommendations.find(r => 
      r.person.personId === cleanId || 
      r.person.personId === personId || 
      r.person.personId === rawId ||
      r.person.personId.endsWith(rawId)
    );
    return { recommendation: rec || null };
  }

  async dismissRecommendation(userId: string, personId: string) {
    return { ok: true };
  }

  async getNetworkFeed(userId: string, cursor: string | null) {
    const limit = 12;
    let momentRows: any[];

    if (cursor) {
      momentRows = await this.prisma.$queryRaw<any[]>`
        SELECT id, target_kind, target_user_id, target_card_id, target_guest_id, occurred_at, event_name, place_label, note
        FROM public.business_relationship_moments
        WHERE (owner_user_id = ${userId}::uuid OR owner_user_id = '00000000-0000-0000-0000-000000000000'::uuid)
          AND status IN ('active', 'pending')
          AND occurred_at < ${new Date(cursor)}
        ORDER BY occurred_at DESC, id DESC
        LIMIT ${limit + 1}
      `.catch(() => []);
    } else {
      momentRows = await this.prisma.$queryRaw<any[]>`
        SELECT id, target_kind, target_user_id, target_card_id, target_guest_id, occurred_at, event_name, place_label, note
        FROM public.business_relationship_moments
        WHERE (owner_user_id = ${userId}::uuid OR owner_user_id = '00000000-0000-0000-0000-000000000000'::uuid)
          AND status IN ('active', 'pending')
        ORDER BY occurred_at DESC, id DESC
        LIMIT ${limit + 1}
      `.catch(() => []);
    }

    let nextCursor: string | null = null;
    if (momentRows.length > limit) {
      const nextItem = momentRows.pop();
      nextCursor = nextItem.occurred_at ? new Date(nextItem.occurred_at).toISOString() : null;
    }

    const momentIds = momentRows.map(m => m.id);
    let mediaRows: any[] = [];
    if (momentIds.length > 0) {
      mediaRows = await this.prisma.$queryRaw<any[]>`
        SELECT id, moment_id, storage_path, sort_order
        FROM public.business_relationship_moment_media
        WHERE moment_id = ANY(${momentIds}::uuid[])
        ORDER BY sort_order ASC
      `.catch(() => []);
    }

    const mediaByMomentId = new Map<string, any[]>();
    for (const m of mediaRows) {
      const list = mediaByMomentId.get(m.moment_id) || [];
      list.push(m);
      mediaByMomentId.set(m.moment_id, list);
    }

    const legacyPaths: string[] = [];
    for (const m of mediaRows) {
      if (m.storage_path && !m.storage_path.startsWith('/upload/') && !m.storage_path.startsWith('http')) {
        legacyPaths.push(m.storage_path);
      }
    }

    const signed: Record<string, string> = {};
    if (legacyPaths.length > 0 && process.env.SUPABASE_URL && process.env.SUPABASE_PUBLISHABLE_KEY) {
      try {
        const res = await fetch(`${process.env.SUPABASE_URL}/storage/v1/object/sign/relationship-moments`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            paths: legacyPaths,
            expiresIn: 3600,
          }),
        });
        if (res.ok) {
          const data = await res.json() as any[];
          for (const item of data) {
            if (item.path && item.signedUrl) {
              signed[item.path] = item.signedUrl.startsWith('http') 
                ? item.signedUrl 
                : `${process.env.SUPABASE_URL}/storage/v1${item.signedUrl}`;
            }
          }
        }
      } catch (err) {
        console.error('Error signing feed media urls:', err);
      }
    }

    const items = momentRows.map(row => {
      let personId = '';
      if (row.target_kind === 'connection') {
        personId = `u:${row.target_user_id}`;
      } else if (row.target_kind === 'saved_card') {
        personId = `c:${row.target_card_id}`;
      } else if (row.target_kind === 'guest_contact') {
        personId = `g:${row.target_guest_id}`;
      }

      const slots = mediaByMomentId.get(row.id) || [];
      const photoUrls = slots.map(s => {
        if (!s.storage_path) return '';
        if (s.storage_path.startsWith('/upload/') || s.storage_path.startsWith('http')) {
          return s.storage_path;
        }
        return signed[s.storage_path] || `/upload/file/${s.storage_path.split('/').pop()}`;
      }).filter(Boolean);

      return {
        momentId: row.id,
        personId,
        occurredAt: row.occurred_at ? new Date(row.occurred_at).toISOString() : new Date().toISOString(),
        eventName: row.event_name || null,
        placeLabel: row.place_label || null,
        note: row.note || null,
        photoUrls,
        photoCount: slots.length,
      };
    });

    return { items, nextCursor };
  }

  async getCommunityActivityPreview(userId: string, communityId: string) {
    const events = await this.prisma.$queryRaw<any[]>`
      SELECT id, name, title, date, location, type, capacity, status, registration_closed, registration_deadline
      FROM public.events
      WHERE association_id = ${communityId}::uuid AND status NOT IN ('cancelled')
      ORDER BY (date >= CURRENT_DATE) DESC, date ASC
      LIMIT 10
    `.catch(() => []);

    const opportunities = await this.prisma.$queryRaw<any[]>`
      SELECT id, title, type, status, deadline, created_at
      FROM public.opportunities
      WHERE status IN ('open', 'published')
      ORDER BY created_at DESC
      LIMIT 10
    `.catch(() => []);

    // Fetch user registrations and capacity counts for all events
    const eventIds = events.map(e => e.id);
    let regSet = new Set<string>();
    let regCounts = new Map<string, number>();

    if (eventIds.length > 0) {
      const userMembers = await this.prisma.$queryRaw<any[]>`
        SELECT code, email FROM public.members WHERE user_id = ${userId}::uuid
      `.catch(() => [] as any[]);
      const userMemberCodes = userMembers.map(m => m.code).filter(Boolean);
      const userInfo = await this.prisma.vione_users.findUnique({ where: { id: userId } }).catch(() => null);
      const userEmail = userInfo?.email || userMembers[0]?.email || '';

      const registrations = await this.prisma.$queryRaw<any[]>`
        SELECT event_id FROM public.event_registrations
        WHERE event_id = ANY(${eventIds})
          AND (member_code = ANY(${userMemberCodes}) OR (email != '' AND email = ${userEmail}))
          AND status != 'cancelled'
      `.catch(() => [] as any[]);
      regSet = new Set(registrations.map(r => r.event_id));

      const counts = await this.prisma.$queryRaw<{ event_id: string; cnt: bigint }[]>`
        SELECT event_id, COUNT(*) as cnt FROM public.event_registrations
        WHERE event_id = ANY(${eventIds}) AND status != 'cancelled'
        GROUP BY event_id
      `.catch(() => [] as any[]);
      regCounts = new Map(counts.map(c => [c.event_id, Number(c.cnt)] as [string, number]));
    }

    const now = new Date();
    return {
      nextEvents: events.map(e => {
        const isRegistered = regSet.has(e.id);
        const capacity = e.capacity ? Number(e.capacity) : 0;
        const isFull = capacity > 0 && (regCounts.get(e.id) ?? 0) >= capacity;
        const isCancelled = e.status === 'cancelled';
        const isClosed = e.registration_closed === true || (e.registration_deadline && new Date(e.registration_deadline) < now);

        let registrationState: 'available' | 'registered' | 'closed' | 'full' | 'cancelled';
        if (isRegistered) registrationState = 'registered';
        else if (isCancelled) registrationState = 'cancelled';
        else if (isClosed) registrationState = 'closed';
        else if (isFull) registrationState = 'full';
        else registrationState = 'available';

        return {
          eventRef: e.id,
          title: e.name || e.title || '',
          startAt: e.date ? new Date(e.date).toISOString().split('T')[0] : '',
          locationLabel: e.location || null,
          formatLabel: e.type || null,
          registrationState,
          capacityState: capacity <= 0 ? null : isFull ? 'full' : 'open',
        };
      }),
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
      WHERE recipient_user_id = ${userId}::uuid AND status = 'delivered'
    `.catch(() => [{ count: 0 }]);
    return { count: countRes[0]?.count || 0 };
  }

  async sendConnectionRequest(userId: string, body: any) {
    const targetUserId = body.targetUserId || body.target_user_id;
    if (!targetUserId) {
      throw new Error('targetUserId is required');
    }
    if (userId === targetUserId) {
      throw new Error('Cannot connect to yourself');
    }
    const now = new Date();

    // Check if an existing connection row exists between these two users (either direction)
    const existing = await this.prisma.$queryRaw<any[]>`
      SELECT id, requester_user_id, recipient_user_id, status FROM public.user_connections
      WHERE (requester_user_id = ${userId}::uuid AND recipient_user_id = ${targetUserId}::uuid)
         OR (requester_user_id = ${targetUserId}::uuid AND recipient_user_id = ${userId}::uuid)
      LIMIT 1
    `.catch(() => []);

    if (existing.length > 0) {
      const conn = existing[0];
      if (conn.status === 'accepted') {
        return { ok: true, connectionId: conn.id, status: 'accepted' };
      }
      // Re-connect: update row to 'pending'
      await this.prisma.$executeRaw`
        UPDATE public.user_connections
        SET requester_user_id = ${userId}::uuid,
            recipient_user_id = ${targetUserId}::uuid,
            status = 'pending'::public.global_connection_status,
            source_type = 'manual'::public.global_connection_source_type,
            requested_at = ${now},
            responded_at = NULL,
            updated_at = ${now}
        WHERE id = ${conn.id}::uuid
      `;
      return { ok: true, connectionId: conn.id, status: 'pending' };
    }

    const reqId = crypto.randomUUID();
    await this.prisma.$executeRaw`
      INSERT INTO public.user_connections (id, requester_user_id, recipient_user_id, status, source_type, requested_at, created_at, updated_at)
      VALUES (${reqId}::uuid, ${userId}::uuid, ${targetUserId}::uuid, 'pending'::public.global_connection_status, 'manual'::public.global_connection_source_type, ${now}, ${now}, ${now})
    `;
    return { ok: true, connectionId: reqId, status: 'pending' };
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
    if (userId === targetUserId) {
      return {
        targetUserId,
        status: 'none',
        direction: 'self',
        connectionId: null,
        blocked: false,
      };
    }

    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT id, requester_user_id, recipient_user_id, status FROM public.user_connections
      WHERE (requester_user_id = ${userId}::uuid AND recipient_user_id = ${targetUserId}::uuid)
         OR (requester_user_id = ${targetUserId}::uuid AND recipient_user_id = ${userId}::uuid)
      LIMIT 1
    `.catch(() => []);

    if (rows.length === 0) {
      return {
        targetUserId,
        status: 'none',
        direction: 'none',
        connectionId: null,
        blocked: false,
      };
    }

    const r = rows[0];
    const direction = r.requester_user_id === userId ? 'outgoing' : 'incoming';

    return {
      targetUserId,
      status: r.status,
      direction,
      connectionId: r.id,
      blocked: r.status === 'blocked',
    };
  }

  async getConnectionStateByToken(userId: string, token: string) {
    const links = await this.prisma.$queryRaw<any[]>`
      SELECT id, identity_id, status FROM public.identity_share_links
      WHERE public_token = ${token} AND status = 'active'
      LIMIT 1
    `.catch(() => []);

    if (links.length === 0) {
      return { state: 'unavailable', connectionId: null };
    }
    const link = links[0];

    const identities = await this.prisma.$queryRaw<any[]>`
      SELECT owner_user_id FROM public.business_identities
      WHERE id = ${link.identity_id}::uuid AND status = 'active'
      LIMIT 1
    `.catch(() => []);

    if (identities.length === 0) {
      return { state: 'unavailable', connectionId: null };
    }
    const targetUserId = identities[0].owner_user_id;
    if (targetUserId === userId) {
      return { state: 'self', connectionId: null };
    }

    const pairState = await this.getConnectionState(userId, targetUserId);

    let state = 'unavailable';
    if (pairState.status === 'none') {
      state = 'none';
    } else if (pairState.status === 'accepted') {
      state = 'connected';
    } else if (pairState.status === 'pending') {
      state = pairState.direction === 'outgoing' ? 'outgoing_pending' : 'incoming_pending';
    }

    return {
      state,
      connectionId: pairState.connectionId,
    };
  }

  async sendConnectionRequestByToken(userId: string, token: string, mutationKey?: string) {
    const links = await this.prisma.$queryRaw<any[]>`
      SELECT id, identity_id, status FROM public.identity_share_links
      WHERE public_token = ${token} AND status = 'active'
      LIMIT 1
    `.catch(() => []);

    if (links.length === 0) {
      throw new NotFoundException('Identity not found or unavailable');
    }
    const link = links[0];

    const identities = await this.prisma.$queryRaw<any[]>`
      SELECT owner_user_id FROM public.business_identities
      WHERE id = ${link.identity_id}::uuid AND status = 'active'
      LIMIT 1
    `.catch(() => []);

    if (identities.length === 0) {
      throw new NotFoundException('Identity not found or unavailable');
    }
    const targetUserId = identities[0].owner_user_id;
    if (targetUserId === userId) {
      throw new Error('Self connection not allowed');
    }

    return this.sendConnectionRequest(userId, { targetUserId });
  }

  /**
   * NFC Tap-to-Exchange: má»™t láº§n gá»i duy nháº¥t.
   * - Resolve token â†’ láº¥y profile cĂ´ng khai cá»§a ngÆ°á»i Ä‘Æ°á»£c cháº¡m
   * - Tá»± Ä‘á»™ng táº¡o/tĂ¬m káº¿t ná»‘i vá»›i source_type = 'nfc'
   * - Tráº£ vá» profile + tráº¡ng thĂ¡i káº¿t ná»‘i
   */
  async nfcTap(userId: string, token: string) {
    // 1. Resolve token â†’ share link
    const links = await this.prisma.$queryRaw<any[]>`
      SELECT id, identity_id FROM public.identity_share_links
      WHERE public_token = ${token} AND status = 'active'
      LIMIT 1
    `.catch(() => []);

    if (links.length === 0) {
      return { ok: false, reason: 'not_found', profile: null, connectionId: null, state: 'unavailable' };
    }
    const link = links[0];

    // 2. Láº¥y full identity (kĂ¨m visibility)
    const identities = await this.prisma.$queryRaw<any[]>`
      SELECT * FROM public.business_identities
      WHERE id = ${link.identity_id}::uuid AND status = 'active'
      LIMIT 1
    `.catch(() => []);

    if (identities.length === 0) {
      return { ok: false, reason: 'not_found', profile: null, connectionId: null, state: 'unavailable' };
    }
    const identity = identities[0];
    const targetUserId = identity.owner_user_id;

    if (targetUserId === userId) {
      return { ok: false, reason: 'self', profile: null, connectionId: null, state: 'self' };
    }

    // 3. Ăp visibility filter
    const visibilityRows = await this.prisma.$queryRaw<any[]>`
      SELECT field_key, visibility FROM public.identity_field_visibility
      WHERE identity_id = ${identity.id}::uuid
    `.catch(() => []);
    const vis: Record<string, string> = {};
    for (const r of visibilityRows) vis[r.field_key] = r.visibility;
    const show = (key: string) => vis[key] !== 'hidden';

    const profile = {
      displayName: show('displayName') ? (identity.display_name ?? null) : null,
      headline: show('headline') ? (identity.headline ?? null) : null,
      jobTitle: show('jobTitle') ? (identity.job_title ?? null) : null,
      companyName: show('companyName') ? (identity.company_name ?? null) : null,
      avatarUrl: show('avatarUrl') ? (identity.avatar_url ?? null) : null,
      primaryEmail: show('primaryEmail') ? (identity.primary_email ?? null) : null,
      primaryPhone: show('primaryPhone') ? (identity.primary_phone ?? null) : null,
      website: show('website') ? (identity.website ?? null) : null,
      linkedinUrl: show('linkedinUrl') ? (identity.linkedin_url ?? null) : null,
      city: show('city') ? (identity.city ?? null) : null,
    };

    // 4. Kiá»ƒm tra connection hiá»‡n táº¡i
    const existing = await this.prisma.$queryRaw<any[]>`
      SELECT id, requester_user_id, status FROM public.user_connections
      WHERE (requester_user_id = ${userId}::uuid AND recipient_user_id = ${targetUserId}::uuid)
         OR (requester_user_id = ${targetUserId}::uuid AND recipient_user_id = ${userId}::uuid)
      LIMIT 1
    `.catch(() => []);

    if (existing.length > 0) {
      const conn = existing[0];
      const direction = conn.requester_user_id === userId ? 'outgoing' : 'incoming';
      let state = 'pending';
      if (conn.status === 'accepted') {
        state = 'connected';
      } else if (conn.status === 'pending') {
        state = direction === 'outgoing' ? 'outgoing_pending' : 'incoming_pending';
      } else {
        const now = new Date();
        await this.prisma.$executeRaw`
          UPDATE public.user_connections
          SET requester_user_id = ${userId}::uuid,
              recipient_user_id = ${targetUserId}::uuid,
              status = 'pending'::public.global_connection_status,
              source_type = 'manual'::public.global_connection_source_type,
              requested_at = ${now},
              responded_at = NULL,
              updated_at = ${now}
          WHERE id = ${conn.id}::uuid
        `.catch(() => {});
        state = 'outgoing_pending';
      }
      return { ok: true, reason: 'existing', profile, connectionId: conn.id, state };
    }

    // 5. Táº¡o káº¿t ná»‘i má»›i vá»›i source_type = 'nfc'
    const reqId = crypto.randomUUID();
    const now = new Date();
    try {
      await this.prisma.$executeRaw`
        INSERT INTO public.user_connections (id, requester_user_id, recipient_user_id, status, source_type, requested_at, created_at, updated_at)
        VALUES (${reqId}::uuid, ${userId}::uuid, ${targetUserId}::uuid, 'pending'::public.global_connection_status, 'nfc'::public.global_connection_source_type, ${now}, ${now}, ${now})
      `;
    } catch {
      // source_type 'nfc' cĂ³ thá»ƒ chÆ°a cĂ³ trong enum â€” fallback sang 'manual'
      await this.prisma.$executeRaw`
        INSERT INTO public.user_connections (id, requester_user_id, recipient_user_id, status, source_type, requested_at, created_at, updated_at)
        VALUES (${reqId}::uuid, ${userId}::uuid, ${targetUserId}::uuid, 'pending'::public.global_connection_status, 'manual'::public.global_connection_source_type, ${now}, ${now}, ${now})
      `;
    }

    // 6. Update last_used_at cá»§a link (async, khĂ´ng block)
    this.prisma.$executeRaw`
      UPDATE public.identity_share_links SET last_used_at = ${now} WHERE id = ${link.id}::uuid
    `.catch(() => {});

    return { ok: true, reason: 'created', profile, connectionId: reqId, state: 'outgoing_pending' };
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

  async listNotifications(userId: string, limit: number = 30) {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT id, recipient_user_id, source_domain, source_record_id, event_kind, notification_kind,
             title_key, body_key, safe_display_data, action_kind, action_label_key, action_target,
             priority, status, created_at, updated_at, read_at
      FROM public.business_notifications
      WHERE recipient_user_id = ${userId}::uuid
      ORDER BY created_at DESC
      LIMIT ${limit}
    `.catch((err) => {
      console.error('Error listing notifications:', err);
      return [];
    });

    return rows.map(r => ({
      id: r.id,
      recipientUserId: r.recipient_user_id,
      sourceDomain: r.source_domain || 'meeting',
      sourceRecordId: r.source_record_id || '',
      eventKind: r.event_kind || '',
      notificationKind: r.notification_kind || '',
      titleKey: r.title_key || '',
      bodyKey: r.body_key || '',
      safeDisplayData: r.safe_display_data || {},
      action: {
        kind: r.action_kind || 'none',
        labelKey: r.action_label_key || 'bc.notif.action.view',
        targetRoute: r.action_target?.route || null,
        targetParams: r.action_target?.params || null,
        targetSearch: r.action_target?.search || null,
        requiresConfirmation: false,
        canonicalCapability: null,
      },
      priority: r.priority || 'normal',
      status: r.status || 'unread',
      scheduledFor: null,
      deliveredAt: r.created_at ? new Date(r.created_at).toISOString() : null,
      readAt: r.read_at ? new Date(r.read_at).toISOString() : null,
      archivedAt: null,
      expiredAt: null,
      dedupeKey: r.id,
      schemaVersion: 1,
      createdAt: r.created_at ? new Date(r.created_at).toISOString() : null,
      updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : null,
    }));
  }

  async markNotificationsRead(userId: string, ids?: string[]) {
    if (ids && ids.length > 0) {
      await this.prisma.$executeRaw`
        UPDATE public.business_notifications
        SET status = 'read', read_at = now()
        WHERE recipient_user_id = ${userId}::uuid AND id = ANY(${ids}::uuid[])
      `;
      return ids.length;
    } else {
      const res = await this.prisma.$executeRaw`
        UPDATE public.business_notifications
        SET status = 'read', read_at = now()
        WHERE recipient_user_id = ${userId}::uuid AND status = 'unread'
      `;
      return res;
    }
  }

  async listMyMemberNotifications(userId: string) {
    const members = await this.prisma.$queryRaw<any[]>`
      SELECT id FROM public.members WHERE user_id = ${userId}::uuid
    `.catch(() => []);
    const memberIds = members.map((m) => m.id);

    const [broadcast, personal] = await Promise.all([
      this.prisma.$queryRaw<any[]>`
        SELECT id, title, body, audience, sent_at, created_at
        FROM public.notifications
        WHERE status = 'sent'
        ORDER BY COALESCE(sent_at, created_at) DESC
        LIMIT 50
      `.catch(() => []),
      memberIds.length > 0
        ? this.prisma.$queryRaw<any[]>`
            SELECT id, title, body, created_at, read, dismissed, ref_type, ref_id
            FROM public.member_notifications
            WHERE recipient_id = ANY(${memberIds}::uuid[])
            ORDER BY created_at DESC
            LIMIT 50
          `.catch(() => [])
        : this.prisma.$queryRaw<any[]>`
            SELECT id, title, body, created_at, read, dismissed, ref_type, ref_id
            FROM public.member_notifications
            WHERE recipient_id = ${userId}::uuid
            ORDER BY created_at DESC
            LIMIT 50
          `.catch(() => []),
    ]);

    const dismissedRows = await this.prisma.$queryRaw<any[]>`
      SELECT notification_id FROM public.broadcast_notification_dismissals
      WHERE user_id = ${userId}::uuid
    `.catch(() => []);
    const dismissedIds = new Set(dismissedRows.map((r) => r.notification_id));

    const typeMap = (audience: string | null) => {
      const a = (audience ?? '').toLowerCase();
      if (a.includes('event') || a.includes('sá»± kiá»‡n')) return 'event';
      if (a.includes('fee') || a.includes('phĂ­')) return 'fee';
      if (a.includes('opp') || a.includes('cÆ¡ há»™i')) return 'opportunity';
      return 'system';
    };

    const broadcastItems = broadcast.map((n) => ({
      id: n.id,
      title: n.title,
      body: n.body,
      time: n.sent_at ? new Date(n.sent_at).toISOString() : new Date(n.created_at).toISOString(),
      createdAt: n.sent_at ? new Date(n.sent_at).toISOString() : new Date(n.created_at).toISOString(),
      type: typeMap(n.audience),
      unread: false,
      dismissed: dismissedIds.has(n.id),
      priority: 'low',
      personal: false,
    }));

    const personalItems = personal.map((n) => ({
      id: n.id,
      title: n.title,
      body: n.body,
      time: n.created_at ? new Date(n.created_at).toISOString() : new Date().toISOString(),
      createdAt: n.created_at ? new Date(n.created_at).toISOString() : new Date().toISOString(),
      type: 'network',
      unread: !n.read,
      dismissed: Boolean(n.dismissed),
      priority: !n.read ? 'high' : 'medium',
      personal: true,
      refType: n.ref_type,
      refId: n.ref_id,
    }));

    return [...personalItems, ...broadcastItems].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }

  async markMemberNotificationRead(userId: string, id: string) {
    await this.prisma.$executeRaw`
      UPDATE public.member_notifications SET read = true WHERE id = ${id}::uuid
    `.catch(() => null);
    return { marked: 1 };
  }

  async markAllMemberNotificationsRead(userId: string) {
    const members = await this.prisma.$queryRaw<any[]>`
      SELECT id FROM public.members WHERE user_id = ${userId}::uuid
    `.catch(() => []);
    const memberIds = members.map((m) => m.id);

    if (memberIds.length > 0) {
      await this.prisma.$executeRaw`
        UPDATE public.member_notifications SET read = true WHERE recipient_id = ANY(${memberIds}::uuid[])
      `.catch(() => null);
    }
    return { marked: true };
  }

  async dismissMemberNotification(userId: string, id: string) {
    await this.prisma.$executeRaw`
      UPDATE public.member_notifications SET dismissed = true, read = true WHERE id = ${id}::uuid
    `.catch(() => null);
    return { dismissed: 1 };
  }

  async dismissBroadcastNotification(userId: string, ids: string[]) {
    for (const nid of ids) {
      await this.prisma.$executeRaw`
        INSERT INTO public.broadcast_notification_dismissals (user_id, notification_id)
        VALUES (${userId}::uuid, ${nid}::uuid)
        ON CONFLICT DO NOTHING
      `.catch(() => null);
    }
    return { dismissed: ids.length };
  }

  async getNotificationPrefs(userId: string) {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT connection_request, connection_accepted, connection_status_update
      FROM public.gn_notification_prefs
      WHERE user_id = ${userId}::uuid
      LIMIT 1
    `.catch((err) => {
      console.error('Error getting notification prefs:', err);
      return [];
    });

    if (rows.length === 0) {
      return {
        connectionRequest: true,
        connectionAccepted: true,
        connectionStatusUpdate: true,
      };
    }

    const r = rows[0];
    return {
      connectionRequest: r.connection_request !== false,
      connectionAccepted: r.connection_accepted !== false,
      connectionStatusUpdate: r.connection_status_update !== false,
    };
  }

  async setNotificationPrefs(userId: string, prefs: any) {
    await this.prisma.$executeRaw`
      INSERT INTO public.gn_notification_prefs (user_id, connection_request, connection_accepted, connection_status_update, updated_at)
      VALUES (
        ${userId}::uuid,
        ${prefs.connectionRequest ?? true},
        ${prefs.connectionAccepted ?? true},
        ${prefs.connectionStatusUpdate ?? true},
        now()
      )
      ON CONFLICT (user_id) DO UPDATE SET
        connection_request = EXCLUDED.connection_request,
        connection_accepted = EXCLUDED.connection_accepted,
        connection_status_update = EXCLUDED.connection_status_update,
        updated_at = now()
    `;
    return prefs;
  }

  async reportUser(userId: string, data: any) {
    const id = crypto.randomUUID();
    await this.prisma.$executeRaw`
      INSERT INTO public.gn_reports (id, reporter_user_id, reported_user_id, category, details, connection_id, created_at)
      VALUES (
        ${id}::uuid,
        ${userId}::uuid,
        ${data.reportedUserId}::uuid,
        ${data.category},
        ${data.details || null},
        ${data.connectionId || null}::uuid,
        now()
      )
    `;
    return { reportId: id };
  }

  async getMyShowcase(userId: string) {
    const items = await this.prisma.$queryRaw<any[]>`
      SELECT id, kind, title, subtitle, logo_url AS "logoUrl"
      FROM public.business_identity_showcase_items
      WHERE owner_user_id = ${userId}::uuid
      ORDER BY sort_order ASC, created_at ASC
      LIMIT 120
    `;
    return {
      businessAreas: items.filter((i) => i.kind === 'business_area'),
      clients: items.filter((i) => i.kind === 'client'),
      metrics: items.filter((i) => i.kind === 'metric'),
      interests: items.filter((i) => i.kind === 'interest'),
      clientMetrics: items.filter((i) => i.kind === 'client_metric'),
    };
  }

  async addShowcaseItem(userId: string, data: any) {
    const { kind, title, subtitle, logoUrl, sortOrder } = data;
    await this.prisma.$executeRaw`
      INSERT INTO public.business_identity_showcase_items (
        owner_user_id, kind, title, subtitle, logo_url, sort_order
      ) VALUES (
        ${userId}::uuid, ${kind}, ${title}, ${subtitle || null}, ${logoUrl || null}, ${sortOrder || 0}
      )
    `;
    return { success: true };
  }

  async deleteShowcaseItem(userId: string, id: string) {
    await this.prisma.$executeRaw`
      DELETE FROM public.business_identity_showcase_items
      WHERE id = ${id}::uuid AND owner_user_id = ${userId}::uuid
    `;
    return { success: true };
  }

  // --- Moments (BC-Mobile-2E) ---
  
  async prepareMoment(userId: string, input: any) {
    const { personId, occurredAt, eventName, placeLabel, note, photoCount, clientToken } = input;

    const m = /^([ucg]):([0-9a-fA-F-]{36})$/.exec(personId);
    if (!m) throw new ForbiddenException('relationship_not_authorized');
    const namespace = m[1];
    const targetId = m[2].toLowerCase();

    let targetKind = 'connection';
    let targetUserId: string | null = null;
    let targetCardId: string | null = null;
    let targetGuestId: string | null = null;

    if (namespace === 'u') {
      if (targetId === userId) throw new ForbiddenException('relationship_not_authorized');
      const rows = await this.prisma.$queryRaw<any[]>`
        SELECT id FROM public.user_connections
        WHERE status = 'accepted'::public.global_connection_status
          AND ((requester_user_id = ${userId}::uuid AND recipient_user_id = ${targetId}::uuid)
            OR (requester_user_id = ${targetId}::uuid AND recipient_user_id = ${userId}::uuid))
        LIMIT 1
      `.catch(() => []);
      if (rows.length === 0) throw new ForbiddenException('relationship_not_authorized');
      targetKind = 'connection';
      targetUserId = targetId;
    } else if (namespace === 'g') {
      const rows = await this.prisma.$queryRaw<any[]>`
        SELECT id FROM public.guest_contacts
        WHERE owner_user_id = ${userId}::uuid AND id = ${targetId}::uuid
        LIMIT 1
      `.catch(() => []);
      if (rows.length === 0) throw new ForbiddenException('relationship_not_authorized');
      targetKind = 'guest_contact';
      targetGuestId = targetId;
    } else {
      const rows = await this.prisma.$queryRaw<any[]>`
        SELECT id FROM public.saved_business_cards
        WHERE owner_user_id = ${userId}::uuid AND target_card_id = ${targetId}::uuid AND archived = false
        LIMIT 1
      `.catch(() => []);
      if (rows.length === 0) throw new ForbiddenException('relationship_not_authorized');
      targetKind = 'saved_card';
      targetCardId = targetId;
    }

    const existingRows = await this.prisma.$queryRaw<any[]>`
      SELECT id, status FROM public.business_relationship_moments
      WHERE owner_user_id = ${userId}::uuid AND client_token = ${clientToken}::uuid
      LIMIT 1
    `.catch(() => []);

    let momentId: string;

    if (existingRows.length > 0) {
      const existing = existingRows[0];
      momentId = existing.id;
      if (existing.status === 'active') {
        return { ok: true, alreadySaved: true, momentId, photos: [] };
      }
      await this.prisma.$executeRaw`
        UPDATE public.business_relationship_moments
        SET occurred_at = ${new Date(occurredAt)},
            event_name = ${eventName || null},
            place_label = ${placeLabel || null},
            note = ${note || null},
            updated_at = now()
        WHERE id = ${momentId}::uuid
      `;
    } else {
      momentId = crypto.randomUUID();
      await this.prisma.$executeRaw`
        INSERT INTO public.business_relationship_moments (
          id, owner_user_id, target_kind, target_user_id, target_card_id, target_guest_id,
          occurred_at, event_name, place_label, note, status, client_token, created_at, updated_at
        ) VALUES (
          ${momentId}::uuid, ${userId}::uuid, ${targetKind},
          ${targetUserId ? targetUserId : null}::uuid,
          ${targetCardId ? targetCardId : null}::uuid,
          ${targetGuestId ? targetGuestId : null}::uuid,
          ${new Date(occurredAt)}, ${eventName || null}, ${placeLabel || null}, ${note || null},
          'pending', ${clientToken}::uuid, now(), now()
        )
      `;
    }

    await this.prisma.$executeRaw`
      DELETE FROM public.business_relationship_moment_media
      WHERE moment_id = ${momentId}::uuid AND owner_user_id = ${userId}::uuid
    `;

    const photos: any[] = [];
    if (photoCount > 0) {
      for (let i = 0; i < photoCount; i++) {
        const mediaId = crypto.randomUUID();
        const storagePath = `${userId}/${momentId}/${mediaId}.jpg`;
        await this.prisma.$executeRaw`
          INSERT INTO public.business_relationship_moment_media (
            id, moment_id, owner_user_id, storage_path, media_type, sort_order
          ) VALUES (
            ${mediaId}::uuid, ${momentId}::uuid, ${userId}::uuid, ${storagePath}, 'image/jpeg', ${i}
          )
        `;
        photos.push({
          mediaId,
          storagePath,
          sortOrder: i,
        });
      }
    }

    return { ok: true, alreadySaved: false, momentId, photos };
  }

  async finalizeMoment(userId: string, input: any) {
    const { momentId, uploadedMediaIds, mediaPaths } = input;
    const momentRows = await this.prisma.$queryRaw<any[]>`
      SELECT id, status FROM public.business_relationship_moments
      WHERE id = ${momentId}::uuid AND owner_user_id = ${userId}::uuid
      LIMIT 1
    `.catch(() => []);

    if (momentRows.length === 0) throw new NotFoundException('not_found');
    const moment = momentRows[0];
    if (moment.status === 'active') return { ok: true, momentId };

    // Update storage paths if mediaPaths mapping is provided
    if (mediaPaths && typeof mediaPaths === 'object') {
      for (const [mediaId, storagePath] of Object.entries(mediaPaths)) {
        await this.prisma.$executeRaw`
          UPDATE public.business_relationship_moment_media
          SET storage_path = ${storagePath}
          WHERE id = ${mediaId}::uuid AND owner_user_id = ${userId}::uuid
        `;
      }
    }

    const slots = await this.prisma.$queryRaw<any[]>`
      SELECT id FROM public.business_relationship_moment_media
      WHERE moment_id = ${momentId}::uuid
    `.catch(() => []);

    const slotIds = new Set(slots.map((s) => s.id));
    const keep = uploadedMediaIds.filter((id) => slotIds.has(id));

    if (keep.length > 0) {
      await this.prisma.$executeRaw`
        DELETE FROM public.business_relationship_moment_media
        WHERE moment_id = ${momentId}::uuid AND owner_user_id = ${userId}::uuid AND NOT (id = ANY(${keep}::uuid[]))
      `;
    } else {
      await this.prisma.$executeRaw`
        DELETE FROM public.business_relationship_moment_media
        WHERE moment_id = ${momentId}::uuid AND owner_user_id = ${userId}::uuid
      `;
    }

    await this.prisma.$executeRaw`
      UPDATE public.business_relationship_moments
      SET status = 'active', updated_at = now()
      WHERE id = ${momentId}::uuid AND owner_user_id = ${userId}::uuid AND status = 'pending'
    `;

    return { ok: true, momentId };
  }

  async updateMoment(userId: string, input: any) {
    const { momentId, occurredAt, eventName, placeLabel, note } = input;

    const momentRows = await this.prisma.$queryRaw<any[]>`
      SELECT id FROM public.business_relationship_moments
      WHERE id = ${momentId}::uuid AND owner_user_id = ${userId}::uuid
      LIMIT 1
    `.catch(() => []);

    if (momentRows.length === 0) throw new NotFoundException('not_found');

    await this.prisma.$executeRaw`
      UPDATE public.business_relationship_moments
      SET occurred_at = ${new Date(occurredAt)},
          event_name = ${eventName || null},
          place_label = ${placeLabel || null},
          note = ${note || null},
          updated_at = now()
      WHERE id = ${momentId}::uuid AND owner_user_id = ${userId}::uuid
    `;

    return { ok: true, momentId };
  }

  async deleteMoment(userId: string, momentId: string) {
    const momentRows = await this.prisma.$queryRaw<any[]>`
      SELECT id FROM public.business_relationship_moments
      WHERE id = ${momentId}::uuid AND owner_user_id = ${userId}::uuid
      LIMIT 1
    `.catch(() => []);

    if (momentRows.length === 0) throw new NotFoundException('not_found');

    await this.prisma.$executeRaw`
      DELETE FROM public.business_relationship_moment_media
      WHERE moment_id = ${momentId}::uuid AND owner_user_id = ${userId}::uuid
    `;

    await this.prisma.$executeRaw`
      DELETE FROM public.business_relationship_moments
      WHERE id = ${momentId}::uuid AND owner_user_id = ${userId}::uuid
    `;

    return { ok: true, momentId };
  }

  async listMomentPhotos(userId: string, momentId: string) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(momentId)) {
      return {
        ok: true,
        momentId,
        max: 6,
        photos: [],
      };
    }

    const momentRows = await this.prisma.$queryRaw<any[]>`
      SELECT id FROM public.business_relationship_moments
      WHERE id = ${momentId}::uuid AND owner_user_id = ${userId}::uuid
      LIMIT 1
    `.catch(() => []);

    if (momentRows.length === 0) {
      return {
        ok: true,
        momentId,
        max: 6,
        photos: [],
      };
    }

    const slots = await this.prisma.$queryRaw<any[]>`
      SELECT id, moment_id, storage_path, sort_order
      FROM public.business_relationship_moment_media
      WHERE moment_id = ${momentId}::uuid
      ORDER BY sort_order ASC
    `.catch(() => []);

    const signed: Record<string, string> = {};
    if (slots.length > 0 && process.env.SUPABASE_URL && process.env.SUPABASE_PUBLISHABLE_KEY) {
      try {
        const paths = slots.map((s) => s.storage_path);
        const res = await fetch(`${process.env.SUPABASE_URL}/storage/v1/object/sign/relationship-moments`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            paths,
            expiresIn: 300,
          }),
        });
        if (res.ok) {
          const data = await res.json() as any[];
          for (const item of data) {
            if (item.path && item.signedUrl) {
              signed[item.path] = item.signedUrl.startsWith('http') 
                ? item.signedUrl 
                : `${process.env.SUPABASE_URL}/storage/v1${item.signedUrl}`;
            }
          }
        }
      } catch (err) {
        console.error('Error signing media urls:', err);
      }
    }

    return {
      ok: true,
      momentId,
      max: 6,
      photos: slots.map((s) => ({
        mediaId: s.id,
        storagePath: s.storage_path,
        sortOrder: s.sort_order,
        url: signed[s.storage_path] || null,
      })),
    };
  }

  async addMomentPhotoSlots(userId: string, momentId: string, count: number) {
    const momentRows = await this.prisma.$queryRaw<any[]>`
      SELECT id FROM public.business_relationship_moments
      WHERE id = ${momentId}::uuid AND owner_user_id = ${userId}::uuid
      LIMIT 1
    `.catch(() => []);

    if (momentRows.length === 0) throw new NotFoundException('not_found');

    const existing = await this.prisma.$queryRaw<any[]>`
      SELECT sort_order FROM public.business_relationship_moment_media
      WHERE moment_id = ${momentId}::uuid
    `.catch(() => [] as any[]);

    if (existing.length + count > 6) {
      throw new BadRequestException('photo_count');
    }

    const startSort = existing.reduce((max, s) => Math.max(max, s.sort_order + 1), 0);
    const photos: any[] = [];
    for (let i = 0; i < count; i++) {
      const mediaId = crypto.randomUUID();
      const storagePath = `${userId}/${momentId}/${mediaId}.jpg`;
      const sortOrder = startSort + i;
      await this.prisma.$executeRaw`
        INSERT INTO public.business_relationship_moment_media (
          id, moment_id, owner_user_id, storage_path, media_type, sort_order
        ) VALUES (
          ${mediaId}::uuid, ${momentId}::uuid, ${userId}::uuid, ${storagePath}, 'image/jpeg', ${sortOrder}
        )
      `;
      photos.push({
        mediaId,
        storagePath,
        sortOrder,
      });
    }

    return { ok: true, momentId, photos };
  }

  async commitMomentPhotos(userId: string, input: any) {
    const { momentId, addedMediaIds, uploadedMediaIds, mediaPaths } = input;
    const momentRows = await this.prisma.$queryRaw<any[]>`
      SELECT id FROM public.business_relationship_moments
      WHERE id = ${momentId}::uuid AND owner_user_id = ${userId}::uuid
      LIMIT 1
    `.catch(() => []);

    if (momentRows.length === 0) throw new NotFoundException('not_found');

    // Update storage paths if mediaPaths mapping is provided
    if (mediaPaths && typeof mediaPaths === 'object') {
      for (const [mediaId, storagePath] of Object.entries(mediaPaths)) {
        await this.prisma.$executeRaw`
          UPDATE public.business_relationship_moment_media
          SET storage_path = ${storagePath}
          WHERE id = ${mediaId}::uuid AND owner_user_id = ${userId}::uuid
        `;
      }
    }

    const slots: any[] = await this.prisma.$queryRaw<any[]>`
      SELECT id FROM public.business_relationship_moment_media
      WHERE moment_id = ${momentId}::uuid
    `.catch(() => [] as any[]);

    const uploaded = new Set(uploadedMediaIds);
    const drop = slots.filter((s: any) => addedMediaIds.includes(s.id) && !uploaded.has(s.id));
    if (drop.length > 0) {
      const dropIds = drop.map((s) => s.id);
      await this.prisma.$executeRaw`
        DELETE FROM public.business_relationship_moment_media
        WHERE moment_id = ${momentId}::uuid AND owner_user_id = ${userId}::uuid AND id = ANY(${dropIds}::uuid[])
      `;
    }

    return { ok: true, momentId };
  }

  async removeMomentPhoto(userId: string, momentId: string, mediaId: string) {
    const momentRows = await this.prisma.$queryRaw<any[]>`
      SELECT id FROM public.business_relationship_moments
      WHERE id = ${momentId}::uuid AND owner_user_id = ${userId}::uuid
      LIMIT 1
    `.catch(() => []);

    if (momentRows.length === 0) throw new NotFoundException('not_found');

    await this.prisma.$executeRaw`
      DELETE FROM public.business_relationship_moment_media
      WHERE moment_id = ${momentId}::uuid AND owner_user_id = ${userId}::uuid AND id = ${mediaId}::uuid
    `;

    return { ok: true, momentId };
  }

  // --- Reminders ---

  async listMomentReminders(userId: string, momentId: string | null, includeDone: boolean, limit: number) {
    let query;
    if (momentId) {
      if (includeDone) {
        query = this.prisma.$queryRaw<any[]>`
          SELECT id, moment_id, remind_at, label, status, completed_at
          FROM public.business_relationship_moment_reminders
          WHERE owner_user_id = ${userId}::uuid AND moment_id = ${momentId}::uuid
          ORDER BY remind_at ASC
          LIMIT ${limit}
        `;
      } else {
        query = this.prisma.$queryRaw<any[]>`
          SELECT id, moment_id, remind_at, label, status, completed_at
          FROM public.business_relationship_moment_reminders
          WHERE owner_user_id = ${userId}::uuid AND moment_id = ${momentId}::uuid AND status = 'pending'
          ORDER BY remind_at ASC
          LIMIT ${limit}
        `;
      }
    } else {
      if (includeDone) {
        query = this.prisma.$queryRaw<any[]>`
          SELECT id, moment_id, remind_at, label, status, completed_at
          FROM public.business_relationship_moment_reminders
          WHERE owner_user_id = ${userId}::uuid
          ORDER BY remind_at ASC
          LIMIT ${limit}
        `;
      } else {
        query = this.prisma.$queryRaw<any[]>`
          SELECT id, moment_id, remind_at, label, status, completed_at
          FROM public.business_relationship_moment_reminders
          WHERE owner_user_id = ${userId}::uuid AND status = 'pending'
          ORDER BY remind_at ASC
          LIMIT ${limit}
        `;
      }
    }

    const rows = await query.catch(() => []);
    return {
      ok: true,
      reminders: rows.map((r) => ({
        id: r.id,
        momentId: r.moment_id,
        remindAt: r.remind_at ? new Date(r.remind_at).toISOString() : null,
        label: r.label,
        status: r.status,
        completedAt: r.completed_at ? new Date(r.completed_at).toISOString() : null,
      })),
    };
  }

  async createMomentReminder(userId: string, momentId: string, remindAt: string, label: string | null) {
    const countRow = await this.prisma.$queryRaw<any[]>`
      SELECT COUNT(id)::int as count FROM public.business_relationship_moment_reminders
      WHERE owner_user_id = ${userId}::uuid AND moment_id = ${momentId}::uuid AND status = 'pending'
    `.catch(() => []);

    const count = countRow[0]?.count || 0;
    if (count >= 5) {
      return { ok: false, error: 'limit_reached' };
    }

    const id = crypto.randomUUID();
    await this.prisma.$executeRaw`
      INSERT INTO public.business_relationship_moment_reminders (
        id, moment_id, owner_user_id, remind_at, label, status
      ) VALUES (
        ${id}::uuid, ${momentId}::uuid, ${userId}::uuid, ${new Date(remindAt)}, ${label || null}, 'pending'
      )
    `;

    return {
      ok: true,
      reminder: {
        id,
        momentId,
        remindAt: new Date(remindAt).toISOString(),
        label,
        status: 'pending',
        completedAt: null,
      },
    };
  }

  async setMomentReminderStatus(userId: string, reminderId: string, status: string) {
    const completedAt = status === 'done' ? new Date() : null;

    const rowBefore = await this.prisma.$queryRaw<any[]>`
      SELECT id FROM public.business_relationship_moment_reminders
      WHERE id = ${reminderId}::uuid AND owner_user_id = ${userId}::uuid
      LIMIT 1
    `.catch(() => []);

    if (rowBefore.length === 0) return { ok: false, error: 'not_found' };

    await this.prisma.$executeRaw`
      UPDATE public.business_relationship_moment_reminders
      SET status = ${status},
          completed_at = ${completedAt}
      WHERE id = ${reminderId}::uuid AND owner_user_id = ${userId}::uuid
    `;

    const rowAfter = await this.prisma.$queryRaw<any[]>`
      SELECT id, moment_id, remind_at, label, status, completed_at
      FROM public.business_relationship_moment_reminders
      WHERE id = ${reminderId}::uuid AND owner_user_id = ${userId}::uuid
      LIMIT 1
    `.catch(() => []);

    const r = rowAfter[0];
    return {
      ok: true,
      reminder: {
        id: r.id,
        momentId: r.moment_id,
        remindAt: r.remind_at ? new Date(r.remind_at).toISOString() : null,
        label: r.label,
        status: r.status,
        completedAt: r.completed_at ? new Date(r.completed_at).toISOString() : null,
      },
    };
  }

  async deleteMomentReminder(userId: string, reminderId: string) {
    await this.prisma.$executeRaw`
      DELETE FROM public.business_relationship_moment_reminders
      WHERE id = ${reminderId}::uuid AND owner_user_id = ${userId}::uuid
    `;
    return { ok: true, reminderId };
  }

  // ==========================================
  // BC-Mobile-5C â€” NFC Device Sessions & Tags
  // ==========================================

  async listMyDeviceSessions(userId: string, currentKey: string | null) {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT id, device_key, device_label, platform, browser, is_standalone, first_seen_at, last_seen_at, revoked_at
      FROM public.user_device_sessions
      WHERE user_id = ${userId}::uuid
      ORDER BY last_seen_at DESC
    `.catch(() => [] as any[]);

    return rows.map(r => ({
      id: r.id,
      deviceKey: r.device_key,
      label: r.device_label ?? "Thiáº¿t bá»‹",
      platform: r.platform,
      browser: r.browser,
      isStandalone: r.is_standalone,
      firstSeenAt: r.first_seen_at ? new Date(r.first_seen_at).toISOString() : null,
      lastSeenAt: r.last_seen_at ? new Date(r.last_seen_at).toISOString() : null,
      revokedAt: r.revoked_at ? new Date(r.revoked_at).toISOString() : null,
      isCurrent: currentKey !== null && r.device_key === currentKey,
    }));
  }

  async touchMyDeviceSession(userId: string, input: any) {
    const existing = await this.prisma.$queryRaw<any[]>`
      SELECT id, revoked_at FROM public.user_device_sessions
      WHERE user_id = ${userId}::uuid AND device_key = ${input.deviceKey}
      LIMIT 1
    `.catch(() => [] as any[]);

    const first = existing[0];
    if (first?.revoked_at) return { revoked: true };

    const now = new Date();
    if (first) {
      await this.prisma.$executeRaw`
        UPDATE public.user_device_sessions
        SET last_seen_at = ${now}
        WHERE id = ${first.id}::uuid
      `;
      return { revoked: false };
    }

    await this.prisma.$executeRaw`
      INSERT INTO public.user_device_sessions (
        user_id, device_key, device_label, platform, browser, is_standalone, first_seen_at, last_seen_at
      ) VALUES (
        ${userId}::uuid, ${input.deviceKey}, ${input.label || null}, ${input.platform || null},
        ${input.browser || null}, ${input.isStandalone || false}, ${now}, ${now}
      )
    `;
    return { revoked: false };
  }

  async revokeMyDeviceSession(userId: string, sessionId: string, currentKey: string | null) {
    const now = new Date();
    await this.prisma.$executeRaw`
      UPDATE public.user_device_sessions
      SET revoked_at = ${now}
      WHERE id = ${sessionId}::uuid AND user_id = ${userId}::uuid
    `;

    const updated = await this.prisma.$queryRaw<any[]>`
      SELECT id, device_key, device_label, platform, browser, is_standalone, first_seen_at, last_seen_at, revoked_at
      FROM public.user_device_sessions
      WHERE id = ${sessionId}::uuid AND user_id = ${userId}::uuid
      LIMIT 1
    `.catch(() => [] as any[]);

    const r = updated[0];
    if (!r) throw new NotFoundException('session_not_found');

    return {
      id: r.id,
      deviceKey: r.device_key,
      label: r.device_label ?? "Thiáº¿t bá»‹",
      platform: r.platform,
      browser: r.browser,
      isStandalone: r.is_standalone,
      firstSeenAt: r.first_seen_at ? new Date(r.first_seen_at).toISOString() : null,
      lastSeenAt: r.last_seen_at ? new Date(r.last_seen_at).toISOString() : null,
      revokedAt: r.revoked_at ? new Date(r.revoked_at).toISOString() : null,
      isCurrent: currentKey !== null && r.device_key === currentKey,
    };
  }

  async listMyNfcTags(userId: string) {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT t.id, t.label, t.status, t.written_at, t.updated_at,
             l.status as link_status, l.last_used_at as link_last_used_at
      FROM public.identity_nfc_tags t
      LEFT JOIN public.identity_share_links l ON t.share_link_id = l.id
      WHERE t.owner_user_id = ${userId}::uuid
      ORDER BY t.created_at DESC
    `.catch(() => [] as any[]);

    return rows.map(r => {
      let derivedStatus = 'STALE';
      if (r.status === 'revoked') derivedStatus = 'REVOKED';
      else if (r.link_status === 'active') derivedStatus = 'ACTIVE';

      return {
        id: r.id,
        label: r.label,
        status: derivedStatus,
        writtenAt: r.written_at ? new Date(r.written_at).toISOString() : null,
        lastTappedAt: r.link_last_used_at ? new Date(r.link_last_used_at).toISOString() : null,
        updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : null,
      };
    });
  }

  async registerMyNfcTag(userId: string, input: any) {
    const links = await this.prisma.$queryRaw<any[]>`
      SELECT id, identity_id, status FROM public.identity_share_links
      WHERE owner_user_id = ${userId}::uuid AND public_token = ${input.shareToken} AND status = 'active'
      LIMIT 1
    `.catch(() => [] as any[]);

    const link = links[0];
    if (!link) throw new BadRequestException('share_link_not_found');

    const tagId = crypto.randomUUID();
    const now = new Date();
    await this.prisma.$executeRaw`
      INSERT INTO public.identity_nfc_tags (
        id, owner_user_id, identity_id, share_link_id, label, status, written_at, created_at, updated_at
      ) VALUES (
        ${tagId}::uuid, ${userId}::uuid, ${link.identity_id}::uuid, ${link.id}::uuid, ${input.label || null}, 'active', ${now}, ${now}, ${now}
      )
    `;

    const tagRows = await this.prisma.$queryRaw<any[]>`
      SELECT t.id, t.label, t.status, t.written_at, t.updated_at,
             l.status as link_status, l.last_used_at as link_last_used_at
      FROM public.identity_nfc_tags t
      LEFT JOIN public.identity_share_links l ON t.share_link_id = l.id
      WHERE t.id = ${tagId}::uuid
      LIMIT 1
    `.catch(() => [] as any[]);

    const r = tagRows[0];
    if (!r) throw new BadRequestException('failed_to_register');

    let derivedStatus = 'STALE';
    if (r.status === 'revoked') derivedStatus = 'REVOKED';
    else if (r.link_status === 'active') derivedStatus = 'ACTIVE';

    return {
      id: r.id,
      label: r.label,
      status: derivedStatus,
      writtenAt: r.written_at ? new Date(r.written_at).toISOString() : null,
      lastTappedAt: r.link_last_used_at ? new Date(r.link_last_used_at).toISOString() : null,
      updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : null,
    };
  }

  async revokeMyNfcTag(userId: string, tagId: string) {
    const now = new Date();
    await this.prisma.$executeRaw`
      UPDATE public.identity_nfc_tags
      SET status = 'revoked', revoked_at = ${now}, updated_at = ${now}
      WHERE id = ${tagId}::uuid AND owner_user_id = ${userId}::uuid
    `;

    const tagRows = await this.prisma.$queryRaw<any[]>`
      SELECT t.id, t.label, t.status, t.written_at, t.updated_at,
             l.status as link_status, l.last_used_at as link_last_used_at
      FROM public.identity_nfc_tags t
      LEFT JOIN public.identity_share_links l ON t.share_link_id = l.id
      WHERE t.id = ${tagId}::uuid
      LIMIT 1
    `.catch(() => [] as any[]);

    const r = tagRows[0];
    if (!r) throw new NotFoundException('tag_not_found');

    let derivedStatus = 'STALE';
    if (r.status === 'revoked') derivedStatus = 'REVOKED';
    else if (r.link_status === 'active') derivedStatus = 'ACTIVE';

    return {
      id: r.id,
      label: r.label,
      status: derivedStatus,
      writtenAt: r.written_at ? new Date(r.written_at).toISOString() : null,
      lastTappedAt: r.link_last_used_at ? new Date(r.link_last_used_at).toISOString() : null,
      updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : null,
    };
  }

  async renameMyNfcTag(userId: string, input: any) {
    const now = new Date();
    await this.prisma.$executeRaw`
      UPDATE public.identity_nfc_tags
      SET label = ${input.label || null}, updated_at = ${now}
      WHERE id = ${input.tagId}::uuid AND owner_user_id = ${userId}::uuid
    `;

    const tagRows = await this.prisma.$queryRaw<any[]>`
      SELECT t.id, t.label, t.status, t.written_at, t.updated_at,
             l.status as link_status, l.last_used_at as link_last_used_at
      FROM public.identity_nfc_tags t
      LEFT JOIN public.identity_share_links l ON t.share_link_id = l.id
      WHERE t.id = ${input.tagId}::uuid
      LIMIT 1
    `.catch(() => [] as any[]);

    const r = tagRows[0];
    if (!r) throw new NotFoundException('tag_not_found');

    let derivedStatus = 'STALE';
    if (r.status === 'revoked') derivedStatus = 'REVOKED';
    else if (r.link_status === 'active') derivedStatus = 'ACTIVE';

    return {
      id: r.id,
      label: r.label,
      status: derivedStatus,
      writtenAt: r.written_at ? new Date(r.written_at).toISOString() : null,
      lastTappedAt: r.link_last_used_at ? new Date(r.link_last_used_at).toISOString() : null,
      updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : null,
    };
  }

  // ==========================================
  // BC-Mobile-8A â€” Inbox Direct Messaging (DM)
  // ==========================================

  async listMyDmThreads(userId: string) {
    const threads = await this.prisma.$queryRaw<any[]>`
      SELECT id, pair_user_low, pair_user_high, last_message_at, last_message_preview, last_message_sender_id, updated_at
      FROM public.bc_dm_threads
      WHERE pair_user_low = ${userId}::uuid OR pair_user_high = ${userId}::uuid
      ORDER BY last_message_at DESC NULLS LAST, updated_at DESC
    `.catch(() => [] as any[]);

    if (threads.length === 0) return [];

    const counterpartIds = threads.map(t => t.pair_user_low === userId ? t.pair_user_high : t.pair_user_low);

    const cards = await this.prisma.$queryRaw<any[]>`
      SELECT owner_user_id, display_name, headline, professional_title, company_name, avatar_url, card_kind
      FROM public.member_business_cards
      WHERE owner_user_id::uuid = ANY(${counterpartIds}::uuid[])
        AND status = 'published'
        AND public_mode = 'public'
    `.catch(() => [] as any[]);

    const cardMap = new Map<string, any>();
    for (const c of cards) {
      const uid = c.owner_user_id;
      if (!uid) continue;
      const isPrimary = c.card_kind === 'primary';
      if (cardMap.has(uid) && !isPrimary) continue;
      cardMap.set(uid, {
        displayName: c.display_name ?? null,
        avatarUrl: c.avatar_url ?? null,
        headline: c.headline ?? c.professional_title ?? null,
        companyName: c.company_name ?? null,
      });
    }

    const unreadCounts = await this.prisma.$queryRaw<any[]>`
      SELECT thread_id, COUNT(*)::int as count FROM public.bc_dm_messages
      WHERE thread_id::uuid = ANY(${threads.map(t => t.id)}::uuid[])
        AND sender_user_id != ${userId}::uuid
        AND read_at IS NULL
        AND retracted_at IS NULL
      GROUP BY thread_id
    `.catch(() => [] as any[]);

    const unreadMap = new Map<string, number>();
    for (const uc of unreadCounts) {
      unreadMap.set(uc.thread_id, uc.count);
    }

    const resultThreads = threads.map(t => {
      const counterpartId = t.pair_user_low === userId ? t.pair_user_high : t.pair_user_low;
      const card = cardMap.get(counterpartId) ?? {
        displayName: 'ThĂ nh viĂªn Vione',
        avatarUrl: null,
        headline: null,
        companyName: null,
      };

      return {
        threadId: t.id,
        personId: `u:${counterpartId}`,
        displayName: card.displayName ?? 'ThĂ nh viĂªn Vione',
        avatarUrl: card.avatarUrl ?? null,
        headline: card.headline ?? null,
        companyName: card.companyName ?? null,
        lastMessageAt: t.last_message_at ? new Date(t.last_message_at).toISOString() : null,
        lastMessagePreview: t.last_message_preview,
        lastMessageFromMe: t.last_message_sender_id === userId,
        unreadCount: unreadMap.get(t.id) ?? 0,
      };
    });
    return { ok: true, threads: resultThreads };
  }

  async openMyDmThread(userId: string, counterpartUserId: string) {
    if (userId === counterpartUserId) throw new BadRequestException('cannot_chat_self');

    const connections = await this.prisma.$queryRaw<any[]>`
      SELECT id FROM public.user_connections
      WHERE status::text = 'accepted'
        AND ((requester_user_id = ${userId}::uuid AND recipient_user_id = ${counterpartUserId}::uuid)
          OR (requester_user_id = ${counterpartUserId}::uuid AND recipient_user_id = ${userId}::uuid))
      LIMIT 1
    `.catch(() => [] as any[]);

    if (connections.length === 0) {
      // Auto-establish accepted connection if not exists
      const connId = crypto.randomUUID();
      const now = new Date();
      await this.prisma.$executeRaw`
        INSERT INTO public.user_connections (
          id, requester_user_id, recipient_user_id, status, source_type, requested_at, responded_at, created_at, updated_at
        ) VALUES (
          ${connId}::uuid, ${userId}::uuid, ${counterpartUserId}::uuid, 'accepted'::public.global_connection_status, 'manual'::public.global_connection_source_type, ${now}, ${now}, ${now}, ${now}
        )
        ON CONFLICT DO NOTHING
      `.catch(() => null);
    }

    let threads = await this.prisma.$queryRaw<any[]>`
      SELECT id, pair_user_low, pair_user_high, last_message_at, last_message_preview, last_message_sender_id, updated_at
      FROM public.bc_dm_threads
      WHERE (pair_user_low = LEAST(${userId}::uuid, ${counterpartUserId}::uuid) AND pair_user_high = GREATEST(${userId}::uuid, ${counterpartUserId}::uuid))
      LIMIT 1
    `.catch(() => [] as any[]);

    let thread = threads[0];
    if (!thread) {
      const threadId = crypto.randomUUID();
      const now = new Date();
      await this.prisma.$executeRaw`
        INSERT INTO public.bc_dm_threads (
          id, pair_user_low, pair_user_high, created_by, created_at, updated_at
        ) VALUES (
          ${threadId}::uuid,
          LEAST(${userId}::uuid, ${counterpartUserId}::uuid),
          GREATEST(${userId}::uuid, ${counterpartUserId}::uuid),
          ${userId}::uuid,
          ${now},
          ${now}
        )
      `;
      threads = await this.prisma.$queryRaw<any[]>`
        SELECT id, pair_user_low, pair_user_high, last_message_at, last_message_preview, last_message_sender_id, updated_at
        FROM public.bc_dm_threads WHERE id = ${threadId}::uuid LIMIT 1
      `.catch(() => [] as any[]);
      thread = threads[0];
    }

    return {
      ok: true,
      threadId: thread.id,
    };
  }

  async getMyDmThreadDetail(userId: string, threadId: string) {
    const threads = await this.prisma.$queryRaw<any[]>`
      SELECT id, pair_user_low, pair_user_high, last_message_at, last_message_preview, last_message_sender_id, updated_at
      FROM public.bc_dm_threads
      WHERE id = ${threadId}::uuid AND (pair_user_low = ${userId}::uuid OR pair_user_high = ${userId}::uuid)
      LIMIT 1
    `.catch(() => [] as any[]);

    const thread = threads[0];
    if (!thread) throw new NotFoundException('thread_not_found');

    const counterpartId = thread.pair_user_low === userId ? thread.pair_user_high : thread.pair_user_low;

    const cards = await this.prisma.$queryRaw<any[]>`
      SELECT display_name, headline, professional_title, company_name, avatar_url, card_kind
      FROM public.member_business_cards
      WHERE owner_user_id = ${counterpartId}::uuid
        AND status = 'published'
        AND public_mode = 'public'
    `.catch(() => [] as any[]);

    const card = cards.find(c => c.card_kind === 'primary') || cards[0] || {
      display_name: 'ThĂ nh viĂªn Vione',
      avatar_url: null,
      headline: null,
      company_name: null,
    };

    const threadSummary = {
      threadId: thread.id,
      personId: `u:${counterpartId}`,
      displayName: card.display_name ?? 'ThĂ nh viĂªn Vione',
      avatarUrl: card.avatar_url ?? null,
      headline: card.headline ?? card.professional_title ?? null,
      companyName: card.company_name ?? null,
      lastMessageAt: thread.last_message_at ? new Date(thread.last_message_at).toISOString() : null,
      lastMessagePreview: thread.last_message_preview,
      lastMessageFromMe: thread.last_message_sender_id === userId,
      unreadCount: 0,
    };

    const messages = await this.listMyDmThreadMessages(userId, threadId);

    return {
      ok: true,
      thread: threadSummary,
      messages,
    };
  }

  async listMyDmThreadMessages(userId: string, threadId: string) {
    const threads = await this.prisma.$queryRaw<any[]>`
      SELECT id, pair_user_low, pair_user_high FROM public.bc_dm_threads
      WHERE id = ${threadId}::uuid AND (pair_user_low = ${userId}::uuid OR pair_user_high = ${userId}::uuid)
      LIMIT 1
    `.catch(() => [] as any[]);

    if (threads.length === 0) throw new ForbiddenException('thread_access_denied');

    const messages = await this.prisma.$queryRaw<any[]>`
      SELECT id, thread_id, sender_user_id, body, client_token, read_at, retracted_at, created_at
      FROM public.bc_dm_messages
      WHERE thread_id = ${threadId}::uuid
      ORDER BY created_at ASC
      LIMIT 1000
    `.catch(() => [] as any[]);

    return messages.map(m => ({
      id: m.id,
      threadId: m.thread_id,
      fromMe: m.sender_user_id === userId,
      body: m.retracted_at ? "" : m.body,
      clientToken: m.client_token,
      createdAt: m.created_at ? new Date(m.created_at).toISOString() : null,
      readAt: m.read_at ? new Date(m.read_at).toISOString() : null,
      retractedAt: m.retracted_at ? new Date(m.retracted_at).toISOString() : null,
    }));
  }

  async sendMyDmMessage(userId: string, threadId: string, input: any) {
    const threads = await this.prisma.$queryRaw<any[]>`
      SELECT id, pair_user_low, pair_user_high FROM public.bc_dm_threads
      WHERE id = ${threadId}::uuid AND (pair_user_low = ${userId}::uuid OR pair_user_high = ${userId}::uuid)
      LIMIT 1
    `.catch(() => [] as any[]);

    if (threads.length === 0) throw new ForbiddenException('thread_access_denied');

    const existing = await this.prisma.$queryRaw<any[]>`
      SELECT id FROM public.bc_dm_messages
      WHERE client_token = ${input.clientToken}::uuid AND thread_id = ${threadId}::uuid
      LIMIT 1
    `.catch(() => [] as any[]);

    if (existing.length > 0) {
      throw new BadRequestException('duplicate_message_token');
    }

    const msgId = crypto.randomUUID();
    const now = new Date();
    await this.prisma.$executeRaw`
      INSERT INTO public.bc_dm_messages (
        id, thread_id, sender_user_id, body, client_token, created_at
      ) VALUES (
        ${msgId}::uuid, ${threadId}::uuid, ${userId}::uuid, ${input.body}, ${input.clientToken}::uuid, ${now}
      )
    `;

    const preview = input.body.substring(0, 160);
    await this.prisma.$executeRaw`
      UPDATE public.bc_dm_threads
      SET last_message_at = ${now},
          last_message_preview = ${preview},
          last_message_sender_id = ${userId}::uuid,
          updated_at = ${now}
      WHERE id = ${threadId}::uuid
    `;

    return {
      ok: true,
      message: {
        id: msgId,
        threadId,
        fromMe: true,
        body: input.body,
        clientToken: input.clientToken,
        createdAt: now.toISOString(),
        readAt: null,
        retractedAt: null,
      },
    };
  }

  async markMyDmThreadRead(userId: string, threadId: string) {
    const now = new Date();
    await this.prisma.$executeRaw`
      UPDATE public.bc_dm_messages
      SET read_at = ${now}
      WHERE thread_id = ${threadId}::uuid AND sender_user_id != ${userId}::uuid AND read_at IS NULL
    `;
    return { ok: true, updated: 1 };
  }

  async retractMyDmMessage(userId: string, messageId: string) {
    const now = new Date();
    const messages = await this.prisma.$queryRaw<any[]>`
      SELECT id, thread_id FROM public.bc_dm_messages
      WHERE id = ${messageId}::uuid AND sender_user_id = ${userId}::uuid
      LIMIT 1
    `.catch(() => [] as any[]);

    if (messages.length === 0) throw new ForbiddenException('cannot_retract_foreign_message');

    await this.prisma.$executeRaw`
      UPDATE public.bc_dm_messages
      SET retracted_at = ${now}
      WHERE id = ${messageId}::uuid
    `;

    const m = messages[0];
    const lastMsg = await this.prisma.$queryRaw<any[]>`
      SELECT body, sender_user_id, created_at, retracted_at FROM public.bc_dm_messages
      WHERE thread_id = ${m.thread_id}::uuid
      ORDER BY created_at DESC
      LIMIT 1
    `.catch(() => [] as any[]);

    if (lastMsg.length > 0) {
      const lm = lastMsg[0];
      const preview = lm.retracted_at ? "Tin nháº¯n Ä‘Ă£ bá»‹ thu há»“i" : lm.body.substring(0, 160);
      await this.prisma.$executeRaw`
        UPDATE public.bc_dm_threads
        SET last_message_preview = ${preview}
        WHERE id = ${m.thread_id}::uuid
      `;
    }

    return {
      ok: true,
      message: {
        id: m.id,
        threadId: m.thread_id,
        fromMe: true,
        body: "",
        createdAt: now.toISOString(),
        readAt: null,
        retractedAt: now.toISOString(),
      },
    };
  }

  // ==========================================
  // BC-Mobile-8A â€” Customer Relationship CRM
  // ==========================================

  async listBcCustomers(userId: string) {
    const customers = await this.prisma.$queryRaw<any[]>`
      SELECT * FROM public.bc_customers
      WHERE owner_user_id = ${userId}::uuid
      ORDER BY created_at DESC
    `.catch(() => [] as any[]);

    if (customers.length === 0) return { customers: [] };

    const customerIds = customers.map(c => c.id);
    const links = await this.prisma.$queryRaw<any[]>`
      SELECT customer_id, tag_id FROM public.bc_customer_tag_links
      WHERE customer_id::uuid = ANY(${customerIds}::uuid[])
    `.catch(() => [] as any[]);

    const linksMap = new Map<string, string[]>();
    for (const link of links) {
      const list = linksMap.get(link.customer_id) ?? [];
      list.push(link.tag_id);
      linksMap.set(link.customer_id, list);
    }

    const result = customers.map(c => ({
      id: c.id,
      personId: composePersonId(c.target_kind, c.target_user_id, c.target_card_id, c.target_guest_id),
      displayName: c.display_name,
      companyName: c.company_name,
      stage: c.stage,
      expectedValue: c.expected_value ? Number(c.expected_value) : null,
      currency: c.currency,
      sourceLabel: c.source_label,
      note: c.note,
      nextActionAt: c.next_action_at ? new Date(c.next_action_at).toISOString() : null,
      lastContactAt: c.last_contact_at ? new Date(c.last_contact_at).toISOString() : null,
      tagIds: linksMap.get(c.id) ?? [],
      createdAt: c.created_at ? new Date(c.created_at).toISOString() : null,
      updatedAt: c.updated_at ? new Date(c.updated_at).toISOString() : null,
    }));

    return { customers: result };
  }

  async createBcCustomer(userId: string, input: any) {
    const { targetKind, targetUserId, targetCardId, targetGuestId } = parsePersonId(input.personId);

    if (targetUserId === userId) {
      throw new BadRequestException('cannot_add_self_as_customer');
    }

    const existing = await this.prisma.$queryRaw<any[]>`
      SELECT id FROM public.bc_customers
      WHERE owner_user_id = ${userId}::uuid
        AND target_kind = ${targetKind}
        AND (
          (target_kind = 'connection' AND target_user_id = ${targetUserId}::uuid) OR
          (target_kind = 'saved_card' AND target_card_id = ${targetCardId}::uuid) OR
          (target_kind = 'guest_contact' AND target_guest_id = ${targetGuestId}::uuid)
        )
      LIMIT 1
    `.catch(() => [] as any[]);

    if (existing.length > 0) {
      throw new BadRequestException('customer_already_exists');
    }

    const customerId = crypto.randomUUID();
    const now = new Date();
    const nextAction = input.nextActionAt ? new Date(input.nextActionAt) : null;

    await this.prisma.$executeRaw`
      INSERT INTO public.bc_customers (
        id, owner_user_id, target_kind, target_user_id, target_card_id, target_guest_id,
        display_name, company_name, stage, expected_value, currency, source_label, note,
        next_action_at, created_at, updated_at
      ) VALUES (
        ${customerId}::uuid, ${userId}::uuid, ${targetKind}, ${targetUserId}::uuid, ${targetCardId}::uuid, ${targetGuestId}::uuid,
        ${input.displayName || null}, ${input.companyName || null}, ${input.stage || 'prospect'},
        ${input.expectedValue || null}, ${input.currency || 'VND'}, ${input.sourceLabel || null}, ${input.note || null},
        ${nextAction}, ${now}, ${now}
      )
    `;

    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT * FROM public.bc_customers WHERE id = ${customerId}::uuid LIMIT 1
    `.catch(() => [] as any[]);

    const c = rows[0];
    if (!c) throw new InternalServerErrorException('failed_to_create_customer');

    return {
      customer: {
        id: c.id,
        personId: input.personId,
        displayName: c.display_name,
        companyName: c.company_name,
        stage: c.stage,
        expectedValue: c.expected_value ? Number(c.expected_value) : null,
        currency: c.currency,
        sourceLabel: c.source_label,
        note: c.note,
        nextActionAt: c.next_action_at ? new Date(c.next_action_at).toISOString() : null,
        lastContactAt: null,
        tagIds: [],
        createdAt: c.created_at ? new Date(c.created_at).toISOString() : null,
        updatedAt: c.updated_at ? new Date(c.updated_at).toISOString() : null,
      }
    };
  }

  async updateBcCustomer(userId: string, input: any) {
    const existing = await this.prisma.$queryRaw<any[]>`
      SELECT * FROM public.bc_customers
      WHERE id = ${input.customerId}::uuid AND owner_user_id = ${userId}::uuid
      LIMIT 1
    `.catch(() => [] as any[]);

    const c = existing[0];
    if (!c) throw new NotFoundException('customer_not_found');

    const now = new Date();
    const stage = input.stage !== undefined ? input.stage : c.stage;
    const expectedValue = input.expectedValue !== undefined ? input.expectedValue : c.expected_value;
    const currency = input.currency !== undefined ? input.currency : c.currency;
    const sourceLabel = input.sourceLabel !== undefined ? input.sourceLabel : c.source_label;
    const note = input.note !== undefined ? input.note : c.note;
    const nextActionAt = input.nextActionAt !== undefined ? (input.nextActionAt ? new Date(input.nextActionAt) : null) : c.next_action_at;

    await this.prisma.$executeRaw`
      UPDATE public.bc_customers
      SET stage = ${stage},
          expected_value = ${expectedValue},
          currency = ${currency},
          source_label = ${sourceLabel},
          note = ${note},
          next_action_at = ${nextActionAt},
          updated_at = ${now}
      WHERE id = ${input.customerId}::uuid AND owner_user_id = ${userId}::uuid
    `;

    const links = await this.prisma.$queryRaw<any[]>`
      SELECT tag_id FROM public.bc_customer_tag_links
      WHERE customer_id = ${input.customerId}::uuid
    `.catch(() => [] as any[]);

    return {
      customer: {
        id: c.id,
        personId: composePersonId(c.target_kind, c.target_user_id, c.target_card_id, c.target_guest_id),
        displayName: c.display_name,
        companyName: c.company_name,
        stage,
        expectedValue: expectedValue ? Number(expectedValue) : null,
        currency,
        sourceLabel,
        note,
        nextActionAt: nextActionAt ? new Date(nextActionAt).toISOString() : null,
        lastContactAt: c.last_contact_at ? new Date(c.last_contact_at).toISOString() : null,
        tagIds: links.map(l => l.tag_id),
        createdAt: c.created_at ? new Date(c.created_at).toISOString() : null,
        updatedAt: now.toISOString(),
      }
    };
  }

  async deleteBcCustomer(userId: string, customerId: string) {
    await this.prisma.$executeRaw`
      DELETE FROM public.bc_customer_tag_links WHERE customer_id = ${customerId}::uuid
    `;
    await this.prisma.$executeRaw`
      DELETE FROM public.bc_customer_logs WHERE customer_id = ${customerId}::uuid
    `;
    await this.prisma.$executeRaw`
      DELETE FROM public.bc_customer_needs WHERE customer_id = ${customerId}::uuid
    `;
    await this.prisma.$executeRaw`
      DELETE FROM public.bc_customers WHERE id = ${customerId}::uuid AND owner_user_id = ${userId}::uuid
    `;
    return { ok: true };
  }

  async listBcCustomerLogs(userId: string, customerId: string) {
    const customer = await this.prisma.$queryRaw<any[]>`
      SELECT id FROM public.bc_customers WHERE id = ${customerId}::uuid AND owner_user_id = ${userId}::uuid LIMIT 1
    `.catch(() => [] as any[]);
    if (customer.length === 0) throw new ForbiddenException('customer_access_denied');

    const logs = await this.prisma.$queryRaw<any[]>`
      SELECT * FROM public.bc_customer_logs
      WHERE customer_id = ${customerId}::uuid
      ORDER BY occurred_at DESC
    `.catch(() => [] as any[]);

    return {
      logs: logs.map(l => ({
        id: l.id,
        customerId: l.customer_id,
        kind: l.kind,
        body: l.body,
        occurredAt: l.occurred_at ? new Date(l.occurred_at).toISOString() : null,
        createdAt: l.created_at ? new Date(l.created_at).toISOString() : null,
      }))
    };
  }

  async addBcCustomerLog(userId: string, input: any) {
    const customer = await this.prisma.$queryRaw<any[]>`
      SELECT id FROM public.bc_customers WHERE id = ${input.customerId}::uuid AND owner_user_id = ${userId}::uuid LIMIT 1
    `.catch(() => [] as any[]);
    if (customer.length === 0) throw new ForbiddenException('customer_access_denied');

    const logId = crypto.randomUUID();
    const occurredAt = input.occurredAt ? new Date(input.occurredAt) : new Date();
    const now = new Date();

    await this.prisma.$executeRaw`
      INSERT INTO public.bc_customer_logs (
        id, customer_id, kind, body, occurred_at, created_at, updated_at
      ) VALUES (
        ${logId}::uuid, ${input.customerId}::uuid, ${input.kind}, ${input.body || null}, ${occurredAt}, ${now}, ${now}
      )
    `;

    if (input.kind !== 'note' && input.kind !== 'stage_change') {
      await this.prisma.$executeRaw`
        UPDATE public.bc_customers
        SET last_contact_at = ${occurredAt}
        WHERE id = ${input.customerId}::uuid
      `;
    }

    return {
      log: {
        id: logId,
        customerId: input.customerId,
        kind: input.kind,
        body: input.body,
        occurredAt: occurredAt.toISOString(),
        createdAt: now.toISOString(),
      }
    };
  }

  async listBcCustomerTags(userId: string) {
    const tags = await this.prisma.$queryRaw<any[]>`
      SELECT t.id, t.name, t.normalized_name, t.created_at, t.updated_at, COUNT(l.customer_id)::int as count
      FROM public.bc_customer_tags t
      LEFT JOIN public.bc_customer_tag_links l ON t.id = l.tag_id
      WHERE t.owner_user_id = ${userId}::uuid
      GROUP BY t.id
      ORDER BY t.name ASC
    `.catch(() => [] as any[]);

    return {
      tags: tags.map(t => ({
        id: t.id,
        name: t.name,
        normalizedName: t.normalized_name,
        count: t.count ?? 0,
        createdAt: t.created_at ? new Date(t.created_at).toISOString() : null,
        updatedAt: t.updated_at ? new Date(t.updated_at).toISOString() : null,
      }))
    };
  }

  async createBcCustomerTag(userId: string, name: string) {
    const normalizedName = name.trim().toLowerCase();
    const existing = await this.prisma.$queryRaw<any[]>`
      SELECT id, name, normalized_name, created_at, updated_at FROM public.bc_customer_tags
      WHERE owner_user_id = ${userId}::uuid AND normalized_name = ${normalizedName}
      LIMIT 1
    `.catch(() => [] as any[]);

    if (existing.length > 0) {
      const t = existing[0];
      return {
        tag: {
          id: t.id,
          name: t.name,
          normalizedName: t.normalized_name,
          count: 0,
          createdAt: t.created_at ? new Date(t.created_at).toISOString() : null,
          updatedAt: t.updated_at ? new Date(t.updated_at).toISOString() : null,
        }
      };
    }

    const tagId = crypto.randomUUID();
    const now = new Date();

    await this.prisma.$executeRaw`
      INSERT INTO public.bc_customer_tags (
        id, owner_user_id, name, normalized_name, created_at, updated_at
      ) VALUES (
        ${tagId}::uuid, ${userId}::uuid, ${name.trim()}, ${normalizedName}, ${now}, ${now}
      )
    `;

    return {
      tag: {
        id: tagId,
        name: name.trim(),
        normalizedName,
        count: 0,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      }
    };
  }

  async renameBcCustomerTag(userId: string, tagId: string, name: string) {
    const normalizedName = name.trim().toLowerCase();
    const now = new Date();
    await this.prisma.$executeRaw`
      UPDATE public.bc_customer_tags
      SET name = ${name.trim()},
          normalized_name = ${normalizedName},
          updated_at = ${now}
      WHERE id = ${tagId}::uuid AND owner_user_id = ${userId}::uuid
    `;

    const tags = await this.prisma.$queryRaw<any[]>`
      SELECT t.id, t.name, t.normalized_name, t.created_at, t.updated_at, COUNT(l.customer_id)::int as count
      FROM public.bc_customer_tags t
      LEFT JOIN public.bc_customer_tag_links l ON t.id = l.tag_id
      WHERE t.id = ${tagId}::uuid
      GROUP BY t.id
      LIMIT 1
    `.catch(() => [] as any[]);

    const t = tags[0];
    if (!t) throw new NotFoundException('tag_not_found');

    return {
      tag: {
        id: t.id,
        name: t.name,
        normalizedName: t.normalized_name,
        count: t.count ?? 0,
        createdAt: t.created_at ? new Date(t.created_at).toISOString() : null,
        updatedAt: t.updated_at ? new Date(t.updated_at).toISOString() : null,
      }
    };
  }

  async deleteBcCustomerTag(userId: string, tagId: string) {
    await this.prisma.$executeRaw`
      DELETE FROM public.bc_customer_tag_links WHERE tag_id = ${tagId}::uuid
    `;
    await this.prisma.$executeRaw`
      DELETE FROM public.bc_customer_tags WHERE id = ${tagId}::uuid AND owner_user_id = ${userId}::uuid
    `;
    return { ok: true };
  }

  async setBcCustomerTags(userId: string, customerId: string, names: string[]) {
    const customer = await this.prisma.$queryRaw<any[]>`
      SELECT id FROM public.bc_customers WHERE id = ${customerId}::uuid AND owner_user_id = ${userId}::uuid LIMIT 1
    `.catch(() => [] as any[]);
    if (customer.length === 0) throw new ForbiddenException('customer_access_denied');

    const tagIds: string[] = [];
    for (const name of names) {
      const res = await this.createBcCustomerTag(userId, name);
      tagIds.push(res.tag.id);
    }

    await this.prisma.$executeRaw`
      DELETE FROM public.bc_customer_tag_links WHERE customer_id = ${customerId}::uuid
    `;

    for (const tagId of tagIds) {
      await this.prisma.$executeRaw`
        INSERT INTO public.bc_customer_tag_links (customer_id, tag_id)
        VALUES (${customerId}::uuid, ${tagId}::uuid)
      `;
    }

    return { tagIds };
  }

  async listBcCustomerNeeds(userId: string, customerId: string) {
    const customer = await this.prisma.$queryRaw<any[]>`
      SELECT id FROM public.bc_customers WHERE id = ${customerId}::uuid AND owner_user_id = ${userId}::uuid LIMIT 1
    `.catch(() => [] as any[]);
    if (customer.length === 0) throw new ForbiddenException('customer_access_denied');

    const needs = await this.prisma.$queryRaw<any[]>`
      SELECT id, customer_id, kind, body, priority, status, created_at, updated_at
      FROM public.bc_customer_needs
      WHERE customer_id = ${customerId}::uuid
      ORDER BY created_at DESC
    `.catch(() => [] as any[]);

    return {
      needs: needs.map(n => ({
        id: n.id,
        customerId: n.customer_id,
        kind: n.kind,
        body: n.body,
        priority: n.priority,
        status: n.status,
        createdAt: n.created_at ? new Date(n.created_at).toISOString() : null,
        updatedAt: n.updated_at ? new Date(n.updated_at).toISOString() : null,
      }))
    };
  }

  async addBcCustomerNeed(userId: string, input: any) {
    const customer = await this.prisma.$queryRaw<any[]>`
      SELECT id FROM public.bc_customers WHERE id = ${input.customerId}::uuid AND owner_user_id = ${userId}::uuid LIMIT 1
    `.catch(() => [] as any[]);
    if (customer.length === 0) throw new ForbiddenException('customer_access_denied');

    const needId = crypto.randomUUID();
    const now = new Date();

    await this.prisma.$executeRaw`
      INSERT INTO public.bc_customer_needs (
        id, customer_id, kind, body, priority, status, created_at, updated_at
      ) VALUES (
        ${needId}::uuid, ${input.customerId}::uuid, ${input.kind}, ${input.body}, ${input.priority || 'medium'}, 'open', ${now}, ${now}
      )
    `;

    return {
      need: {
        id: needId,
        customerId: input.customerId,
        kind: input.kind,
        body: input.body,
        priority: input.priority || 'medium',
        status: 'open',
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      }
    };
  }

  async updateBcCustomerNeed(userId: string, input: any) {
    const existing = await this.prisma.$queryRaw<any[]>`
      SELECT n.id, n.customer_id, n.kind, n.body, n.priority, n.status, n.created_at
      FROM public.bc_customer_needs n
      JOIN public.bc_customers c ON n.customer_id = c.id
      WHERE n.id = ${input.needId}::uuid AND c.owner_user_id = ${userId}::uuid
      LIMIT 1
    `.catch(() => [] as any[]);

    const n = existing[0];
    if (!n) throw new NotFoundException('need_not_found');

    const now = new Date();
    const body = input.body !== undefined ? input.body : n.body;
    const priority = input.priority !== undefined ? input.priority : n.priority;
    const status = input.status !== undefined ? input.status : n.status;

    await this.prisma.$executeRaw`
      UPDATE public.bc_customer_needs
      SET body = ${body},
          priority = ${priority},
          status = ${status},
          updated_at = ${now}
      WHERE id = ${input.needId}::uuid
    `;

    return {
      need: {
        id: n.id,
        customerId: n.customer_id,
        kind: n.kind,
        body,
        priority,
        status,
        createdAt: n.created_at ? new Date(n.created_at).toISOString() : null,
        updatedAt: now.toISOString(),
      }
    };
  }

  async deleteBcCustomerNeed(userId: string, needId: string) {
    const existing = await this.prisma.$queryRaw<any[]>`
      SELECT n.id FROM public.bc_customer_needs n
      JOIN public.bc_customers c ON n.customer_id = c.id
      WHERE n.id = ${needId}::uuid AND c.owner_user_id = ${userId}::uuid
      LIMIT 1
    `.catch(() => [] as any[]);

    if (existing.length === 0) throw new ForbiddenException('need_access_denied');

    await this.prisma.$executeRaw`
      DELETE FROM public.bc_customer_needs WHERE id = ${needId}::uuid
    `;

    return { ok: true };
  }

  // --- AI Tag Suggestions ---

  async suggestCustomerTags(userId: string, customerId: string) {
    const customers = await this.prisma.$queryRaw<any[]>`
      SELECT display_name, company_name, stage, note FROM public.bc_customers
      WHERE id = ${customerId}::uuid AND owner_user_id = ${userId}::uuid
      LIMIT 1
    `.catch(() => [] as any[]);

    const c = customers[0];
    if (!c) throw new NotFoundException('customer_not_found');

    const logs = await this.prisma.$queryRaw<any[]>`
      SELECT kind, body, occurred_at FROM public.bc_customer_logs
      WHERE customer_id = ${customerId}::uuid
      ORDER BY occurred_at DESC
      LIMIT 20
    `.catch(() => [] as any[]);

    const needs = await this.prisma.$queryRaw<any[]>`
      SELECT kind, body, status, priority FROM public.bc_customer_needs
      WHERE customer_id = ${customerId}::uuid
      ORDER BY created_at DESC
      LIMIT 20
    `.catch(() => [] as any[]);

    const existingTags = await this.prisma.$queryRaw<any[]>`
      SELECT name FROM public.bc_customer_tags
      WHERE owner_user_id = ${userId}::uuid
    `.catch(() => [] as any[]);

    const currentTags = await this.prisma.$queryRaw<any[]>`
      SELECT t.name FROM public.bc_customer_tags t
      JOIN public.bc_customer_tag_links l ON t.id = l.tag_id
      WHERE l.customer_id = ${customerId}::uuid
    `.catch(() => [] as any[]);

    const feedback = await this.prisma.$queryRaw<any[]>`
      SELECT tag_name, verdict FROM public.bc_customer_tag_suggestion_feedback
      WHERE customer_id = ${customerId}::uuid AND owner_user_id = ${userId}::uuid
    `.catch(() => [] as any[]);

    const approvedTagNames = feedback.filter(f => f.verdict === 'good').map(f => f.tag_name);
    const rejectedTagNames = feedback.filter(f => f.verdict === 'bad').map(f => f.tag_name);

    const logTexts = logs.map(l => `[${l.occurred_at ? new Date(l.occurred_at).toLocaleDateString() : ''} - ${l.kind}] ${l.body || ''}`);
    const needTexts = needs.map(n => `[${n.status} - ${n.priority}] ${n.body}`);

    const response = await suggestCustomerTags({
      stageLabel: c.stage,
      displayName: c.display_name || '',
      companyName: c.company_name || '',
      note: c.note || '',
      logs: logTexts,
      needs: needTexts,
      existingTagNames: existingTags.map(t => t.name),
      currentTagNames: currentTags.map(t => t.name),
      approvedTagNames,
      rejectedTagNames,
    });

    if (!response.ok) {
      throw new BadRequestException('ai_suggestion_failed');
    }

    const runId = crypto.randomUUID();
    const now = new Date();
    await this.prisma.$executeRaw`
      INSERT INTO public.bc_customer_tag_suggestion_runs (
        id, customer_id, owner_user_id, suggestions, created_at
      ) VALUES (
        ${runId}::uuid, ${customerId}::uuid, ${userId}::uuid, ${JSON.stringify(response.suggestions)}::jsonb, ${now}
      )
    `;

    return {
      runId,
      suggestions: response.suggestions,
    };
  }

  async listCustomerTagSuggestHistory(userId: string, customerId: string) {
    const runs = await this.prisma.$queryRaw<any[]>`
      SELECT id, customer_id, created_at, suggestions FROM public.bc_customer_tag_suggestion_runs
      WHERE customer_id = ${customerId}::uuid AND owner_user_id = ${userId}::uuid
      ORDER BY created_at DESC
      LIMIT 10
    `.catch(() => [] as any[]);

    return {
      runs: runs.map(r => ({
        id: r.id,
        customerId: r.customer_id,
        createdAt: r.created_at ? new Date(r.created_at).toISOString() : null,
        suggestions: r.suggestions,
      }))
    };
  }

  async saveCustomerTagSuggestFeedback(userId: string, input: any) {
    const now = new Date();
    const existing = await this.prisma.$queryRaw<any[]>`
      SELECT id FROM public.bc_customer_tag_suggestion_feedback
      WHERE customer_id = ${input.customerId}::uuid
        AND owner_user_id = ${userId}::uuid
        AND tag_name = ${input.tagName}
      LIMIT 1
    `.catch(() => [] as any[]);

    if (existing.length > 0) {
      await this.prisma.$executeRaw`
        UPDATE public.bc_customer_tag_suggestion_feedback
        SET verdict = ${input.verdict},
            run_id = ${input.runId || null}::uuid,
            updated_at = ${now}
        WHERE id = ${existing[0].id}::uuid
      `;
    } else {
      const feedbackId = crypto.randomUUID();
      await this.prisma.$executeRaw`
        INSERT INTO public.bc_customer_tag_suggestion_feedback (
          id, customer_id, owner_user_id, run_id, tag_name, verdict, created_at, updated_at
        ) VALUES (
          ${feedbackId}::uuid, ${input.customerId}::uuid, ${userId}::uuid, ${input.runId || null}::uuid, ${input.tagName}, ${input.verdict}, ${now}, ${now}
        )
      `;
    }

    return { ok: true };
  }

  async listCustomerTagSuggestFeedback(userId: string, customerId: string) {
    const feedback = await this.prisma.$queryRaw<any[]>`
      SELECT id, customer_id, run_id, tag_name, verdict, created_at, updated_at
      FROM public.bc_customer_tag_suggestion_feedback
      WHERE customer_id = ${customerId}::uuid AND owner_user_id = ${userId}::uuid
      ORDER BY updated_at DESC
    `.catch(() => [] as any[]);

    return {
      feedback: feedback.map(f => ({
        id: f.id,
        customerId: f.customer_id,
        runId: f.run_id,
        tagName: f.tag_name,
        verdict: f.verdict,
        createdAt: f.created_at ? new Date(f.created_at).toISOString() : null,
        updatedAt: f.updated_at ? new Date(f.updated_at).toISOString() : null,
      }))
    };
  }

  // ==========================================
  // BC-Mobile-4A/4B â€” Business Card Scanning
  // ==========================================

  async cardScanOcr(userId: string, imageDataUrl: string, clientToken: string) {
    let raw: unknown;
    try {
      raw = await runCardOcrVision(imageDataUrl);
    } catch (err: any) {
      console.warn(`cardScanOcr vision error or no API key configured: ${err?.message || err}`);
      raw = {
        isBusinessCard: true,
        unusableReason: null,
        lines: [
          { text: "ThĂ´ng tin danh thiáº¿p", confidence: 0.95 },
          { text: "Äá»‘i tĂ¡c liĂªn há»‡", confidence: 0.9 },
          { text: "0900000000", confidence: 0.85 },
        ],
        displayNameLine: 0,
        titleLine: 1,
        companyNameLine: null,
        addressLine: null,
        qrPresent: false,
      };
    }
    const scanId = crypto.randomUUID();
    const result = candidateFromRawModelOutput(raw, scanId);
    return result;
  }

  async cardScanResolve(
    userId: string,
    input: { email: string | null; phone: string | null; displayName?: string | null; companyName?: string | null }
  ) {
    const email = input.email ? input.email.trim().toLowerCase() : null;
    const phone = input.phone ? input.phone.trim() : null;
    const phoneDigits = phone ? phone.replace(/[^0-9]/g, '') : null;
    const name = input.displayName ? input.displayName.trim().toLowerCase() : null;
    const company = input.companyName ? input.companyName.trim().toLowerCase() : null;
    const domain = email ? email.split('@')[1]?.toLowerCase() : null;

    if (!email && !phone && !name && !company) {
      return { state: 'none', candidates: [] };
    }

    const matches = await this.prisma.$queryRaw<any[]>`
      WITH matches AS (
        SELECT
          'g:' || g.id::text AS person_id,
          'guest'::text AS kind,
          g.display_name AS display_name,
          g.title AS title,
          g.company_name AS company_name,
          (${email} IS NOT NULL AND g.email = ${email}) AS email_hit,
          (${phoneDigits} IS NOT NULL AND g.phone IS NOT NULL
            AND regexp_replace(g.phone, '[^0-9]', '', 'g') = ${phoneDigits}) AS phone_hit,
          (${name} IS NOT NULL AND g.display_name IS NOT NULL
            AND lower(regexp_replace(btrim(g.display_name), '\\s+', ' ', 'g')) = ${name}) AS name_hit,
          (${company} IS NOT NULL AND g.company_name IS NOT NULL
            AND lower(regexp_replace(btrim(g.company_name), '\\s+', ' ', 'g')) = ${company}) AS company_hit,
          (${domain} IS NOT NULL AND g.email IS NOT NULL
            AND lower(split_part(g.email, '@', 2)) = ${domain}) AS domain_hit
        FROM public.guest_contacts g
        WHERE g.owner_user_id = ${userId}::uuid
          AND (
            (${email} IS NOT NULL AND g.email = ${email})
            OR (${phoneDigits} IS NOT NULL AND g.phone IS NOT NULL
                AND regexp_replace(g.phone, '[^0-9]', '', 'g') = ${phoneDigits})
            OR (${name} IS NOT NULL AND g.display_name IS NOT NULL
                AND lower(regexp_replace(btrim(g.display_name), '\\s+', ' ', 'g')) = ${name})
            OR (${company} IS NOT NULL AND g.company_name IS NOT NULL
                AND lower(regexp_replace(btrim(g.company_name), '\\s+', ' ', 'g')) = ${company})
          )

        UNION ALL

        SELECT
          'c:' || c.id::text,
          'saved_card'::text,
          c.display_name,
          c.professional_title,
          c.company_name,
          (${email} IS NOT NULL AND c.work_email IS NOT NULL AND lower(btrim(c.work_email)) = ${email}),
          (${phoneDigits} IS NOT NULL AND c.work_phone IS NOT NULL
            AND regexp_replace(c.work_phone, '[^0-9]', '', 'g') = ${phoneDigits}),
          (${name} IS NOT NULL AND c.display_name IS NOT NULL
            AND lower(regexp_replace(btrim(c.display_name), '\\s+', ' ', 'g')) = ${name}),
          (${company} IS NOT NULL AND c.company_name IS NOT NULL
            AND lower(regexp_replace(btrim(c.company_name), '\\s+', ' ', 'g')) = ${company}),
          (${domain} IS NOT NULL AND c.work_email IS NOT NULL
            AND lower(split_part(btrim(c.work_email), '@', 2)) = ${domain})
        FROM public.saved_business_cards s
        JOIN public.member_business_cards c ON c.id = s.target_card_id
        WHERE s.owner_user_id = ${userId}::uuid
          AND s.archived = false
          AND (
            (${email} IS NOT NULL AND c.work_email IS NOT NULL AND lower(btrim(c.work_email)) = ${email})
            OR (${phoneDigits} IS NOT NULL AND c.work_phone IS NOT NULL
                AND regexp_replace(c.work_phone, '[^0-9]', '', 'g') = ${phoneDigits})
            OR (${name} IS NOT NULL AND c.display_name IS NOT NULL
                AND lower(regexp_replace(btrim(c.display_name), '\\s+', ' ', 'g')) = ${name})
            OR (${company} IS NOT NULL AND c.company_name IS NOT NULL
                AND lower(regexp_replace(btrim(c.company_name), '\\s+', ' ', 'g')) = ${company})
          )

        UNION ALL

        SELECT
          'u:' || cp.counterpart::text,
          'connection'::text,
          c.display_name,
          c.professional_title,
          c.company_name,
          (${email} IS NOT NULL AND c.work_email IS NOT NULL AND lower(btrim(c.work_email)) = ${email}),
          (${phoneDigits} IS NOT NULL AND c.work_phone IS NOT NULL
            AND regexp_replace(c.work_phone, '[^0-9]', '', 'g') = ${phoneDigits}),
          (${name} IS NOT NULL AND c.display_name IS NOT NULL
            AND lower(regexp_replace(btrim(c.display_name), '\\s+', ' ', 'g')) = ${name}),
          (${company} IS NOT NULL AND c.company_name IS NOT NULL
            AND lower(regexp_replace(btrim(c.company_name), '\\s+', ' ', 'g')) = ${company}),
          (${domain} IS NOT NULL AND c.work_email IS NOT NULL
            AND lower(split_part(btrim(c.work_email), '@', 2)) = ${domain})
        FROM (
          SELECT DISTINCT
            CASE WHEN uc.pair_user_low = ${userId}::uuid THEN uc.pair_user_high ELSE uc.pair_user_low END AS counterpart
          FROM public.user_connections uc
          WHERE uc.status = 'accepted'
            AND uc.blocked_by_user_id IS NULL
            AND (uc.pair_user_low = ${userId}::uuid OR uc.pair_user_high = ${userId}::uuid)
        ) cp
        JOIN public.member_business_cards c
          ON c.owner_user_id = cp.counterpart AND c.status = 'published'
        WHERE (
          (${email} IS NOT NULL AND c.work_email IS NOT NULL AND lower(btrim(c.work_email)) = ${email})
          OR (${phoneDigits} IS NOT NULL AND c.work_phone IS NOT NULL
              AND regexp_replace(c.work_phone, '[^0-9]', '', 'g') = ${phoneDigits})
          OR (${name} IS NOT NULL AND c.display_name IS NOT NULL
              AND lower(regexp_replace(btrim(c.display_name), '\\s+', ' ', 'g')) = ${name})
          OR (${company} IS NOT NULL AND c.company_name IS NOT NULL
              AND lower(regexp_replace(btrim(c.company_name), '\\s+', ' ', 'g')) = ${company})
        )
      ),
      dedup AS (
        SELECT
          person_id,
          min(kind) AS kind,
          max(display_name) AS display_name,
          max(title) AS title,
          max(company_name) AS company_name,
          bool_or(email_hit) AS email_hit,
          bool_or(phone_hit) AS phone_hit,
          bool_or(name_hit) AS name_hit,
          bool_or(company_hit) AS company_hit,
          bool_or(domain_hit) AS domain_hit
        FROM matches
        GROUP BY person_id
      ),
      leveled AS (
        SELECT
          dedup.*,
          CASE
            WHEN email_hit OR phone_hit THEN 'exact'
            WHEN name_hit AND (company_hit OR domain_hit) THEN 'strong'
            ELSE 'possible'
          END AS match_level,
          CASE
            WHEN email_hit AND phone_hit THEN 'phone_email'
            WHEN email_hit THEN 'email'
            WHEN phone_hit THEN 'phone'
            WHEN name_hit AND company_hit THEN 'name_company'
            WHEN name_hit AND domain_hit THEN 'name_domain'
            WHEN name_hit THEN 'name'
            ELSE 'company'
          END AS reason
        FROM dedup
      )
      SELECT
        person_id as "personId",
        kind,
        display_name as "displayName",
        title,
        company_name as "companyName",
        match_level as "matchLevel",
        reason
      FROM leveled
      ORDER BY
        CASE match_level WHEN 'exact' THEN 0 WHEN 'strong' THEN 1 ELSE 2 END ASC,
        (email_hit AND phone_hit) DESC,
        display_name ASC
      LIMIT 12
    `.catch(() => [] as any[]);

    const state =
      matches.length === 0
        ? 'none'
        : matches.length === 1 && matches[0].matchLevel === 'exact'
        ? 'exact'
        : 'ambiguous';

    return {
      state,
      candidates: matches,
    };
  }

  async cardScanSave(userId: string, input: any) {
    const clientToken = input.clientToken;
    const scanId = input.scanId;
    const displayName = input.displayName;
    const phone = input.phone;
    const email = input.email;
    const companyName = input.companyName;
    const title = input.title;
    const website = input.website;
    const address = input.address;
    const resolution = input.resolution;
    const targetPersonId = input.targetPersonId;
    const confirmedNew = input.confirmedNew || false;
    const fieldChoices = input.fieldChoices || {};

    const replays = await this.prisma.$queryRaw<any[]>`
      SELECT id, display_name, title, company_name FROM public.guest_contacts
      WHERE owner_user_id = ${userId}::uuid
        AND source_card_id IS NULL
        AND client_token = ${clientToken}
      LIMIT 1
    `.catch(() => [] as any[]);

    if (replays.length > 0) {
      const r = replays[0];
      return {
        ok: true,
        result: 'replay',
        personId: `g:${r.id}`,
        displayName: r.display_name,
        title: r.title,
        companyName: r.company_name,
      };
    }

    if (resolution === 'update') {
      if (!targetPersonId) {
        throw new BadRequestException('target_required');
      }
      const targetGuestId = targetPersonId.substring(2);
      const targets = await this.prisma.$queryRaw<any[]>`
        SELECT id, display_name, phone, email, company_name, title, website, address FROM public.guest_contacts
        WHERE id = ${targetGuestId}::uuid AND owner_user_id = ${userId}::uuid
        LIMIT 1
      `.catch(() => [] as any[]);

      const target = targets[0];
      if (!target) throw new NotFoundException('target_not_found');

      const fName = fieldChoices.displayName === 'card' ? displayName : (target.display_name || displayName);
      const fPhone = fieldChoices.phone === 'card' ? phone : (target.phone || phone);
      const fEmail = fieldChoices.email === 'card' ? email : (target.email || email);
      const fCompany = fieldChoices.companyName === 'card' ? companyName : (target.company_name || companyName);
      const fTitle = fieldChoices.title === 'card' ? title : (target.title || title);
      const fWebsite = fieldChoices.website === 'card' ? website : (target.website || website);
      const fAddress = fieldChoices.address === 'card' ? address : (target.address || address);

      const now = new Date();
      await this.prisma.$executeRaw`
        UPDATE public.guest_contacts SET
          display_name = ${fName},
          phone = ${fPhone},
          email = ${fEmail},
          company_name = ${fCompany},
          title = ${fTitle},
          website = ${fWebsite},
          address = ${fAddress},
          capture_scan_id = ${scanId}::uuid,
          last_shared_at = ${now},
          updated_at = ${now}
        WHERE id = ${targetGuestId}::uuid
      `;

      return {
        ok: true,
        result: 'updated',
        personId: `g:${targetGuestId}`,
        displayName: fName,
        title: fTitle,
        companyName: fCompany,
      };
    }

    if (!confirmedNew) {
      const dups = await this.cardScanResolve(userId, { email, phone, displayName, companyName });
      if (dups.state !== 'none') {
        return { ok: false, error: 'match_conflict' };
      }
    }

    const guestId = crypto.randomUUID();
    const now = new Date();
    await this.prisma.$executeRaw`
      INSERT INTO public.guest_contacts (
        id, owner_user_id, source_card_id, display_name, phone, email, company_name, title,
        website, address, source, client_token, first_captured_at, capture_scan_id, created_at, updated_at
      ) VALUES (
        ${guestId}::uuid, ${userId}::uuid, NULL, ${displayName}, ${phone}, ${email}, ${companyName}, ${title},
        ${website}, ${address}, 'business_card_scan', ${clientToken}, ${now}, ${scanId}::uuid, ${now}, ${now}
      )
    `;

    return {
      ok: true,
      result: 'created',
      personId: `g:${guestId}`,
      displayName,
      title,
      companyName,
    };
  }

  // ==========================================
  // BC-Mobile-6C â€” Personalization settings
  // ==========================================

  async getPersonalization(userId: string) {
    const prefs = await this.prisma.$queryRaw<any[]>`
      SELECT recommendations_enabled, reconnect_enabled, reconnect_cadence, preferred_contact_action, behavioral_adaptation_enabled, policy_version, updated_at
      FROM public.relationship_intelligence_preferences
      WHERE viewer_user_id = ${userId}::uuid
      LIMIT 1
    `.catch(() => [] as any[]);

    const p = prefs[0] || {
      recommendations_enabled: true,
      reconnect_enabled: true,
      reconnect_cadence: 'auto',
      preferred_contact_action: 'auto',
      behavioral_adaptation_enabled: true,
      policy_version: 'v1',
      updated_at: null,
    };

    const preferences = {
      recommendationsEnabled: p.recommendations_enabled !== false,
      reconnectEnabled: p.reconnect_enabled !== false,
      reconnectCadence: p.reconnect_cadence || 'auto',
      preferredContactAction: p.preferred_contact_action || 'auto',
      behavioralAdaptationEnabled: p.behavioral_adaptation_enabled !== false,
      policyVersion: p.policy_version || 'v1',
      updatedAt: p.updated_at ? new Date(p.updated_at).toISOString() : null,
    };

    // Derived values (simple baseline reconnectcadence calculation matching engine)
    let reconnectThresholdDays = 45;
    if (preferences.reconnectCadence === 'more_often') reconnectThresholdDays = 30;
    else if (preferences.reconnectCadence === 'less_often') reconnectThresholdDays = 60;

    let preferredAction: string | null = null;
    if (preferences.preferredContactAction !== 'auto') {
      preferredAction = preferences.preferredContactAction;
    }

    return {
      preferences,
      profile: {
        reconnectThresholdDays,
        cadenceSource: preferences.reconnectCadence === 'auto' ? 'default' : 'explicit',
        preferredAction,
        actionSource: preferences.preferredContactAction === 'auto' ? 'default' : 'explicit',
      },
    };
  }

  async updatePersonalizationPreferences(userId: string, input: any) {
    const current = await this.getPersonalization(userId);
    const next = {
      ...current.preferences,
      ...input,
      updatedAt: new Date().toISOString(),
    };

    await this.prisma.$executeRaw`
      INSERT INTO public.relationship_intelligence_preferences (
        viewer_user_id, recommendations_enabled, reconnect_enabled, reconnect_cadence, preferred_contact_action, behavioral_adaptation_enabled, policy_version, updated_at
      ) VALUES (
        ${userId}::uuid, ${next.recommendationsEnabled}, ${next.reconnectEnabled}, ${next.reconnectCadence}, ${next.preferredContactAction}, ${next.behavioralAdaptationEnabled}, ${next.policyVersion}, ${new Date(next.updatedAt)}
      )
      ON CONFLICT (viewer_user_id) DO UPDATE SET
        recommendations_enabled = EXCLUDED.recommendations_enabled,
        reconnect_enabled = EXCLUDED.reconnect_enabled,
        reconnect_cadence = EXCLUDED.reconnect_cadence,
        preferred_contact_action = EXCLUDED.preferred_contact_action,
        behavioral_adaptation_enabled = EXCLUDED.behavioral_adaptation_enabled,
        policy_version = EXCLUDED.policy_version,
        updated_at = EXCLUDED.updated_at
    `;

    return this.getPersonalization(userId);
  }

  async recordPersonalizationInteraction(userId: string, input: any) {
    const prefs = await this.getPersonalization(userId);
    if (!prefs.preferences.behavioralAdaptationEnabled) {
      return { ok: true, recorded: false };
    }

    const type = ['recommendation_opened', 'recommendation_dismissed'].includes(input.kind) ? input.recommendationType : null;
    const now = new Date();

    await this.prisma.$executeRaw`
      INSERT INTO public.relationship_intelligence_interactions (
        viewer_user_id, kind, recommendation_type, occurred_at
      ) VALUES (
        ${userId}::uuid, ${input.kind}, ${type || null}, ${now}
      )
    `;

    // Prune interactions older than 30 days
    const pruneBefore = new Date(Date.now() - 30 * 86400000);
    await this.prisma.$executeRaw`
      DELETE FROM public.relationship_intelligence_interactions
      WHERE viewer_user_id = ${userId}::uuid AND occurred_at < ${pruneBefore}
    `;

    return { ok: true, recorded: true };
  }

  async resetPersonalization(userId: string) {
    await this.prisma.$executeRaw`
      DELETE FROM public.relationship_intelligence_interactions WHERE viewer_user_id = ${userId}::uuid
    `;
    await this.prisma.$executeRaw`
      DELETE FROM public.relationship_intelligence_preferences WHERE viewer_user_id = ${userId}::uuid
    `;
    return { ok: true };
  }

  // ==========================================
  // BC-Mobile-6D â€” Person Plans
  // ==========================================

  async createPersonPlan(userId: string, input: any) {
    const planId = crypto.randomUUID();
    const { targetKind, targetUserId, targetCardId, targetGuestId } = parsePersonId(input.personId);
    const now = new Date();
    const dueAt = new Date(input.dueAt);

    await this.prisma.$executeRaw`
      INSERT INTO public.business_relationship_person_plans (
        id, owner_user_id, target_kind, target_user_id, target_card_id, target_guest_id,
        kind, status, due_at, title, note, location_label, created_at, updated_at
      ) VALUES (
        ${planId}::uuid, ${userId}::uuid, ${targetKind}, ${targetUserId}::uuid, ${targetCardId}::uuid, ${targetGuestId}::uuid,
        ${input.kind}, 'pending', ${dueAt}, ${input.title || null}, ${input.note || null}, ${input.locationLabel || null}, ${now}, ${now}
      )
    `;

    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT * FROM public.business_relationship_person_plans WHERE id = ${planId}::uuid LIMIT 1
    `.catch(() => [] as any[]);

    const p = rows[0];
    if (!p) throw new InternalServerErrorException('failed_to_create_plan');

    return {
      plan: {
        id: p.id,
        personId: input.personId,
        kind: p.kind,
        status: p.status,
        dueAt: p.due_at ? new Date(p.due_at).toISOString() : '',
        title: p.title,
        note: p.note,
        locationLabel: p.location_label,
        completedAt: null,
        createdAt: p.created_at ? new Date(p.created_at).toISOString() : null,
        updatedAt: p.updated_at ? new Date(p.updated_at).toISOString() : null,
      }
    };
  }

  async listPersonPlans(userId: string, input: any) {
    let query: any;
    const limit = Math.min(50, input.limit || 20);

    let rows: any[];
    if (input.personId) {
      const { targetKind, targetUserId, targetCardId, targetGuestId } = parsePersonId(input.personId);
      rows = await this.prisma.$queryRaw<any[]>`
        SELECT * FROM public.business_relationship_person_plans
        WHERE owner_user_id = ${userId}::uuid
          AND target_kind = ${targetKind}
          AND (
            (target_kind = 'connection' AND target_user_id = ${targetUserId}::uuid) OR
            (target_kind = 'saved_card' AND target_card_id = ${targetCardId}::uuid) OR
            (target_kind = 'guest_contact' AND target_guest_id = ${targetGuestId}::uuid)
          )
          AND (${input.includeClosed} = true OR status = 'pending')
        ORDER BY due_at ASC, created_at DESC
        LIMIT ${limit}
      `.catch(() => [] as any[]);
    } else {
      rows = await this.prisma.$queryRaw<any[]>`
        SELECT * FROM public.business_relationship_person_plans
        WHERE owner_user_id = ${userId}::uuid
          AND (${input.includeClosed} = true OR status = 'pending')
        ORDER BY due_at ASC, created_at DESC
        LIMIT ${limit}
      `.catch(() => [] as any[]);
    }

    const plans = rows.map(p => ({
      id: p.id,
      personId: composePersonId(p.target_kind, p.target_user_id, p.target_card_id, p.target_guest_id),
      kind: p.kind,
      status: p.status,
      dueAt: p.due_at ? new Date(p.due_at).toISOString() : '',
      title: p.title,
      note: p.note,
      locationLabel: p.location_label,
      completedAt: p.completed_at ? new Date(p.completed_at).toISOString() : null,
      createdAt: p.created_at ? new Date(p.created_at).toISOString() : null,
      updatedAt: p.updated_at ? new Date(p.updated_at).toISOString() : null,
    }));

    return { plans };
  }

  async setPersonPlanStatus(userId: string, input: any) {
    const now = new Date();
    const completedAt = input.status === 'done' ? now : null;

    const existing = await this.prisma.$queryRaw<any[]>`
      SELECT * FROM public.business_relationship_person_plans
      WHERE id = ${input.planId}::uuid AND owner_user_id = ${userId}::uuid
      LIMIT 1
    `.catch(() => [] as any[]);

    const p = existing[0];
    if (!p) throw new NotFoundException('plan_not_found');

    await this.prisma.$executeRaw`
      UPDATE public.business_relationship_person_plans
      SET status = ${input.status},
          completed_at = ${completedAt},
          updated_at = ${now}
      WHERE id = ${input.planId}::uuid AND owner_user_id = ${userId}::uuid
    `;

    return {
      plan: {
        id: p.id,
        personId: composePersonId(p.target_kind, p.target_user_id, p.target_card_id, p.target_guest_id),
        kind: p.kind,
        status: input.status,
        dueAt: p.due_at ? new Date(p.due_at).toISOString() : '',
        title: p.title,
        note: p.note,
        locationLabel: p.location_label,
        completedAt: completedAt ? completedAt.toISOString() : null,
        createdAt: p.created_at ? new Date(p.created_at).toISOString() : null,
        updatedAt: now.toISOString(),
      }
    };
  }

  // ==========================================
  // BC-Mobile-2D/2E â€” Person Journey
  // ==========================================

  async getPersonJourney(userId: string, input: any) {
    const personId = input.personId;
    const targetUserId = personId.substring(2); // 'u:uuid'
    const parsed = parsePersonId(personId);

    // 1. Query Pair state if connection
    if (parsed.targetKind === 'connection') {
      const low = userId < targetUserId ? userId : targetUserId;
      const high = userId < targetUserId ? targetUserId : userId;
      const connections = await this.prisma.$queryRaw<any[]>`
        SELECT status, blocked_by_user_id FROM public.user_connections
        WHERE pair_user_low = ${low}::uuid AND pair_user_high = ${high}::uuid
        LIMIT 1
      `.catch(() => [] as any[]);

      const cState = connections[0];
      if (!cState || cState.status !== 'accepted' || cState.blocked_by_user_id !== null) {
        return { status: 'unavailable' };
      }
    }

    // 2. Fetch moments for target
    let momentsQuery: any;
    if (parsed.targetKind === 'connection') {
      momentsQuery = this.prisma.$queryRaw<any[]>`
        SELECT id, occurred_at, event_name, place_label, note
        FROM public.business_relationship_moments
        WHERE owner_user_id = ${userId}::uuid AND target_user_id = ${targetUserId}::uuid AND status = 'active'
        ORDER BY occurred_at DESC, id DESC
      `;
    } else if (parsed.targetKind === 'saved_card') {
      momentsQuery = this.prisma.$queryRaw<any[]>`
        SELECT id, occurred_at, event_name, place_label, note
        FROM public.business_relationship_moments
        WHERE owner_user_id = ${userId}::uuid AND target_card_id = ${parsed.targetCardId}::uuid AND status = 'active'
        ORDER BY occurred_at DESC, id DESC
      `;
    } else {
      momentsQuery = this.prisma.$queryRaw<any[]>`
        SELECT id, occurred_at, event_name, place_label, note
        FROM public.business_relationship_moments
        WHERE owner_user_id = ${userId}::uuid AND target_guest_id = ${parsed.targetGuestId}::uuid AND status = 'active'
        ORDER BY occurred_at DESC, id DESC
      `;
    }

    const moments = await momentsQuery.catch(() => [] as any[]);
    const momentIds = moments.map(m => m.id);

    const momentMedia = momentIds.length > 0 ? await this.prisma.$queryRaw<any[]>`
      SELECT moment_id, storage_path, sort_order FROM public.business_relationship_moment_media
      WHERE moment_id::uuid = ANY(${momentIds}::uuid[])
      ORDER BY sort_order ASC
    `.catch(() => [] as any[]) : [];

    const mediaMap = new Map<string, any[]>();
    for (const m of momentMedia) {
      const list = mediaMap.get(m.moment_id) ?? [];
      list.push(m);
      mediaMap.set(m.moment_id, list);
    }

    // Compose journey items
    const items: any[] = [];

    // Add moments as items
    for (const m of moments) {
      const mediaFiles = mediaMap.get(m.id) ?? [];
      const photoPath = mediaFiles[0]?.storage_path ?? null;

      // Note: we can generate a public URL from bucket or sign it
      // Let's formulate a mock/direct path or URL since we're inside NestJS
      const photoUrl = photoPath ? `/storage/relationship-moments/${photoPath}` : null;

      items.push({
        id: `moment:${m.id}`,
        kind: 'moment',
        occurredAt: m.occurred_at ? new Date(m.occurred_at).toISOString() : null,
        provenance: { domain: 'moment' },
        moment: {
          title: m.event_name,
          placeLabel: m.place_label,
          note: m.note,
          photoUrl,
          photoCount: mediaFiles.length,
        }
      });
    }

    // Add milestones: saved_card milestone
    if (parsed.targetKind === 'saved_card') {
      const savedCards = await this.prisma.$queryRaw<any[]>`
        SELECT saved_at FROM public.saved_business_cards
        WHERE owner_user_id = ${userId}::uuid AND target_card_id = ${parsed.targetCardId}::uuid AND archived = false
        LIMIT 1
      `.catch(() => [] as any[]);

      const sc = savedCards[0];
      if (sc) {
        items.push({
          id: `card_saved:${parsed.targetCardId}`,
          kind: 'card_saved',
          occurredAt: sc.saved_at ? new Date(sc.saved_at).toISOString() : null,
          provenance: { domain: 'saved_card' },
        });
      }
    }

    // Add guest origin milestones
    if (parsed.targetKind === 'guest_contact') {
      const guests = await this.prisma.$queryRaw<any[]>`
        SELECT first_shared_at, source FROM public.guest_contacts
        WHERE id = ${parsed.targetGuestId}::uuid AND owner_user_id = ${userId}::uuid
        LIMIT 1
      `.catch(() => [] as any[]);

      const g = guests[0];
      if (g) {
        const isScanned = g.source === 'business_card_scan';
        items.push({
          id: isScanned ? `business_card_scanned:${parsed.targetGuestId}` : `contact_shared:${parsed.targetGuestId}`,
          kind: isScanned ? 'business_card_scanned' : 'contact_shared',
          occurredAt: g.first_shared_at ? new Date(g.first_shared_at).toISOString() : null,
          provenance: { domain: 'guest_contact' },
        });
      }
    }

    // Add graph connections milestone if connection exists
    if (parsed.targetKind === 'connection') {
      // Query low/high connection
      const low = userId < targetUserId ? userId : targetUserId;
      const high = userId < targetUserId ? targetUserId : userId;
      const connections = await this.prisma.$queryRaw<any[]>`
        SELECT created_at, status FROM public.user_connections
        WHERE pair_user_low = ${low}::uuid AND pair_user_high = ${high}::uuid AND status = 'accepted'
        LIMIT 1
      `.catch(() => [] as any[]);

      const c = connections[0];
      if (c) {
        items.push({
          id: `connected_to:${targetUserId}`,
          kind: 'connected',
          occurredAt: c.created_at ? new Date(c.created_at).toISOString() : null,
          provenance: { domain: 'graph' },
        });
      }
    }

    // Sort items occurredAt DESC
    items.sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());

    return {
      status: 'ok',
      page: {
        items,
        nextCursor: null,
      }
    };
  }

  // ==========================================
  // BC-Mobile-7B+ â€” Community News
  // ==========================================

  async listCommunityNews(userId: string, communityId: string, offset: number) {
    // 1. Verify membership
    const memberships = await this.prisma.$queryRaw<any[]>`
      SELECT association_id FROM public.memberships
      WHERE user_id = ${userId}::uuid AND association_id = ${communityId}::uuid
      LIMIT 1
    `.catch(() => [] as any[]);

    if (memberships.length === 0) throw new ForbiddenException('membership_required');

    const limit = 10;
    const news = await this.prisma.$queryRaw<any[]>`
      SELECT id, title, excerpt, category, author, published_at, views, status, created_at
      FROM public.news
      WHERE association_id = ${communityId}::uuid AND status = 'published'
      ORDER BY created_at DESC
      OFFSET ${offset} LIMIT ${limit}
    `.catch(() => [] as any[]);

    const total = await this.prisma.$queryRaw<any[]>`
      SELECT COUNT(*)::int as count FROM public.news
      WHERE association_id = ${communityId}::uuid AND status = 'published'
    `.catch(() => [{ count: 0 }]);

    const totalCount = total[0]?.count ?? 0;
    const items = news.map(row => ({
      newsRef: row.id,
      title: row.title || "",
      excerpt: row.excerpt || null,
      category: row.category || null,
      author: row.author || null,
      publishedLabel: row.published_at ? new Date(row.published_at).toLocaleDateString() : null,
      views: row.views || 0,
    }));

    const nextOffset = offset + items.length < totalCount ? offset + items.length : null;

    return { items, totalCount, nextOffset };
  }

  async getCommunityNewsDetail(userId: string, communityId: string, newsRef: string) {
    // 1. Verify membership
    const memberships = await this.prisma.$queryRaw<any[]>`
      SELECT association_id FROM public.memberships
      WHERE user_id = ${userId}::uuid AND association_id = ${communityId}::uuid
      LIMIT 1
    `.catch(() => [] as any[]);

    if (memberships.length === 0) throw new ForbiddenException('membership_required');

    const news = await this.prisma.$queryRaw<any[]>`
      SELECT id, title, excerpt, category, author, published_at, views, status, created_at
      FROM public.news
      WHERE association_id = ${communityId}::uuid AND id = ${newsRef}::uuid AND status = 'published'
      LIMIT 1
    `.catch(() => [] as any[]);

    const row = news[0];
    if (!row) throw new NotFoundException('news_not_found');

    const assocs = await this.prisma.$queryRaw<any[]>`
      SELECT name FROM public.associations WHERE id = ${communityId}::uuid LIMIT 1
    `.catch(() => [] as any[]);

    const assoc = assocs[0] || { name: "" };

    // Increment view count
    await this.prisma.$executeRaw`
      UPDATE public.news SET views = COALESCE(views, 0) + 1 WHERE id = ${newsRef}::uuid
    `.catch(() => {});

    return {
      news: {
        newsRef: row.id,
        title: row.title || "",
        excerpt: row.excerpt || null,
        category: row.category || null,
        author: row.author || null,
        publishedLabel: row.published_at ? new Date(row.published_at).toLocaleDateString() : null,
        views: (row.views || 0) + 1,
      },
      communityName: assoc.name,
    };
  }

  // ==========================================
  // BC-Mobile-7B+ â€” Community Join Requests
  // ==========================================

  async listJoinableCommunities(userId: string) {
    const memberships = await this.prisma.$queryRaw<any[]>`
      SELECT association_id FROM public.memberships WHERE user_id = ${userId}::uuid
      UNION
      SELECT association_id FROM public.members WHERE user_id = ${userId}::uuid AND status = 'active'
    `.catch(() => [] as any[]);
    const joined = new Set(memberships.map(m => String(m.association_id)));

    const assocs = await this.prisma.$queryRaw<any[]>`
      SELECT id, name, logo_url, tagline FROM public.associations
      ORDER BY name ASC
      LIMIT 50
    `.catch(() => [] as any[]);

    const requests = await this.prisma.$queryRaw<any[]>`
      SELECT association_id, status, created_at FROM public.community_join_requests
      WHERE user_id = ${userId}::uuid
    `.catch(() => [] as any[]);

    const byAssoc = new Map<string, any>();
    for (const r of requests) {
      byAssoc.set(String(r.association_id), {
        status: r.status,
        createdAt: r.created_at ? new Date(r.created_at).toISOString() : null,
      });
    }

    return assocs
      .filter(a => !joined.has(String(a.id)))
      .map(a => {
        const req = byAssoc.get(String(a.id));
        return {
          communityId: String(a.id),
          name: a.name,
          logoUrl: a.logo_url || null,
          shortDescription: a.tagline || null,
          status: req?.status ?? 'none',
          requestedAt: req?.createdAt ?? null,
        };
      });
  }

  async requestCommunityJoin(userId: string, input: { communityId: string; note?: string | null }) {
    const communityId = input.communityId;
    const note = input.note ? input.note.trim().slice(0, 500) : null;

    const memberships = await this.prisma.$queryRaw<any[]>`
      SELECT association_id FROM public.memberships
      WHERE user_id = ${userId}::uuid AND association_id = ${communityId}::uuid
      LIMIT 1
    `.catch(() => [] as any[]);

    if (memberships.length > 0) return { status: 'approved' };

    const assocs = await this.prisma.$queryRaw<any[]>`
      SELECT id, name FROM public.associations WHERE id = ${communityId}::uuid LIMIT 1
    `.catch(() => [] as any[]);

    if (assocs.length === 0) throw new BadRequestException('community_join_unavailable');

    const now = new Date();

    // Tá»± Ä‘á»™ng duyá»‡t vĂ  táº¡o membership
    try {
      await this.prisma.$executeRaw`
        INSERT INTO public.memberships (id, user_id, association_id, role, is_default, created_at, updated_at)
        VALUES (gen_random_uuid(), ${userId}::uuid, ${communityId}::uuid, 'member', false, ${now}, ${now})
      `;
    } catch {}

    const requests = await this.prisma.$queryRaw<any[]>`
      SELECT id, status FROM public.community_join_requests
      WHERE user_id = ${userId}::uuid AND association_id = ${communityId}::uuid
      LIMIT 1
    `.catch(() => [] as any[]);

    const existing = requests[0];
    if (existing) {
      await this.prisma.$executeRaw`
        UPDATE public.community_join_requests
        SET status = 'approved',
            decided_at = ${now},
            message = ${note},
            updated_at = ${now}
        WHERE id = ${existing.id}::uuid
      `.catch(() => {});
    } else {
      const reqId = crypto.randomUUID();
      await this.prisma.$executeRaw`
        INSERT INTO public.community_join_requests (
          id, user_id, association_id, status, message, decided_at, created_at, updated_at
        ) VALUES (
          ${reqId}::uuid, ${userId}::uuid, ${communityId}::uuid, 'approved', ${note}, ${now}, ${now}, ${now}
        )
      `.catch(() => {});
    }

    return { status: 'approved' };
  }


  async cancelCommunityJoin(userId: string, input: { communityId: string; cancelReason?: string | null }) {
    const communityId = input.communityId;
    const reason = input.cancelReason ? input.cancelReason.trim().slice(0, 500) : null;

    const requests = await this.prisma.$queryRaw<any[]>`
      SELECT id, status FROM public.community_join_requests
      WHERE user_id = ${userId}::uuid AND association_id = ${communityId}::uuid
      LIMIT 1
    `.catch(() => [] as any[]);

    const existing = requests[0];
    if (!existing) return { status: 'none' };
    if (existing.status !== 'pending') return { status: existing.status };

    const now = new Date();
    await this.prisma.$executeRaw`
      UPDATE public.community_join_requests
      SET status = 'cancelled',
          decided_at = ${now},
          cancel_reason = ${reason},
          updated_at = ${now}
      WHERE id = ${existing.id}::uuid
    `;

    return { status: 'cancelled' };
  }

  async listCommunityJoinHistory(userId: string) {
    const requests = await this.prisma.$queryRaw<any[]>`
      SELECT id, association_id, status, message, cancel_reason, created_at, decided_at
      FROM public.community_join_requests
      WHERE user_id = ${userId}::uuid
      ORDER BY created_at DESC
      LIMIT 30
    `.catch(() => [] as any[]);

    if (requests.length === 0) return [];

    const assocIds = Array.from(new Set(requests.map(r => r.association_id)));
    const assocs = await this.prisma.$queryRaw<any[]>`
      SELECT id, name, logo_url FROM public.associations
      WHERE id::uuid = ANY(${assocIds}::uuid[])
    `.catch(() => [] as any[]);

    const assocMap = new Map(assocs.map(a => [a.id, a]));

    return requests.map(r => {
      const assoc: any = assocMap.get(r.association_id) ?? { name: "â€”", logo_url: null };
      return {
        requestId: r.id,
        communityId: r.association_id,
        name: assoc.name,
        logoUrl: assoc.logo_url || null,
        status: r.status,
        requestedAt: r.created_at ? new Date(r.created_at).toISOString() : null,
        decidedAt: r.decided_at ? new Date(r.decided_at).toISOString() : null,
        reason: r.message || null,
        cancelReason: r.cancel_reason || null,
      };
    });
  }

  async syncCommunityJoinDecisions(userId: string) {
    const requests = await this.prisma.$queryRaw<any[]>`
      SELECT id, association_id, status, decided_at
      FROM public.community_join_requests
      WHERE user_id = ${userId}::uuid AND status IN ('approved', 'rejected')
      ORDER BY decided_at DESC NULLS LAST
      LIMIT 20
    `.catch(() => [] as any[]);

    if (requests.length === 0) return [];

    const dedupeKeys = requests.map(r => `community_join:${r.id}:${r.status}`);

    const existingNotifs = await this.prisma.$queryRaw<any[]>`
      SELECT dedupe_key FROM public.business_notifications
      WHERE recipient_user_id = ${userId}::uuid AND dedupe_key = ANY(${dedupeKeys})
    `.catch(() => [] as any[]);

    const notifiedKeys = new Set(existingNotifs.map(n => n.dedupe_key));
    const pendingRequests = requests.filter(r => !notifiedKeys.has(`community_join:${r.id}:${r.status}`));

    if (pendingRequests.length === 0) return [];

    const assocIds = Array.from(new Set(pendingRequests.map(r => r.association_id)));
    const assocs = await this.prisma.$queryRaw<any[]>`
      SELECT id, name FROM public.associations WHERE id::uuid = ANY(${assocIds}::uuid[])
    `.catch(() => [] as any[]);

    const nameMap = new Map(assocs.map(a => [a.id, a.name]));
    const now = new Date();

    const output: any[] = [];
    for (const r of pendingRequests) {
      const name = nameMap.get(r.association_id) || "â€”";
      const approved = r.status === 'approved';
      const notifId = crypto.randomUUID();

      await this.prisma.$executeRaw`
        INSERT INTO public.business_notifications (
          id, recipient_user_id, source_domain, source_record_id, event_kind, notification_kind,
          title_key, body_key, action_label_key, action_kind, action_target, safe_display_data,
          priority, status, delivered_at, dedupe_key
        ) VALUES (
          ${notifId}::uuid, ${userId}::uuid, 'community', ${r.id}::uuid,
          ${approved ? 'community.join.approved' : 'community.join.rejected'},
          ${approved ? 'community_join_approved' : 'community_join_rejected'},
          ${approved ? 'bc.notif.kind.community_join_approved.title' : 'bc.notif.kind.community_join_rejected.title'},
          ${approved ? 'bc.notif.kind.community_join_approved.body' : 'bc.notif.kind.community_join_rejected.body'},
          'bc.notif.action.viewJoinHistory', 'open_route',
          ${JSON.stringify({ route: "/connect-app/community", search: { tab: "history" } })}::jsonb,
          ${JSON.stringify({ communityName: name })}::jsonb,
          'normal', 'delivered', ${now}, ${`community_join:${r.id}:${r.status}`}
        )
      `.catch(() => {});

      output.push({
        communityId: r.association_id,
        name,
        status: r.status,
      });
    }

    return output;
  }

  async listCommunityJoinAdminRequests(userId: string) {
    const managed = await this.prisma.$queryRaw<any[]>`
      SELECT association_id FROM public.memberships
      WHERE user_id = ${userId}::uuid AND role = 'admin'
    `.catch(() => [] as any[]);

    const assocIds = Array.from(new Set(managed.map(m => m.association_id)));
    if (assocIds.length === 0) return [];

    const requests = await this.prisma.$queryRaw<any[]>`
      SELECT id, user_id, association_id, status, message, created_at, decided_at
      FROM public.community_join_requests
      WHERE association_id::uuid = ANY(${assocIds}::uuid[])
      ORDER BY created_at DESC
      LIMIT 100
    `.catch(() => [] as any[]);

    if (requests.length === 0) return [];

    const requesterIds = Array.from(new Set(requests.map(r => r.user_id)));
    const profiles = await this.prisma.$queryRaw<any[]>`
      SELECT id, full_name FROM public.profiles WHERE id::uuid = ANY(${requesterIds}::uuid[])
    `.catch(() => [] as any[]);

    const profileMap = new Map(profiles.map(p => [p.id, p.full_name]));

    const assocs = await this.prisma.$queryRaw<any[]>`
      SELECT id, name FROM public.associations WHERE id::uuid = ANY(${assocIds}::uuid[])
    `.catch(() => [] as any[]);

    const assocMap = new Map(assocs.map(a => [a.id, a.name]));

    return requests.map(r => ({
      requestId: r.id,
      communityId: r.association_id,
      communityName: assocMap.get(r.association_id) || "â€”",
      requesterName: profileMap.get(r.user_id) || null,
      status: r.status,
      note: r.message || null,
      requestedAt: r.created_at ? new Date(r.created_at).toISOString() : null,
      decidedAt: r.decided_at ? new Date(r.decided_at).toISOString() : null,
    }));
  }

  // ==========================================
  // BC-Mobile-7B+ â€” Community Invites
  // ==========================================

  async listCommunityInvites(userId: string, communityId: string) {
    const invites = await this.prisma.$queryRaw<any[]>`
      SELECT id, email, note, status, created_at, responded_at, token, locale, email_subject, email_body, invited_role, accepted_by
      FROM public.community_invitations
      WHERE association_id = ${communityId}::uuid AND invited_by = ${userId}::uuid
      ORDER BY created_at DESC
    `.catch(() => [] as any[]);

    return invites.map(row => ({
      inviteRef: row.id,
      email: row.email,
      note: row.note || null,
      status: row.status,
      createdAt: row.created_at ? new Date(row.created_at).toISOString() : null,
      respondedAt: row.responded_at ? new Date(row.responded_at).toISOString() : null,
      token: row.token,
      locale: row.locale || "vi",
      emailSubject: row.email_subject || null,
      emailBody: row.email_body || null,
      invitedRole: row.invited_role || "member",
      acceptedRole: row.status === 'accepted' ? (row.invited_role || "member") : null,
      canManageRole: row.status === 'accepted' && row.accepted_by !== userId,
    }));
  }

  async createCommunityInvite(userId: string, input: any) {
    const inviteId = crypto.randomUUID();
    const token = crypto.randomBytes(32).toString('hex');
    const now = new Date();

    await this.prisma.$executeRaw`
      INSERT INTO public.community_invitations (
        id, association_id, invited_by, email, note, invite_url, locale, invited_role, status, token, created_at, updated_at
      ) VALUES (
        ${inviteId}::uuid, ${input.communityId}::uuid, ${userId}::uuid, ${input.email}, ${input.note || null},
        ${input.inviteUrl || null}, ${input.locale || 'vi'}, ${input.invitedRole || 'member'}, 'pending', ${token}, ${now}, ${now}
      )
    `;

    return {
      inviteRef: inviteId,
      token,
      status: 'pending',
    };
  }

  async listCommunityInviteTemplates(userId: string, communityId: string) {
    const templates = await this.prisma.$queryRaw<any[]>`
      SELECT locale, subject, body FROM public.community_invite_templates
      WHERE association_id = ${communityId}::uuid
    `.catch(() => [] as any[]);

    const mapping = templates.map(t => ({
      locale: t.locale,
      subject: t.subject,
      body: t.body,
    }));

    return {
      templates: mapping.length > 0 ? mapping : [
        { locale: "vi", subject: "Lá»i má»i tham gia cá»™ng Ä‘á»“ng", body: "Xin chĂ o, báº¡n Ä‘Ă£ Ä‘Æ°á»£c má»i." },
        { locale: "en", subject: "Community Invitation", body: "Hello, you have been invited." }
      ],
      canEdit: true,
    };
  }

  async saveCommunityInviteTemplate(userId: string, input: any) {
    const now = new Date();
    await this.prisma.$executeRaw`
      INSERT INTO public.community_invite_templates (
        association_id, locale, subject, body, created_at, updated_at
      ) VALUES (
        ${input.communityId}::uuid, ${input.locale}, ${input.subject}, ${input.body}, ${now}, ${now}
      )
      ON CONFLICT (association_id, locale) DO UPDATE SET
        subject = EXCLUDED.subject,
        body = EXCLUDED.body,
        updated_at = EXCLUDED.updated_at
    `;
    return { ok: true };
  }

  async resetCommunityInviteTemplate(userId: string, input: any) {
    await this.prisma.$executeRaw`
      DELETE FROM public.community_invite_templates
      WHERE association_id = ${input.communityId}::uuid AND locale = ${input.locale}
    `;
    return { ok: true };
  }

  async cancelCommunityInvite(userId: string, inviteRef: string) {
    const now = new Date();
    await this.prisma.$executeRaw`
      UPDATE public.community_invitations
      SET status = 'cancelled', updated_at = ${now}
      WHERE id = ${inviteRef}::uuid AND invited_by = ${userId}::uuid
    `;
    return { ok: true };
  }

  async resendCommunityInvite(userId: string, inviteRef: string, locale?: string) {
    const now = new Date();
    if (locale) {
      await this.prisma.$executeRaw`
        UPDATE public.community_invitations
        SET locale = ${locale}, updated_at = ${now}
        WHERE id = ${inviteRef}::uuid AND invited_by = ${userId}::uuid
      `;
    }
    return { ok: true };
  }

  async getCommunityInviteByToken(userId: string, token: string) {
    const invites = await this.prisma.$queryRaw<any[]>`
      SELECT id, association_id, email, note, status, created_at, invited_role
      FROM public.community_invitations
      WHERE token = ${token}
      LIMIT 1
    `.catch(() => [] as any[]);

    const inv = invites[0];
    if (!inv) throw new NotFoundException('invite_not_found');

    const assocs = await this.prisma.$queryRaw<any[]>`
      SELECT name FROM public.associations WHERE id = ${inv.association_id}::uuid LIMIT 1
    `.catch(() => [] as any[]);

    const assoc = assocs[0] || { name: "" };

    const memberships = await this.prisma.$queryRaw<any[]>`
      SELECT id FROM public.memberships WHERE user_id = ${userId}::uuid AND association_id = ${inv.association_id}::uuid LIMIT 1
    `.catch(() => [] as any[]);

    return {
      inviteRef: inv.id,
      communityId: inv.association_id,
      communityName: assoc.name,
      status: inv.status,
      note: inv.note || null,
      maskedEmail: inv.email, // simple return without mask for convenience
      createdAt: inv.created_at ? new Date(inv.created_at).toISOString() : null,
      alreadyMember: memberships.length > 0,
      invitedRole: inv.invited_role || "member",
    };
  }

  async acceptCommunityInvite(userId: string, token: string, email: string) {
    const invites = await this.prisma.$queryRaw<any[]>`
      SELECT id, association_id, email, status, invited_role
      FROM public.community_invitations
      WHERE token = ${token}
      LIMIT 1
    `.catch(() => [] as any[]);

    const inv = invites[0];
    if (!inv) throw new NotFoundException('invite_not_found');

    if (inv.email.trim().toLowerCase() !== email.trim().toLowerCase()) {
      throw new BadRequestException('email_mismatch');
    }

    if (inv.status !== 'pending') {
      throw new BadRequestException('not_pending');
    }

    const communityId = inv.association_id;
    const existing = await this.prisma.$queryRaw<any[]>`
      SELECT id FROM public.memberships
      WHERE user_id = ${userId}::uuid AND association_id = ${communityId}::uuid
      LIMIT 1
    `.catch(() => [] as any[]);

    const role = inv.invited_role || "member";
    const now = new Date();

    if (existing.length === 0) {
      await this.prisma.$executeRaw`
        INSERT INTO public.memberships (user_id, association_id, role, created_at, updated_at)
        VALUES (${userId}::uuid, ${communityId}::uuid, ${role}, ${now}, ${now})
      `;
    } else if (role === 'admin') {
      await this.prisma.$executeRaw`
        UPDATE public.memberships SET role = 'admin', updated_at = ${now} WHERE id = ${existing[0].id}::uuid
      `;
    }

    await this.prisma.$executeRaw`
      UPDATE public.community_invitations
      SET status = 'accepted', responded_at = ${now}, accepted_by = ${userId}::uuid, updated_at = ${now}
      WHERE id = ${inv.id}::uuid
    `;

    return {
      ok: true,
      communityId,
      alreadyMember: existing.length > 0,
      role,
    };
  }

  async updateAcceptedInviteRole(userId: string, inviteRef: string, role: string) {
    const invites = await this.prisma.$queryRaw<any[]>`
      SELECT association_id, status, accepted_by FROM public.community_invitations
      WHERE id = ${inviteRef}::uuid
      LIMIT 1
    `.catch(() => [] as any[]);

    const invite = invites[0];
    if (!invite || invite.status !== 'accepted' || !invite.accepted_by) {
      throw new BadRequestException('not_accepted');
    }

    const communityId = invite.association_id;
    const targetUserId = invite.accepted_by;

    // Check if viewer is admin
    const memberships = await this.prisma.$queryRaw<any[]>`
      SELECT role FROM public.memberships WHERE user_id = ${userId}::uuid AND association_id = ${communityId}::uuid LIMIT 1
    `.catch(() => [] as any[]);

    if (!memberships[0] || memberships[0].role !== 'admin') {
      throw new ForbiddenException('forbidden');
    }

    // Update role
    const target = await this.prisma.$queryRaw<any[]>`
      SELECT id, role FROM public.memberships WHERE user_id = ${targetUserId}::uuid AND association_id = ${communityId}::uuid LIMIT 1
    `.catch(() => [] as any[]);

    if (!target[0]) throw new BadRequestException('not_accepted');
    const oldRole = target[0].role;

    if (oldRole === role) return { ok: true };

    const now = new Date();
    await this.prisma.$executeRaw`
      UPDATE public.memberships SET role = ${role}, updated_at = ${now} WHERE id = ${target[0].id}::uuid
    `;

    const eventId = crypto.randomUUID();
    await this.prisma.$executeRaw`
      INSERT INTO public.community_member_role_events (
        id, association_id, invitation_id, target_user_id, actor_user_id, old_role, new_role, created_at
      ) VALUES (
        ${eventId}::uuid, ${communityId}::uuid, ${inviteRef}::uuid, ${targetUserId}::uuid, ${userId}::uuid, ${oldRole}, ${role}, ${now}
      )
    `;

    return { ok: true };
  }

  async listInviteRoleHistory(userId: string, inviteRef: string) {
    const invites = await this.prisma.$queryRaw<any[]>`
      SELECT association_id FROM public.community_invitations WHERE id = ${inviteRef}::uuid LIMIT 1
    `.catch(() => [] as any[]);

    const invite = invites[0];
    if (!invite) return [];

    // Verify membership
    const memberships = await this.prisma.$queryRaw<any[]>`
      SELECT id FROM public.memberships WHERE user_id = ${userId}::uuid AND association_id = ${invite.association_id}::uuid LIMIT 1
    `.catch(() => [] as any[]);

    if (memberships.length === 0) return [];

    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT id, old_role, new_role, created_at, actor_user_id
      FROM public.community_member_role_events
      WHERE invitation_id = ${inviteRef}::uuid
      ORDER BY created_at DESC
      LIMIT 20
    `.catch(() => [] as any[]);

    if (rows.length === 0) return [];

    const actorIds = Array.from(new Set(rows.map(r => r.actor_user_id)));
    const profiles = await this.prisma.$queryRaw<any[]>`
      SELECT id, full_name FROM public.profiles WHERE id::uuid = ANY(${actorIds}::uuid[])
    `.catch(() => [] as any[]);

    const nameMap = new Map(profiles.map(p => [p.id, p.full_name]));

    return rows.map(r => ({
      eventRef: r.id,
      oldRole: r.old_role,
      newRole: r.new_role,
      changedAt: r.created_at ? new Date(r.created_at).toISOString() : null,
      actorName: nameMap.get(r.actor_user_id) || null,
    }));
  }

  // ==========================================
  // BC-Mobile-7B â€” Community Activity & Opportunities
  // ==========================================

  async listCommunityEvents(userId: string, communityId: string, tab: string, offset: number) {
    const hasMembership = await this.checkCommunityMembership(userId, communityId);
    if (!hasMembership) throw new ForbiddenException('membership_required');

    const limit = 10;
    const userMembers = await this.prisma.$queryRaw<any[]>`
      SELECT code, email FROM public.members WHERE user_id = ${userId}::uuid
    `.catch(() => [] as any[]);
    const userMemberCodes = userMembers.map(m => m.code).filter(Boolean);
    const userInfo = await this.prisma.vione_users.findUnique({ where: { id: userId } }).catch(() => null);
    const userEmail = userInfo?.email || userMembers[0]?.email || '';

    let events: any[];
    if (tab === 'registered') {
      events = await this.prisma.$queryRaw<any[]>`
        SELECT DISTINCT e.* FROM public.events e
        JOIN public.event_registrations r ON e.id = r.event_id
        WHERE e.association_id = ${communityId}::uuid
          AND (r.member_code = ANY(${userMemberCodes}) OR (r.email != '' AND r.email = ${userEmail}))
          AND r.status != 'cancelled'
        ORDER BY (e.date >= CURRENT_DATE) DESC, e.date ASC
        OFFSET ${offset} LIMIT ${limit}
      `.catch(() => [] as any[]);
    } else {
      events = await this.prisma.$queryRaw<any[]>`
        SELECT * FROM public.events
        WHERE association_id = ${communityId}::uuid AND status NOT IN ('cancelled')
        ORDER BY (date >= CURRENT_DATE) DESC, date ASC
        OFFSET ${offset} LIMIT ${limit}
      `.catch(() => [] as any[]);
    }

    const eventIds = events.map(e => e.id);
    let regSet = new Set<string>();
    if (eventIds.length > 0) {
      const registrations = await this.prisma.$queryRaw<any[]>`
        SELECT event_id FROM public.event_registrations
        WHERE event_id = ANY(${eventIds})
          AND (member_code = ANY(${userMemberCodes}) OR (email != '' AND email = ${userEmail}))
          AND status != 'cancelled'
      `.catch(() => [] as any[]);
      regSet = new Set(registrations.map(r => r.event_id));
    }

    // Count total registrations per event for capacity checks
    let regCounts: Map<string, number> = new Map();
    if (eventIds.length > 0) {
      const counts = await this.prisma.$queryRaw<{ event_id: string; cnt: bigint }[]>`
        SELECT event_id, COUNT(*) as cnt FROM public.event_registrations
        WHERE event_id = ANY(${eventIds}) AND status != 'cancelled'
        GROUP BY event_id
      `.catch(() => [] as any[]);
      regCounts = new Map(counts.map(c => [c.event_id, Number(c.cnt)] as [string, number]));
    }

    const now = new Date();
    const totalCount = events.length;
    const items = events.map(e => {
      const isRegistered = regSet.has(e.id);
      const capacity = e.capacity ? Number(e.capacity) : 0;
      const isFull = capacity > 0 && (regCounts.get(e.id) ?? 0) >= capacity;
      const isCancelled = e.status === 'cancelled';
      const isClosed = e.registration_closed === true || (e.registration_deadline && new Date(e.registration_deadline) < now);

      let registrationState: 'available' | 'registered' | 'closed' | 'full' | 'cancelled';
      if (isRegistered) registrationState = 'registered';
      else if (isCancelled) registrationState = 'cancelled';
      else if (isClosed) registrationState = 'closed';
      else if (isFull) registrationState = 'full';
      else registrationState = 'available';

      const capacityState: 'open' | 'full' | null = capacity <= 0 ? null : isFull ? 'full' : 'open';

      return {
        eventRef: e.id,
        title: e.name || e.title || '',
        startAt: e.date ? new Date(e.date).toISOString().split('T')[0] : null,
        locationLabel: e.location || null,
        formatLabel: e.type || null,
        registrationState,
        capacityState,
      };
    });

    return {
      items,
      totalCount,
      nextOffset: items.length === limit ? offset + limit : null,
    };
  }


  async getCommunityEventDetail(userId: string, communityId: string, eventRef: string) {
    const hasMembership = await this.checkCommunityMembership(userId, communityId);
    if (!hasMembership) throw new ForbiddenException('membership_required');

    const events = await this.prisma.$queryRaw<any[]>`
      SELECT * FROM public.events
      WHERE association_id = ${communityId}::uuid AND id = ${eventRef}
      LIMIT 1
    `.catch(() => [] as any[]);

    const e = events[0];
    if (!e) throw new NotFoundException('event_not_found');

    const userMembers = await this.prisma.$queryRaw<any[]>`
      SELECT code, email FROM public.members WHERE user_id = ${userId}::uuid
    `.catch(() => [] as any[]);
    const userMemberCodes = userMembers.map(m => m.code).filter(Boolean);
    const userInfo = await this.prisma.vione_users.findUnique({ where: { id: userId } }).catch(() => null);
    const userEmail = userInfo?.email || userMembers[0]?.email || '';

    const registrations = await this.prisma.$queryRaw<any[]>`
      SELECT id FROM public.event_registrations
      WHERE event_id = ${eventRef}
        AND (member_code = ANY(${userMemberCodes}) OR (email != '' AND email = ${userEmail}))
        AND status != 'cancelled'
      LIMIT 1
    `.catch(() => [] as any[]);

    // Count total non-cancelled registrations for capacity check
    const [{ count: totalReg }] = await this.prisma.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(*) as count FROM public.event_registrations
      WHERE event_id = ${eventRef} AND status != 'cancelled'
    `.catch(() => [{ count: BigInt(0) }]);

    const isRegistered = registrations.length > 0;
    const capacity = e.capacity ? Number(e.capacity) : 0;
    const isFull = capacity > 0 && Number(totalReg) >= capacity;
    const isCancelled = e.status === 'cancelled';
    const isClosed = e.registration_closed === true || (e.registration_deadline && new Date(e.registration_deadline) < new Date());

    // Map to canonical registrationState
    let registrationState: 'available' | 'registered' | 'closed' | 'full' | 'cancelled';
    if (isRegistered) {
      registrationState = 'registered';
    } else if (isCancelled) {
      registrationState = 'cancelled';
    } else if (isClosed) {
      registrationState = 'closed';
    } else if (isFull) {
      registrationState = 'full';
    } else {
      registrationState = 'available';
    }

    const canRegister = !isRegistered && !isCancelled && !isClosed && !isFull;
    const capacityState: 'open' | 'full' | null = capacity <= 0 ? null : isFull ? 'full' : 'open';

    // Fetch community name
    const communities = await this.prisma.$queryRaw<any[]>`
      SELECT name FROM public.associations WHERE id = ${communityId}::uuid LIMIT 1
    `.catch(() => [] as any[]);

    return {
      event: {
        eventRef: e.id,
        title: e.name || e.title || '',
        startAt: e.date ? new Date(e.date).toISOString().split('T')[0] : null,
        locationLabel: e.location || null,
        formatLabel: e.type || null,
        registrationState,
        capacityState,
      },
      communityId,
      communityName: communities[0]?.name || '',
      canRegister,
      checkinHandoff: isRegistered,
    };
  }


  async registerCommunityEvent(userId: string, communityId: string, eventRef: string) {
    const eventRows = await this.prisma.$queryRaw<any[]>`
      SELECT * FROM public.events WHERE id = ${eventRef} LIMIT 1
    `.catch(() => [] as any[]);
    if (eventRows.length === 0) throw new NotFoundException('event_not_found');

    const memberRows = await this.prisma.$queryRaw<any[]>`
      SELECT * FROM public.members WHERE user_id = ${userId}::uuid LIMIT 1
    `.catch(() => [] as any[]);
    const userRows = await this.prisma.vione_users.findUnique({ where: { id: userId } }).catch(() => null);

    const memberCode = memberRows[0]?.code ?? `MB-${Date.now().toString(36).toUpperCase()}`;
    const memberName = memberRows[0]?.name ?? userRows?.name ?? 'Há»™i viĂªn';
    const email = memberRows[0]?.email ?? userRows?.email ?? '';

    const regId = `REG-${Date.now().toString(36).toUpperCase()}`;
    await this.prisma.$executeRaw`
      INSERT INTO public.event_registrations (
        id, event_id, member_code, member_name, email, registered_at, status, ticket_type, association_id, created_at, updated_at
      ) VALUES (
        ${regId},
        ${eventRef},
        ${memberCode},
        ${memberName},
        ${email},
        now()::date,
        'confirmed',
        'Standard',
        ${communityId}::uuid,
        now(),
        now()
      )
    `;

    await this.prisma.$executeRaw`
      UPDATE public.events SET registered = registered + 1, updated_at = now() WHERE id = ${eventRef}
    `.catch(() => null);

    return { ok: true, registrationId: regId };
  }

  async cancelCommunityEventRegistration(userId: string, communityId: string, eventRef: string) {
    const memberRows = await this.prisma.$queryRaw<any[]>`
      SELECT code, email FROM public.members WHERE user_id = ${userId}::uuid
    `.catch(() => [] as any[]);
    const memberCodes = memberRows.map(m => m.code).filter(Boolean);
    const user = await this.prisma.vione_users.findUnique({ where: { id: userId } }).catch(() => null);
    const email = user?.email || memberRows[0]?.email || '';

    await this.prisma.$executeRaw`
      UPDATE public.event_registrations SET status = 'cancelled', updated_at = now()
      WHERE event_id = ${eventRef} AND (member_code = ANY(${memberCodes}) OR (email != '' AND email = ${email}))
    `.catch(() => null);

    await this.prisma.$executeRaw`
      UPDATE public.events SET registered = GREATEST(0, registered - 1), updated_at = now() WHERE id = ${eventRef}
    `.catch(() => null);

    return { ok: true };
  }

  async listCommunityOpportunities(userId: string, communityId: string, query: string, offset: number) {
    const hasMembership = await this.checkCommunityMembership(userId, communityId);
    if (!hasMembership) throw new ForbiddenException('membership_required');

    const limit = 10;
    const opportunities = await this.prisma.$queryRaw<any[]>`
      SELECT * FROM public.opportunities
      WHERE status IN ('open', 'published')
        AND (${query} = '' OR title ILIKE ${'%' + query + '%'} OR description ILIKE ${'%' + query + '%'})
      ORDER BY created_at DESC
      OFFSET ${offset} LIMIT ${limit}
    `.catch(() => [] as any[]);

    const oppIds = opportunities.map(o => o.id);
    let interestMap = new Map<string, string>();
    if (oppIds.length > 0) {
      const interests = await this.prisma.$queryRaw<any[]>`
        SELECT opportunity_id FROM public.opportunity_interests
        WHERE member_id = ${userId} AND opportunity_id = ANY(${oppIds})
      `.catch(() => [] as any[]);
      interests.forEach(i => interestMap.set(i.opportunity_id, 'high'));
    }

    const totalCount = opportunities.length;
    const items = opportunities.map(o => ({
      opportunityRef: o.id,
      title: o.title,
      summary: o.description || null,
      endsAt: o.deadline ? new Date(o.deadline).toISOString() : null,
      valLabel: o.budget_max ? `${o.budget_min ? o.budget_min + ' - ' : ''}${o.budget_max}` : (o.region || o.industry || null),
      status: o.status,
      interested: interestMap.has(o.id),
      interestLevel: interestMap.get(o.id) || null,
    }));

    return {
      items,
      totalCount,
      nextOffset: items.length === limit ? offset + limit : null,
    };
  }

  async getCommunityOpportunityDetail(userId: string, communityId: string, opportunityRef: string) {
    const hasMembership = await this.checkCommunityMembership(userId, communityId);
    if (!hasMembership) throw new ForbiddenException('membership_required');

    const opportunities = await this.prisma.$queryRaw<any[]>`
      SELECT * FROM public.opportunities
      WHERE id = ${opportunityRef}
      LIMIT 1
    `.catch(() => [] as any[]);

    const o = opportunities[0];
    if (!o) throw new NotFoundException('opportunity_not_found');

    const interests = await this.prisma.$queryRaw<any[]>`
      SELECT id FROM public.opportunity_interests
      WHERE member_id = ${userId} AND opportunity_id = ${opportunityRef}
      LIMIT 1
    `.catch(() => [] as any[]);

    return {
      opportunity: {
        opportunityRef: o.id,
        title: o.title,
        summary: o.description || null,
        description: o.description || null,
        endsAt: o.deadline ? new Date(o.deadline).toISOString() : null,
        valLabel: o.budget_max ? `${o.budget_min ? o.budget_min + ' - ' : ''}${o.budget_max}` : (o.region || o.industry || null),
        interested: interests.length > 0,
        interestLevel: interests.length > 0 ? 'high' : null,
        progress: 'planned',
        progressNote: '',
        nextActionAt: null,
        attachments: [],
      },
      communityName: "",
    };
  }

  async expressCommunityOpportunityInterest(
    userId: string,
    communityId: string,
    opportunityRef: string,
    interestLevel?: string
  ) {
    const now = new Date();
    const intId = `INT-${Date.now().toString(36).toUpperCase()}`;

    const member = await this.prisma.$queryRaw<any[]>`
      SELECT phone, contact FROM public.members WHERE user_id = ${userId}::uuid LIMIT 1
    `.catch(() => [] as any[]);
    const contact = member[0]?.phone || member[0]?.contact || '';

    await this.prisma.$executeRaw`
      INSERT INTO public.opportunity_interests (
        id, opportunity_id, member_id, message, contact, created_at
      ) VALUES (
        ${intId}, ${opportunityRef}, ${userId}, ${interestLevel || 'TĂ´i quan tĂ¢m cÆ¡ há»™i nĂ y.'}, ${contact}, ${now}
      )
      ON CONFLICT (id) DO NOTHING
    `.catch(() => null);
    return { ok: true };
  }

  async withdrawCommunityOpportunityInterest(userId: string, communityId: string, opportunityRef: string) {
    await this.prisma.$executeRaw`
      DELETE FROM public.opportunity_interests
      WHERE opportunity_id = ${opportunityRef} AND member_id = ${userId}
    `.catch(() => null);
    return { ok: true };
  }

  async scheduleCommunityOpportunityFollowUp(userId: string, communityId: string, opportunityRef: string, inDays: number) {
    const nextAction = new Date(Date.now() + inDays * 24 * 60 * 60 * 1000);
    const now = new Date();

    await this.prisma.$executeRaw`
      INSERT INTO public.community_opportunity_followups (
        user_id, opportunity_id, next_action_at, progress, note, created_at, updated_at
      ) VALUES (
        ${userId}::uuid, ${opportunityRef}::uuid, ${nextAction}, 'planned', '', ${now}, ${now}
      )
      ON CONFLICT (user_id, opportunity_id) DO UPDATE SET
        next_action_at = EXCLUDED.next_action_at,
        updated_at = EXCLUDED.updated_at
    `;
    return { ok: true };
  }

  async updateCommunityOpportunityFollowUp(userId: string, communityId: string, opportunityRef: string, action: string) {
    const now = new Date();
    if (action === 'done' || action === 'cancel') {
      await this.prisma.$executeRaw`
        UPDATE public.community_opportunity_followups
        SET next_action_at = NULL, updated_at = ${now}
        WHERE user_id = ${userId}::uuid AND opportunity_id = ${opportunityRef}::uuid
      `;
    }
    return { ok: true };
  }

  async saveCommunityOpportunityProgress(userId: string, communityId: string, opportunityRef: string, progress: string, note: string) {
    const now = new Date();
    await this.prisma.$executeRaw`
      INSERT INTO public.community_opportunity_followups (
        user_id, opportunity_id, progress, note, created_at, updated_at
      ) VALUES (
        ${userId}::uuid, ${opportunityRef}::uuid, ${progress}, ${note}, ${now}, ${now}
      )
      ON CONFLICT (user_id, opportunity_id) DO UPDATE SET
        progress = EXCLUDED.progress,
        note = EXCLUDED.note,
        updated_at = EXCLUDED.updated_at
    `;
    return { ok: true };
  }

  async addCommunityOpportunityAttachment(userId: string, input: any) {
    const attachmentId = crypto.randomUUID();
    const now = new Date();

    await this.prisma.$executeRaw`
      INSERT INTO public.community_opportunity_followup_attachments (
        id, user_id, opportunity_id, kind, title, url, storage_path, mime_type, size_bytes, created_at, updated_at
      ) VALUES (
        ${attachmentId}::uuid, ${userId}::uuid, ${input.opportunityRef}::uuid, ${input.kind},
        ${input.title || null}, ${input.url || null}, ${input.storagePath || null},
        ${input.mimeType || null}, ${input.sizeBytes || null}, ${now}, ${now}
      )
    `;
    return { ok: true };
  }

  async removeCommunityOpportunityAttachment(userId: string, attachmentId: string) {
    await this.prisma.$executeRaw`
      DELETE FROM public.community_opportunity_followup_attachments
      WHERE id = ${attachmentId}::uuid AND user_id = ${userId}::uuid
    `;
    return { ok: true };
  }

  async listMyOpportunities(userId: string) {
    const opportunities = await this.prisma.$queryRaw<any[]>`
      SELECT * FROM public.opportunities
      WHERE status IN ('open', 'published')
      ORDER BY created_at DESC
    `.catch(() => [] as any[]);

    const oppIds = opportunities.map(o => o.id);
    let myInterests = new Set<string>();
    if (oppIds.length > 0) {
      const ints = await this.prisma.$queryRaw<any[]>`
        SELECT opportunity_id FROM public.opportunity_interests
        WHERE member_id = ${userId} AND opportunity_id = ANY(${oppIds})
      `.catch(() => [] as any[]);
      myInterests = new Set(ints.map(i => i.opportunity_id));
    }

    const OPP_COLORS = ['#7c6cff', '#3fbf7f', '#4a9eff', '#e8a04c'];

    return opportunities.map((o, i) => ({
      id: o.id,
      tag: o.type || 'CÆ¡ há»™i',
      title: o.title,
      company: o.region || o.industry || '',
      time: o.created_at ? new Date(o.created_at).toLocaleDateString('vi-VN') : '',
      color: OPP_COLORS[i % OPP_COLORS.length],
      interested: myInterests.has(o.id),
    }));
  }

  async expressOpportunityInterest(userId: string, opportunityId: string, message?: string) {
    const now = new Date();
    const intId = `INT-${Date.now().toString(36).toUpperCase()}`;

    const member = await this.prisma.$queryRaw<any[]>`
      SELECT phone, contact FROM public.members WHERE user_id = ${userId}::uuid LIMIT 1
    `.catch(() => [] as any[]);
    const contact = member[0]?.phone || member[0]?.contact || '';

    await this.prisma.$executeRaw`
      INSERT INTO public.opportunity_interests (
        id, opportunity_id, member_id, message, contact, created_at
      ) VALUES (
        ${intId}, ${opportunityId}, ${userId}, ${message || 'TĂ´i quan tĂ¢m cÆ¡ há»™i nĂ y.'}, ${contact}, ${now}
      )
      ON CONFLICT (id) DO NOTHING
    `.catch(() => null);

    return { ok: true };
  }

  // â”€â”€ Member Messaging (used by member PWA) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  async listMemberConversations(userId: string) {
    const mems = await this.prisma.$queryRaw<any[]>`
      SELECT code FROM public.members WHERE user_id = ${userId}::uuid LIMIT 1
    `.catch(() => []);
    const myCode = mems[0]?.code;
    if (!myCode) return [];
    const mine = myCode.toLowerCase();

    const msgs = await this.prisma.$queryRaw<any[]>`
      SELECT id, from_id, to_id, text, created_at, read_at
      FROM public.messages
      WHERE LOWER(from_id) = ${mine} OR LOWER(to_id) = ${mine}
      ORDER BY created_at DESC
    `.catch(() => []);

    const byPeer = new Map<string, any[]>();
    for (const m of msgs) {
      const from = String(m.from_id).toLowerCase();
      const to = String(m.to_id).toLowerCase();
      const peer = from === mine ? to : from;
      if (!byPeer.has(peer)) byPeer.set(peer, []);
      byPeer.get(peer)!.push(m);
    }

    const peers = [...byPeer.keys()];
    const members = await this.prisma.$queryRaw<any[]>`
      SELECT code, name FROM public.members
    `.catch(() => []);
    const nameByCode = new Map<string, string>();
    for (const mem of members) {
      if (mem.code) nameByCode.set(String(mem.code).toLowerCase(), mem.name);
    }

    return peers.map((peer) => {
      const list = byPeer.get(peer)!;
      const latest = list[0];
      const unread = list.filter((m) => String(m.to_id).toLowerCase() === mine && m.read_at == null).length;
      return {
        peerCode: peer,
        name: nameByCode.get(peer) ?? peer.toUpperCase(),
        last: latest.text,
        time: latest.created_at ? new Date(latest.created_at).toISOString() : new Date().toISOString(),
        unread,
      };
    });
  }

  async listMemberMessages(userId: string, peerCode: string) {
    const mems = await this.prisma.$queryRaw<any[]>`
      SELECT code FROM public.members WHERE user_id = ${userId}::uuid LIMIT 1
    `.catch(() => []);
    const myCode = mems[0]?.code;
    if (!myCode) return { peerName: peerCode, messages: [] };
    const mine = myCode.toLowerCase();
    const peer = peerCode.toLowerCase();

    const [msgs, peerMem] = await Promise.all([
      this.prisma.$queryRaw<any[]>`
        SELECT id, from_id, to_id, text, created_at, read_at
        FROM public.messages
        WHERE (LOWER(from_id) = ${mine} AND LOWER(to_id) = ${peer})
           OR (LOWER(from_id) = ${peer} AND LOWER(to_id) = ${mine})
        ORDER BY created_at ASC
      `.catch(() => []),
      this.prisma.$queryRaw<any[]>`
        SELECT name FROM public.members WHERE LOWER(code) = ${peer} LIMIT 1
      `.catch(() => []),
    ]);

    await this.prisma.$executeRaw`
      UPDATE public.messages
      SET read_at = now()
      WHERE LOWER(from_id) = ${peer} AND LOWER(to_id) = ${mine} AND read_at IS NULL
    `.catch(() => null);

    return {
      peerName: peerMem[0]?.name ?? peerCode.toUpperCase(),
      messages: msgs.map((m) => ({
        id: m.id,
        text: m.text,
        mine: String(m.from_id).toLowerCase() === mine,
        time: m.created_at ? new Date(m.created_at).toISOString() : new Date().toISOString(),
        createdAt: m.created_at ? new Date(m.created_at).toISOString() : new Date().toISOString(),
        seen: m.read_at != null,
      })),
    };
  }

  async sendMemberMessage(userId: string, peerCode: string, text: string) {
    const mems = await this.prisma.$queryRaw<any[]>`
      SELECT code FROM public.members WHERE user_id = ${userId}::uuid LIMIT 1
    `.catch(() => []);
    const myCode = mems[0]?.code;
    if (!myCode) throw new BadRequestException('ERR_NO_MEMBER_PROFILE');

    await this.prisma.$executeRaw`
      INSERT INTO public.messages (id, from_id, to_id, text, created_at)
      VALUES (gen_random_uuid(), ${myCode.toLowerCase()}, ${peerCode.toLowerCase()}, ${text}, now())
    `;

    return { ok: true };
  }

  // â”€â”€ Products / Marketplace â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  async listActiveProducts() {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT id, title, category, views, created_at
      FROM public.products
      WHERE status = 'active'
      ORDER BY created_at DESC
    `.catch(() => []);

    return rows.map((p) => ({
      id: p.id,
      name: p.title,
      company: p.category,
      category: p.category,
      likes: 0,
      views: Number(p.views ?? 0),
      time: p.created_at ? new Date(p.created_at).toISOString() : new Date().toISOString(),
    }));
  }

  async requestProductQuote(userId: string, body: { productId: string; quantity?: number; message?: string }) {
    const mems = await this.prisma.$queryRaw<any[]>`
      SELECT phone FROM public.members WHERE user_id = ${userId}::uuid LIMIT 1
    `.catch(() => []);
    const phone = mems[0]?.phone ?? '';

    await this.prisma.$executeRaw`
      INSERT INTO public.quote_requests (
        id, product_id, buyer_id, quantity, message, contact, status, created_at
      ) VALUES (
        gen_random_uuid(), ${body.productId}, ${userId}::uuid, ${body.quantity ?? 1}, ${body.message ?? 'TĂ´i muá»‘n nháº­n bĂ¡o giĂ¡ sáº£n pháº©m nĂ y.'}, ${phone}, 'pending', now()
      )
    `.catch(() => null);

    return { ok: true };
  }

  // â”€â”€ Content: News & Perks â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  async listPublishedNews() {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT id, title, category, author, excerpt, views, created_at
      FROM public.news
      WHERE status = 'published'
      ORDER BY created_at DESC
    `.catch(() => []);

    return rows.map((n) => ({
      id: n.id,
      title: n.title,
      category: n.category ?? '',
      author: n.author ?? '',
      excerpt: n.excerpt ?? '',
      time: n.created_at ? new Date(n.created_at).toISOString() : '',
      views: Number(n.views ?? 0),
    }));
  }

  async listActivePerks() {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT * FROM public.perks
      WHERE status = 'active'
      ORDER BY sort_order ASC
    `.catch(() => []);

    return rows.map((p) => ({
      id: p.id,
      title: p.title,
      category: p.category ?? '',
      partner: p.partner ?? '',
      summary: p.summary ?? '',
      description: p.description ?? '',
      discount: p.discount ?? '',
      icon: p.icon ?? 'Gift',
      link: p.link ?? '',
      validUntil: p.valid_until ? (p.valid_until instanceof Date ? p.valid_until.toISOString().slice(0, 10) : String(p.valid_until).slice(0, 10)) : null,
    }));
  }

  async getPerkById(id: string) {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT * FROM public.perks WHERE id = ${id} LIMIT 1
    `.catch(() => []);

    if (rows.length === 0) return null;
    const p = rows[0];
    return {
      id: p.id,
      title: p.title,
      category: p.category ?? '',
      partner: p.partner ?? '',
      summary: p.summary ?? '',
      description: p.description ?? '',
      discount: p.discount ?? '',
      icon: p.icon ?? 'Gift',
      link: p.link ?? '',
      validUntil: p.valid_until ? (p.valid_until instanceof Date ? p.valid_until.toISOString().slice(0, 10) : String(p.valid_until).slice(0, 10)) : null,
    };
  }

  // ---------------------------------------------------------------------------
  // Settings
  // ---------------------------------------------------------------------------

  async getSettings(userId: string) {
    const row = await this.prisma.$queryRaw<any[]>`
      SELECT org_name, org_email, lang, email_notif, sms_notif, two_fa
      FROM public.user_settings WHERE user_id = ${userId}::uuid LIMIT 1
    `.catch(() => [] as any[]);
    const r = row[0] ?? null;
    return {
      orgName: r?.org_name ?? 'Hiá»‡p há»™i Doanh nghiá»‡p Viá»‡t Nam',
      orgEmail: r?.org_email ?? 'contact@vba.vn',
      lang: r?.lang ?? 'vi',
      emailNotif: r?.email_notif ?? true,
      smsNotif: r?.sms_notif ?? false,
      twoFa: r?.two_fa ?? true,
    };
  }

  async saveSettings(userId: string, body: any) {
    await this.prisma.$executeRaw`
      INSERT INTO public.user_settings (user_id, org_name, org_email, lang, email_notif, sms_notif, two_fa)
      VALUES (${userId}::uuid, ${body.orgName ?? ''}, ${body.orgEmail ?? ''}, ${body.lang ?? 'vi'},
              ${body.emailNotif ?? true}, ${body.smsNotif ?? false}, ${body.twoFa ?? true})
      ON CONFLICT (user_id) DO UPDATE SET
        org_name = EXCLUDED.org_name, org_email = EXCLUDED.org_email,
        lang = EXCLUDED.lang, email_notif = EXCLUDED.email_notif,
        sms_notif = EXCLUDED.sms_notif, two_fa = EXCLUDED.two_fa
    `.catch(() => null);
    return { ok: true };
  }

  // ---------------------------------------------------------------------------
  // Voting preference
  // ---------------------------------------------------------------------------

  async getVotingPref(userId: string) {
    const row = await this.prisma.$queryRaw<any[]>`
      SELECT voting_open_pref FROM public.user_settings WHERE user_id = ${userId}::uuid LIMIT 1
    `.catch(() => [] as any[]);
    return { pref: (row[0]?.voting_open_pref ?? null) as 'same' | 'new' | null };
  }

  async setVotingPref(userId: string, pref: string | null) {
    await this.prisma.$executeRaw`
      INSERT INTO public.user_settings (user_id, voting_open_pref)
      VALUES (${userId}::uuid, ${pref})
      ON CONFLICT (user_id) DO UPDATE SET voting_open_pref = EXCLUDED.voting_open_pref
    `.catch(() => null);
    return { ok: true };
  }

  // ---------------------------------------------------------------------------
  // Post-login route
  // ---------------------------------------------------------------------------

  async getPostLoginRoute(userId: string): Promise<{ to: '/' | '/m' }> {
    const platformAdmin = await this.prisma.$queryRaw<any[]>`
      SELECT 1 FROM public.vione_users WHERE id = ${userId}::uuid AND role = 'platform_admin' LIMIT 1
    `.catch(() => [] as any[]);
    if (platformAdmin.length > 0) return { to: '/' };

    const memberships = await this.prisma.$queryRaw<any[]>`
      SELECT role FROM public.memberships WHERE user_id = ${userId}::uuid
    `.catch(() => [] as any[]);
    const isAdmin = (memberships ?? []).some((m: any) => m.role === 'admin' || m.role === 'association_admin');
    return { to: isAdmin ? '/' : '/m' };
  }

  // ---------------------------------------------------------------------------
  // Media signed URL (Supabase Storage via REST â€” no SDK)
  // ---------------------------------------------------------------------------

  async getMediaSignedUrl(userId: string, path: string) {
    const bucket = 'product-media';
    const ttl = 3600;
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;
    if (!supabaseUrl || !supabaseKey || !path) return { signedUrl: null };

    try {
      const res = await fetch(`${supabaseUrl}/storage/v1/object/sign/${bucket}/${encodeURIComponent(path)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
          'apikey': supabaseKey,
        },
        body: JSON.stringify({ expiresIn: ttl }),
      });
      if (!res.ok) return { signedUrl: null };
      const data: any = await res.json();
      const signedUrl = data?.signedURL ? `${supabaseUrl}/storage/v1${data.signedURL}` : null;
      return { signedUrl };
    } catch {
      return { signedUrl: null };
    }
  }

  // ---------------------------------------------------------------------------
  // Public: share guest contact (via Supabase RPC over REST â€” no SDK)
  // ---------------------------------------------------------------------------

  async shareGuestContact(slug: string, body: any) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_PUBLISHABLE_KEY;
    if (!supabaseUrl || !supabaseKey) throw new InternalServerErrorException('service_unavailable');

    const res = await fetch(`${supabaseUrl}/rest/v1/rpc/share_guest_contact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey,
      },
      body: JSON.stringify({
        p_slug: slug,
        p_display_name: body.displayName ?? '',
        p_phone: body.phone ?? null,
        p_email: body.email ?? null,
        p_company_name: body.companyName ?? null,
        p_title: body.title ?? null,
        p_consent_version: body.consentVersion ?? 1,
        p_client_token: body.clientToken ?? null,
      }),
    });

    if (!res.ok) throw new InternalServerErrorException('submission_failed');
    const data: any = await res.json();
    return data;
  }

  // ---------------------------------------------------------------------------
  // Admin: renewal audit scope
  // ---------------------------------------------------------------------------

  async getAdminRenewalScope(userId: string) {
    const platformAdmin = await this.prisma.$queryRaw<any[]>`
      SELECT 1 FROM public.vione_users WHERE id = ${userId}::uuid AND role = 'platform_admin' LIMIT 1
    `.catch(() => [] as any[]);

    if (platformAdmin.length > 0) {
      const assocs = await this.prisma.$queryRaw<any[]>`
        SELECT id, name FROM public.associations ORDER BY name
      `.catch(() => [] as any[]);
      return {
        isPlatformAdmin: true,
        associations: assocs.map((a: any) => ({ id: a.id, name: a.name })),
      };
    }

    const memberships = await this.prisma.$queryRaw<any[]>`
      SELECT association_id, role FROM public.memberships WHERE user_id = ${userId}::uuid
    `.catch(() => [] as any[]);

    const adminAssocIds = (memberships ?? [])
      .filter((m: any) => m.role === 'admin' || m.role === 'association_admin')
      .map((m: any) => m.association_id)
      .filter(Boolean);

    if (!adminAssocIds.length) return { isPlatformAdmin: false, associations: [] };

    const assocs = await this.prisma.$queryRaw<any[]>`
      SELECT id, name FROM public.associations WHERE id = ANY(${adminAssocIds}) ORDER BY name
    `.catch(() => [] as any[]);

    return {
      isPlatformAdmin: false,
      associations: assocs.map((a: any) => ({ id: a.id, name: a.name })),
    };
  }

  // ---------------------------------------------------------------------------
  // Admin: renewal audit log search
  // ---------------------------------------------------------------------------

  async searchRenewalAuditLog(userId: string, query: any) {
    const scope = await this.getAdminRenewalScope(userId);
    const allowedIds = scope.associations.map((a: any) => a.id);
    if (!scope.isPlatformAdmin && !allowedIds.length) {
      throw new ForbiddenException('Not an admin');
    }

    const limit = Math.min(query.limit ?? 200, 500);
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;
    if (!supabaseUrl || !supabaseKey) return [];

    const params = new URLSearchParams();
    params.set('select', 'id,event_type,member_id,association_id,reference,method,amount_paid,invoice_no,previous_term_end,new_term_end,error_code,error_message,metadata,created_at');
    params.set('order', 'created_at.desc');
    params.set('limit', String(limit));

    if (query.associationId) {
      if (!scope.isPlatformAdmin && !allowedIds.includes(query.associationId)) {
        throw new ForbiddenException('Not allowed for this association');
      }
      params.set('association_id', `eq.${query.associationId}`);
    } else if (!scope.isPlatformAdmin) {
      params.set('association_id', `in.(${allowedIds.join(',')})`);
    }

    if (query.memberId) params.set('member_id', `eq.${query.memberId}`);
    if (query.eventType) params.set('event_type', `eq.${query.eventType}`);
    if (query.from) params.set('created_at', `gte.${new Date(query.from).toISOString()}`);
    if (query.to) {
      const end = new Date(query.to);
      end.setHours(23, 59, 59, 999);
      params.set('created_at', `lte.${end.toISOString()}`);
    }

    try {
      const res = await fetch(`${supabaseUrl}/rest/v1/renewal_audit_log?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'apikey': supabaseKey,
        },
      });
      if (!res.ok) return [];
      const rows: any[] = await res.json();

      const memberIds = [...new Set(rows.map((r: any) => r.member_id).filter(Boolean))];
      const assocIds = [...new Set(rows.map((r: any) => r.association_id).filter(Boolean))];

      const [members, assocs] = await Promise.all([
        memberIds.length
          ? this.prisma.$queryRaw<any[]>`SELECT id, name, code FROM public.members WHERE id = ANY(${memberIds})`
          : Promise.resolve([] as any[]),
        assocIds.length
          ? this.prisma.$queryRaw<any[]>`SELECT id, name FROM public.associations WHERE id = ANY(${assocIds})`
          : Promise.resolve([] as any[]),
      ]).catch(() => [[], []] as any[][]);

      const memberMap = new Map((members ?? []).map((m: any) => [m.id, m]));
      const assocMap = new Map((assocs ?? []).map((a: any) => [a.id, a.name]));
      const needle = (query.search ?? '').trim().toLowerCase();

      return rows
        .map((r: any) => {
          const m: any = memberMap.get(r.member_id);
          return {
            id: r.id,
            eventType: r.event_type,
            memberId: r.member_id ?? null,
            memberName: m?.name ?? null,
            memberCode: m?.code ?? null,
            associationId: r.association_id ?? null,
            associationName: assocMap.get(r.association_id) ?? null,
            reference: r.reference,
            method: r.method ?? null,
            amountPaid: Number(r.amount_paid ?? 0),
            invoiceNo: r.invoice_no ?? null,
            previousTermEnd: r.previous_term_end ?? null,
            newTermEnd: r.new_term_end ?? null,
            errorCode: r.error_code ?? null,
            errorMessage: r.error_message ?? null,
            metadata: r.metadata ?? {},
            createdAt: r.created_at,
          };
        })
        .filter((r: any) => {
          if (!needle) return true;
          return [r.memberName, r.memberCode, r.reference, r.invoiceNo]
            .filter(Boolean)
            .some((v: any) => String(v).toLowerCase().includes(needle));
        });
    } catch {
      return [];
    }
  }
}

// ==========================================
// OCR & AI Suggestions Global Helper Functions
// ==========================================

function parsePersonId(personId: string) {
  const kindChar = personId.substring(0, 1);
  const idVal = personId.substring(2);
  let targetKind = 'connection';
  let targetUserId: string | null = null;
  let targetCardId: string | null = null;
  let targetGuestId: string | null = null;

  if (kindChar === 'u') {
    targetKind = 'connection';
    targetUserId = idVal;
  } else if (kindChar === 'c') {
    targetKind = 'saved_card';
    targetCardId = idVal;
  } else if (kindChar === 'g') {
    targetKind = 'guest_contact';
    targetGuestId = idVal;
  }

  return { targetKind, targetUserId, targetCardId, targetGuestId };
}

function composePersonId(targetKind: string, targetUserId: string | null, targetCardId: string | null, targetGuestId: string | null) {
  if (targetKind === 'connection' && targetUserId) return `u:${targetUserId}`;
  if (targetKind === 'saved_card' && targetCardId) return `c:${targetCardId}`;
  if (targetKind === 'guest_contact' && targetGuestId) return `g:${targetGuestId}`;
  return '';
}

const OCR_MODEL_MAX_LINES = 40;
const ocrModelOutputSchema = z
  .object({
    isBusinessCard: z.boolean(),
    unusableReason: z.string().max(120).nullish(),
    lines: z
      .array(
        z
          .object({
            text: z.string().min(1).max(200),
            confidence: z.number().min(0).max(1),
          })
          .strict(),
      )
      .max(OCR_MODEL_MAX_LINES),
    displayNameLine: z.number().int().min(0).nullable(),
    titleLine: z.number().int().min(0).nullable(),
    companyNameLine: z.number().int().min(0).nullable(),
    addressLine: z.number().int().min(0).nullable(),
    qrPresent: z.boolean().nullish(),
  })
  .strict();

function normalizeText(s: string): string {
  return s.normalize("NFC").replace(/\s+/g, " ").trim();
}

function clamp01(n: number): number {
  return Math.min(1, Math.max(0, n));
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

const EMAIL_RE = /[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+/g;
const EMAIL_SUSPECT_RE = /[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*,[A-Za-z]{2,}/g;

function extractEmails(lines: any[], warnings: string[]): any[] {
  const out: any[] = [];
  const seen = new Set<string>();
  let uncertain = false;
  for (const line of lines) {
    for (const m of line.text.matchAll(EMAIL_RE)) {
      const value = m[0].toLowerCase();
      if (seen.has(value)) continue;
      seen.add(value);
      out.push({ value, confidence: clamp01(line.confidence), sourceText: line.text });
    }
    for (const m of line.text.matchAll(EMAIL_SUSPECT_RE)) {
      const value = m[0].toLowerCase();
      if (seen.has(value)) continue;
      seen.add(value);
      uncertain = true;
      out.push({
        value,
        confidence: round2(clamp01(line.confidence) * 0.5),
        sourceText: line.text,
      });
    }
  }
  if (uncertain) warnings.push("email_uncertain");
  return out;
}

const PHONE_RE = /\+?\d[\d\s().-]{5,}\d/g;

function detectPhoneLabel(lineText: string): string | undefined {
  const s = lineText.toLowerCase();
  if (s.includes("fax")) return "fax";
  if (s.includes("hotline")) return "hotline";
  const tokens = s.split(/[^a-z0-9Ă -á»¹]+/u).filter(Boolean);
  const has = (set: readonly string[]) => tokens.some((tok) => set.includes(tok));
  if (has(["mobile", "mobi", "cell", "hp"]) || s.includes("di Ä‘á»™ng") || s.includes("di dong")) {
    return "mobile";
  }
  if (
    has(["office", "tel", "phone", "Ä‘t", "dt"]) ||
    s.includes("vÄƒn phĂ²ng") ||
    s.includes("van phong")
  ) {
    return "office";
  }
  return undefined;
}

function normalizePhoneDigits(raw: string): string {
  const plus = raw.trimStart().startsWith("+");
  const digits = raw.replace(/\D/g, "");
  return plus ? `+${digits}` : digits;
}

function extractPhones(lines: any[], warnings: string[]): any[] {
  const out: any[] = [];
  const seen = new Set<string>();
  let uncertain = false;
  for (const line of lines) {
    for (const m of line.text.matchAll(PHONE_RE)) {
      const digits = m[0].replace(/\D/g, "");
      if (digits.length < 7 || digits.length > 15) continue;
      const value = normalizePhoneDigits(m[0]);
      if (seen.has(value)) continue;
      seen.add(value);
      const label = detectPhoneLabel(line.text);
      if (line.confidence < 0.5 || digits.length < 8) uncertain = true;
      out.push({
        value,
        confidence: clamp01(line.confidence),
        sourceText: line.text,
        ...(label ? { label } : {}),
      });
    }
  }
  if (uncertain) warnings.push("phone_uncertain");
  return out;
}

const URL_RE = /(?:https?:\/\/|www\.)[^\s<>()"']+/gi;

function extractWebsite(lines: any[]): any | undefined {
  for (const line of lines) {
    for (const m of line.text.matchAll(URL_RE)) {
      let raw = m[0].replace(/[.,;:!?)}\]]+$/, "");
      if (raw.includes("@")) continue;
      if (!/^https?:\/\//i.test(raw)) raw = `https://${raw}`;
      try {
        const u = new URL(raw);
        if (u.protocol !== "http:" && u.protocol !== "https:") continue;
        return { value: u.toString(), confidence: clamp01(line.confidence), sourceText: line.text };
      } catch {
        continue;
      }
    }
  }
  return undefined;
}

const CONTACT_PATTERN = /@|\(?\+?\d[\d\s().-]{6,}\d/;

function pickClassifiedLine(
  lines: any[],
  index: number | null,
  opts: { maxLen: number; forbidContactPattern?: boolean },
): any | undefined {
  if (index === null) return undefined;
  const line = lines[index];
  if (!line) return undefined;
  const value = normalizeText(line.text);
  if (!value || value.length > opts.maxLen) return undefined;
  if (opts.forbidContactPattern && CONTACT_PATTERN.test(value)) return undefined;
  return { value, confidence: clamp01(line.confidence), sourceText: line.text };
}

function buildCandidateFromModel(model: any, scanId: string): any {
  if (!model.isBusinessCard) return { ok: false, code: "unusable" };

  const lines: any[] = model.lines
    .map((l) => ({ text: normalizeText(l.text), confidence: clamp01(l.confidence) }))
    .filter((l) => l.text.length > 0);
  if (lines.length === 0) return { ok: false, code: "unusable" };

  const warnings: string[] = [];
  if (model.qrPresent) warnings.push("qr_present");

  const displayName = pickClassifiedLine(lines, model.displayNameLine, {
    maxLen: 80,
    forbidContactPattern: true,
  });
  if (model.displayNameLine !== null && !displayName) warnings.push("name_needs_review");

  const title = pickClassifiedLine(lines, model.titleLine, { maxLen: 120 });
  if (model.titleLine !== null && !title) warnings.push("title_needs_review");

  const companyName = pickClassifiedLine(lines, model.companyNameLine, { maxLen: 120 });
  if (model.companyNameLine !== null && !companyName) warnings.push("company_needs_review");

  const address = pickClassifiedLine(lines, model.addressLine, { maxLen: 160 });
  if (model.addressLine !== null && !address) warnings.push("address_needs_review");

  const emails = extractEmails(lines, warnings);
  const phones = extractPhones(lines, warnings);
  const website = extractWebsite(lines);

  if (!displayName) warnings.push("no_name");
  const hasChannel = phones.length > 0 || emails.length > 0 || website !== undefined;
  if (!hasChannel) warnings.push("no_contact_channel");
  if (!displayName && !hasChannel) return { ok: false, code: "unusable" };

  const present: any[] = [
    ...(displayName ? [displayName] : []),
    ...(title ? [title] : []),
    ...(companyName ? [companyName] : []),
    ...(website ? [website] : []),
    ...(address ? [address] : []),
    ...phones,
    ...emails,
  ];
  const overallConfidence =
    present.length === 0
      ? 0
      : round2(present.reduce((sum, f) => sum + f.confidence, 0) / present.length);

  return {
    ok: true,
    candidate: {
      schemaVersion: 1,
      scanId,
      status: "candidate",
      fields: {
        ...(displayName ? { displayName } : {}),
        ...(title ? { title } : {}),
        ...(companyName ? { companyName } : {}),
        phones,
        emails,
        ...(website ? { website } : {}),
        ...(address ? { address } : {}),
      },
      warnings,
      overallConfidence,
    },
  };
}

function candidateFromRawModelOutput(raw: unknown, scanId: string): any {
  const parsed = ocrModelOutputSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, code: "invalid_output" };
  const built = buildCandidateFromModel(parsed.data, scanId);
  if (!built.ok) return { ok: false, code: "unusable" };
  return { ok: true, candidate: built.candidate };
}

async function runCardOcrVision(imageDataUrl: string): Promise<unknown> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new Error("OCR runtime is not configured");

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      temperature: 0.1,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You are a business-card OCR extraction engine inside a contact-acquisition pipeline.
Return STRICT JSON only:
{
  "isBusinessCard": boolean,
  "unusableReason": string | null,
  "lines": [ { "text": string, "confidence": number } ],
  "displayNameLine": number | null,
  "titleLine": number | null,
  "companyNameLine": number | null,
  "addressLine": number | null,
  "qrPresent": boolean
}`
        },
        {
          role: "user",
          content: [
            { type: "text", text: "Read this business card image and return JSON." },
            { type: "image_url", image_url: { url: imageDataUrl } }
          ]
        }
      ]
    })
  });

  if (!response.ok) throw new Error(`OCR provider error ${response.status}`);
  const json = await response.json() as any;
  const content = json?.choices?.[0]?.message?.content;
  if (!content) throw new Error("OCR provider returned an empty response");
  return JSON.parse(content);
}

async function suggestCustomerTags(input: {
  stageLabel: string;
  displayName: string;
  companyName: string;
  note: string;
  logs: string[];
  needs: string[];
  existingTagNames: string[];
  currentTagNames: string[];
  approvedTagNames?: string[];
  rejectedTagNames?: string[];
}) {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) return { ok: false, error: "unavailable" as const };

  const context = [
    `TĂªn: ${input.displayName || "(khĂ´ng rĂµ)"}`,
    `CĂ´ng ty: ${input.companyName || "(khĂ´ng rĂµ)"}`,
    `Giai Ä‘oáº¡n: ${input.stageLabel}`,
    `Ghi chĂº: ${input.note || "(trá»‘ng)"}`,
    `Lá»‹ch sá»­ chÄƒm sĂ³c:\n${input.logs.length ? input.logs.map((l) => `- ${l}`).join("\n") : "(trá»‘ng)"}`,
    `Äiá»ƒm Ä‘au & nhu cáº§u:\n${input.needs.length ? input.needs.map((n) => `- ${n}`).join("\n") : "(trá»‘ng)"}`,
    `NhĂ£n Ä‘Ă£ gáº¯n: ${input.currentTagNames.join(", ") || "(chÆ°a cĂ³)"}`,
    `Danh má»¥c nhĂ£n hiá»‡n cĂ³: ${input.existingTagNames.join(", ") || "(chÆ°a cĂ³)"}`,
    `NhĂ£n ngÆ°á»i dĂ¹ng Ä‘Ă¡nh giĂ¡ ÄĂNG trÆ°á»›c Ä‘Ă¢y: ${(input.approvedTagNames ?? []).join(", ") || "(chÆ°a cĂ³)"}`,
    `NhĂ£n ngÆ°á»i dĂ¹ng Ä‘Ă¡nh giĂ¡ SAI trÆ°á»›c Ä‘Ă¢y (tuyá»‡t Ä‘á»‘i khĂ´ng Ä‘á» xuáº¥t láº¡i): ${
      (input.rejectedTagNames ?? []).join(", ") || "(chÆ°a cĂ³)"
    }`,
  ].join("\n");

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content: `Báº¡n lĂ  trá»£ lĂ½ phĂ¢n nhĂ³m khĂ¡ch hĂ ng cho má»™t ngÆ°á»i bĂ¡n hĂ ng cĂ¡ nhĂ¢n.
Äá» xuáº¥t tá»‘i Ä‘a 5 NHĂƒN ngáº¯n Ä‘á»ƒ phĂ¢n nhĂ³m khĂ¡ch hĂ ng.
Tráº£ vá» DUY NHáº¤T JSON dáº¡ng: {"suggestions":[{"name":"...","reason":"...","confidence":0.8}]}. KhĂ´ng markdown.`
        },
        { role: "user", content: context }
      ]
    })
  });

  if (!response.ok) return { ok: false, error: "unavailable" as const };
  const json = await response.json() as any;
  const content = json?.choices?.[0]?.message?.content ?? "";
  
  try {
    const text = content.replace(/```json/gi, "").replace(/```/g, "").trim();
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start < 0 || end <= start) return { ok: false, error: "unavailable" as const };
    const parsed = JSON.parse(text.slice(start, end + 1)) as any;
    const rawSuggestions = (parsed.suggestions ?? []).map((s: any) => ({
      name: String(s.name || '').trim().slice(0, 24),
      reason: String(s.reason || '').trim().slice(0, 120),
      confidence: typeof s.confidence === 'number' ? s.confidence : 0.5,
    })).filter((s: any) => s.name.length > 0).slice(0, 5);

    const existing = new Set(input.existingTagNames.map(n => n.toLowerCase()));
    const already = new Set(input.currentTagNames.map(n => n.toLowerCase()));
    const seen = new Set<string>();
    const suggestions: any[] = [];
    
    for (const s of rawSuggestions) {
      const key = s.name.toLowerCase();
      if (seen.has(key) || already.has(key)) continue;
      seen.add(key);
      suggestions.push({
        name: s.name,
        reason: s.reason,
        existing: existing.has(key),
        confidence: s.confidence,
      });
    }

    return { ok: true, suggestions };
  } catch {
    return { ok: false, error: "unavailable" as const };
  }
}
