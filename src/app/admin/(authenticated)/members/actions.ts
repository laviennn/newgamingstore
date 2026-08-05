"use server";

import bcrypt from "bcryptjs";
import { createServiceClient } from "@/utils/supabase/service";
import { getActiveAdminTenantId } from "@/app/admin/actions";
import { checkPermission } from "@/app/admin/actions";
import { revalidatePath } from "next/cache";

export async function createMember(formData: FormData) {
  if (!(await checkPermission("manage_members"))) {
    return { error: "Akses ditolak." };
  }

  const tenantId = await getActiveAdminTenantId();
  if (!tenantId) {
    return { error: "Tenant tidak ditemukan." };
  }

  const username = (formData.get("username") as string || "").trim().toLowerCase();
  const phone = (formData.get("phone") as string || "").trim();
  const password = formData.get("password") as string;

  if (!username || !password) {
    return { error: "Username dan password wajib diisi." };
  }

  if (!/^[a-z0-9_]{3,20}$/.test(username)) {
    return { error: "Username harus 3-20 karakter (huruf kecil, angka, underscore)." };
  }

  if (password.length < 6) {
    return { error: "Password minimal 6 karakter." };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const supabase = createServiceClient();

  const { error } = await supabase.from("members").insert({
    tenant_id: tenantId,
    username,
    phone: phone || null,
    password_hash: passwordHash,
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "Username sudah digunakan di tenant ini." };
    }
    return { error: error.message || "Gagal mendaftarkan member." };
  }

  revalidatePath("/admin/members");
  return { success: true };
}

export async function deleteMember(id: string) {
  if (!(await checkPermission("manage_members"))) {
    return { error: "Akses ditolak." };
  }

  const tenantId = await getActiveAdminTenantId();
  if (!tenantId) {
    return { error: "Tenant tidak ditemukan." };
  }

  const supabase = createServiceClient();
  const { error } = await supabase
    .from("members")
    .delete()
    .eq("id", id)
    .eq("tenant_id", tenantId);

  if (error) {
    return { error: error.message || "Gagal menghapus member." };
  }

  revalidatePath("/admin/members");
  return { success: true };
}
