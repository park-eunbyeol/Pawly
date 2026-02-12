import { createClient } from '@supabase/supabase-js';

// 빌드 중 환경 변수가 없을 때를 대비한 안전 장치 (실제 서비스에서는 환경 변수가 꼭 있어야 합니다!)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
