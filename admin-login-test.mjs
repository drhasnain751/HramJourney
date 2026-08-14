import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://jslelzkaibdcqrivqkwf.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_7ZZ0EBS38UlWDymC9GwAew_EdaPpLCZ';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function run() {
  console.log('Checking for admin roles...');
  const { data: roles, error: rolesError } = await supabase.from('user_roles').select('*');
  if (rolesError) {
    console.error('Error querying user_roles:', rolesError.message);
  } else {
    console.log('user_roles rows:', roles.length);
    console.log(roles.slice(0,5));
  }

  console.log('\nAttempting signInWithPassword with dummy credentials (should fail)...');
  const { data, error } = await supabase.auth.signInWithPassword({ email: 'admin@example.test', password: 'password123' });
  if (error) {
    console.log('Sign-in failed as expected. Error:', error.message, 'status:', error.status);
  } else {
    console.log('Sign-in result:', data);
  }
}

run().catch(e=>{ console.error(e); process.exit(1); });
