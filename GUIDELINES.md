
**1. Tech Stack**
*   **Framework:** Next.js (App Router).
*   **Styling:** Tailwind CSS + Shadcn UI (for accessible, CMS-like components).
*   **State Management:** React Hook Form + Zod (for strict form validation, especially for dynamic game fields) and Zustand (if global state is needed).
*   **Database & Auth:** Supabase (PostgreSQL)
*   **Deployment:** Cloudflare Pages (Edge Runtime).

**2. Folder Structure (App Router)**
*   Implement a structured folder system prioritizing the `[domain]` dynamic route for the multi-tenant architecture.
*   Separate `components/admin` and `components/storefront`.
*   Use `lib/utils` for helper functions (e.g., formatting currency to IDR).

**3. Edge Runtime Constraints**
*   Since the app will deploy to Cloudflare Pages, avoid Node.js native APIs (`fs`, `path`). Use Edge-compatible libraries.