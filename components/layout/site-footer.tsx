import Link from "next/link";
import { Compass } from "lucide-react";

const FOOTER_LINKS = [
  {
    heading: "Explore",
    links: [
      { href: "/careers", label: "Career explorer" },
      { href: "/industries", label: "Industries" },
      { href: "/schools", label: "Schools & programs" },
      { href: "/quiz", label: "Career quiz" },
    ],
  },
  {
    heading: "About KnowHow",
    links: [
      { href: "/about", label: "Methodology & sources" },
      { href: "/privacy", label: "Privacy policy" },
      { href: "/terms", label: "Terms of use" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card mt-16">
      <div className="container-page py-10 grid gap-8 sm:grid-cols-2 md:grid-cols-4">
        <div className="md:col-span-2">
          <Link href="/" className="flex items-center gap-2 font-semibold text-lg">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Compass className="h-5 w-5" aria-hidden />
            </span>
            KnowHow
          </Link>
          <p className="mt-3 max-w-sm text-sm text-muted-foreground">
            KnowHow helps people in the Philippines explore careers and make grounded decisions. Salary,
            demand, and market signals shown across this site are informational estimates — many are
            clearly-labeled POC seed data — and are not guarantees. See our{" "}
            <Link href="/about" className="underline underline-offset-2 hover:text-primary">
              source policy
            </Link>{" "}
            for details.
          </p>
        </div>
        {FOOTER_LINKS.map((group) => (
          <div key={group.heading}>
            <h3 className="text-sm font-semibold">{group.heading}</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {group.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-primary">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border py-4">
        <p className="container-page text-xs text-muted-foreground">
          © {new Date().getFullYear()} KnowHow PH. Proof-of-concept — career and salary information is
          illustrative unless labeled "verified." Not affiliated with any government agency.
        </p>
      </div>
    </footer>
  );
}
