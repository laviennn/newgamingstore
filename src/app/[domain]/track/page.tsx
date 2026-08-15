import { TrackClient } from './TrackClient';

import { getTenantAuthConfig } from '@/lib/tenantAuth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function TrackTransactionPage({
  params,
}: {
  params: Promise<{ domain: string }>;
}) {
  const { domain } = await params;
  const tenantConfig = await getTenantAuthConfig(domain);
  const language = tenantConfig?.language || 'id';
  const currency = tenantConfig?.currency || (tenantConfig?.language === 'ms' ? 'MYR' : 'IDR');

  return (
    <div className='min-h-screen bg-black text-white relative overflow-hidden'>
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      <TrackClient language={language} currency={currency} />
    </div>
  );
}
