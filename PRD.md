
**1. Architecture & Multi-tenant Concept**
*   The platform is a White-label SaaS. One codebase serves multiple tenants based on the domain/subdomain.
*   Next.js Middleware must be used to rewrite URLs based on the host (e.g., routing `tenant1.com` to `/[domain]/page.tsx`).
*   All queries to the database must be isolated using a `tenant_id`.
*   Theming is dynamic. The system will fetch theme configurations (primary color, logo) from the database and apply them using CSS Variables mapped to Tailwind CSS.

**2. Dynamic Game Top-Up Fields (Crucial)**
*   Games have different requirements for top-ups. (e.g., Mobile Legends requires `Zone ID` and `User ID`; Genshin Impact requires `UID` and `Server Selection`).
*   The database schema for `Games` must have a JSON field called `form_fields` to dynamically render the input forms on the detail page.

**3. Pages & Features Requirement**
*   **Storefront (Public):**
    *   **Homepage:** Hero image slider (CMS manageable), Special Promo section, Popular Games section, Articles/Blog section, FAQ section, and Footer.
    *   **Top Up Detail Page:** Dynamic account input fields (based on game type), List of top-up products, Rating & Reviews display, Payment method selection, Promo code input, and Contact details.
    *   **Invoice/Checkout Page:** Displays order summary, manual payment instructions (Bank/E-wallet/QRIS), and upload proof of payment / redirect to WhatsApp.
    *   **Check Transaction Page:** Form to input Order ID/Invoice ID to track order status.
    *   **Price List Page:** Tabular view of all games and product prices.
    *   **Authentication:** Basic Auth (Login/Register) for customers and Admins using email/password.
*   **Admin Dashboard (CMS):**
    *   Manage Tenants (Themes, Domain).
    *   Manage Games (Dynamic form configurations).
    *   Manage Products & Prices.
    *   Manage Orders (Manual status update: Pending, Processed, Success, Failed).
    *   Manage Homepage Content (Sliders, Promos, Articles, FAQs).