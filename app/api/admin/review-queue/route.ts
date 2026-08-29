import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { withApiErrorHandling } from "@/lib/validations/api";
import { getReviewQueueItems } from "@/lib/db/queries/admin";

export const GET = withApiErrorHandling(async () => {
  await requireAdmin();
  const items = await getReviewQueueItems();
  return NextResponse.json(items);
});
