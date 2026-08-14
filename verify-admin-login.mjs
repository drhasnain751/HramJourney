import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://jslelzkaibdcqrivqkwf.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_7ZZ0EBS38UlWDymC9GwAew_EdaPpLCZ';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testLogin() {
  try {
    console.log('Testing admin login...\n');
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'husnainjaveed179@gmail.com',
      password: '@Hasnain#173'
    });

    if (error) {
      console.log('❌ Sign-in failed:', error.message);
      return;
    }

    if (!data.user) {
      console.log('❌ No user returned');
      return;
    }

    console.log('✓ Sign-in successful');
    console.log('  User ID:', data.user.id);
    console.log('  Email:', data.user.email);

    // Check admin role
    const { data: roles, error: rolesError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', data.user.id)
      .eq('role', 'admin');

    if (rolesError) {
      console.log('❌ Error checking role:', rolesError.message);
      return;
    }

    if (!roles || roles.length === 0) {
      console.log('❌ User is NOT an admin');
      return;
    }

    console.log('✓ User is admin');
    console.log('\n✅ ADMIN LOGIN VERIFIED - Ready for dashboard access');

  } catch (err) {
    console.error('❌ Test failed:', err.message);
  }
}

testLogin();
