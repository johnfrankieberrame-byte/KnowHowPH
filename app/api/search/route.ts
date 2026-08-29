import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { withApiErrorHandling } from "@/lib/validations/api";

const querySchema = z.object({ q: z.string().trim().min(1).max(100) });

export const GET = withApiErrorHandling(async (req: Request) => {
  const { searchParams } = new URL(req.url);
  const { q } = querySchema.parse({ q: searchParams.get("q") ?? "" });

  const [careers, industries, skills] = await Promise.all([
    prisma.career.findMany({
      where: { publicationStatus: "PUBLISHED", title: { contains: q, mode: "insensitive" } },
      select: { slug: true, title: true, primaryIndustry: { select: { name: true } } },
      take: 5,
    }),
    prisma.industry.findMany({
      where: { publicationStatus: "PUBLISHED", name: { contains: q, mode: "insensitive" } },
      select: { slug: true, name: true },
      take: 3,
    }),
    prisma.skill.findMany({
      where: { name: { contains: q, mode: "insensitive" } },
      select: { slug: true, name: true },
      take: 3,
    }),
  ]);

  return NextResponse.json({
    careers: careers.map((c) => ({ type: "career" as const, slug: c.slug, label: c.title, meta: c.primaryIndustry.name })),
    industries: industries.map((i) => ({ type: "industry" as const, slug: i.slug, label: i.name })),
    skills: skills.map((s) => ({ type: "skill" as const, slug: s.slug, label: s.name })),
  });
});
