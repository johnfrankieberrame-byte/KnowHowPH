/**
 * EOD call-log reference data — extracted from the team's EOD_REPORT.xlsx
 * (payer directory, staff directory, reason codes, payer assignments, and
 * the payer-name normalization audit trail). Real operational config, not
 * illustrative POC data — see prisma/seed.ts for how it's loaded.
 */

import referenceData from "./call-log/reference-data.json";

export interface StaffRow {
  initials: string;
  fullName: string;
  active: boolean;
}

export interface PayerRow {
  name: string;
  payerGroup: string;
  phone: string | null;
  altPhone: string | null;
  extension: string | null;
  ivrNotes: string | null;
}

export interface ReasonCodeRow {
  code: string;
  description: string;
}

export interface PayerAssignmentRow {
  agentFullName: string;
  payer: string;
  payerGroup: string;
  accountCount: number;
}

export interface PayerAliasRow {
  aliasText: string;
  canonicalPayer: string;
  payerGroup: string;
  rowsAffected: number;
  changeType: string | null;
}

export interface TaskRow {
  mattRef: string;
  payer: string | null;
  payerGroup: string | null;
  status: string;
  assignedTo: string | null;
  notes: string | null;
}

export const STAFF = referenceData.staff as StaffRow[];
export const PAYERS = referenceData.payers as PayerRow[];
export const REASON_CODES = referenceData.reasonCodes as ReasonCodeRow[];
export const PAYER_ASSIGNMENTS = referenceData.payerAssignments as PayerAssignmentRow[];
export const PAYER_ALIASES = referenceData.payerAliases as PayerAliasRow[];
export const TASKS = referenceData.tasks as TaskRow[];
