# Security Implementation: Server Actions & Input Validation

## 🎯 Objective
Secure all Next.js Server Actions against BOLA/IDOR attacks, enforce strict Zod schema validation, and secure R2 file uploads.

## 📝 Deliverables for AI Agent
1. **Safe Action Wrapper (`lib/safe-action.ts`):**
   - Create a Higher-Order Function that intercepts incoming Server Action requests.
   - **Step 1:** Verify Supabase auth session. Reject if unauthorized.
   - **Step 2:** Extract `tenant_id` and role from the session.
   - **Step 3:** Accept a Zod schema and parse the raw input. Reject if validation fails.
   - **Step 4:** Pass the validated data, `tenant_id`, and `user_id` to the core handler logic.
2. **Strict Zod Schemas (`schemas/transaction.schema.ts`):**
   - Create Zod schemas for `Deposit` and `UpdateProduct`.
   - Ensure numbers are positive, strings have max lengths, and emails are properly regex-validated.
3. **Secure File Upload Utility (`lib/upload.ts`):**
   - Create a utility for handling image uploads to Cloudflare R2.
   - **MUST DO:** Rename the incoming file using `crypto.randomUUID()` + original extension to prevent Directory Traversal.
   - **MUST DO:** Implement a "Magic Bytes" check (using a library like `file-type`) to verify the file is truly an image (e.g., JPEG/PNG), not just checking the `.png` string extension.