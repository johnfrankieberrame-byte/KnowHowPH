"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { formatVerificationStatus } from "@/lib/utils/format";

const PUBLICATION_OPTIONS = ["DRAFT", "PUBLISHED", "ARCHIVED"];
const VERIFICATION_OPTIONS = ["POC_SEED", "UNVERIFIED", "NEEDS_REVIEW", "VERIFIED", "ARCHIVED"];

export function CareersFilterBar({
  industries,
}: {
  industries: { id: string; name: string }[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Input
        placeholder="Search titles…"
        defaultValue={searchParams.get("q") ?? ""}
        className="h-9 w-48"
        onChange={(e) => setParam("q", e.target.value)}
      />
      <Select value={searchParams.get("publicationStatus") ?? "all"} onValueChange={(v) => setParam("publicationStatus", v === "all" ? "" : v)}>
        <SelectTrigger className="h-9 w-40 text-sm">
          <SelectValue placeholder="Publication status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          {PUBLICATION_OPTIONS.map((s) => (
            <SelectItem key={s} value={s}>
              {s.charAt(0) + s.slice(1).toLowerCase()}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={searchParams.get("verificationStatus") ?? "all"} onValueChange={(v) => setParam("verificationStatus", v === "all" ? "" : v)}>
        <SelectTrigger className="h-9 w-44 text-sm">
          <SelectValue placeholder="Verification status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All verification</SelectItem>
          {VERIFICATION_OPTIONS.map((s) => (
            <SelectItem key={s} value={s}>
              {formatVerificationStatus(s)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={searchParams.get("industryId") ?? "all"} onValueChange={(v) => setParam("industryId", v === "all" ? "" : v)}>
        <SelectTrigger className="h-9 w-44 text-sm">
          <SelectValue placeholder="Industry" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All industries</SelectItem>
          {industries.map((i) => (
            <SelectItem key={i.id} value={i.id}>
              {i.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
