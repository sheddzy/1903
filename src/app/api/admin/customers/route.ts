import { NextResponse } from 'next/server';
import { requireStaff } from '@/lib/auth';
import { adminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET(request:Request){
 const staff=await requireStaff();if(!staff)return NextResponse.json({error:'Unauthorized'},{status:401});
 const url=new URL(request.url);const q=url.searchParams.get('q')?.trim().slice(0,100)||'';
 let query=adminClient().from('customers').select('id,email,full_name,phone,created_at').order('created_at',{ascending:false}).limit(300);
 if(q)query=query.or('email.ilike.%'+q+'%,full_name.ilike.%'+q+'%');
 const {data,error}=await query;if(error)return NextResponse.json({error:error.message},{status:500});
 return NextResponse.json({customers:data??[]});
}
