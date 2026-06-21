const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://mjxokjbxnujkchdlqtgs.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qeG9ramJ4bnVqa2NoZGxxdGdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEzNjU1MDQsImV4cCI6MjA5Njk0MTUwNH0.yYPXnG9HP1AeBpWmFIdrJkG_TMJ4e09bS6hC9jUXJ3Y";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function main() {
  console.log('Listing crm_tool_analytics table...');
  const { data, error } = await supabase
    .from("crm_tool_analytics")
    .select("*");

  console.log('Result:', { data, error });
}

main().catch(console.error);
