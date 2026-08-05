import { createClient } from '@/utils/supabase/server';
import { getMemberSession, type MemberPayload } from '@/utils/memberSession';
import type { User } from '@supabase/supabase-js';

export type AuthMode = 'email' | 'username';

export type TenantAuthConfig = {
  tenantId: string;
  authMode: AuthMode;
  whatsapp?: string;
};

export type StorefrontSession =
  | { type: 'email'; user: User }
  | {
      type: 'username';
      member: MemberPayload & {
        phone?: string | null;
        created_at?: string | null;
      };
    };

export async function getTenantAuthConfig(
  domain: string,
): Promise<TenantAuthConfig | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return null;

  const supabase = await createClient();

  // Smart domain resolution for local dev/testing
  const targetDomain = domain === 'demo.localhost' ? 'localhost' : domain;

  let { data: tenant } = await supabase
    .from('tenants')
    .select('id, auth_mode, theme_config')
    .eq('domain', targetDomain)
    .maybeSingle();

  // Try matching 'localhost' as a secondary fallback for local testing before resorting to limit(1)
  if (!tenant && targetDomain.includes('localhost')) {
    const { data: localTenant } = await supabase
      .from('tenants')
      .select('id, auth_mode, theme_config')
      .eq('domain', 'localhost')
      .maybeSingle();
    if (localTenant) tenant = localTenant;
  }

  if (!tenant) {
    const fallback = await supabase
      .from('tenants')
      .select('id, auth_mode, theme_config')
      .limit(1)
      .maybeSingle();
    tenant = fallback.data;
  }

  if (!tenant) return null;

  const themeConfig = tenant.theme_config as { whatsapp?: string } | null;

  return {
    tenantId: tenant.id,
    authMode: (tenant.auth_mode as AuthMode) || 'email',
    whatsapp: themeConfig?.whatsapp,
  };
}

export async function getStorefrontSession(
  domain: string,
): Promise<StorefrontSession | null> {
  const config = await getTenantAuthConfig(domain);
  if (!config) return null;

  if (config.authMode === 'username') {
    const session = await getMemberSession();
    if (!session || session.tenantId !== config.tenantId) return null;

    const supabase = await createClient();
    const { data } = await supabase
      .from('members')
      .select('phone, created_at')
      .eq('id', session.memberId)
      .maybeSingle();

    return {
      type: 'username',
      member: {
        ...session,
        phone: data?.phone ?? null,
        created_at: data?.created_at ?? null,
      },
    };
  }

  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return null;

  return { type: 'email', user: authData.user };
}

export type UnifiedSessionUser = {
  id: string;
  email: string;
  name: string;
  phone: string;
  level: string;
  created_at: string;
  isUsernameMode: boolean;
};

export async function getUnifiedSession(
  domain: string,
): Promise<UnifiedSessionUser | null> {
  const session = await getStorefrontSession(domain);
  if (!session) return null;

  const supabase = await createClient();

  if (session.type === 'username') {
    const member = session.member;
    const email = `${member.username}@${member.tenantId}.member`.toLowerCase();

    // Fetch level dynamically from the latest successful upgrade deposit if any, otherwise default to "MEMBER"
    let level = 'MEMBER';
    const { data: upgradeHistory } = await supabase
      .from('deposits')
      .select('metadata')
      .eq('customer_email', email)
      .eq('status', 'Success')
      .order('created_at', { ascending: false });

    if (upgradeHistory && upgradeHistory.length > 0) {
      const latestUpgrade = upgradeHistory.find(
        (d) => d.metadata && d.metadata.type === 'UPGRADE',
      );
      if (latestUpgrade && latestUpgrade.metadata.package_name) {
        level = latestUpgrade.metadata.package_name;
      }
    }

    return {
      id: member.memberId,
      email: email,
      name: member.username,
      phone: member.phone || '',
      level: level,
      created_at: member.created_at || new Date().toISOString(),
      isUsernameMode: true,
    };
  }

  // Email Mode (Supabase Auth)
  const user = session.user;
  let level = user.user_metadata?.level || 'MEMBER';

  // Fetch level dynamically from the latest successful upgrade deposit
  const { data: upgradeHistory } = await supabase
    .from('deposits')
    .select('metadata')
    .eq('customer_email', (user.email || '').toLowerCase())
    .eq('status', 'Success')
    .order('created_at', { ascending: false });

  if (upgradeHistory && upgradeHistory.length > 0) {
    const latestUpgrade = upgradeHistory.find(
      (d) => d.metadata && d.metadata.type === 'UPGRADE',
    );
    if (latestUpgrade && latestUpgrade.metadata.package_name) {
      level = latestUpgrade.metadata.package_name;
    }
  }

  return {
    id: user.id,
    email: user.email || '',
    name: user.user_metadata?.name || 'Member',
    phone: user.user_metadata?.phone || '',
    level: level,
    created_at: user.created_at,
    isUsernameMode: false,
  };
}
