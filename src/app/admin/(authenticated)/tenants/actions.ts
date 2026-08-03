"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function saveTenant(formData: FormData, id?: string) {
  const name = formData.get("name") as string;
  const domain = formData.get("domain") as string;
  const admin_domain = formData.get("admin_domain") as string;
  const is_maintenance = formData.get("is_maintenance") === "on";

  if (!name || !domain || !admin_domain) {
    return { error: "Name, Domain, and Admin Domain are required." };
  }

  const supabase = await createClient();

  try {
    if (id) {
      // Update
      const { error } = await supabase
        .from("tenants")
        .update({ name, domain, admin_domain, is_maintenance })
        .eq("id", id);
      if (error) throw error;
    } else {
      // Insert
      const { error } = await supabase
        .from("tenants")
        .insert([{ name, domain, admin_domain, is_maintenance }]);
      if (error) throw error;
    }

    revalidatePath("/admin/tenants");
    return { success: true };
  } catch (err) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const error = err as any;
    return { error: error.message || "Failed to save tenant." };
  }
}
