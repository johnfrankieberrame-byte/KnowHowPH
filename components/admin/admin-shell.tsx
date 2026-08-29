import { AdminSidebar } from "@/components/admin/admin-sidebar";

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="shrink-0 border-b border-border bg-card md:w-56 md:border-b-0 md:border-r">
        <div className="md:sticky md:top-0 md:h-screen md:overflow-y-auto">
          <AdminSidebar />
        </div>
      </aside>
      <main className="min-w-0 flex-1">
        <div className="container-page max-w-6xl py-8">{children}</div>
      </main>
    </div>
  );
}
