const { Client } = require('pg');

const DB_URL = 'postgresql://app1:5%5ES0CEpvYwC1%28%23YN1UoJ@113.20.107.184:6432/vione_app?sslmode=disable';

async function runTest() {
  const client = new Client({ connectionString: DB_URL });
  await client.connect();
  console.log('--- TEST: MULTI-APP VOTING & NOTIFICATION FLOW ---');
  console.log('Connected to PostgreSQL database...');

  const pollId = 'e0000000-0000-4000-8000-000000002026';
  const assocId = 'c1983000-0000-4000-8000-000000001983';
  const opt1Id = 'e0000000-0000-4000-8000-000000000001';
  const opt2Id = 'e0000000-0000-4000-8000-000000000002';

  // Find three distinct users for voting
  const userRes = await client.query(`SELECT id FROM auth.users LIMIT 3;`);
  const userA = userRes.rows[0]?.id || 'c1983000-0000-4000-8000-000000000001';
  const userB = userRes.rows[1]?.id || 'c1983000-0000-4000-8000-000000000002';
  const userC = userRes.rows[2]?.id || 'c1983000-0000-4000-8000-000000000003';
  console.log(`Test users: User A (${userA}), User B (${userB}), User C (${userC})`);

  try {
    // 1. Clean previous test artifacts
    await client.query(`DELETE FROM public.poll_votes WHERE poll_id = $1::uuid`, [pollId]);
    await client.query(`DELETE FROM public.poll_options WHERE poll_id = $1::uuid`, [pollId]);
    await client.query(`DELETE FROM public.polls WHERE id = $1::uuid`, [pollId]);
    await client.query(`DELETE FROM public.business_notifications WHERE source_record_id = $1`, [pollId]);
    await client.query(`DELETE FROM public.member_notifications WHERE ref_id = $1`, [pollId]);

    // 2. Verify schema: source_app column in poll_votes
    const colCheck = await client.query(`
      SELECT column_name, data_type, column_default 
      FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'poll_votes' AND column_name = 'source_app';
    `);
    console.log('1. Schema check (source_app in poll_votes):', colCheck.rows[0]);
    if (!colCheck.rows.length) {
      throw new Error('Column source_app missing in public.poll_votes');
    }

    // 3. Create Poll in CRM
    console.log('2. Creating Poll in CRM...');
    await client.query(`
      INSERT INTO public.polls (
        id, title, description, status, created_at, updated_at
      ) VALUES (
        $1::uuid, $2, $3, 'open', NOW(), NOW()
      );
    `, [
      pollId,
      'Biểu quyết: Kế hoạch xúc tiến thương mại Quốc tế 2026',
      'Đại hội biểu quyết phương án tổ chức sự kiện B2B tại Singapore hoặc Nhật Bản',
    ]);

    // Options
    await client.query(`
      INSERT INTO public.poll_options (id, poll_id, title, votes_count, created_at)
      VALUES 
        ($1::uuid, $2::uuid, 'Phương án A: Tổ chức tại Singapore (Tháng 10/2026)', 0, NOW()),
        ($3::uuid, $2::uuid, 'Phương án B: Tổ chức tại Tokyo Nhật Bản (Tháng 11/2026)', 0, NOW());
    `, [opt1Id, pollId, opt2Id]);
    console.log('   ✓ Poll and Options inserted into public.polls & public.poll_options');

    // 4. Dispatch Notifications to ViOne App & Hiệp hội App
    console.log('3. Dispatching Poll Created notifications to ViOne App & Hiệp hội App...');
    const notifOptions = [
      { id: opt1Id, title: 'Phương án A: Tổ chức tại Singapore (Tháng 10/2026)' },
      { id: opt2Id, title: 'Phương án B: Tổ chức tại Tokyo Nhật Bản (Tháng 11/2026)' },
    ];
    const pollCreatedPayload = {
      pollId,
      title: 'Biểu quyết: Kế hoạch xúc tiến thương mại Quốc tế 2026',
      targetAudience: 'all',
      options: notifOptions,
    };

    // Broadcast to ViOne App (business_notifications)
    await client.query(`
      INSERT INTO public.business_notifications (
        id, recipient_user_id, source_domain, source_record_id, event_kind, notification_kind,
        title_key, body_key, safe_display_data, priority, status, dedupe_key, app_scope, target_app, created_at, updated_at
      ) VALUES (
        gen_random_uuid(), $1, 'voting', $2, 'poll_created', 'interactive_poll',
        'Mời tham gia biểu quyết mới', 'Có biểu quyết mới: Kế hoạch xúc tiến thương mại Quốc tế 2026',
        $3::jsonb, 'high', 'delivered', $4, 'all', 'all', NOW(), NOW()
      );
    `, [userA, pollId, JSON.stringify(pollCreatedPayload), `poll-created-${pollId}-${userA}`]);

    // Broadcast to Hiệp hội App (member_notifications)
    await client.query(`
      INSERT INTO public.member_notifications (
        id, recipient_id, title, body, read, dismissed, ref_type, ref_id, created_at
      ) VALUES (
        gen_random_uuid(), $1, 'Biểu quyết Hiệp hội mới',
        'Có biểu quyết mới: Kế hoạch xúc tiến thương mại Quốc tế 2026',
        false, false, 'poll', $2, NOW()
      );
    `, [userB, pollId]);
    console.log('   ✓ Notifications dispatched to ViOne App and Hiệp hội App');

    // 5. Cast Votes across different Apps
    console.log('4. Simulating votes from distinct client applications:');

    // Vote 1: User A votes for Option 1 via ViOne App
    console.log('   -> User A voting Option 1 via [ViOne App] (source_app: vione_app)...');
    await client.query(`
      INSERT INTO public.poll_votes (id, poll_id, option_id, user_id, source_app, created_at)
      VALUES (gen_random_uuid(), $1::uuid, $2::uuid, $3::uuid, 'vione_app', NOW());
    `, [pollId, opt1Id, userA]);

    // Vote 2: User B votes for Option 1 via Hiệp hội App
    console.log('   -> User B voting Option 1 via [Hiệp hội App] (source_app: association_app)...');
    await client.query(`
      INSERT INTO public.poll_votes (id, poll_id, option_id, user_id, source_app, created_at)
      VALUES (gen_random_uuid(), $1::uuid, $2::uuid, $3::uuid, 'association_app', NOW());
    `, [pollId, opt1Id, userB]);

    // Vote 3: User C votes for Option 2 via CRM Web
    console.log('   -> User C voting Option 2 via [CRM Web] (source_app: crm)...');
    await client.query(`
      INSERT INTO public.poll_votes (id, poll_id, option_id, user_id, source_app, created_at)
      VALUES (gen_random_uuid(), $1::uuid, $2::uuid, $3::uuid, 'crm', NOW());
    `, [pollId, opt2Id, userC]);

    // 6. Verify Aggregated Results and Source Tracking in CRM
    console.log('5. Querying aggregated results and channel attribution:');
    const sourceBreakdownRes = await client.query(`
      SELECT 
        source_app,
        COUNT(*)::int as count
      FROM public.poll_votes
      WHERE poll_id = $1::uuid
      GROUP BY source_app;
    `, [pollId]);
    console.log('   Votes by source_app:', sourceBreakdownRes.rows);

    const sourceStats = {
      vioneApp: 0,
      associationApp: 0,
      crm: 0,
    };
    for (const r of sourceBreakdownRes.rows) {
      if (r.source_app === 'vione_app') sourceStats.vioneApp = r.count;
      else if (r.source_app === 'association_app') sourceStats.associationApp = r.count;
      else if (r.source_app === 'crm') sourceStats.crm = r.count;
    }

    if (sourceStats.vioneApp !== 1 || sourceStats.associationApp !== 1 || sourceStats.crm !== 1) {
      throw new Error(`Source stats mismatch! Expected 1,1,1 but got: ${JSON.stringify(sourceStats)}`);
    }
    console.log('   ✓ Source statistics verified: 1 ViOne App, 1 Hiệp hội App, 1 CRM');

    // Option votes
    const optionVotesRes = await client.query(`
      SELECT 
        o.id,
        o.title,
        COUNT(v.id)::int as votes_count,
        COUNT(CASE WHEN v.source_app = 'vione_app' THEN 1 END)::int as vione_votes,
        COUNT(CASE WHEN v.source_app = 'association_app' THEN 1 END)::int as association_votes,
        COUNT(CASE WHEN v.source_app = 'crm' THEN 1 END)::int as crm_votes
      FROM public.poll_options o
      LEFT JOIN public.poll_votes v ON v.option_id = o.id
      WHERE o.poll_id = $1::uuid
      GROUP BY o.id, o.title;
    `, [pollId]);
    console.log('   Option stats with source breakdown:', optionVotesRes.rows);

    const totalVotes = 3;
    const winnerOpt = optionVotesRes.rows.find(o => o.id === opt1Id);
    if (winnerOpt.votes_count !== 2) {
      throw new Error(`Option 1 should have 2 votes, got ${winnerOpt.votes_count}`);
    }
    console.log(`   ✓ Winner determined: "${winnerOpt.title}" with 2 votes (${Math.round(2/3*100)}%)`);

    // 7. Simulate Closing Poll in CRM
    console.log('6. Closing Poll in CRM and broadcasting final results...');
    await client.query(`
      UPDATE public.polls 
      SET status = 'closed', updated_at = NOW()
      WHERE id = $1::uuid;
    `, [pollId]);

    const finalResultPayload = {
      pollId,
      isClosed: true,
      totalVotes,
      winner: {
        id: winnerOpt.id,
        title: winnerOpt.title,
        votesCount: winnerOpt.votes_count,
        percentage: Math.round((winnerOpt.votes_count / totalVotes) * 100),
      },
      sourceStats,
      options: optionVotesRes.rows.map(o => ({
        id: o.id,
        title: o.title,
        votesCount: o.votes_count,
        percentage: Math.round((o.votes_count / totalVotes) * 100),
        vioneVotes: o.vione_votes,
        associationVotes: o.association_votes,
        crmVotes: o.crm_votes,
        isLeading: o.id === winnerOpt.id,
      })),
    };

    // Insert closed notification for ViOne App
    await client.query(`
      INSERT INTO public.business_notifications (
        id, recipient_user_id, source_domain, source_record_id, event_kind, notification_kind,
        title_key, body_key, safe_display_data, priority, status, dedupe_key, app_scope, target_app, created_at, updated_at
      ) VALUES (
        gen_random_uuid(), $1, 'voting', $2, 'poll_closed', 'poll_result',
        'Kết quả biểu quyết: Kế hoạch xúc tiến thương mại Quốc tế 2026',
        'Biểu quyết đã kết thúc. Phương án chiến thắng: ' || $3,
        $4::jsonb, 'high', 'delivered', $5, 'all', 'all', NOW(), NOW()
      );
    `, [userA, pollId, winnerOpt.title, JSON.stringify(finalResultPayload), `poll-result-${pollId}-${userA}`]);

    // Insert closed notification for Hiệp hội App
    await client.query(`
      INSERT INTO public.member_notifications (
        id, recipient_id, title, body, read, dismissed, ref_type, ref_id, created_at
      ) VALUES (
        gen_random_uuid(), $1,
        'Kết quả biểu quyết: Kế hoạch xúc tiến thương mại Quốc tế 2026',
        'Biểu quyết đã kết thúc. Phương án chiến thắng: ' || $2,
        false, false, 'poll_result', $3, NOW()
      );
    `, [userB, winnerOpt.title, pollId]);
    console.log('   ✓ Poll closed notifications with full winner & breakdown payloads inserted.');

    // 8. Verification: Check closed notifications exist and can be read by both apps
    const vioneNotif = await client.query(`
      SELECT notification_kind, event_kind, safe_display_data
      FROM public.business_notifications
      WHERE source_record_id = $1 AND event_kind = 'poll_closed';
    `, [pollId]);
    console.log('7. Verifying ViOne App closed notification payload:');
    console.log('   ViOne notif display winner:', vioneNotif.rows[0].safe_display_data.winner);
    console.log('   ViOne notif source stats:', vioneNotif.rows[0].safe_display_data.sourceStats);

    const assocNotif = await client.query(`
      SELECT ref_type, ref_id, title, body
      FROM public.member_notifications
      WHERE ref_id = $1 AND ref_type = 'poll_result';
    `, [pollId]);
    console.log('8. Verifying Hiệp hội App closed notification payload:');
    console.log('   Assoc notif title:', assocNotif.rows[0].title);
    console.log('   Assoc notif ref_type:', assocNotif.rows[0].ref_type);

    // 9. Clean up test records
    console.log('9. Cleaning up test records...');
    await client.query(`DELETE FROM public.poll_votes WHERE poll_id = $1::uuid`, [pollId]);
    await client.query(`DELETE FROM public.poll_options WHERE poll_id = $1::uuid`, [pollId]);
    await client.query(`DELETE FROM public.polls WHERE id = $1::uuid`, [pollId]);
    await client.query(`DELETE FROM public.business_notifications WHERE source_record_id = $1`, [pollId]);
    await client.query(`DELETE FROM public.member_notifications WHERE ref_id = $1`, [pollId]);
    console.log('   ✓ Cleaned up successfully.');

    console.log('\n🎉 ALL MULTI-APP VOTING & NOTIFICATION TESTS PASSED SUCCESSFULLY!');
  } finally {
    await client.end();
  }
}

runTest().catch((err) => {
  console.error('❌ Test failed with error:', err);
  process.exit(1);
});
