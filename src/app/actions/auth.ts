"use server";

import { createClient } from "@/utils/supabase/server";
import { createServiceClient } from "@/utils/supabase/service";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { setMemberSessionCookie, clearMemberSessionCookie } from "@/utils/memberSession";

export async function login(formData: FormData) {
  const email = (formData.get("email") as string || "").trim();
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Semua kolom harus diisi." };
  }

  const supabase = await createClient();

  // Basic email detection, if not email, maybe they typed username, but Supabase requires email by default
  const isEmail = email.includes("@");
  if (!isEmail) {
    return { error: "Gunakan email yang valid untuk masuk." };
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: "Email atau password salah." };
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signup(formData: FormData) {
  const name = (formData.get("name") as string || "").trim();
  const phone = (formData.get("phone") as string || "").trim();
  const email = (formData.get("email") as string || "").trim();
  const password = formData.get("password") as string;

  if (!email || !password || !name || !phone) {
    return { error: "Semua kolom harus diisi." };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name: name,
        phone: phone,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  
  revalidatePath("/", "layout");
  redirect("/");
}

// ─── Username Mode (Opsi 2) ───────────────────────────────────────────────

export async function loginWithUsername(formData: FormData, tenantId: string) {
  const username = (formData.get("username") as string || "").trim().toLowerCase();
  const password = formData.get("password") as string;

  if (!username || !password) {
    return { error: "Username dan password harus diisi." };
  }

  const supabase = createServiceClient();

  const { data: member, error } = await supabase
    .from("members")
    .select("id, username, password_hash, tenant_id")
    .eq("tenant_id", tenantId)
    .eq("username", username)
    .maybeSingle();

  if (error || !member) {
    return { error: "Username atau password salah." };
  }

  const isValid = await bcrypt.compare(password, member.password_hash);
  if (!isValid) {
    return { error: "Username atau password salah." };
  }

  await setMemberSessionCookie({
    memberId: member.id,
    username: member.username,
    tenantId: member.tenant_id,
  });

  revalidatePath("/", "layout");
  redirect("/");
}

export async function logoutMember() {
  await clearMemberSessionCookie();
  revalidatePath("/", "layout");
  redirect("/");
}

export async function logoutStorefront(authMode: "email" | "username" = "email") {
  if (authMode === "username") {
    return logoutMember();
  }
  return logout();
}
