"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function saveFaq(formData: FormData, id?: string) {
  const question = formData.get("question") as string;
  const answer = formData.get("answer") as string;
  const sort_order = parseInt(formData.get("sort_order") as string || "0");
  const is_active_raw = formData.get("is_active") as string;
  const is_active = is_active_raw === "true";

  if (!question || !answer) {
    return { error: "Pertanyaan dan Jawaban wajib diisi." };
  }

  const supabase = await createClient();

  try {
    if (id) {
      const { error } = await supabase
        .from("faqs")
        .update({ question, answer, sort_order, is_active })
        .eq("id", id);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from("faqs")
        .insert([{ question, answer, sort_order, is_active }]);
      if (error) throw error;
    }

    revalidatePath("/admin/faqs");
    revalidatePath("/");
    return { success: true };
  } catch (err: unknown) {
    return { error: (err as Error).message || "Gagal menyimpan FAQ." };
  }
}

export async function toggleFaqStatus(id: string, currentStatus: boolean) {
  const supabase = await createClient();
  try {
    const { error } = await supabase
      .from("faqs")
      .update({ is_active: !currentStatus })
      .eq("id", id);
    if (error) throw error;

    revalidatePath("/admin/faqs");
    revalidatePath("/");
    return { success: true };
  } catch (err: unknown) {
    return { error: (err as Error).message || "Gagal mengubah status FAQ." };
  }
}

export async function deleteFaq(id: string) {
  const supabase = await createClient();
  try {
    const { error } = await supabase.from("faqs").delete().eq("id", id);
    if (error) throw error;

    revalidatePath("/admin/faqs");
    revalidatePath("/");
    return { success: true };
  } catch (err: unknown) {
    return { error: (err as Error).message || "Gagal menghapus FAQ." };
  }
}
