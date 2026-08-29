import "server-only";
import { prisma } from "@/lib/db/prisma";
import type { Prisma } from "@prisma/client";

/**
 * Records one AdminAuditLog row for a mutating admin action.
 * `changes` should be a small JSON-serializable summary (diffed fields or
 * the new values) — not a full relation dump.
 */
export async function logAdminAction(
  actorUserId: string,
  action: string,
  entityType: string,
  entityId: string,
  changes?: Record<string, unknown> | null
) {
  await prisma.adminAuditLog.create({
    data: {
      actorUserId,
      action,
      entityType,
      entityId,
      changesJson: (changes ?? undefined) as Prisma.InputJsonValue | undefined,
    },
  });
}
