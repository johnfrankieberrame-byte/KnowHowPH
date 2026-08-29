import type { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { PublicationStatusBadge } from "@/components/admin/publication-status-badge";
import { VerificationBadge } from "@/components/careers/verification-badge";
import { SchoolFormDialog } from "@/components/admin/school-form-dialog";
import { getAllSchoolsForAdmin } from "@/lib/db/queries/admin";
import { formatSchoolType } from "@/lib/utils/format";

export const metadata: Metadata = { title: "Schools" };
export const dynamic = "force-dynamic";

export default async function AdminSchoolsPage() {
  const schools = await getAllSchoolsForAdmin();

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Schools</h1>
          <p className="mt-1 text-sm text-muted-foreground">{schools.length} schools</p>
        </div>
        <SchoolFormDialog mode="create" />
      </div>

      <Card className="overflow-x-auto">
        <table className="w-full min-w-[800px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="p-3 font-medium">Name</th>
              <th className="p-3 font-medium">Type</th>
              <th className="p-3 font-medium">Region</th>
              <th className="p-3 font-medium">Programs</th>
              <th className="p-3 font-medium">Verification</th>
              <th className="p-3 font-medium">Publication</th>
              <th className="p-3 font-medium" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {schools.map((school) => (
              <tr key={school.id}>
                <td className="p-3">
                  <p className="font-medium">{school.name}</p>
                  <p className="text-xs text-muted-foreground">/{school.slug}</p>
                </td>
                <td className="p-3 text-muted-foreground">{formatSchoolType(school.type)}</td>
                <td className="p-3 text-muted-foreground">
                  {school.region}
                  <span className="block text-xs">{school.provinceCity}</span>
                </td>
                <td className="p-3 text-muted-foreground">{school._count.schoolPrograms}</td>
                <td className="p-3">
                  <VerificationBadge status={school.verificationStatus} />
                </td>
                <td className="p-3">
                  <PublicationStatusBadge status={school.publicationStatus} />
                </td>
                <td className="p-3 text-right">
                  <SchoolFormDialog
                    mode="edit"
                    schoolId={school.id}
                    defaults={{
                      name: school.name,
                      slug: school.slug,
                      type: school.type,
                      region: school.region,
                      provinceCity: school.provinceCity,
                      website: school.website ?? "",
                      description: school.description,
                      accreditationNote: school.accreditationNote ?? "",
                      verificationStatus: school.verificationStatus,
                      publicationStatus: school.publicationStatus,
                    }}
                  />
                </td>
              </tr>
            ))}
            {schools.length === 0 && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-sm text-muted-foreground">
                  No schools yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
