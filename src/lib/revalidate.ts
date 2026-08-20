import { revalidatePath } from "next/cache";

/**
 * Centralized Storefront Cache Invalidation
 * Calling this purges stale ISR Edge cache on Vercel CDN whenever an admin modifies
 * products, prices, games, categories, FAQs, or tenant theme configs.
 */
export function revalidateStorefront(extraPaths: string[] = []) {
  try {
    // Purge dynamic tenant domain routes
    revalidatePath("/", "layout");
    revalidatePath("/[domain]", "page");
    revalidatePath("/[domain]/prices", "page");
    revalidatePath("/[domain]/game/[slug]", "page");
    revalidatePath("/[domain]/blog", "page");
    revalidatePath("/[domain]/blog/[slug]", "page");
    
    // Purge extra explicit paths if provided
    for (const path of extraPaths) {
      if (path) revalidatePath(path);
    }
  } catch (err) {
    console.warn("[REVALIDATE_STOREFRONT_ERROR]", err);
  }
}
