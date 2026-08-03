'use server';

import { createClient } from '@/utils/supabase/server';
import { checkPermission } from '@/app/admin/actions';
import { revalidatePath } from 'next/cache';

export async function createRole(name: string, permissions: string[]) {
  if (!(await checkPermission('manage_roles'))) {
    return { success: false, message: 'Akses ditolak.' };
  }

  const supabase = await createClient();
  const { error } = await supabase.from('admin_roles').insert([{ name, permissions }]);

  if (error) {
    return { success: false, message: error.message };
  }
  revalidatePath('/admin/roles');
  return { success: true };
}

export async function updateRole(id: string, name: string, permissions: string[]) {
  if (!(await checkPermission('manage_roles'))) {
    return { success: false, message: 'Akses ditolak.' };
  }

  const supabase = await createClient();
  const { error } = await supabase.from('admin_roles').update({ name, permissions }).eq('id', id);

  if (error) {
    return { success: false, message: error.message };
  }
  revalidatePath('/admin/roles');
  return { success: true };
}

export async function deleteRole(id: string) {
  if (!(await checkPermission('manage_roles'))) {
    return { success: false, message: 'Akses ditolak.' };
  }

  const supabase = await createClient();
  const { error } = await supabase.from('admin_roles').delete().eq('id', id);

  if (error) {
    return { success: false, message: error.message };
  }
  revalidatePath('/admin/roles');
  return { success: true };
}
