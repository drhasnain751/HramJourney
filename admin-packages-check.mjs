import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://jslelzkaibdcqrivqkwf.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_7ZZ0EBS38UlWDymC9GwAew_EdaPpLCZ';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function run(){
  try{
    console.log('Signing in as admin...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'husnainjaveed179@gmail.com',
      password: '@Hasnain#173'
    });
    if(signInError){ console.error('Sign-in error:', signInError.message); return; }
    const user = signInData.user;
    console.log('Signed in user id:', user.id);

    console.log('\nQuerying packages counts...');
    const { data: allPkgs, error: allErr } = await supabase.from('packages').select('id, name, status').order('created_at', { ascending: false });
    if(allErr){ console.error('Error querying packages:', allErr.message); }
    else {
      console.log('Total packages rows:', allPkgs.length);
      if(allPkgs.length > 0) console.table(allPkgs.slice(0,10));
    }

    const { data: pubPkgs, error: pubErr } = await supabase.from('packages').select('id, name, status').eq('status','published');
    if(pubErr) console.error('Error querying published packages:', pubErr.message);
    else console.log('Published packages count:', pubPkgs.length);

    const { data: roles } = await supabase.from('user_roles').select('*').eq('user_id', user.id);
    console.log('\nUser roles:', roles.length ? JSON.stringify(roles) : 'none');

  }catch(e){ console.error('Failed:', e.message); }
}
run();