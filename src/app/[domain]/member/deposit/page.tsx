import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { DepositForm } from '@/components/storefront/DepositForm';
import { getUnifiedSession } from '@/lib/tenantAuth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
import Link from 'next/link';
import { ArrowLeft, Wallet } from 'lucide-react';

export default async function MemberDepositPage({
  params,
}: {
  params: Promise<{ domain: string }>;
}) {
  const { domain } = await params;
  const supabase = await createClient();

  // Authenticate user
  const user = await getUnifiedSession(domain);

  if (!user) {
    redirect('/login');
  }

  // Fetch tenant
  let { data: tenant } = await supabase
    .from('tenants')
    .select('id')
    .eq('domain', domain)
    .maybeSingle();
  if (!tenant) {
    const res = await supabase
      .from('tenants')
      .select('id')
      .limit(1)
      .maybeSingle();
    if (res.data) tenant = res.data;
  }

  // Fetch active payment channels
  const { data: paymentChannels } = await supabase
    .from('payment_channels')
    .select('*')
    .eq('tenant_id', tenant?.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  // Fetch Wallet Balance
  const userEmail = (user.email || '').toLowerCase();
  const { data: wallet } = await supabase
    .from('wallets')
    .select('balance')
    .eq('email', userEmail)
    .maybeSingle();

  const currentBalance = wallet?.balance || 0;

  return (
    <div className='space-y-6'>
      {/* Header / Back */}
      <div className='flex items-center gap-4 mb-6'>
        <Link
          href='/member/dashboard'
          className='w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors'>
          <ArrowLeft className='w-5 h-5' />
        </Link>
        <div>
          <h2 className='text-xl font-bold text-white'>Deposit Saldo</h2>
          <p className='text-sm text-gray-400'>
            Isi saldo akun Anda untuk transaksi lebih cepat.
          </p>
        </div>
      </div>

      {/* Saldo Saat Ini */}
      <div className='bg-[#121212] border border-white/10 rounded-2xl p-6 mb-6'>
        <div className='flex items-center gap-3 mb-2'>
          <Wallet className='w-5 h-5 text-blue-400' />
          <span className='text-sm font-bold text-gray-400 tracking-wider'>
            SALDO SAAT INI
          </span>
        </div>
        <div className='text-3xl font-black text-white'>
          <span className='text-gray-400 font-bold text-xl mr-1'>Rp</span>
          {currentBalance.toLocaleString('id-ID')}
        </div>
      </div>

      {/* Form Deposit */}
      <DepositForm
        paymentChannels={paymentChannels || []}
        waNumber={user.phone || ''}
      />
    </div>
  );
}
