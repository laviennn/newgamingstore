"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

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
