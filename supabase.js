const SUPABASE_URL = 'https://lqgxrgwoxagxlahoexck.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxZ3hyZ3dveGFneGxhaG9leGNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxMTkzMDksImV4cCI6MjA5NDY5NTMwOX0.672ifClklbNVpIcxEGSw2N5MJXSWDXE911d26K9pLlI';
const SUPABASE_PROJECT_ID = new URL(SUPABASE_URL).hostname.split('.')[0];

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const supabasePublicClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
    storageKey: 'olympax-public-events'
  }
});
