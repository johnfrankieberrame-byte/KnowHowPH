import type { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { PublicationStatusBadge } from "@/components/admin/publication-status-badge";
import { VerificationBadge } from "@/components/careers/verification-badge";
import { ProgramFormDialog } from "@/components/admin/program-form-dialog";
import { getAllProgramsForAdmin } from "@/lib/db/queries/admin";
import { formatCredentialType, formatDeliveryMode } from "@/lib/utils/format";

export const metadata: Metadata = { title: "Programs" };
export const dynamic = "force-dynamic";

export default async function AdminProgramsPage() {
  const programs = await getAllProgramsForAdmin();

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Programs</h1>
          <p className="mt-1 text-sm text-muted-foreground">{programs.length} programs</p>
        </div>
        <ProgramFormDialog mode="create" />
      </div>

      <Card className="overflow-x-auto">
        <table className="w-full min-w-[800px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="p-3 font-medium">Name</th>
              <th className="p-3 font-medium">Credential</th>
              <th className="p-3 font-medium">Delivery</th>
              <th className="p-3 font-medium">Schools / careers</th>
              <th className="p-3 font-medium">Verification</th>
              <th className="p-3 font-medium">Publication</th>
              <th className="p-3 font-medium" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {programs.map((program) => (
              <tr key={program.id}>
                <td className="p-3">
                  <p className="font-medium">{program.name}</p>
                  <p className="text-xs text-muted-foreground">/{program.slug} · {program.durationLabel}</p>
                </td>
                <td className="p-3 text-muted-foreground">{formatCredentialType(program.credentialType)}</td>
                <td className="p-3 text-muted-foreground">{formatDeliveryMode(program.deliveryMode)}</td>
                <td className="p-3 text-muted-foreground">
                  {program._count.schoolPrograms} / {program._count.programCareers}
                </td>
                <td className="p-3">
                  <VerificationBadge status={program.verificationStatus} />
                </td>
                <td className="p-3">
                  <PublicationStatusBadge status={program.publicationStatus} />
                </td>
                <td className="p-3 text-right">
                  <ProgramFormDialog
                    mode="edit"
                    programId={program.id}
                    defaults={{
                      name: program.name,
                      slug: program.slug,
                      credentialType: program.credentialType,
                      durationLabel: program.durationLabel,
                      deliveryMode: program.deliveryMode,
                      admissionNotes: program.admissionNotes ?? "",
                      tuitionNote: program.tuitionNote ?? "",
                      verificationStatus: program.verificationStatus,
                      publicationStatus: program.publicationStatus,
                    }}
                  />
                </td>
              </tr>
            ))}
            {programs.length === 0 && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-sm text-muted-foreground">
                  No programs yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
