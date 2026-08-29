// Shared reference pools reused across careers: Skill, WorkStyleTag, Certification.

export type SkillCategoryLiteral = "TECHNICAL" | "HUMAN";

export interface SkillDef {
  slug: string;
  name: string;
  category: SkillCategoryLiteral;
  description?: string;
}

export const SKILLS: SkillDef[] = [
  // Human / soft skills
  { slug: "communication", name: "Communication", category: "HUMAN" },
  { slug: "customer-service", name: "Customer Service", category: "HUMAN" },
  { slug: "teamwork", name: "Teamwork", category: "HUMAN" },
  { slug: "problem-solving", name: "Problem Solving", category: "HUMAN" },
  { slug: "attention-to-detail", name: "Attention to Detail", category: "HUMAN" },
  { slug: "time-management", name: "Time Management", category: "HUMAN" },
  { slug: "adaptability", name: "Adaptability", category: "HUMAN" },
  { slug: "leadership", name: "Leadership", category: "HUMAN" },
  { slug: "negotiation", name: "Negotiation", category: "HUMAN" },
  { slug: "empathy", name: "Empathy", category: "HUMAN" },
  { slug: "creativity", name: "Creativity", category: "HUMAN" },
  { slug: "critical-thinking", name: "Critical Thinking", category: "HUMAN" },
  { slug: "active-listening", name: "Active Listening", category: "HUMAN" },
  { slug: "conflict-resolution", name: "Conflict Resolution", category: "HUMAN" },

  // Technical / domain skills
  { slug: "excel", name: "Microsoft Excel / Spreadsheets", category: "TECHNICAL" },
  { slug: "sql", name: "SQL", category: "TECHNICAL" },
  { slug: "data-analysis", name: "Data Analysis", category: "TECHNICAL" },
  { slug: "data-visualization", name: "Data Visualization", category: "TECHNICAL" },
  { slug: "python", name: "Python", category: "TECHNICAL" },
  { slug: "javascript", name: "JavaScript", category: "TECHNICAL" },
  { slug: "git-version-control", name: "Git & Version Control", category: "TECHNICAL" },
  { slug: "figma", name: "Figma", category: "TECHNICAL" },
  { slug: "adobe-creative-suite", name: "Adobe Creative Suite", category: "TECHNICAL" },
  { slug: "seo", name: "SEO", category: "TECHNICAL" },
  { slug: "content-writing", name: "Content Writing", category: "TECHNICAL" },
  { slug: "social-media-management", name: "Social Media Management", category: "TECHNICAL" },
  { slug: "accounting-software", name: "Accounting Software", category: "TECHNICAL" },
  { slug: "financial-reporting", name: "Financial Reporting", category: "TECHNICAL" },
  { slug: "bookkeeping", name: "Bookkeeping", category: "TECHNICAL" },
  { slug: "cad-software", name: "CAD Software", category: "TECHNICAL" },
  { slug: "structural-analysis", name: "Structural Analysis", category: "TECHNICAL" },
  { slug: "blueprint-reading", name: "Blueprint Reading", category: "TECHNICAL" },
  { slug: "patient-care-procedures", name: "Patient Care Procedures", category: "TECHNICAL" },
  { slug: "medical-lab-procedures", name: "Medical Laboratory Procedures", category: "TECHNICAL" },
  { slug: "clinical-documentation", name: "Clinical Documentation", category: "TECHNICAL" },
  { slug: "welding-techniques", name: "Welding Techniques", category: "TECHNICAL" },
  { slug: "equipment-maintenance", name: "Equipment Maintenance & Safety", category: "TECHNICAL" },
  { slug: "network-security", name: "Network Security", category: "TECHNICAL" },
  { slug: "threat-analysis", name: "Threat Analysis", category: "TECHNICAL" },
  { slug: "inventory-management-systems", name: "Inventory Management Systems", category: "TECHNICAL" },
  { slug: "logistics-planning", name: "Logistics Planning", category: "TECHNICAL" },
  { slug: "crm-software", name: "CRM Software", category: "TECHNICAL" },
  { slug: "ux-research", name: "UX Research", category: "TECHNICAL" },
  { slug: "wireframing-prototyping", name: "Wireframing & Prototyping", category: "TECHNICAL" },
  { slug: "lesson-planning", name: "Lesson Planning", category: "TECHNICAL" },
  { slug: "classroom-management", name: "Classroom Management", category: "TECHNICAL" },
  { slug: "business-strategy", name: "Business Strategy", category: "TECHNICAL" },
  { slug: "fundraising-pitching", name: "Fundraising & Pitching", category: "TECHNICAL" },
  { slug: "office-administration", name: "Office Administration", category: "TECHNICAL" },
];

export interface WorkStyleTagDef {
  slug: string;
  name: string;
}

export const WORK_STYLE_TAGS: WorkStyleTagDef[] = [
  { slug: "remote-friendly", name: "Remote-friendly" },
  { slug: "client-facing", name: "Client-facing" },
  { slug: "team-based", name: "Team-based" },
  { slug: "independent", name: "Independent" },
  { slug: "field-work", name: "Field work" },
  { slug: "high-structure", name: "High structure" },
  { slug: "creative-freedom", name: "Creative freedom" },
  { slug: "deadline-driven", name: "Deadline-driven" },
  { slug: "physically-active", name: "Physically active" },
  { slug: "licensed-profession", name: "Licensed profession" },
  { slug: "entry-level-friendly", name: "Entry-level friendly" },
  { slug: "entrepreneurial", name: "Entrepreneurial" },
];

export interface CertificationDef {
  slug: string;
  name: string;
  issuingBody: string;
  description?: string;
  isLicensure: boolean;
}

export const CERTIFICATIONS: CertificationDef[] = [
  {
    slug: "ph-nursing-licensure-exam",
    name: "Nurse Licensure Examination (NLE)",
    issuingBody: "Professional Regulation Commission (PRC)",
    description: "Required licensure exam for practicing as a registered nurse in the Philippines.",
    isLicensure: true,
  },
  {
    slug: "medtech-licensure",
    name: "Medical Technologist Licensure Examination",
    issuingBody: "Professional Regulation Commission (PRC)",
    description: "Required licensure exam for practicing as a licensed medical technologist.",
    isLicensure: true,
  },
  {
    slug: "cpa-licensure",
    name: "CPA Licensure Examination",
    issuingBody: "Professional Regulation Commission (PRC)",
    description: "Required licensure exam to practice as a Certified Public Accountant.",
    isLicensure: true,
  },
  {
    slug: "civil-engineer-licensure",
    name: "Civil Engineer Licensure Examination",
    issuingBody: "Professional Regulation Commission (PRC)",
    description: "Required licensure exam to practice as a professional civil engineer.",
    isLicensure: true,
  },
  {
    slug: "teacher-licensure-exam",
    name: "Licensure Examination for Teachers (LET)",
    issuingBody: "Professional Regulation Commission (PRC)",
    description: "Required licensure exam to teach in Philippine basic education.",
    isLicensure: true,
  },
  {
    slug: "tesda-welding-ncii",
    name: "Welding NC II",
    issuingBody: "TESDA",
    description: "National Certificate II in shielded metal arc welding, assessed via a TESDA competency exam.",
    isLicensure: false,
  },
  {
    slug: "bookkeeping-ncii",
    name: "Bookkeeping NC III",
    issuingBody: "TESDA",
    description: "National Certificate III in bookkeeping competencies.",
    isLicensure: false,
  },
  {
    slug: "comptia-security-plus",
    name: "CompTIA Security+",
    issuingBody: "CompTIA",
    description: "Vendor-neutral entry-level cybersecurity certification.",
    isLicensure: false,
  },
  {
    slug: "google-data-analytics-cert",
    name: "Google Data Analytics Certificate",
    issuingBody: "Google / Coursera",
    description: "Professional certificate covering data cleaning, analysis, and visualization fundamentals.",
    isLicensure: false,
  },
  {
    slug: "aws-cloud-practitioner",
    name: "AWS Certified Cloud Practitioner",
    issuingBody: "Amazon Web Services",
    description: "Entry-level certification covering cloud computing fundamentals on AWS.",
    isLicensure: false,
  },
  {
    slug: "hubspot-content-marketing-cert",
    name: "HubSpot Content Marketing Certification",
    issuingBody: "HubSpot Academy",
    description: "Free certification covering content strategy and digital marketing fundamentals.",
    isLicensure: false,
  },
  {
    slug: "hr-certification",
    name: "HR Practitioner Certification",
    issuingBody: "People Management Association of the Philippines (illustrative)",
    description: "Illustrative professional certification recognizing foundational HR practice competencies.",
    isLicensure: false,
  },
  {
    slug: "ux-certification",
    name: "UX Design Certificate",
    issuingBody: "Google / Coursera",
    description: "Professional certificate covering UX research, wireframing, and prototyping fundamentals.",
    isLicensure: false,
  },
];
