'use server';

import { cookies } from 'next/headers';
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
