CREATE TABLE IF NOT EXISTS "bounties" (
  "id" INTEGER NOT NULL,
  "issue_url" TEXT NOT NULL,
  "creator" TEXT NOT NULL,
  "owner_github_login" TEXT,
  "owner_wallet_address" TEXT,
  "amount" DOUBLE PRECISION NOT NULL,
  "token" TEXT DEFAULT 'XLM',
  "deadline" BIGINT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'funded',
  "linked_pr_url" TEXT,
  "contributor" TEXT,
  "funded_at" BIGINT NOT NULL,
  "paid_at" BIGINT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "bounties_pkey" PRIMARY KEY ("id")
);

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