import "server-only";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser, UnauthorizedError, ForbiddenError } from "@/lib/auth/session";
import type { OpsRole } from "@prisma/client";

export type OpsSessionAgent = {
  id: string;
  userId: string;
  initials: string;
  fullName: string;
  email: string;
  opsRole: OpsRole;
};

/**
 * Comma-separated emails that get auto-provisioned as a SUPERVISOR ops agent
 * on first sign-in if no OpsAgent record exists yet for them. MVP bootstrap
 * mechanism, mirroring ADMIN_EMAILS in lib/auth/session.ts — once at least
 * one supervisor is in, everyone else should be provisioned from the Staff
 * directory page instead.
 */
function bootstrapOpsSupervisorEmails(): string[] {
  return (process.env.OPS_SUPERVISOR_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

function deriveInitials(email: string, taken: Set<string>): string {
  const local = email.split("@")[0] ?? "";
  const letters = local.replace(/[^a-zA-Z]/g, "").toUpperCase();
  const base = (letters.slice(0, 3) || "OPS").padEnd(2, "X");
  if (!taken.has(base)) return base;
  for (let n = 2; n < 100; n += 1) {
    const candidate = `${base.slice(0, 2)}${n}`;
    if (!taken.has(candidate)) return candidate;
  }
  return `${base}${Date.now() % 1000}`;
}

function deriveFullName(email: string): string {
  const local = email.split("@")[0] ?? "";
  const parts = local.split(/[._-]+/).filter(Boolean);
  if (parts.length === 0) return "New Supervisor";
  return parts.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(" ");
}

/**
 * Resolves the signed-in user's OpsAgent profile, if they have one.
 *
 * Three ways to get one:
 *  1. Already linked (OpsAgent.userId === user.id) — the common case.
 *  2. A supervisor pre-provisioned an OpsAgent with this email but the person
 *     hasn't signed in yet — claim it by linking userId on first sight.
 *  3. Bootstrap: the email is in OPS_SUPERVISOR_EMAILS and no OpsAgent
 *     exists at all yet — auto-create one as SUPERVISOR.
 *
 * Returns null if the signed-in user is none of the above (not an ops team
 * member) or if nobody is signed in.
 */
export async function getCurrentOpsAgent(): Promise<OpsSessionAgent | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const linked = await prisma.opsAgent.findUnique({ where: { userId: user.id } });
  if (linked) return toSessionAgent(linked, user.email);

  const unclaimed = await prisma.opsAgent.findFirst({
    where: { email: { equals: user.email, mode: "insensitive" }, userId: null },
  });
  if (unclaimed) {
    const claimed = await prisma.opsAgent.update({
      where: { id: unclaimed.id },
      data: { userId: user.id },
    });
    return toSessionAgent(claimed, user.email);
  }

  if (bootstrapOpsSupervisorEmails().includes(user.email)) {
    const existingAgentCount = await prisma.opsAgent.count();
    const taken = new Set((await prisma.opsAgent.findMany({ select: { initials: true } })).map((a) => a.initials));
    const created = await prisma.opsAgent.create({
      data: {
        userId: user.id,
        email: user.email,
        initials: deriveInitials(user.email, taken),
        fullName: deriveFullName(user.email),
        opsRole: "SUPERVISOR",
        active: true,
      },
    });
    if (existingAgentCount === 0) {
      // eslint-disable-next-line no-console
      console.log(`Bootstrapped first ops supervisor: ${created.fullName} (${created.initials})`);
    }
    return toSessionAgent(created, user.email);
  }

  return null;
}

function toSessionAgent(
  agent: { id: string; userId: string | null; initials: string; fullName: string; opsRole: OpsRole },
  email: string
): OpsSessionAgent {
  return {
    id: agent.id,
    userId: agent.userId as string,
    initials: agent.initials,
    fullName: agent.fullName,
    email,
    opsRole: agent.opsRole,
  };
}

/** Throws UnauthorizedError/ForbiddenError unless the caller is an active ops agent. */
export async function requireOpsAgent(): Promise<OpsSessionAgent> {
  const user = await getCurrentUser();
  if (!user) throw new UnauthorizedError();

  const agent = await getCurrentOpsAgent();
  if (!agent) throw new ForbiddenError("You're not set up as a call-log team member yet. Ask a supervisor to add you.");

  const active = await prisma.opsAgent.findUnique({ where: { id: agent.id }, select: { active: true } });
  if (!active?.active) throw new ForbiddenError("Your call-log access has been deactivated.");

  return agent;
}

/** Throws UnauthorizedError/ForbiddenError unless the caller is an active SUPERVISOR ops agent. */
export async function requireOpsSupervisor(): Promise<OpsSessionAgent> {
  const agent = await requireOpsAgent();
  if (agent.opsRole !== "SUPERVISOR") throw new ForbiddenError("Supervisor access required.");
  return agent;
}
