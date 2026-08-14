import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://jslelzkaibdcqrivqkwf.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_7ZZ0EBS38UlWDymC9GwAew_EdaPpLCZ";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkBucket() {
  try {
    console.log('Checking storage buckets...');
    const { data, error } = await supabase.storage.listBuckets();
    if (error) {
      console.error('✗ Error listing buckets:', error.message);
      process.exit(1);
    }
    const buckets = data.map(b => b.name);
    console.log('Buckets:', buckets.join(', '));
    if (buckets.includes('media')) console.log('✓ media bucket exists');
    else console.log('✗ media bucket missing');
  } catch (err) {
    console.error('✗ Storage check failed:', err.message);
    process.exit(1);
  }
}

checkBucket();
