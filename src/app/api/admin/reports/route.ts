import {NextResponse} from 'next/server';import {requireStaff} from '@/lib/auth';import {adminClient} from '@/lib/supabase/admin';
export const dynamic='force-dynamic';
export async function GET(){const staff=await requireStaff();if(!staff)return NextResponse.json({error:'Unauthorized'},{status:401});
const db=adminClient();const [payments,orders]=await Promise.all([db.from('payments').select('amount_minor,created_at,provider,status').eq('status','successful').order('created_at',{ascending:false}).limit(5000),db.from('orders').select('id,status,created_at,total_minor').order('created_at',{ascending:false}).limit(5000)]);
if(payments.error||orders.error)return NextResponse.json({error:payments.error?.message||orders.error?.message},{status:500});
const paid=payments.data||[];const all=orders.data||[];const now=new Date();const start=new Date(now.getFullYear(),now.getMonth(),1);const prev=new Date(now.getFullYear(),now.getMonth()-1,1);
const sum=(list:{amount_minor:number}[])=>list.reduce((n,x)=>n+Number(x.amount_minor||0),0);
const thisMonth=paid.filter(x=>new Date(x.created_at)>=start);const lastMonth=paid.filter(x=>new Date(x.created_at)>=prev&&new Date(x.created_at)<start);
const daily=new Map<string,number>();for(const p of paid){const d=new Date(p.created_at);if(d>=new Date(now.getTime()-29*86400000)){const key=d.toISOString().slice(0,10);daily.set(key,(daily.get(key)||0)+Number(p.amount_minor||0));}}
return NextResponse.json({totalRevenueMinor:sum(paid),thisMonthMinor:sum(thisMonth),lastMonthMinor:sum(lastMonth),successfulPayments:paid.length,orders:all.length,pendingOrders:all.filter(x=>x.status==='pending_payment').length,paidDaily:Array.from(daily,([date,amount_minor])=>({date,amount_minor})).sort((a,b)=>a.date.localeCompare(b.date))});
}
