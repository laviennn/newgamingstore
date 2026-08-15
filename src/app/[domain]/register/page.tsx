import { redirect } from 'next/navigation';
import { AuthCard } from '@/components/auth/AuthCard';
import { getTenantAuthConfig } from '@/lib/tenantAuth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function RegisterPage({
  params,
}: {
  params: Promise<{ domain: string }>;
}) {
  const { domain } = await params;
  const tenantConfig = await getTenantAuthConfig(domain);

  if (tenantConfig?.authMode === 'username') {
    redirect('/login');
  }

  return (
    <div className='min-h-screen bg-black'>
      <AuthCard
        mode='register'
        authMode='email'
        whatsapp={tenantConfig?.whatsapp}
        language={tenantConfig?.language}
      />
    </div>
  );
}
