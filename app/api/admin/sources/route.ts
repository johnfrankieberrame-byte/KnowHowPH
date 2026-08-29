import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { withApiErrorHandling } from "@/lib/validations/api";
import { prisma } from "@/lib/db/prisma";
import { logAdminAction } from "@/lib/db/audit";
import { dataSourceInputSchema } from "@/lib/validations/admin";
import { getAllSourcesForAdmin } from "@/lib/db/queries/admin";

export const GET = withApiErrorHandling(async () => {
  await requireAdmin();
  const sources = await getAllSourcesForAdmin();
  return NextResponse.json(sources);
});

export const POST = withApiErrorHandling(async (req: Request) => {
  const admin = await requireAdmin();
  const body = dataSourceInputSchema.parse(await req.json());

  const source = await prisma.dataSource.create({
    data: { ...body, url: body.url || null, archivedUrl: body.archivedUrl || null },
  });
  await logAdminAction(admin.id, "create_source", "DataSource", source.id, {
    title: source.title,
    publisher: source.publisher,
  });

  return NextResponse.json(source, { status: 201 });
});
