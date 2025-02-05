import { createClient } from "@supabase/supabase-js";

// Replace with your Supabase project URL and API key
const SUPABASE_URL = "https://cfsnmkqomjhvgsndzsqy.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmc25ta3FvbWpodmdzbmR6c3F5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg0MTUwMzMsImV4cCI6MjA1Mzk5MTAzM30.9hT0ELKjMYNCuUKQYWrBUKlgVoUqAnciqIQtV1t52IY";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
