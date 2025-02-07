import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

// Replace with your Supabase project URL and API key
const SUPABASE_URL = process.env.SUPABASE_URL as string;
const SUPABASE_ANON_KEY = process.env.SUPABASE_KEY as string;


export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
