const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://mjxokjbxnujkchdlqtgs.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qeG9ramJ4bnVqa2NoZGxxdGdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEzNjU1MDQsImV4cCI6MjA5Njk0MTUwNH0.yYPXnG9HP1AeBpWmFIdrJkG_TMJ4e09bS6hC9jUXJ3Y";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function main() {
  console.log('Querying Supabase user_page_visits table...');
  const { data, error } = await supabase
    .from('user_page_visits')
    .select('*')
    .order('visited_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error('Error querying table:', error);
    return;
  }

  console.log('\n--- LATEST USER PAGE VISITS IN SUPABASE ---');
  console.table(data.map(v => ({
    id: v.id,
    user_id: v.user_id,
    user_name: v.user_name,
    slug: v.slug,
    visited_at: v.visited_at
  })));
}

main().catch(console.error);
