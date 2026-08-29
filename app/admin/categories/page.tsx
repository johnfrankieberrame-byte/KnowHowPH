import type { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { PublicationStatusBadge } from "@/components/admin/publication-status-badge";
import { CategoryFormDialog } from "@/components/admin/category-form-dialog";
import { getAllCategoriesForAdmin, getAllIndustriesForAdmin } from "@/lib/db/queries/admin";

export const metadata: Metadata = { title: "Categories" };
export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const [categories, industries] = await Promise.all([getAllCategoriesForAdmin(), getAllIndustriesForAdmin()]);
  const industryOptions = industries.map((i) => ({ id: i.id, name: i.name }));

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Categories</h1>
          <p className="mt-1 text-sm text-muted-foreground">{categories.length} categories</p>
        </div>
        <CategoryFormDialog mode="create" industries={industryOptions} />
      </div>

      <Card className="overflow-x-auto">
        <table className="w-full min-w-[700px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="p-3 font-medium">Name</th>
              <th className="p-3 font-medium">Industry</th>
              <th className="p-3 font-medium">Careers</th>
              <th className="p-3 font-medium">Order</th>
              <th className="p-3 font-medium">Status</th>
              <th className="p-3 font-medium" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {categories.map((cat) => (
              <tr key={cat.id}>
                <td className="p-3">
                  <p className="font-medium">{cat.name}</p>
                  <p className="text-xs text-muted-foreground">/{cat.slug}</p>
                </td>
                <td className="p-3 text-muted-foreground">{cat.industry.name}</td>
                <td className="p-3 text-muted-foreground">{cat._count.primaryCareers}</td>
                <td className="p-3 text-muted-foreground">{cat.order}</td>
                <td className="p-3">
                  <PublicationStatusBadge status={cat.publicationStatus} />
                </td>
                <td className="p-3 text-right">
                  <CategoryFormDialog
                    mode="edit"
                    categoryId={cat.id}
                    industries={industryOptions}
                    defaults={{
                      name: cat.name,
                      slug: cat.slug,
                      description: cat.description,
                      industryId: cat.industryId,
                      order: cat.order,
                      publicationStatus: cat.publicationStatus,
                    }}
                  />
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-sm text-muted-foreground">
                  No categories yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
