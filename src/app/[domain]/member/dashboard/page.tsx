import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { DashboardHistoryClient } from './DashboardHistoryClient';
import { getUnifiedSession } from '@/lib/tenantAuth';
import { getDictionary } from '@/lib/dictionary';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
import {
  BadgeCheck,
  Wallet,
  Settings,
  ArrowRight,
  BarChart3,
  Mail,
  Calendar,
  Phone,
  User,
} from 'lucide-react';

export default async function MemberDashboardPage({
  params,
}: {
  params: Promise<{ domain: string }>;
}) {
  const { domain } = await params;
  const supabase = await createClient();

  // 1. Authenticate user
  const user = await getUnifiedSession(domain);

  if (!user) {
    redirect('/login');
  }

  // 2. Fetch Tenant Config for WA Channel setting
  let waChannelActive = false;
  let waChannelUrl = '';

  const { data: tenantData } = await supabase
    .from('tenants')
    .select('theme_config')
    .eq('domain', domain)
    .maybeSingle();

  const language = tenantData?.theme_config?.language || 'id';

  if (tenantData?.theme_config) {
    waChannelActive = tenantData.theme_config.waChannelActive ?? false;
    waChannelUrl = tenantData.theme_config.waChannelUrl || '#';
  }

  // 3. Fetch User's Orders & Deposits from DB
  const { data: allOrders } = await supabase
    .from('orders')
    .select('*, games(name)')
    .order('created_at', { ascending: false });

  const { data: allDeposits } = await supabase
    .from('deposits')
    .select('*')
    .order('created_at', { ascending: false });

  // 4. Fetch Wallet Balance
  const userEmail = (user.email || '').toLowerCase();
  const { data: wallet } = await supabase
    .from('wallets')
    .select('balance')
    .eq('email', userEmail)
    .maybeSingle();

  const currentBalance = wallet?.balance || 0;
  const userPhoneRaw = (user.phone || '').replace(/[^0-9]/g, '');
  const userPhoneShort = userPhoneRaw.replace(/^(62|0)/, '');

  let orders = (allOrders || []).filter((o) => {
    // 1. Direct Email Match
    if (
      userEmail &&
      o.customer_email &&
      o.customer_email.toLowerCase() === userEmail
    ) {
      return true;
    }

    // 2. Phone Match (on wa_number or customer_email)
    const orderWaRaw = (o.wa_number || '').replace(/[^0-9]/g, '');
    const orderWaShort = orderWaRaw.replace(/^(62|0)/, '');

    const orderEmailRaw = (o.customer_email || '').replace(/[^0-9]/g, '');
    const orderEmailShort = orderEmailRaw.replace(/^(62|0)/, '');

    if (userPhoneShort && userPhoneShort.length >= 8) {
      if (
        (orderWaShort &&
          (orderWaShort === userPhoneShort || orderWaRaw === userPhoneRaw)) ||
        (orderEmailShort &&
          (orderEmailShort === userPhoneShort ||
            orderEmailRaw === userPhoneRaw))
      ) {
        return true;
      }
    }

    return false;
  });

  // Removed fallback dev logic to prevent data leaks for new users

  // Filter Deposits
  let deposits = (allDeposits || []).filter((d) => {
    if (
      userEmail &&
      d.customer_email &&
      d.customer_email.toLowerCase() === userEmail
    )
      return true;

    const depWaRaw = (d.wa_number || '').replace(/[^0-9]/g, '');
    const depWaShort = depWaRaw.replace(/^(62|0)/, '');

    if (
      userPhoneShort &&
      userPhoneShort.length >= 8 &&
      depWaShort === userPhoneShort
    )
      return true;
    return false;
  });

  // Removed fallback dev logic to prevent data leaks for new users

  // Merge & Sort History
  const mergedHistory = [...orders, ...deposits].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  // Calculate statistics
  const pendingCount = orders.filter((o) => o.status === 'Pending').length;
  const processCount = orders.filter((o) => o.status === 'Processed').length;
  const successCount = orders.filter((o) => o.status === 'Success').length;
  const failedCount = orders.filter((o) => o.status === 'Failed').length;

  const totalTransactions = orders.length;
  const totalSpent = orders
    .filter((o) => o.status === 'Success' || o.status === 'Pending')
    .reduce((sum, o) => sum + (Number(o.total_price) || 0), 0);

  // User metadata
  const name = user.name || 'Member';
  const phone = user.phone || '-';
  const level = user.level || 'MEMBER';

  const createdAtFormatted = new Date(user.created_at).toLocaleDateString(
    'id-ID',
    {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    },
  );

  const initials = name
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const dict = getDictionary(language);

  return (
    <div className='space-y-6'>
      {/* 1. Banner Upgrade Level */}
      {level.toUpperCase() !== 'VIP' &&
      level.toUpperCase() !== 'PREMIUM' &&
      level.toUpperCase() !== 'GOLD' ? (
        <div className='bg-[#121212] border border-white/5 rounded-2xl p-6 flex flex-col items-start gap-4'>
          <div>
            <h2 className='text-lg font-bold text-white mb-1.5'>
              {dict.member_upgrade_banner_t}
            </h2>
            <p className='text-gray-400 text-sm'>
              {dict.member_upgrade_banner_d}{' '}
              <strong className='text-white uppercase'>{level}</strong>.
            </p>
          </div>
          <Link
            href='/member/upgrade'
            className='bg-blue-500 hover:bg-blue-400 text-white font-bold px-6 py-2.5 rounded-full transition-all flex items-center justify-center gap-2 text-sm shadow-lg shadow-blue-500/20'>
            <span>{dict.member_upgrade_btn}</span>
            <ArrowRight className='w-4 h-4' />
          </Link>
        </div>
      ) : (
        <div className='bg-[#121212] border border-theme-primary/20 rounded-2xl p-6 flex flex-col items-start gap-4'>
          <div>
            <h2 className='text-lg font-bold text-white mb-1.5'>
              {dict.member_active_banner_t}{' '}
              <span className='text-theme-primary opacity-90 uppercase'>{level}</span>
            </h2>
            <p className='text-gray-400 text-sm'>
              {dict.member_active_banner_d}
            </p>
          </div>
          <Link
            href='/member/upgrade'
            className='bg-[#1a1a1a] border border-gray-800 hover:border-gray-600 text-white font-bold px-6 py-2.5 rounded-full transition-all flex items-center justify-center gap-2 text-sm'>
            <span>{dict.member_active_btn}</span>
            <ArrowRight className='w-4 h-4' />
          </Link>
        </div>
      )}

      {/* 2. Banner WA Channel (Admin Configurable) */}
      {waChannelActive && (
        <div className='bg-[#0a1410] border border-[#1a3328] rounded-2xl p-6 flex flex-col items-start gap-4 relative overflow-hidden'>
          {/* Watermark WA Icon */}
          <svg
            className='absolute -right-8 -bottom-8 w-48 h-48 fill-emerald-500 opacity-5'
            viewBox='0 0 24 24'>
            <path d='M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z' />
          </svg>
          <div className='relative z-10 w-full'>
            <div className='flex items-center gap-2 mb-2'>
              <div className='w-6 h-6 rounded-md bg-[#25D366]/20 flex items-center justify-center shrink-0'>
                <svg
                  className='w-3.5 h-3.5 fill-[#25D366]'
                  viewBox='0 0 24 24'>
                  <path d='M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654z' />
                </svg>
              </div>
              <h3 className='text-lg font-bold text-white'>
                {dict.member_wa_channel_t}
              </h3>
            </div>
            <p className='text-gray-400 text-sm mb-5 pr-8'>
              {dict.member_wa_channel_d}
            </p>
            <a
              href={waChannelUrl}
              target='_blank'
              rel='noopener noreferrer'
              className='bg-[#25D366] hover:bg-[#1fbd58] text-white font-bold px-6 py-2.5 rounded-full transition-all text-sm inline-block shadow-lg shadow-[#25D366]/20'>
              {dict.member_wa_channel_btn}
            </a>
          </div>
        </div>
      )}

      {/* 3. Cards Section: Member ID & Dompet Anda */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        {/* Member ID Card */}
        <div className='bg-[#121212] border border-white/5 rounded-2xl p-5 md:p-6 relative flex flex-col justify-between h-full'>
          <div>
            <div className='flex items-center justify-between mb-3'>
              <div className='flex items-center gap-2'>
                <User className='w-4 h-4 text-gray-400' />
                <span className='text-xs font-bold text-gray-400 tracking-wider'>
                  {dict.member_card_id}
                </span>
              </div>
              {!user.isUsernameMode && (
                <Link
                  href='/member/profile'
                  className='bg-blue-500 hover:bg-blue-400 text-white font-semibold px-4 py-1.5 rounded-full text-xs flex items-center gap-1.5 transition-colors shadow-lg shadow-blue-500/20'>
                  <Settings className='w-3.5 h-3.5' />
                  <span>{dict.member_card_setting}</span>
                </Link>
              )}
            </div>

            <div className='mb-5 inline-flex bg-white/5 border border-white/10 px-2.5 py-1 rounded-md'>
              <span className='text-[10px] font-bold text-gray-300 uppercase tracking-wider'>
                {level}
              </span>
            </div>

            <div className='flex items-center gap-4 mb-6'>
              <div className='w-16 h-16 rounded-full bg-blue-500 text-white text-2xl font-black flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(59,130,246,0.3)]'>
                {initials}
              </div>
              <div>
                <div className='flex items-center gap-2 mb-1'>
                  <h3 className='text-xl font-bold text-white'>{name}</h3>
                  <BadgeCheck className='w-5 h-5 text-theme-primary' />
                </div>
                {/* Email: hanya tampil di mode email. Username mode pakai email sintetis — sembunyikan */}
                {user.isUsernameMode ? (
                  <div className='flex items-center gap-2 text-xs text-gray-400 mb-1'>
                    <Mail className='w-3.5 h-3.5 opacity-70' />
                    <span>@{user.name}</span>
                  </div>
                ) : (
                  <div className='flex items-center gap-2 text-xs text-gray-400 mb-1'>
                    <Mail className='w-3.5 h-3.5 opacity-70' />
                    <span>{user.email}</span>
                  </div>
                )}
                <div className='flex items-center gap-2 text-xs text-gray-400'>
                  <Calendar className='w-3.5 h-3.5 opacity-70' />
                  <span>{dict.member_since} {createdAtFormatted}</span>
                </div>
              </div>
            </div>
          </div>

          <div className='pt-4 flex items-center gap-3'>
            <div className='w-8 h-8 rounded-lg bg-[#0a1410] border border-[#1a3328] flex items-center justify-center'>
              <Phone className='w-4 h-4 text-[#25D366]' />
            </div>
            <span className='text-sm font-medium text-gray-300'>{phone}</span>
          </div>
        </div>

        {/* Dompet Anda Card */}
        <div className='bg-[#121212] border border-white/5 rounded-2xl p-5 md:p-6 flex flex-col justify-between h-full'>
          <div>
            <div className='flex items-center justify-between mb-6'>
              <div className='flex items-center gap-2'>
                <Wallet className='w-5 h-5 text-theme-primary opacity-90' />
                <h3 className='font-bold text-white text-lg'>{dict.member_wallet_title}</h3>
              </div>
              <div className='flex items-center gap-2'>
                <button className='w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white transition-colors border border-white/10'>
                  <BarChart3 className='w-4 h-4' />
                </button>
                <Link
                  href='/member/deposit'
                  className='bg-blue-500 hover:bg-blue-400 text-white font-bold px-5 py-2 rounded-full text-sm transition-colors shadow-lg shadow-blue-500/20'>
                  {dict.member_nav_deposit}
                </Link>
              </div>
            </div>

            <div className='mt-8'>
              <span className='text-xs font-bold text-gray-500 tracking-wider'>
                {dict.member_wallet_balance}
              </span>
              <div className='text-4xl font-black text-white mt-1'>
                <span className='text-gray-400 font-bold text-2xl mr-1'>
                  Rp
                </span>{' '}
                {currentBalance.toLocaleString('id-ID')}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Statistik Transaksi Hari Ini */}
      <div>
        <h3 className='text-lg font-bold text-white mb-4'>
          {dict.member_stats_title}
        </h3>

        <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-4'>
          <div className='bg-[#121212] border border-white/5 rounded-2xl p-4 text-center'>
            <div className='text-3xl font-black text-amber-500 mb-1'>
              {pendingCount}
            </div>
            <div className='text-xs font-bold tracking-wider text-amber-500 uppercase'>
              {dict.member_stat_waiting}
            </div>
          </div>

          <div className='bg-[#121212] border border-white/5 rounded-2xl p-4 text-center'>
            <div className='text-3xl font-black text-theme-primary mb-1'>
              {processCount}
            </div>
            <div className='text-xs font-bold tracking-wider text-theme-primary uppercase'>
              {dict.member_stat_processed}
            </div>
          </div>

          <div className='bg-[#121212] border border-white/5 rounded-2xl p-4 text-center'>
            <div className='text-3xl font-black text-emerald-500 mb-1'>
              {successCount}
            </div>
            <div className='text-xs font-bold tracking-wider text-emerald-500 uppercase'>
              {dict.member_stat_success}
            </div>
          </div>

          <div className='bg-[#121212] border border-white/5 rounded-2xl p-4 text-center'>
            <div className='text-3xl font-black text-rose-500 mb-1'>
              {failedCount}
            </div>
            <div className='text-xs font-bold tracking-wider text-rose-500 uppercase'>
              {dict.member_stat_failed}
            </div>
          </div>
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
          <div className='bg-[#121212] border border-white/5 rounded-2xl p-5 text-center'>
            <div className='text-xl font-black text-white'>
              {totalTransactions}
            </div>
            <div className='text-xs font-medium text-gray-400 mt-0.5'>
              {dict.member_stat_total_trx}
            </div>
          </div>

          <div className='bg-[#121212] border border-white/5 rounded-2xl p-5 text-center'>
            <div className='text-xl font-black text-white'>
              Rp {totalSpent.toLocaleString('id-ID')}
            </div>
            <div className='text-xs font-medium text-gray-400 mt-0.5'>
              {dict.member_stat_total_sale}
            </div>
          </div>
        </div>
      </div>

      {/* 5. Riwayat Transaksi Terbaru Table */}
      <DashboardHistoryClient mergedHistory={mergedHistory} language={language} />
    </div>
  );
}
