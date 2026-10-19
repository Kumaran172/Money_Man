// Seed Black Clover test data directly against the live Vercel deployment
const API_URL = 'https://moneyman-liard.vercel.app/api';

async function main() {
  console.log('--- 🍀 Seeding Black Clover Test Data to Live Money Man App ---');
  console.log(`Target: ${API_URL}`);

  // 1. Register or Log in Asta
  let token = null;
  let user = null;
  let defaultProfile = null;

  const regRes = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Asta (Black Bulls)',
      email: 'asta@blackbulls.clover',
      password: 'NeverGiveUp@123'
    })
  });

  const regData = await regRes.json();
  if (regData.success) {
    console.log('✅ Registered new user:', regData.user.name, `(${regData.user.email})`);
    token = regData.token;
    user = regData.user;
    defaultProfile = regData.profile;
  } else {
    console.log('ℹ️ User exists or register returned:', regData.error, '- attempting login...');
    const loginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'asta@blackbulls.clover',
        password: 'NeverGiveUp@123'
      })
    });
    const loginData = await loginRes.json();
    if (!loginData.success) {
      throw new Error(`Login failed: ${loginData.error}`);
    }
    console.log('✅ Logged in successfully as:', loginData.user.name);
    token = loginData.token;
    user = loginData.user;
    defaultProfile = loginData.profile;
  }

  const authHeader = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  // 2. Fetch User Accounts
  const accRes = await fetch(`${API_URL}/accounts`, { headers: authHeader });
  const accData = await accRes.json();
  const accounts = accData.data || [];
  console.log(`Found ${accounts.length} default accounts:`, accounts.map(a => `${a.name} (${a.type})`).join(', '));

  const kvbAcc = accounts.find(a => a.name.includes('KVB')) || accounts[0];
  const gpayAcc = accounts.find(a => a.name.includes('Google Pay')) || accounts[1];
  const cashAcc = accounts.find(a => a.name.includes('Cash')) || accounts[2];
  const supermoneyAcc = accounts.find(a => a.name.includes('Supermoney')) || accounts[3];

  // 3. Create Black Clover Profiles (People)
  const profilesToCreate = [
    { name: 'Captain Yami Sukehiro', avatar: '🗡️', color: '#6366f1' },
    { name: 'Noelle Silva', avatar: '🌊', color: '#06b6d4' },
    { name: 'Charmy Pappitson', avatar: '🍖', color: '#f59e0b' },
    { name: 'Finral Roulacase', avatar: '🚪', color: '#ec4899' },
    { name: 'Julius Novachrono', avatar: '👑', color: '#10b981' }
  ];

  // Check existing profiles
  const curProfilesRes = await fetch(`${API_URL}/profiles`, { headers: authHeader });
  const curProfilesData = await curProfilesRes.json();
  const existingProfiles = curProfilesData.data || [];
  const profileMap = {};
  existingProfiles.forEach(p => { profileMap[p.name] = p; });

  for (const p of profilesToCreate) {
    if (!profileMap[p.name]) {
      const pRes = await fetch(`${API_URL}/profiles`, {
        method: 'POST',
        headers: authHeader,
        body: JSON.stringify(p)
      });
      const pData = await pRes.json();
      if (pData.success) {
        console.log(`✅ Created Profile: ${p.avatar} ${p.name}`);
        profileMap[p.name] = pData.data;
      }
    } else {
      console.log(`ℹ️ Profile exists: ${p.name}`);
    }
  }

  // 4. Create Black Clover Transactions
  const transactions = [
    {
      type: 'credit',
      amount: 150000,
      category: 'Salary',
      note: 'Wizard King Magic Knight Special Mission Bounty (Julius Novachrono)',
      account_id: kvbAcc?.id,
      profile_id: profileMap['Julius Novachrono']?.id || defaultProfile?.id,
      date: '2026-10-01'
    },
    {
      type: 'debit',
      amount: 8450,
      category: 'Food & Dining',
      note: "Charmy's Nomotato & Roasted Mana Boar Grand Feast",
      account_id: kvbAcc?.id,
      profile_id: profileMap['Charmy Pappitson']?.id || defaultProfile?.id,
      date: '2026-10-03'
    },
    {
      type: 'debit',
      amount: 4800,
      category: 'Bills & Recharge',
      note: 'Grimoire Tower Spell Awakening & Magic Inscription Fees',
      account_id: gpayAcc?.id,
      profile_id: defaultProfile?.id,
      date: '2026-10-06'
    },
    {
      type: 'debit',
      amount: 6000,
      category: 'General / Other',
      note: 'Black Bulls Hideout Room Rent & Facility Fee to Captain Yami',
      account_id: cashAcc?.id,
      profile_id: profileMap['Captain Yami Sukehiro']?.id || defaultProfile?.id,
      date: '2026-10-09'
    },
    {
      type: 'debit',
      amount: 3200,
      category: 'Travel & Fuel',
      note: "Finral's Spatial Portal Cab Across Royal Capital",
      account_id: supermoneyAcc?.id,
      profile_id: profileMap['Finral Roulacase']?.id || defaultProfile?.id,
      date: '2026-10-11'
    },
    {
      type: 'debit',
      amount: 14500,
      category: 'Shopping',
      note: "Sea Dragon's Roar Training Robes & Royal Silk Cloak for Noelle",
      account_id: kvbAcc?.id,
      profile_id: profileMap['Noelle Silva']?.id || defaultProfile?.id,
      date: '2026-10-13'
    },
    {
      type: 'debit',
      amount: 2750,
      category: 'Health & Medical',
      note: 'Mimosa Recovery Magic Healing Herbs & High Mana Elixirs',
      account_id: gpayAcc?.id,
      profile_id: defaultProfile?.id,
      date: '2026-10-15'
    },
    {
      type: 'credit',
      amount: 35000,
      category: 'Investment / Returns',
      note: 'Diamond Kingdom Dungeon Exploration Secret Treasure Vault',
      account_id: kvbAcc?.id,
      profile_id: defaultProfile?.id,
      date: '2026-10-16'
    },
    {
      type: 'debit',
      amount: 1900,
      category: 'Entertainment',
      note: "Magna & Luck's Fiery Lightning Duel Sparring Arena Bet",
      account_id: cashAcc?.id,
      profile_id: defaultProfile?.id,
      date: '2026-10-17'
    },
    {
      type: 'debit',
      amount: 5500,
      category: 'General / Other',
      note: "Nero's Anti-Magic Bird Perch & High Grade Demon Stones",
      account_id: gpayAcc?.id,
      profile_id: defaultProfile?.id,
      date: '2026-10-18'
    }
  ];

  console.log('\n--- Adding Transactions ---');
  for (const tx of transactions) {
    const res = await fetch(`${API_URL}/transactions`, {
      method: 'POST',
      headers: authHeader,
      body: JSON.stringify(tx)
    });
    const d = await res.json();
    if (d.success) {
      console.log(`✅ [${tx.type.toUpperCase()}] ₹${tx.amount} - ${tx.note}`);
    } else {
      console.log(`⚠️ Transaction failed: ${d.error}`);
    }
  }

  // 5. Test SMS Bulk Import
  console.log('\n--- Testing SMS Bulk Import ---');
  const sampleBankSms = `Dear KVB Customer, your A/c ending 1516 is debited for Rs 1,850.00 on 19-10-2026 11:20:15 by UPI ref 429381749281 - Nero Anti-Magic Treats. Avl Bal Rs 1,41,850.00
Dear KVB Customer, your A/c ending 1516 is credited for Rs 5,000.00 on 19-10-2026 12:45:00 by UPI ref 429381749282 - Clover Kingdom Stipend Bonus. Avl Bal Rs 1,46,850.00`;

  const smsRes = await fetch(`${API_URL}/sms/bulk-import`, {
    method: 'POST',
    headers: authHeader,
    body: JSON.stringify({
      messages: sampleBankSms,
      account_id: kvbAcc?.id
    })
  });
  const smsData = await smsRes.json();
  console.log('✅ SMS Bulk Import Result:', smsData);

  // 6. Verify Totals
  console.log('\n--- Verifying Live Analytics ---');
  const analyticsRes = await fetch(`${API_URL}/analytics`, { headers: authHeader });
  const analyticsData = await analyticsRes.json();
  console.log('Analytics Summary:', {
    totalIncome: analyticsData.data?.total_income,
    totalExpenses: analyticsData.data?.total_expenses,
    netSavings: analyticsData.data?.net_savings,
    categoryBreakdown: analyticsData.data?.category_breakdown?.map(c => `${c.category}: ₹${c.amount}`)
  });

  // 7. Verify Accounts Directory
  const usersRes = await fetch(`${API_URL}/users/accounts-summary`);
  const usersData = await usersRes.json();
  console.log('\n--- Global Accounts Directory Check ---');
  console.log(`Total Registered Accounts: ${usersData.data?.total_accounts}`);
  console.log('Users in Directory:', usersData.data?.accounts?.map(u => `${u.name} (${u.email}) - Profiles: ${u.profiles_count}, Tx: ${u.transactions_count}`));

  console.log('\n🍀 Black Clover Test Run Complete! 🍀');
}

main().catch(console.error);
