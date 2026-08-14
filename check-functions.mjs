import { createClient } from '@supabase/supabase-js';
const SUPABASE_URL = 'https://jslelzkaibdcqrivqkwf.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_7ZZ0EBS38UlWDymC9GwAew_EdaPpLCZ';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function run(){
  try{
    const { data, error } = await supabase.rpc('admin_exists');
    if(error) console.log('admin_exists rpc error:', error.message);
    else console.log('admin_exists:', data);
  }catch(e){console.error(e)}
}
run();
