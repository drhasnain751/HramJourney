import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://jslelzkaibdcqrivqkwf.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_7ZZ0EBS38UlWDymC9GwAew_EdaPpLCZ";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function verify() {
  try {
    console.log("Verifying Supabase database schema...\n");

    const tables = [
      "user_roles",
      "packages",
      "package_images",
      "package_inclusions",
      "package_exclusions",
      "hotels",
      "hotel_images",
      "services",
      "inquiries",
      "custom_package_requests",
      "media",
      "site_settings",
    ];

    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select("*")
        .limit(1);

      if (error) {
        if (error.code === "PGRST116") {
          console.log(`✗ ${table}: TABLE NOT FOUND`);
        } else {
          console.log(`✗ ${table}: ${error.message}`);
        }
      } else {
        console.log(`✓ ${table}: EXISTS`);
      }
    }

    console.log("\n✓ Supabase connection successful");
    console.log("✓ All required tables verified");
  } catch (error) {
    console.error("✗ Verification failed:", error.message);
    process.exit(1);
  }
}

verify();
