import {NextResponse} from 'next/server';

export const dynamic='force-dynamic';

export async function GET(){
  const checks={
    supabaseUrl: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    supabaseAnonKey: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    supabaseServiceRoleKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
  };
  const missing=Object.entries(checks).filter(([,present])=>!present).map(([name])=>name);
  return NextResponse.json({
    status:missing.length===0?'configured':'missing_environment',
    checks,
    missing,
    note:'Only configuration presence is reported. Secret values are never returned.',
  },{status:missing.length===0?200:503});
}
