-- CreateEnum
CREATE TYPE "OpsRole" AS ENUM ('AGENT', 'SUPERVISOR');

-- CreateEnum
CREATE TYPE "CallOutcome" AS ENUM ('COMPLETED', 'UNSUCCESSFUL');

-- CreateEnum
CREATE TYPE "FollowUpStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'DONE', 'CANCELLED');

-- CreateTable
CREATE TABLE "OpsAgent" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "initials" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT,
    "opsRole" "OpsRole" NOT NULL DEFAULT 'AGENT',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OpsAgent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "payerGroup" TEXT NOT NULL,
    "phone" TEXT,
    "altPhone" TEXT,
    "extension" TEXT,
    "ivrNotes" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayerAlias" (
    "id" TEXT NOT NULL,
    "payerId" TEXT NOT NULL,
    "aliasText" TEXT NOT NULL,
    "rowsAffected" INTEGER NOT NULL DEFAULT 0,
    "changeType" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PayerAlias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReasonCode" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReasonCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CallLogEntry" (
    "id" TEXT NOT NULL,
    "callDate" DATE NOT NULL,
    "agentId" TEXT NOT NULL,
    "mattRef" TEXT NOT NULL,
    "payerId" TEXT,
    "payerAsEntered" TEXT,
    "outcome" "CallOutcome" NOT NULL,
    "durationMinutes" DOUBLE PRECISION,
    "reasonCodeId" TEXT,
    "notes" TEXT,
    "loggedById" TEXT NOT NULL,
    "legacyKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CallLogEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FollowUpTask" (
    "id" TEXT NOT NULL,
    "mattRef" TEXT NOT NULL,
    "payerId" TEXT,
    "status" "FollowUpStatus" NOT NULL DEFAULT 'OPEN',
    "assignedToId" TEXT,
    "callLogEntryId" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "FollowUpTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayerAssignment" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "payerId" TEXT NOT NULL,
    "accountCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PayerAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OpsAgent_userId_key" ON "OpsAgent"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "OpsAgent_initials_key" ON "OpsAgent"("initials");

-- CreateIndex
CREATE UNIQUE INDEX "OpsAgent_email_key" ON "OpsAgent"("email");

-- CreateIndex
CREATE INDEX "OpsAgent_opsRole_idx" ON "OpsAgent"("opsRole");

-- CreateIndex
CREATE INDEX "OpsAgent_active_idx" ON "OpsAgent"("active");

-- CreateIndex
CREATE UNIQUE INDEX "Payer_name_key" ON "Payer"("name");

-- CreateIndex
CREATE INDEX "Payer_payerGroup_idx" ON "Payer"("payerGroup");

-- CreateIndex
CREATE INDEX "Payer_active_idx" ON "Payer"("active");

-- CreateIndex
CREATE UNIQUE INDEX "PayerAlias_aliasText_key" ON "PayerAlias"("aliasText");

-- CreateIndex
CREATE INDEX "PayerAlias_payerId_idx" ON "PayerAlias"("payerId");

-- CreateIndex
CREATE UNIQUE INDEX "ReasonCode_code_key" ON "ReasonCode"("code");

-- CreateIndex
CREATE INDEX "ReasonCode_active_idx" ON "ReasonCode"("active");

-- CreateIndex
CREATE UNIQUE INDEX "CallLogEntry_legacyKey_key" ON "CallLogEntry"("legacyKey");

-- CreateIndex
CREATE INDEX "CallLogEntry_agentId_callDate_idx" ON "CallLogEntry"("agentId", "callDate");

-- CreateIndex
CREATE INDEX "CallLogEntry_payerId_idx" ON "CallLogEntry"("payerId");

-- CreateIndex
CREATE INDEX "CallLogEntry_mattRef_idx" ON "CallLogEntry"("mattRef");

-- CreateIndex
CREATE INDEX "CallLogEntry_callDate_idx" ON "CallLogEntry"("callDate");

-- CreateIndex
CREATE INDEX "CallLogEntry_outcome_idx" ON "CallLogEntry"("outcome");

-- CreateIndex
CREATE INDEX "FollowUpTask_status_idx" ON "FollowUpTask"("status");

-- CreateIndex
CREATE INDEX "FollowUpTask_assignedToId_idx" ON "FollowUpTask"("assignedToId");

-- CreateIndex
CREATE INDEX "FollowUpTask_mattRef_idx" ON "FollowUpTask"("mattRef");

-- CreateIndex
CREATE INDEX "PayerAssignment_payerId_idx" ON "PayerAssignment"("payerId");

-- CreateIndex
CREATE UNIQUE INDEX "PayerAssignment_agentId_payerId_key" ON "PayerAssignment"("agentId", "payerId");

-- AddForeignKey
ALTER TABLE "OpsAgent" ADD CONSTRAINT "OpsAgent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayerAlias" ADD CONSTRAINT "PayerAlias_payerId_fkey" FOREIGN KEY ("payerId") REFERENCES "Payer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CallLogEntry" ADD CONSTRAINT "CallLogEntry_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "OpsAgent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CallLogEntry" ADD CONSTRAINT "CallLogEntry_payerId_fkey" FOREIGN KEY ("payerId") REFERENCES "Payer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CallLogEntry" ADD CONSTRAINT "CallLogEntry_reasonCodeId_fkey" FOREIGN KEY ("reasonCodeId") REFERENCES "ReasonCode"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CallLogEntry" ADD CONSTRAINT "CallLogEntry_loggedById_fkey" FOREIGN KEY ("loggedById") REFERENCES "OpsAgent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FollowUpTask" ADD CONSTRAINT "FollowUpTask_payerId_fkey" FOREIGN KEY ("payerId") REFERENCES "Payer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FollowUpTask" ADD CONSTRAINT "FollowUpTask_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "OpsAgent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FollowUpTask" ADD CONSTRAINT "FollowUpTask_callLogEntryId_fkey" FOREIGN KEY ("callLogEntryId") REFERENCES "CallLogEntry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayerAssignment" ADD CONSTRAINT "PayerAssignment_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "OpsAgent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayerAssignment" ADD CONSTRAINT "PayerAssignment_payerId_fkey" FOREIGN KEY ("payerId") REFERENCES "Payer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
