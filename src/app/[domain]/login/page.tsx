import { redirect } from 'next/navigation';
import { AuthCard } from '@/components/auth/AuthCard';
import { getTenantAuthConfig } from '@/lib/tenantAuth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function LoginPage({
  params,
}: {
  params: Promise<{ domain: string }>;
}) {
  const { domain } = await params;
  const tenantConfig = await getTenantAuthConfig(domain);

  return (
    <div className='min-h-screen bg-black'>
      <AuthCard
        mode='login'
        authMode={tenantConfig?.authMode || 'email'}
        tenantId={tenantConfig?.tenantId}
        whatsapp={tenantConfig?.whatsapp}
      />
    </div>
  );
}
