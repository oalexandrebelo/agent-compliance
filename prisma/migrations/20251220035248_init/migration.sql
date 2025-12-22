-- CreateTable
CREATE TABLE "organizations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'VIEWER',
    "organizationId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "lastLoginAt" DATETIME,
    "notificationPreferences" JSONB,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    CONSTRAINT "users_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "agents" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "organizationId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "walletAddress" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "chainId" INTEGER NOT NULL DEFAULT 1,
    "trustScore" REAL NOT NULL DEFAULT 0.5,
    "totalSpent" DECIMAL NOT NULL DEFAULT 0,
    "transactionCount" INTEGER NOT NULL DEFAULT 0,
    "alertCount" INTEGER NOT NULL DEFAULT 0,
    "blockedCount" INTEGER NOT NULL DEFAULT 0,
    "dailyLimit" DECIMAL,
    "transactionLimit" DECIMAL,
    "behavioralProfile" JSONB,
    CONSTRAINT "agents_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "agentId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "fromAddress" TEXT NOT NULL,
    "toAddress" TEXT NOT NULL,
    "amount" DECIMAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USDC',
    "chainId" INTEGER NOT NULL DEFAULT 1,
    "txHash" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "decision" TEXT NOT NULL DEFAULT 'PENDING',
    "riskScore" REAL,
    "metadata" JSONB,
    "circleTransactionId" TEXT,
    "gasUsed" DECIMAL,
    "gasPriceGwei" DECIMAL,
    "submittedAt" DATETIME,
    "evaluatedAt" DATETIME,
    "executedAt" DATETIME,
    "blockedAt" DATETIME,
    CONSTRAINT "transactions_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "transactions_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "agents" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "risk_scores" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "transactionId" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "overallScore" REAL NOT NULL,
    "confidence" REAL NOT NULL,
    "velocityScore" REAL,
    "amountScore" REAL,
    "geographyScore" REAL,
    "behaviorScore" REAL,
    "reputationScore" REAL,
    "aiExplanation" TEXT,
    "reasons" JSONB,
    "features" JSONB,
    CONSTRAINT "risk_scores_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "transactions" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "risk_scores_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "agents" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "screening_results" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "transactionId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isPassed" BOOLEAN NOT NULL,
    "riskLevel" TEXT NOT NULL,
    "isOnOFAC" BOOLEAN NOT NULL DEFAULT false,
    "isOnEU" BOOLEAN NOT NULL DEFAULT false,
    "isOnPEP" BOOLEAN NOT NULL DEFAULT false,
    "isOnBlacklist" BOOLEAN NOT NULL DEFAULT false,
    "details" JSONB,
    "circleRequestId" TEXT,
    CONSTRAINT "screening_results_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "transactions" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "alerts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "transactionId" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "severity" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "reasons" JSONB NOT NULL,
    "aiExplanation" TEXT NOT NULL,
    "mustReviewBy" DATETIME,
    "reviewedAt" DATETIME,
    "resolvedAt" DATETIME,
    CONSTRAINT "alerts_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "alerts_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "transactions" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "alerts_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "agents" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "alert_reviews" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "alertId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "decision" TEXT NOT NULL,
    "comments" TEXT,
    "isSAR" BOOLEAN NOT NULL DEFAULT false,
    "sarId" TEXT,
    CONSTRAINT "alert_reviews_alertId_fkey" FOREIGN KEY ("alertId") REFERENCES "alerts" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "alert_reviews_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "compliance_settings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "defaultDailyLimit" DECIMAL,
    "defaultTransactionLimit" DECIMAL,
    "autoApproveThreshold" REAL NOT NULL DEFAULT 0.3,
    "autoBlockThreshold" REAL NOT NULL DEFAULT 0.7,
    "whitelist" JSONB,
    "blacklist" JSONB,
    "notifyOnHighRisk" BOOLEAN NOT NULL DEFAULT true,
    "notifyOnBlockedTx" BOOLEAN NOT NULL DEFAULT true,
    "slackWebhookUrl" TEXT,
    "emailAlertRecipients" JSONB,
    "customRules" JSONB,
    CONSTRAINT "compliance_settings_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "compliance_reports" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "reportType" TEXT NOT NULL,
    "periodStart" DATETIME NOT NULL,
    "periodEnd" DATETIME NOT NULL,
    "totalTransactions" INTEGER NOT NULL,
    "flaggedCount" INTEGER NOT NULL,
    "blockedCount" INTEGER NOT NULL,
    "sarCount" INTEGER NOT NULL,
    "data" JSONB NOT NULL,
    "pdfUrl" TEXT,
    "csvUrl" TEXT,
    "auditNFTAddress" TEXT,
    "auditNFTTokenId" TEXT,
    CONSTRAINT "compliance_reports_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "before" JSONB,
    "after" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "metadata" JSONB,
    CONSTRAINT "audit_logs_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readAt" DATETIME,
    "type" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "actionUrl" TEXT,
    "metadata" JSONB,
    CONSTRAINT "notifications_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "api_keys" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME,
    "lastUsedAt" DATETIME,
    "name" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "permissions" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "rateLimit" INTEGER,
    "requestCount" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "api_keys_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "api_keys_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "daily_metrics" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalTransactions" INTEGER NOT NULL DEFAULT 0,
    "approvedCount" INTEGER NOT NULL DEFAULT 0,
    "blockedCount" INTEGER NOT NULL DEFAULT 0,
    "totalVolume" DECIMAL NOT NULL DEFAULT 0,
    "alertsCreated" INTEGER NOT NULL DEFAULT 0,
    "alertsResolved" INTEGER NOT NULL DEFAULT 0,
    "avgRiskScore" REAL,
    "avgResponseTimeMs" INTEGER,
    "topAgents" JSONB
);

-- CreateIndex
CREATE UNIQUE INDEX "organizations_slug_key" ON "organizations"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "organizations_email_key" ON "organizations"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_organizationId_idx" ON "users"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "agents_walletAddress_key" ON "agents"("walletAddress");

-- CreateIndex
CREATE UNIQUE INDEX "agents_walletId_key" ON "agents"("walletId");

-- CreateIndex
CREATE INDEX "agents_organizationId_idx" ON "agents"("organizationId");

-- CreateIndex
CREATE INDEX "agents_walletAddress_idx" ON "agents"("walletAddress");

-- CreateIndex
CREATE INDEX "agents_status_idx" ON "agents"("status");

-- CreateIndex
CREATE UNIQUE INDEX "transactions_txHash_key" ON "transactions"("txHash");

-- CreateIndex
CREATE UNIQUE INDEX "transactions_circleTransactionId_key" ON "transactions"("circleTransactionId");

-- CreateIndex
CREATE INDEX "transactions_agentId_idx" ON "transactions"("agentId");

-- CreateIndex
CREATE INDEX "transactions_organizationId_idx" ON "transactions"("organizationId");

-- CreateIndex
CREATE INDEX "transactions_status_idx" ON "transactions"("status");

-- CreateIndex
CREATE INDEX "transactions_decision_idx" ON "transactions"("decision");

-- CreateIndex
CREATE INDEX "transactions_createdAt_idx" ON "transactions"("createdAt");

-- CreateIndex
CREATE INDEX "transactions_toAddress_idx" ON "transactions"("toAddress");

-- CreateIndex
CREATE UNIQUE INDEX "risk_scores_transactionId_key" ON "risk_scores"("transactionId");

-- CreateIndex
CREATE INDEX "risk_scores_agentId_idx" ON "risk_scores"("agentId");

-- CreateIndex
CREATE INDEX "risk_scores_overallScore_idx" ON "risk_scores"("overallScore");

-- CreateIndex
CREATE UNIQUE INDEX "screening_results_transactionId_key" ON "screening_results"("transactionId");

-- CreateIndex
CREATE INDEX "screening_results_isPassed_idx" ON "screening_results"("isPassed");

-- CreateIndex
CREATE INDEX "screening_results_riskLevel_idx" ON "screening_results"("riskLevel");

-- CreateIndex
CREATE UNIQUE INDEX "alerts_transactionId_key" ON "alerts"("transactionId");

-- CreateIndex
CREATE INDEX "alerts_organizationId_idx" ON "alerts"("organizationId");

-- CreateIndex
CREATE INDEX "alerts_agentId_idx" ON "alerts"("agentId");

-- CreateIndex
CREATE INDEX "alerts_status_idx" ON "alerts"("status");

-- CreateIndex
CREATE INDEX "alerts_severity_idx" ON "alerts"("severity");

-- CreateIndex
CREATE INDEX "alerts_createdAt_idx" ON "alerts"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "alert_reviews_sarId_key" ON "alert_reviews"("sarId");

-- CreateIndex
CREATE INDEX "alert_reviews_alertId_idx" ON "alert_reviews"("alertId");

-- CreateIndex
CREATE INDEX "alert_reviews_userId_idx" ON "alert_reviews"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "compliance_settings_organizationId_key" ON "compliance_settings"("organizationId");

-- CreateIndex
CREATE INDEX "compliance_reports_organizationId_idx" ON "compliance_reports"("organizationId");

-- CreateIndex
CREATE INDEX "compliance_reports_reportType_idx" ON "compliance_reports"("reportType");

-- CreateIndex
CREATE INDEX "compliance_reports_periodStart_idx" ON "compliance_reports"("periodStart");

-- CreateIndex
CREATE INDEX "audit_logs_organizationId_idx" ON "audit_logs"("organizationId");

-- CreateIndex
CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("userId");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- CreateIndex
CREATE INDEX "notifications_organizationId_idx" ON "notifications"("organizationId");

-- CreateIndex
CREATE INDEX "notifications_createdAt_idx" ON "notifications"("createdAt");

-- CreateIndex
CREATE INDEX "notifications_readAt_idx" ON "notifications"("readAt");

-- CreateIndex
CREATE UNIQUE INDEX "api_keys_key_key" ON "api_keys"("key");

-- CreateIndex
CREATE INDEX "api_keys_organizationId_idx" ON "api_keys"("organizationId");

-- CreateIndex
CREATE INDEX "api_keys_key_idx" ON "api_keys"("key");

-- CreateIndex
CREATE INDEX "daily_metrics_organizationId_idx" ON "daily_metrics"("organizationId");

-- CreateIndex
CREATE INDEX "daily_metrics_date_idx" ON "daily_metrics"("date");

-- CreateIndex
CREATE UNIQUE INDEX "daily_metrics_organizationId_date_key" ON "daily_metrics"("organizationId", "date");
