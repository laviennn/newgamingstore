
**1. SEO Mastery**
*   **Dynamic Metadata:** Use Next.js `generateMetadata` for all pages. The title and description must dynamically include the Tenant's name and Game names (e.g., "Top Up {Game Name} Murah & Cepat - {Tenant Name}").
*   **Schema Markup (JSON-LD):** Implement `Product` schema for the Top-up Detail page and `FAQPage` schema for the Homepage FAQs to ensure rich snippets on Google.
*   **Semantic HTML:** Use proper `<header>`, `<main>`, `<article>`, `<section>`, and hierarchical heading tags (`h1` to `h6`).

**2. CMS & Component Modularity**
*   Everything on the homepage (Sliders, Promo banners) must be built as independent React components that accept props from the database. No hardcoded content.

**3. Dynamic Form Handling Strategy**
*   When fetching a Game detail, parse the `form_fields` JSON.
*   Create a `<DynamicFieldBuilder />` component that loops through this JSON and renders standard text inputs, dropdowns (for servers), or numeric inputs depending on the config.
*   Validate these dynamic fields strictly before allowing the user to click "Checkout".