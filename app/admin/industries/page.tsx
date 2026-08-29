import type { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { PublicationStatusBadge } from "@/components/admin/publication-status-badge";
import { IndustryFormDialog } from "@/components/admin/industry-form-dialog";
import { getAllIndustriesForAdmin } from "@/lib/db/queries/admin";

export const metadata: Metadata = { title: "Industries" };
export const dynamic = "force-dynamic";

export default async function AdminIndustriesPage() {
  const industries = await getAllIndustriesForAdmin();

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Industries</h1>
          <p className="mt-1 text-sm text-muted-foreground">{industries.length} industries</p>
        </div>
        <IndustryFormDialog mode="create" />
      </div>

      <Card className="overflow-x-auto">
        <table className="w-full min-w-[700px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="p-3 font-medium">Name</th>
              <th className="p-3 font-medium">Categories</th>
              <th className="p-3 font-medium">Careers</th>
              <th className="p-3 font-medium">Order</th>
              <th className="p-3 font-medium">Status</th>
              <th className="p-3 font-medium" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {industries.map((ind) => (
              <tr key={ind.id}>
                <td className="p-3">
                  <p className="font-medium">{ind.name}</p>
                  <p className="text-xs text-muted-foreground">/{ind.slug}</p>
                </td>
                <td className="p-3 text-muted-foreground">{ind._count.categories}</td>
                <td className="p-3 text-muted-foreground">{ind._count.primaryCareers}</td>
                <td className="p-3 text-muted-foreground">{ind.order}</td>
                <td className="p-3">
                  <PublicationStatusBadge status={ind.publicationStatus} />
                </td>
                <td className="p-3 text-right">
                  <IndustryFormDialog
                    mode="edit"
                    industryId={ind.id}
                    defaults={{
                      name: ind.name,
                      slug: ind.slug,
                      description: ind.description,
                      icon: ind.icon ?? "",
                      order: ind.order,
                      publicationStatus: ind.publicationStatus,
                    }}
                  />
                </td>
              </tr>
            ))}
            {industries.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-sm text-muted-foreground">
                  No industries yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
