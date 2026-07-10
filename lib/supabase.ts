import { createClient } from '@supabase/supabase-js'

// Server-side client — uses the service role key so API routes can read/write freely.
// Never import this file into client components; it's for API routes (server) only.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false },
})
