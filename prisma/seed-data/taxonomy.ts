// Industry / CareerCategory taxonomy for the KnowHow PH POC seed.

export interface CategoryDef {
  slug: string;
  name: string;
  description: string;
}

export interface IndustryDef {
  slug: string;
  name: string;
  description: string;
  categories: CategoryDef[];
}

export const INDUSTRIES: IndustryDef[] = [
  {
    slug: "technology",
    name: "Technology",
    description: "Building, analyzing, and securing the software and data systems that power modern businesses.",
    categories: [
      {
        slug: "data-analytics",
        name: "Data & Analytics",
        description: "Turning raw data into insights that guide business decisions.",
      },
      {
        slug: "software-it",
        name: "Software & IT",
        description: "Designing, building, and protecting software systems and digital infrastructure.",
      },
    ],
  },
  {
    slug: "business-operations",
    name: "Business & Operations",
    description: "Keeping organizations running smoothly through people, process, and customer support.",
    categories: [
      {
        slug: "customer-operations",
        name: "Customer Operations",
        description: "Direct, day-to-day support and coordination that keeps customers and supply chains moving.",
      },
      {
        slug: "administrative-support",
        name: "Administrative Support",
        description: "Behind-the-scenes coordination, people support, and office operations work.",
      },
    ],
  },
  {
    slug: "creative-media",
    name: "Creative & Media",
    description: "Crafting visuals, words, and digital experiences that inform, persuade, and delight audiences.",
    categories: [
      {
        slug: "design",
        name: "Design",
        description: "Visual and experience design across print, digital products, and brands.",
      },
      {
        slug: "writing-content",
        name: "Writing & Content",
        description: "Writing, marketing, and content work that reaches and grows an audience.",
      },
    ],
  },
  {
    slug: "healthcare",
    name: "Healthcare",
    description: "Direct patient care and the diagnostic work that supports medical decision-making.",
    categories: [
      {
        slug: "clinical-care",
        name: "Clinical Care",
        description: "Hands-on patient care delivered in hospitals, clinics, and community settings.",
      },
      {
        slug: "diagnostics",
        name: "Diagnostics",
        description: "Laboratory and diagnostic work that informs clinical treatment decisions.",
      },
    ],
  },
  {
    slug: "engineering-built-environment",
    name: "Engineering & Built Environment",
    description: "Designing, building, and maintaining the physical structures and systems people rely on.",
    categories: [
      {
        slug: "civil-construction",
        name: "Civil & Construction",
        description: "Planning and engineering the infrastructure and buildings that shape communities.",
      },
      {
        slug: "skilled-trades",
        name: "Skilled Trades",
        description: "Hands-on technical trades that fabricate, install, and maintain physical work.",
      },
    ],
  },
  {
    slug: "education",
    name: "Education",
    description: "Teaching, mentoring, and developing learners across the education system.",
    categories: [
      {
        slug: "teaching",
        name: "Teaching",
        description: "Classroom instruction and student development in basic education.",
      },
    ],
  },
  {
    slug: "finance",
    name: "Finance",
    description: "Managing, recording, and reporting on the financial health of organizations and individuals.",
    categories: [
      {
        slug: "accounting",
        name: "Accounting",
        description: "Recording, reporting, and safeguarding accurate financial information.",
      },
    ],
  },
  {
    slug: "commerce",
    name: "Commerce",
    description: "Running the online storefronts and marketplaces that connect sellers to buyers.",
    categories: [
      {
        slug: "e-commerce",
        name: "E-commerce",
        description: "Managing online stores, marketplace listings, and digital retail operations.",
      },
    ],
  },
  {
    slug: "entrepreneurship",
    name: "Entrepreneurship",
    description: "Founding and growing new ventures from an idea into a working business.",
    categories: [
      {
        slug: "startup-business-creation",
        name: "Startup & Business Creation",
        description: "Building a new business from the ground up, from validation through early growth.",
      },
    ],
  },
];
