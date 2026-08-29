/** Formats an integer PHP amount as ₱ currency, e.g. 25000 -> "₱25,000". */
export function formatPHP(amount: number): string {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Formats a PHP salary range, e.g. (25000, 40000) -> "₱25,000 – ₱40,000 / month". */
export function formatSalaryRange(
  min: number | null | undefined,
  max: number | null | undefined,
  period: string = "month"
): string {
  if (min == null && max == null) return "Not yet estimated";
  if (min != null && max != null) {
    return `${formatPHP(min)} – ${formatPHP(max)} / ${period}`;
  }
  return `${formatPHP((min ?? max) as number)} / ${period}`;
}

const RATING_LABELS: Record<string, string> = {
  VERY_LOW: "Very low",
  LOW: "Low",
  MODERATE: "Moderate",
  HIGH: "High",
  VERY_HIGH: "Very high",
};

export function formatRating(rating: string | null | undefined): string {
  if (!rating) return "Not yet rated";
  return RATING_LABELS[rating] ?? rating;
}

const EDUCATION_LABELS: Record<string, string> = {
  HIGH_SCHOOL: "High school diploma",
  TESDA_CERTIFICATE: "TESDA certificate",
  ASSOCIATE_OR_DIPLOMA: "Associate degree or diploma",
  BACHELORS: "Bachelor's degree",
  POSTGRADUATE: "Postgraduate degree",
  LICENSE_REQUIRED: "Professional license required",
  VARIES: "Varies by employer",
};

export function formatEducationLevel(level: string | null | undefined): string {
  if (!level) return "Varies";
  return EDUCATION_LABELS[level] ?? level;
}

export function formatMonthsRange(min: number, max: number): string {
  const fmt = (m: number) => (m < 12 ? `${m} mo` : `${(m / 12).toFixed(m % 12 === 0 ? 0 : 1)} yr`);
  if (min === max) return fmt(min);
  return `${fmt(min)} – ${fmt(max)}`;
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "—";
  return new Intl.DateTimeFormat("en-PH", { year: "numeric", month: "long", day: "numeric" }).format(
    new Date(date)
  );
}

const VERIFICATION_LABELS: Record<string, string> = {
  POC_SEED: "POC seed data",
  UNVERIFIED: "Unverified",
  VERIFIED: "Verified",
  NEEDS_REVIEW: "Needs review",
  ARCHIVED: "Archived",
};

export function formatVerificationStatus(status: string | null | undefined): string {
  if (!status) return "Unverified";
  return VERIFICATION_LABELS[status] ?? status;
}

const SCHOOL_TYPE_LABELS: Record<string, string> = {
  PUBLIC: "Public",
  PRIVATE: "Private",
  STATE_UNIVERSITY_COLLEGE: "State university / college",
  TRAINING_PROVIDER: "Training provider",
  ONLINE_PROVIDER: "Online provider",
};

export function formatSchoolType(type: string | null | undefined): string {
  if (!type) return "School";
  return SCHOOL_TYPE_LABELS[type] ?? type;
}

const CREDENTIAL_TYPE_LABELS: Record<string, string> = {
  DEGREE: "Degree",
  DIPLOMA: "Diploma",
  CERTIFICATE: "Certificate",
  TESDA_ALIGNED: "TESDA-aligned",
  BOOTCAMP: "Bootcamp",
  SHORT_COURSE: "Short course",
};

export function formatCredentialType(type: string | null | undefined): string {
  if (!type) return "Program";
  return CREDENTIAL_TYPE_LABELS[type] ?? type;
}

const DELIVERY_MODE_LABELS: Record<string, string> = {
  IN_PERSON: "In-person",
  ONLINE: "Online",
  HYBRID: "Hybrid",
};

export function formatDeliveryMode(mode: string | null | undefined): string {
  if (!mode) return "Varies";
  return DELIVERY_MODE_LABELS[mode] ?? mode;
}

const ENTRY_DIFFICULTY_LABELS: Record<string, string> = {
  EASY: "Easy",
  MODERATE: "Moderate",
  HARD: "Hard",
  VERY_HARD: "Very hard",
};

export function formatEntryDifficulty(difficulty: string | null | undefined): string {
  if (!difficulty) return "Unrated";
  return ENTRY_DIFFICULTY_LABELS[difficulty] ?? difficulty;
}

const PUBLICATION_STATUS_LABELS: Record<string, string> = {
  DRAFT: "Draft",
  PUBLISHED: "Published",
  ARCHIVED: "Archived",
};

export function formatPublicationStatus(status: string | null | undefined): string {
  if (!status) return "Draft";
  return PUBLICATION_STATUS_LABELS[status] ?? status;
}

const SOURCE_TYPE_LABELS: Record<string, string> = {
  GOVERNMENT: "Government",
  SCHOOL: "School",
  EMPLOYER: "Employer",
  JOB_PLATFORM: "Job platform",
  PROFESSIONAL_BODY: "Professional body",
  RESEARCH: "Research",
  INTERNAL_POC: "Internal POC estimate",
  OTHER: "Other",
};

export function formatSourceType(type: string | null | undefined): string {
  if (!type) return "Other";
  return SOURCE_TYPE_LABELS[type] ?? type;
}

const METRIC_TYPE_LABELS: Record<string, string> = {
  SALARY: "Salary",
  DEMAND: "Demand",
  SATURATION: "Saturation",
  REMOTE_VIABILITY: "Remote viability",
  FREELANCE_VIABILITY: "Freelance viability",
};

export function formatMetricType(type: string | null | undefined): string {
  if (!type) return "Metric";
  return METRIC_TYPE_LABELS[type] ?? type;
}
