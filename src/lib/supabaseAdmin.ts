/**
 * supabaseAdmin.ts
 * Direct Supabase client for admin page — bypasses Express server entirely.
 * Reads data directly from Supabase using the anon key.
 */
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL     = "https://mjxokjbxnujkchdlqtgs.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qeG9ramJ4bnVqa2NoZGxxdGdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEzNjU1MDQsImV4cCI6MjA5Njk0MTUwNH0.yYPXnG9HP1AeBpWmFIdrJkG_TMJ4e09bS6hC9jUXJ3Y";

export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
