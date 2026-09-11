/**
 * One-off historical import for the EOD call log: loads the 1,693 calls
 * migrated into EOD_REPORT.xlsx's Daily Log sheet on 04 Sep 2026.
 *
 * Not part of `npm run db:seed` — run it once, manually, after `db:seed` has
 * created the ops agents, payers, and reason codes this data references:
 *
 *   npx tsx scripts/import-call-log-history.ts
 *
 * Idempotent via CallLogEntry.legacyKey (the spreadsheet's own per-agent
 * dedup key, e.g. "MIV-1"): safe to re-run, existing keys are skipped. A row
 * whose MattRef# cell held more than one reference (jammed together in the
 * legacy file) is split into one CallLogEntry per reference, each keyed
 * "<legacyKey>-<n>", since a claim reference is the row's real identity.
 */

import "dotenv/config";
import { PrismaClient, CallOutcome } from "@prisma/client";
import historicalEntries from "../prisma/seed-data/call-log/historical-entries.json";

const prisma = new PrismaClient();

interface HistoricalEntry {
  legacyKey: string;
  callDate: string;
  initials: string;
  mattRef: string;
  payer: string | null;
  outcome: "Completed" | "Unsuccessful";
  durationMinutes: number | null;
  reasonCode: string | null;
  notes: string | null;
}

const OUTCOME_MAP: Record<string, CallOutcome> = {
  Completed: "COMPLETED",
  Unsuccessful: "UNSUCCESSFUL",
};

const normalizePayerName = (name: string) => name.trim().toLowerCase();

async function main() {
  console.log(`Importing ${historicalEntries.length} historical call-log rows...\n`);

  const agents = await prisma.opsAgent.findMany({ select: { id: true, initials: true } });
  const agentIdByInitials = new Map(agents.map((a) => [a.initials, a.id]));

  const payers = await prisma.payer.findMany({ select: { id: true, name: true } });
  const payerIdByName = new Map(payers.map((p) => [normalizePayerName(p.name), p.id]));

  const aliases = await prisma.payerAlias.findMany({ include: { payer: { select: { name: true } } } });
  const payerIdByAlias = new Map(aliases.map((a) => [normalizePayerName(a.aliasText), a.payerId]));

  const reasonCodes = await prisma.reasonCode.findMany({ select: { id: true, code: true } });
  const reasonCodeIdByCode = new Map(reasonCodes.map((r) => [r.code, r.id]));

  const existingKeys = new Set(
    (await prisma.callLogEntry.findMany({ where: { legacyKey: { not: null } }, select: { legacyKey: true } })).map(
      (e) => e.legacyKey as string
    )
  );

  let created = 0;
  let skippedExisting = 0;
  let missingAgent = 0;
  let unresolvedPayer = 0;

  for (const raw of historicalEntries as HistoricalEntry[]) {
    const agentId = agentIdByInitials.get(raw.initials);
    if (!agentId) {
      console.warn(`  ! Unknown agent initials "${raw.initials}" (legacyKey ${raw.legacyKey}) — skipped.`);
      missingAgent += 1;
      continue;
    }

    let payerId: string | null = null;
    if (raw.payer) {
      const key = normalizePayerName(raw.payer);
      payerId = payerIdByName.get(key) ?? payerIdByAlias.get(key) ?? null;
      if (!payerId) {
        console.warn(`  ! Unresolved payer "${raw.payer}" (legacyKey ${raw.legacyKey}) — logged with no payer link.`);
        unresolvedPayer += 1;
      }
    }

    const reasonCodeId = raw.reasonCode ? reasonCodeIdByCode.get(raw.reasonCode) ?? null : null;

    // A legacy row's MattRef# cell sometimes held 2-4 references jammed
    // together (newline-separated); split into one row per reference.
    const mattRefs = raw.mattRef
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean);

    for (let i = 0; i < mattRefs.length; i += 1) {
      const legacyKey = mattRefs.length === 1 ? raw.legacyKey : `${raw.legacyKey}-${i + 1}`;
      if (existingKeys.has(legacyKey)) {
        skippedExisting += 1;
        continue;
      }

      await prisma.callLogEntry.create({
        data: {
          callDate: new Date(raw.callDate),
          agentId,
          mattRef: mattRefs[i],
          payerId,
          payerAsEntered: raw.payer,
          outcome: OUTCOME_MAP[raw.outcome],
          durationMinutes: raw.durationMinutes,
          reasonCodeId,
          notes: raw.notes,
          loggedById: agentId,
          legacyKey,
        },
      });
      existingKeys.add(legacyKey);
      created += 1;
    }
  }

  console.log("\nImport summary:");
  console.log(`  Created:              ${created}`);
  console.log(`  Skipped (already in): ${skippedExisting}`);
  console.log(`  Skipped (bad agent):  ${missingAgent}`);
  console.log(`  Logged w/o payer:     ${unresolvedPayer}`);
  console.log("\nDone.");
}

main()
  .catch((err) => {
    console.error("Historical import failed:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
