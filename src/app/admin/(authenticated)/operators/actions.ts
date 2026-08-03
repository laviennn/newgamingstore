'use server';

import { createClient } from '@/utils/supabase/server';
import { checkPermission } from '@/app/admin/actions';
import { revalidatePath } from 'next/cache';

export async function createOperator(email: string, password: string, roleId: string, tenantId: string) {
  if (!(await checkPermission('manage_operators'))) { // Superadmin only usually, but let's say 'manage_operators' or just checking superadmin
    return { success: false, message: 'Akses ditolak.' };
  }

  const supabase = await createClient();
  
  // Call the custom RPC function that hashes the password and bypasses auto-login
  const { data, error } = await supabase.rpc('create_admin_operator', {
    p_email: email,
    p_password: password,
    p_role_id: roleId || null,
    p_tenant_id: tenantId || null
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

  const supabase = await createClient();
  
  // Admin_users table has ON DELETE CASCADE from auth.users? Wait, auth.users is the parent.
  // Actually, we can't easily delete auth.users without Service Role Key.
  // Let's just delete from admin_users to revoke BO access.
  const { error } = await supabase.from('admin_users').delete().eq('id', id);

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath('/admin/operators');
  return { success: true };
}
