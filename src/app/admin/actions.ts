'use server';

import { cookies, headers } from 'next/headers';
import { createClient } from '@/utils/supabase/server';

export async function setAdminTenantCookie(tenantId: string) {
  const cookieStore = await cookies();
  cookieStore.set('admin_tenant_id', tenantId, { path: '/', maxAge: 60 * 60 * 24 * 30 }); // 30 days
}

export async function adminLogin(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError) {
    return { success: false, message: authError.message };
  }

  // Check if user is an admin
  const { data: adminUser, error: adminError } = await supabase
    .from('admin_users')
    .select('*, admin_roles(name, permissions)')
    .eq('id', authData.user.id)
    .single();

  if (adminError || !adminUser) {
    // If not in admin_users, sign them out immediately
    await supabase.auth.signOut();
    return { success: false, message: "Akses ditolak. Anda bukan Admin." };
  }

  // If Operator (not superadmin) and has assigned tenant, force set the tenant cookie
  if (!adminUser.is_superadmin && adminUser.tenant_id) {
    await setAdminTenantCookie(adminUser.tenant_id);
  }

  return { success: true };
}

export async function adminLogout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
}

export async function getAdminSession() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('*, admin_roles(name, permissions)')
    .eq('id', user.id)
    .single();

  if (!adminUser) return null;

  return adminUser;
}

export async function checkPermission(permissionName: string) {
  const adminSession = await getAdminSession();
  if (!adminSession) return false;
  if (adminSession.is_superadmin) return true; // Superadmin has all permissions

  const permissions = adminSession.admin_roles?.permissions || [];
  return permissions.includes(permissionName);
}

export async function getActiveAdminTenantId() {
  const adminSession = await getAdminSession();

  // 1. If Operator (not superadmin) and has assigned tenant, force their assigned tenant
  if (adminSession && !adminSession.is_superadmin && adminSession.tenant_id) {
    return adminSession.tenant_id;
  }

  const cookieStore = await cookies();
  const cookieTenantId = cookieStore.get('admin_tenant_id')?.value;

  // 2. If SuperAdmin explicitly selected a tenant via TenantSelector cookie, use it
  if (cookieTenantId) {
    return cookieTenantId;
  }

  // 3. Automatically detect tenant based on the Request Host / Domain
  const supabase = await createClient();
  try {
    const headerList = await headers();
    const rawHost = headerList.get('host') || headerList.get('x-forwarded-host') || '';
    const domainWithoutPort = rawHost.split(':')[0]; // e.g. "admin.localhost" or "admin.newgamingstore.com"

    if (domainWithoutPort) {
      // Try matching admin_domain or domain
      const { data: matchedTenant } = await supabase
        .from('tenants')
        .select('id')
        .or(`admin_domain.eq.${domainWithoutPort},domain.eq.${domainWithoutPort}`)
        .maybeSingle();

      if (matchedTenant?.id) {
        return matchedTenant.id;
      }

      // Try matching storefront domain if host starts with "admin."
      if (domainWithoutPort.startsWith('admin.')) {
        const sfDomain = domainWithoutPort.replace('admin.', '');
        const { data: matchedSf } = await supabase
          .from('tenants')
          .select('id')
          .eq('domain', sfDomain)
          .maybeSingle();

        if (matchedSf?.id) {
          return matchedSf.id;
        }
      }
    }
  } catch (err) {
    console.error("Failed to detect tenant from headers:", err);
  }

  // 4. Fallback: First tenant in the database
  const { data: firstTenant } = await supabase
    .from('tenants')
    .select('id')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  return firstTenant?.id || null;
}
