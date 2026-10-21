import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim() ?? '';
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim() ?? '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

// Keep the application renderable when a deployment is missing its environment variables.
// Data requests will fail gracefully in the page-level loading/error states instead of
// throwing during module initialization and leaving a blank screen.
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'missing-anon-key',
);

export const ADMIN_FUNCTION_URL = isSupabaseConfigured
  ? `${supabaseUrl}/functions/v1/admin-moderation`
  : '';
