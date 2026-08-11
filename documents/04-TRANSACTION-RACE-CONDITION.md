# Security Implementation: Transaction Race Conditions

## 🎯 Objective
Prevent "Double Spending" and duplicate orders/deposits caused by rapid successive clicks (race conditions) at the database level.

## 📝 Deliverables for AI Agent
1. **Idempotency Key Database Migration (`supabase/migrations/xxxx_add_idempotency.sql`):**
   - Create a table `idempotency_keys` (columns: `key` uuid, `created_at`, `locked_at`, `status`).
   - Add a unique constraint to prevent duplicate processing.
2. **Atomic Balance Update RPC (PostgreSQL):**
   - Create a Supabase PostgreSQL function (RPC) named `process_deposit_atomic`.
   - The RPC MUST use row-level locking (`SELECT ... FOR UPDATE`) when reading the user's wallet balance before adding the deposit amount.
   - It must deduct/add balance and update the transaction status in a single database transaction (`BEGIN ... COMMIT`).
3. **Integration in Server Action:**
   - Provide Next.js Server Action code that calls this RPC securely.
   - Demonstrate how to generate an Idempotency Key (UUID) on the client, pass it to the Server Action, and handle the "Transaction already processing" error gracefully.