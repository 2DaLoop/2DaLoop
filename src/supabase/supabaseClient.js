import { createClient } from '../../node_modules/@supabase/supabase-js';

const SUPABASE_URL = "https://ttswhygqrukmssbcpjps.supabase.co";
const SUPABASE_ANON_KEY = window.ENV.SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);