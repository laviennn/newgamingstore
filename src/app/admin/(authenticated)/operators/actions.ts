'use server';

import { createClient } from '@/utils/supabase/server';
import { checkPermission, getActiveAdminTenantId, getAdminSession } from '@/app/admin/actions';
import { revalidatePath } from 'next/cache';

export async function createOperator(email: string, password: string, roleId: string, tenantId: string) {
  if (!(await checkPermission('manage_operators'))) {
    return { success: false, message: 'Akses ditolak.' };
  }

  const adminSession = await getAdminSession();
  const currentTenantId = await getActiveAdminTenantId();

  // If non-superadmin, force tenant_id to be their active tenant
  let finalTenantId = tenantId;
  if (!adminSession?.is_superadmin) {
    if (!currentTenantId) {
      return { success: false, message: 'Tenant aktif tidak ditemukan.' };
    }
    finalTenantId = currentTenantId;
  } else if (!finalTenantId && currentTenantId) {
    finalTenantId = currentTenantId;
  }

  const supabase = await createClient();
  
  // Call the custom RPC function that hashes the password and bypasses auto-login
  const { data, error } = await supabase.rpc('create_admin_operator', {
    p_email: email,
    p_password: password,
    p_role_id: roleId || null,
    p_tenant_id: finalTenantId || null
  });

  if (error) {
    return { success: false, message: error.message };
  }
  
  revalidatePath('/admin/operators');
  return { success: true };
}

export async function deleteOperator(id: string) {
  if (!(await checkPermission('manage_operators'))) {
    return { success: false, message: 'Akses ditolak.' };
  }

  const adminSession = await getAdminSession();
  const currentTenantId = await getActiveAdminTenantId();
  const supabase = await createClient();

  // Verify that the operator belongs to current tenant if caller is not superadmin
  if (!adminSession?.is_superadmin) {
    const { data: targetOp } = await supabase
      .from('admin_users')
      .select('tenant_id, is_superadmin')
      .eq('id', id)
      .maybeSingle();

    if (!targetOp || targetOp.is_superadmin || targetOp.tenant_id !== currentTenantId) {
      return { success: false, message: 'Akses ditolak untuk menghapus operator ini.' };
    }
  }

  const { error } = await supabase.from('admin_users').delete().eq('id', id);

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath('/admin/operators');
  return { success: true };
}

