/**
 * Supabase Client Service
 * Provides storage and database access.
 *
 * Setup:
 *   1. Create a Supabase project at https://supabase.com
 *   2. Create a bucket named "ai-designs" (public)
 *   3. Add SUPABASE_URL and SUPABASE_ANON_KEY to .env
 */

import { createClient } from "@supabase/supabase-js";

let supabaseClient = null;

/**
 * Returns a Supabase client if configured, otherwise null.
 * Graceful fallback to local storage when Supabase is not set up.
 */
export function getSupabaseClient() {
  if (supabaseClient) return supabaseClient;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;

  if (!url || !key) return null;

  supabaseClient = createClient(url, key, {
    auth: { persistSession: false },
  });

  return supabaseClient;
}

/**
 * Save a job record to Supabase database.
 * @param {object} job - Job metadata
 */
export async function saveJob(job) {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("design_jobs")
    .insert([job])
    .select()
    .single();

  if (error) {
    console.error("Supabase DB error:", error.message);
    return null;
  }

  return data;
}

/**
 * Get a job record by ID.
 */
export async function getJob(jobId) {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("design_jobs")
    .select("*")
    .eq("id", jobId)
    .single();

  return error ? null : data;
}
