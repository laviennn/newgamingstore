import { createClient } from "@/utils/supabase/server";
import { ArticlesClient } from "./ArticlesClient";

export default async function ArticlesPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let articles: any[] = [];

  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error && data) articles = data;
    }
  } catch (err) {
    console.error("Gagal mengambil data artikel", err);
  }

  return (
    <div className="space-y-6">
      <ArticlesClient initialArticles={articles} />
    </div>
  );
}
