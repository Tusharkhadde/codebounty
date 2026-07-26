ALTER TABLE "bounties" ADD COLUMN IF NOT EXISTS "owner_github_login" TEXT;
ALTER TABLE "bounties" ADD COLUMN IF NOT EXISTS "owner_wallet_address" TEXT;
CREATE TABLE IF NOT EXISTS "audit_logs" (
  "id" TEXT NOT NULL,
  "bounty_id" INTEGER NOT NULL,
  "github_login" TEXT NOT NULL,
  "wallet_address" TEXT,
  "action" TEXT NOT NULL,
  "previous_state" TEXT,
  "new_state" TEXT,
  "transaction_hash" TEXT,
  "ip_address" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "audit_logs_bounty_id_idx" ON "audit_logs"("bounty_id");
