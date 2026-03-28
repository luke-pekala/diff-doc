import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://podwczztvefznzbtzpkk.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_yrnv9DyJCzJgc_Fd3KMe_g_qQLsUZpI'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)