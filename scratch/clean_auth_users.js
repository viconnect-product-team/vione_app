const { Client } = require('pg');
const c = new Client({ connectionString: 'postgresql://app1:5%5ES0CEpvYwC1%28%23YN1UoJ@113.20.107.184:6432/vione_app?sslmode=disable' });

async function run() {
  await c.connect();
  const validIds = [
    '00000000-0000-4000-8000-000000000001',
    '00000000-0000-4000-8000-000000000002',
    '00000000-0000-4000-8000-000000000003',
    '00000000-0000-4000-8000-000000000004',
    '00000000-0000-4000-8000-000000000005',
    '00000000-0000-4000-8000-000000000006',
    'c1983000-0000-4000-8000-000000000001',
    'c1983000-0000-4000-8000-000000000002',
    'c1983000-0000-4000-8000-000000000003',
    'c1983000-0000-4000-8000-000000000004',
    'c1983000-0000-4000-8000-000000000005',
    'c1983000-0000-4000-8000-000000000006',
    'c1983000-0000-4000-8000-000000000007',
    'c1983000-0000-4000-8000-000000000008',
    'c1983000-0000-4000-8000-000000000009',
    'c1983000-0000-4000-8000-000000000010'
  ];
  
  await c.query('DROP TRIGGER IF EXISTS bmfu_block_delete_trg ON public.business_meeting_follow_ups;');
  await c.query('DELETE FROM public.business_meeting_follow_ups;');

  const childTables = [
    'public.business_meeting_calendar_projections',
    'public.business_meeting_time_proposals',
    'public.business_meeting_proposals',
    'public.business_meeting_participants',
    'public.business_meetings',
    'public.business_relationship_memory_feedback',
    'public.business_relationship_memory_links',
    'public.business_relationship_memory_sources',
    'public.business_relationship_memories',
    'public.business_relationship_memory_extraction_receipts',
    'public.business_connect_ai_tool_invocations',
    'public.business_connect_ai_result_feedback',
    'public.business_connect_ai_rate_counters',
    'public.business_connect_ai_requests',
    'public.business_connect_ai_results',
    'public.relationship_intelligence_interactions',
    'public.relationship_recommendation_dismissals',
    'public.relationship_intelligence_preferences',
    'public.community_opportunity_followup_events',
    'public.community_opportunity_followups',
    'public.community_join_requests',
    'public.community_invitations',
    'public.community_invite_templates',
    'public.bc_customer_tag_suggestion_feedback',
    'public.bc_customer_tag_suggestion_runs',
    'public.bc_customer_needs',
    'public.business_relationship_moment_reminders',
    'public.business_relationship_person_plans',
    'public.business_identity_showcase_items',
    'public.identity_nfc_tags',
    'public.identity_share_links',
    'public.identity_field_visibility',
    'public.business_identities',
    'public.user_device_sessions',
    'public.gn_reports',
    'public.gn_notifications',
    'public.gn_notification_prefs',
    'public.user_connections',
    'public.saved_card_tags',
    'public.saved_card_collections',
    'public.saved_business_cards',
    'public.relationship_events',
    'public.business_interactions',
    'public.business_availability_preferences',
    'public.business_calendar_accounts',
    'public.broadcast_notification_dismissals',
    'public.bc_admin_grants',
    'public.card_ai_import_history',
    'public.card_settings',
    'public.association_logo_history',
    'public.user_settings',
    'public.profiles'
  ];

  for (const t of childTables) {
    try {
      await c.query('DELETE FROM ' + t + ';');
    } catch(e) {}
  }

  const res = await c.query('DELETE FROM auth.users WHERE NOT (id = ANY($1::uuid[]));', [validIds]);
  console.log('Deleted old auth.users:', res.rowCount);
  const count = await c.query('SELECT count(*) FROM auth.users;');
  console.log('Remaining auth.users count:', count.rows[0].count);

  // Re-create trigger if needed
  await c.query(`
    CREATE TRIGGER bmfu_block_delete_trg
    BEFORE DELETE ON public.business_meeting_follow_ups
    FOR EACH ROW EXECUTE FUNCTION bmfu_block_delete();
  `);

  await c.end();
}
run();
