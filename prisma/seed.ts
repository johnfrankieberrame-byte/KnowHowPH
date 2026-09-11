/**
 * KnowHow PH — Proof-of-concept seed script.
 *
 * Populates the local database with realistic, internally-consistent demo
 * data: industries/categories, careers with all related detail rows, a
 * shared skill/work-style/certification pool, schools & programs, and the
 * career-fit quiz (sections, questions, options).
 *
 * All salary, demand, and metric figures are illustrative placeholders for
 * a proof-of-concept and are explicitly marked as such via the seeded
 * DataSource and per-metric methodology notes — see docs/METHODOLOGY.md.
 *
 * Idempotent: safe to re-run via `npm run db:seed`. Rows keyed by a unique
 * slug/compound-key use upsert; rows with no natural unique key (pathways,
 * metrics, source references, quiz questions/options) are deleted and
 * recreated per parent so re-running never duplicates or crashes.
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { INDUSTRIES } from "./seed-data/taxonomy";
import { SKILLS, WORK_STYLE_TAGS, CERTIFICATIONS } from "./seed-data/pools";
import { CAREERS } from "./seed-data/careers";
import { SCHOOLS, PROGRAMS } from "./seed-data/schools";
import { QUIZ_SECTIONS } from "./seed-data/quiz";
import {
  STAFF,
  PAYERS,
  REASON_CODES,
  PAYER_ASSIGNMENTS,
  PAYER_ALIASES,
  TASKS,
} from "./seed-data/call-log";

const prisma = new PrismaClient();

const DATA_SOURCE_TITLE = "KnowHow POC Seed Data";

async function main() {
  console.log("Seeding KnowHow PH POC data...\n");

  // -----------------------------------------------------------------
  // 1. DataSource (all metrics/sourceRefs reference this)
  // -----------------------------------------------------------------
  let dataSource = await prisma.dataSource.findFirst({ where: { title: DATA_SOURCE_TITLE } });
  if (!dataSource) {
    dataSource = await prisma.dataSource.create({
      data: {
        title: DATA_SOURCE_TITLE,
        publisher: "KnowHow",
        sourceType: "INTERNAL_POC",
        verificationStatus: "UNVERIFIED",
        methodologySummary:
          "All figures attached to this source (salary ranges, demand/saturation ratings, remote/freelance viability ratings, and career source references) are illustrative placeholder values authored for a proof-of-concept product demo. They are not derived from live labor-market data, government statistics, or employer surveys, and must be verified against real, current sources (e.g. PSA, DOLE, PRC, job platform postings) before being presented to users as factual.",
        notes:
          "POC placeholder data source. Every value referencing this source is a best-guess illustrative estimate created for demo purposes only and requires verification before production use.",
      },
    });
    console.log(`Created DataSource "${DATA_SOURCE_TITLE}" (${dataSource.id})`);
  } else {
    console.log(`Found existing DataSource "${DATA_SOURCE_TITLE}" (${dataSource.id})`);
  }

  // -----------------------------------------------------------------
  // 2. Industries + Categories
  // -----------------------------------------------------------------
  const industryIdBySlug = new Map<string, string>();
  const categoryIdBySlug = new Map<string, string>();

  let industryOrder = 0;
  for (const ind of INDUSTRIES) {
    const industry = await prisma.industry.upsert({
      where: { slug: ind.slug },
      update: {
        name: ind.name,
        description: ind.description,
        order: industryOrder,
        publicationStatus: "PUBLISHED",
      },
      create: {
        slug: ind.slug,
        name: ind.name,
        description: ind.description,
        order: industryOrder,
        publicationStatus: "PUBLISHED",
      },
    });
    industryIdBySlug.set(ind.slug, industry.id);
    industryOrder += 1;

    let categoryOrder = 0;
    for (const cat of ind.categories) {
      const category = await prisma.careerCategory.upsert({
        where: { slug: cat.slug },
        update: {
          name: cat.name,
          description: cat.description,
          industryId: industry.id,
          order: categoryOrder,
          publicationStatus: "PUBLISHED",
        },
        create: {
          slug: cat.slug,
          name: cat.name,
          description: cat.description,
          industryId: industry.id,
          order: categoryOrder,
          publicationStatus: "PUBLISHED",
        },
      });
      categoryIdBySlug.set(cat.slug, category.id);
      categoryOrder += 1;
    }
  }
  console.log(`Upserted ${industryIdBySlug.size} industries and ${categoryIdBySlug.size} categories.`);

  // -----------------------------------------------------------------
  // 3. Shared pools: Skill, WorkStyleTag, Certification
  // -----------------------------------------------------------------
  const skillIdBySlug = new Map<string, string>();
  for (const s of SKILLS) {
    const skill = await prisma.skill.upsert({
      where: { slug: s.slug },
      update: { name: s.name, category: s.category, description: s.description },
      create: { slug: s.slug, name: s.name, category: s.category, description: s.description },
    });
    skillIdBySlug.set(s.slug, skill.id);
  }

  const tagIdBySlug = new Map<string, string>();
  for (const t of WORK_STYLE_TAGS) {
    const tag = await prisma.workStyleTag.upsert({
      where: { slug: t.slug },
      update: { name: t.name },
      create: { slug: t.slug, name: t.name },
    });
    tagIdBySlug.set(t.slug, tag.id);
  }

  const certIdBySlug = new Map<string, string>();
  for (const c of CERTIFICATIONS) {
    const cert = await prisma.certification.upsert({
      where: { slug: c.slug },
      update: {
        name: c.name,
        issuingBody: c.issuingBody,
        description: c.description,
        isLicensure: c.isLicensure,
      },
      create: {
        slug: c.slug,
        name: c.name,
        issuingBody: c.issuingBody,
        description: c.description,
        isLicensure: c.isLicensure,
      },
    });
    certIdBySlug.set(c.slug, cert.id);
  }
  console.log(
    `Upserted ${skillIdBySlug.size} skills, ${tagIdBySlug.size} work-style tags, ${certIdBySlug.size} certifications.`
  );

  // -----------------------------------------------------------------
  // 4. Careers — pass 1: base fields (no relatedCareers yet)
  // -----------------------------------------------------------------
  const careerIdBySlug = new Map<string, string>();

  for (const c of CAREERS) {
    const industryId = industryIdBySlug.get(c.industrySlug);
    const categoryId = categoryIdBySlug.get(c.categorySlug);
    if (!industryId || !categoryId) {
      throw new Error(`Career ${c.slug}: unknown industry/category slug (${c.industrySlug}/${c.categorySlug})`);
    }

    const reviewedAt = new Date("2026-07-15T00:00:00.000Z");
    const nextReviewDue = new Date("2027-01-15T00:00:00.000Z");

    const career = await prisma.career.upsert({
      where: { slug: c.slug },
      update: {
        title: c.title,
        shortDescription: c.shortDescription,
        longDescription: c.longDescription,
        primaryIndustryId: industryId,
        primaryCategoryId: categoryId,
        responsibilities: c.responsibilities,
        goodFitIf: c.goodFitIf,
        challengingIf: c.challengingIf,
        workEnvironment: c.workEnvironment,
        workStyleSummary: c.workStyleSummary,
        educationLevel: c.educationLevel,
        entryDifficulty: c.entryDifficulty,
        timeToEntryMinMonths: c.timeToEntryMinMonths,
        timeToEntryMaxMonths: c.timeToEntryMaxMonths,
        remoteViability: c.remoteViability,
        freelanceViability: c.freelanceViability,
        entryLevelTitle: c.entryLevelTitle,
        midLevelTitle: c.midLevelTitle,
        seniorLevelTitle: c.seniorLevelTitle,
        seoTitle: c.seoTitle,
        seoDescription: c.seoDescription,
        publicationStatus: "PUBLISHED",
        verificationStatus: "POC_SEED",
        lastReviewedAt: reviewedAt,
        nextReviewDueAt: nextReviewDue,
      },
      create: {
        slug: c.slug,
        title: c.title,
        shortDescription: c.shortDescription,
        longDescription: c.longDescription,
        primaryIndustryId: industryId,
        primaryCategoryId: categoryId,
        responsibilities: c.responsibilities,
        goodFitIf: c.goodFitIf,
        challengingIf: c.challengingIf,
        workEnvironment: c.workEnvironment,
        workStyleSummary: c.workStyleSummary,
        educationLevel: c.educationLevel,
        entryDifficulty: c.entryDifficulty,
        timeToEntryMinMonths: c.timeToEntryMinMonths,
        timeToEntryMaxMonths: c.timeToEntryMaxMonths,
        remoteViability: c.remoteViability,
        freelanceViability: c.freelanceViability,
        entryLevelTitle: c.entryLevelTitle,
        midLevelTitle: c.midLevelTitle,
        seniorLevelTitle: c.seniorLevelTitle,
        seoTitle: c.seoTitle,
        seoDescription: c.seoDescription,
        publicationStatus: "PUBLISHED",
        verificationStatus: "POC_SEED",
        lastReviewedAt: reviewedAt,
        nextReviewDueAt: nextReviewDue,
      },
    });
    careerIdBySlug.set(c.slug, career.id);
  }
  console.log(`Upserted ${careerIdBySlug.size} careers (base fields).`);

  // -----------------------------------------------------------------
  // 5. Careers — pass 2: nested detail rows
  // -----------------------------------------------------------------
  for (const c of CAREERS) {
    const careerId = careerIdBySlug.get(c.slug)!;

    // Aliases
    for (const alias of c.aliases) {
      await prisma.careerAlias.upsert({
        where: { careerId_alias: { careerId, alias } },
        update: {},
        create: { careerId, alias },
      });
    }

    // Skills
    for (const cs of c.skills) {
      const skillId = skillIdBySlug.get(cs.skillSlug);
      if (!skillId) throw new Error(`Career ${c.slug}: unknown skill slug ${cs.skillSlug}`);
      await prisma.careerSkill.upsert({
        where: { careerId_skillId: { careerId, skillId } },
        update: { proficiency: cs.proficiency, isCore: cs.isCore },
        create: { careerId, skillId, proficiency: cs.proficiency, isCore: cs.isCore },
      });
    }

    // Work style tags
    for (const tagSlug of c.workStyleTagSlugs) {
      const tagId = tagIdBySlug.get(tagSlug);
      if (!tagId) throw new Error(`Career ${c.slug}: unknown work style tag slug ${tagSlug}`);
      await prisma.careerWorkStyleTag.upsert({
        where: { careerId_tagId: { careerId, tagId } },
        update: {},
        create: { careerId, tagId },
      });
    }

    // Certifications
    for (const cert of c.certifications) {
      const certificationId = certIdBySlug.get(cert.certificationSlug);
      if (!certificationId) throw new Error(`Career ${c.slug}: unknown certification slug ${cert.certificationSlug}`);
      await prisma.careerCertification.upsert({
        where: { careerId_certificationId: { careerId, certificationId } },
        update: { isRequired: cert.isRequired, notes: cert.notes },
        create: { careerId, certificationId, isRequired: cert.isRequired, notes: cert.notes },
      });
    }

    // Pathways — no natural unique key: wipe and recreate deterministically.
    await prisma.careerPathway.deleteMany({ where: { careerId } });
    await prisma.careerPathway.createMany({
      data: c.pathways.map((p) => ({
        careerId,
        type: p.type,
        title: p.title,
        description: p.description,
        typicalDurationMonths: p.typicalDurationMonths,
        isRequired: p.isRequired,
        order: p.order,
      })),
    });

    // Metrics — wipe and recreate.
    await prisma.careerMetric.deleteMany({ where: { careerId } });
    const salaryMethodologyNote =
      c.salaryMethodologyNote ??
      "Illustrative POC estimate for entry-to-mid level roles in the Philippines; not sourced from live salary data and requires verification.";
    const ratingMethodologyNote =
      "Illustrative POC estimate based on general market impressions, not derived from live labor-market data. Requires verification before production use.";
    await prisma.careerMetric.createMany({
      data: [
        {
          careerId,
          metricType: "SALARY",
          salaryMin: c.salaryMin,
          salaryMax: c.salaryMax,
          currency: "PHP",
          status: "POC_ESTIMATE",
          geography: "Philippines",
          periodLabel: "Monthly, entry-to-mid level",
          methodologyNote: salaryMethodologyNote,
          sourceId: dataSource.id,
        },
        {
          careerId,
          metricType: "DEMAND",
          rating: c.demand,
          status: "POC_ESTIMATE",
          geography: "Philippines",
          periodLabel: "Current, illustrative",
          methodologyNote: ratingMethodologyNote,
          sourceId: dataSource.id,
        },
        {
          careerId,
          metricType: "SATURATION",
          rating: c.saturation,
          status: "POC_ESTIMATE",
          geography: "Philippines",
          periodLabel: "Current, illustrative",
          methodologyNote: ratingMethodologyNote,
          sourceId: dataSource.id,
        },
        {
          careerId,
          metricType: "REMOTE_VIABILITY",
          rating: c.remoteViability,
          status: "POC_ESTIMATE",
          geography: "Philippines",
          periodLabel: "Current, illustrative",
          methodologyNote: ratingMethodologyNote,
          sourceId: dataSource.id,
        },
        {
          careerId,
          metricType: "FREELANCE_VIABILITY",
          rating: c.freelanceViability,
          status: "POC_ESTIMATE",
          geography: "Philippines",
          periodLabel: "Current, illustrative",
          methodologyNote: ratingMethodologyNote,
          sourceId: dataSource.id,
        },
      ],
    });

    // Source references — wipe and recreate.
    await prisma.careerSourceReference.deleteMany({ where: { careerId } });
    await prisma.careerSourceReference.createMany({
      data: [
        {
          careerId,
          sourceId: dataSource.id,
          fieldContext: "overview",
          note: "Illustrative POC content — career overview, responsibilities, and fit criteria are placeholder text pending verification against real industry sources.",
        },
        {
          careerId,
          sourceId: dataSource.id,
          fieldContext: "salary",
          note: "Illustrative POC salary estimate — not sourced from live labor-market data.",
        },
      ],
    });

    // Quiz profile — careerId is unique, so upsert works directly.
    await prisma.careerQuizProfile.upsert({
      where: { careerId },
      update: {
        idealTraits: c.quizProfile.idealTraits,
        acceptableRanges: {},
        traitWeights: c.quizProfile.traitWeights,
        hardConstraints: c.quizProfile.hardConstraints,
        boosts: {},
        calculationVersion: 1,
      },
      create: {
        careerId,
        idealTraits: c.quizProfile.idealTraits,
        acceptableRanges: {},
        traitWeights: c.quizProfile.traitWeights,
        hardConstraints: c.quizProfile.hardConstraints,
        boosts: {},
        calculationVersion: 1,
      },
    });
  }
  console.log("Seeded per-career detail rows (aliases, skills, tags, pathways, certifications, metrics, source refs, quiz profiles).");

  // -----------------------------------------------------------------
  // 6. Careers — pass 3: relatedCareers (needs all careers to exist)
  // -----------------------------------------------------------------
  for (const c of CAREERS) {
    const careerId = careerIdBySlug.get(c.slug)!;
    const relatedIds = c.relatedCareerSlugs
      .map((slug) => careerIdBySlug.get(slug))
      .filter((id): id is string => Boolean(id));
    if (relatedIds.length === 0) continue;
    await prisma.career.update({
      where: { id: careerId },
      data: { relatedCareers: { connect: relatedIds.map((id) => ({ id })) } },
    });
  }
  console.log("Linked relatedCareers across all careers.");

  // -----------------------------------------------------------------
  // 7. Schools
  // -----------------------------------------------------------------
  const schoolIdBySlug = new Map<string, string>();
  for (const s of SCHOOLS) {
    const school = await prisma.school.upsert({
      where: { slug: s.slug },
      update: {
        name: s.name,
        type: s.type,
        region: s.region,
        provinceCity: s.provinceCity,
        description: s.description,
        accreditationNote: s.accreditationNote,
        verificationStatus: "POC_SEED",
        publicationStatus: "PUBLISHED",
      },
      create: {
        slug: s.slug,
        name: s.name,
        type: s.type,
        region: s.region,
        provinceCity: s.provinceCity,
        description: s.description,
        accreditationNote: s.accreditationNote,
        verificationStatus: "POC_SEED",
        publicationStatus: "PUBLISHED",
      },
    });
    schoolIdBySlug.set(s.slug, school.id);
  }
  console.log(`Upserted ${schoolIdBySlug.size} schools.`);

  // -----------------------------------------------------------------
  // 8. Programs + SchoolProgram + ProgramCareer links
  // -----------------------------------------------------------------
  const programIdBySlug = new Map<string, string>();
  for (const p of PROGRAMS) {
    const program = await prisma.program.upsert({
      where: { slug: p.slug },
      update: {
        name: p.name,
        credentialType: p.credentialType,
        durationLabel: p.durationLabel,
        deliveryMode: p.deliveryMode,
        admissionNotes: p.admissionNotes,
        tuitionNote: p.tuitionNote,
        verificationStatus: "POC_SEED",
        publicationStatus: "PUBLISHED",
      },
      create: {
        slug: p.slug,
        name: p.name,
        credentialType: p.credentialType,
        durationLabel: p.durationLabel,
        deliveryMode: p.deliveryMode,
        admissionNotes: p.admissionNotes,
        tuitionNote: p.tuitionNote,
        verificationStatus: "POC_SEED",
        publicationStatus: "PUBLISHED",
      },
    });
    programIdBySlug.set(p.slug, program.id);

    for (const schoolSlug of p.schoolSlugs) {
      const schoolId = schoolIdBySlug.get(schoolSlug);
      if (!schoolId) throw new Error(`Program ${p.slug}: unknown school slug ${schoolSlug}`);
      await prisma.schoolProgram.upsert({
        where: { schoolId_programId: { schoolId, programId: program.id } },
        update: { sourceId: dataSource.id },
        create: { schoolId, programId: program.id, sourceId: dataSource.id },
      });
    }

    for (const careerSlug of p.careerSlugs) {
      const careerId = careerIdBySlug.get(careerSlug);
      if (!careerId) throw new Error(`Program ${p.slug}: unknown career slug ${careerSlug}`);
      await prisma.programCareer.upsert({
        where: { programId_careerId: { programId: program.id, careerId } },
        update: {},
        create: { programId: program.id, careerId },
      });
    }
  }
  console.log(`Upserted ${programIdBySlug.size} programs with school and career links.`);

  // Sanity check: every career has at least one program link.
  const uncoveredCareers = CAREERS.filter(
    (c) => !PROGRAMS.some((p) => p.careerSlugs.includes(c.slug))
  );
  if (uncoveredCareers.length > 0) {
    throw new Error(
      `Careers with no linked program: ${uncoveredCareers.map((c) => c.slug).join(", ")}`
    );
  }

  // -----------------------------------------------------------------
  // 9. Quiz: Quiz -> QuizSection -> QuizQuestion -> QuizOption
  // -----------------------------------------------------------------
  const quiz = await prisma.quiz.upsert({
    where: { slug: "career-fit-quiz" },
    update: {
      title: "Career Fit Quiz",
      description:
        "An exploratory, ~8-12 minute quiz about your personality, skills, work style, and goals. It's designed to surface careers worth exploring, not to diagnose the single 'right' career for you.",
      version: 1,
      isActive: true,
    },
    create: {
      slug: "career-fit-quiz",
      title: "Career Fit Quiz",
      description:
        "An exploratory, ~8-12 minute quiz about your personality, skills, work style, and goals. It's designed to surface careers worth exploring, not to diagnose the single 'right' career for you.",
      version: 1,
      isActive: true,
    },
  });

  // Rebuilding questions below deletes and recreates them, which would
  // otherwise fail once real attempts exist (QuizAnswer -> QuizQuestion is a
  // required FK). Clearing this quiz's attempts first lets `db:seed` stay
  // safely re-runnable at any point; QuizAnswer/QuizResult/QuizResultCareer/
  // AiGeneration all cascade-delete from QuizAttempt per the schema.
  await prisma.quizAttempt.deleteMany({ where: { quizId: quiz.id } });

  let totalQuestions = 0;
  let totalOptions = 0;

  for (const section of QUIZ_SECTIONS) {
    const sectionRow = await prisma.quizSection.upsert({
      where: { quizId_key: { quizId: quiz.id, key: section.key } },
      update: {
        title: section.title,
        description: section.description,
        weight: section.weight,
        order: section.order,
      },
      create: {
        quizId: quiz.id,
        key: section.key,
        title: section.title,
        description: section.description,
        weight: section.weight,
        order: section.order,
      },
    });

    // Questions (and their options, via cascade) have no natural unique key
    // beyond id, so wipe and recreate deterministically per section.
    await prisma.quizQuestion.deleteMany({ where: { sectionId: sectionRow.id } });

    for (const q of section.questions) {
      const question = await prisma.quizQuestion.create({
        data: {
          sectionId: sectionRow.id,
          type: q.type,
          prompt: q.prompt,
          helpText: q.helpText,
          order: q.order,
          isRequired: q.isRequired,
        },
      });
      totalQuestions += 1;

      await prisma.quizOption.createMany({
        data: q.options.map((o) => ({
          questionId: question.id,
          label: o.label,
          value: o.value,
          order: o.order,
          traitWeights: o.constraints
            ? { traits: o.traits, constraints: o.constraints }
            : { traits: o.traits },
        })),
      });
      totalOptions += q.options.length;
    }
  }
  console.log(
    `Upserted quiz "${quiz.slug}" with ${QUIZ_SECTIONS.length} sections, ${totalQuestions} questions, ${totalOptions} options.`
  );

  // -----------------------------------------------------------------
  // 10. Ops: EOD call-log reference data (staff, payers, reason codes,
  //     payer assignments, payer-name alias/merge audit trail, open tasks)
  // -----------------------------------------------------------------
  const normalizePayerName = (name: string) => name.trim().toLowerCase();

  const payerIdByName = new Map<string, string>();
  for (const p of PAYERS) {
    const payer = await prisma.payer.upsert({
      where: { name: p.name },
      update: {
        payerGroup: p.payerGroup,
        phone: p.phone,
        altPhone: p.altPhone,
        extension: p.extension,
        ivrNotes: p.ivrNotes,
      },
      create: {
        name: p.name,
        payerGroup: p.payerGroup,
        phone: p.phone,
        altPhone: p.altPhone,
        extension: p.extension,
        ivrNotes: p.ivrNotes,
      },
    });
    payerIdByName.set(normalizePayerName(payer.name), payer.id);
  }
  console.log(`Upserted ${payerIdByName.size} payers.`);

  // Alias -> canonical map, for resolving legacy/free-text spellings that
  // appear in Payer Assignments / Task below (and in the historical import).
  const canonicalNameByAlias = new Map<string, string>();
  for (const a of PAYER_ALIASES) {
    if (a.canonicalPayer) canonicalNameByAlias.set(normalizePayerName(a.aliasText), a.canonicalPayer);
  }

  /** Resolve a possibly-legacy payer name to a Payer id, creating a new
   * canonical Payer as a last resort so a supervisor can review/merge it
   * later rather than silently dropping the row. */
  async function resolvePayerId(name: string | null | undefined, fallbackGroup?: string | null) {
    if (!name) return null;
    const key = normalizePayerName(name);
    let id = payerIdByName.get(key);
    if (id) return id;

    const canonical = canonicalNameByAlias.get(key);
    if (canonical) {
      id = payerIdByName.get(normalizePayerName(canonical));
      if (id) return id;
    }

    console.warn(`  ! No canonical payer match for "${name}" — creating it as a new payer for review.`);
    const created = await prisma.payer.upsert({
      where: { name },
      update: {},
      create: { name, payerGroup: fallbackGroup ?? "Needs review" },
    });
    payerIdByName.set(key, created.id);
    return created.id;
  }

  for (const a of PAYER_ALIASES) {
    const payerId = await resolvePayerId(a.canonicalPayer, a.payerGroup);
    if (!payerId) continue;
    await prisma.payerAlias.upsert({
      where: { aliasText: a.aliasText },
      update: { payerId, rowsAffected: a.rowsAffected, changeType: a.changeType },
      create: { payerId, aliasText: a.aliasText, rowsAffected: a.rowsAffected, changeType: a.changeType },
    });
  }
  console.log(`Upserted ${PAYER_ALIASES.length} payer aliases.`);

  let reasonOrder = 0;
  const reasonCodeIdByCode = new Map<string, string>();
  for (const r of REASON_CODES) {
    const reasonCode = await prisma.reasonCode.upsert({
      where: { code: r.code },
      update: { description: r.description, order: reasonOrder },
      create: { code: r.code, description: r.description, order: reasonOrder },
    });
    reasonCodeIdByCode.set(r.code, reasonCode.id);
    reasonOrder += 1;
  }
  console.log(`Upserted ${reasonCodeIdByCode.size} reason codes.`);

  const agentIdByInitials = new Map<string, string>();
  const agentIdByFullName = new Map<string, string>();
  for (const s of STAFF) {
    const agent = await prisma.opsAgent.upsert({
      where: { initials: s.initials },
      update: { fullName: s.fullName, active: s.active },
      create: { initials: s.initials, fullName: s.fullName, active: s.active },
    });
    agentIdByInitials.set(s.initials, agent.id);
    agentIdByFullName.set(s.fullName, agent.id);
  }
  console.log(`Upserted ${agentIdByInitials.size} ops agents.`);

  let assignmentCount = 0;
  for (const a of PAYER_ASSIGNMENTS) {
    const agentId = agentIdByFullName.get(a.agentFullName);
    if (!agentId) {
      console.warn(`  ! Payer assignment for unknown agent "${a.agentFullName}" skipped.`);
      continue;
    }
    const payerId = await resolvePayerId(a.payer, a.payerGroup);
    if (!payerId) continue;
    await prisma.payerAssignment.upsert({
      where: { agentId_payerId: { agentId, payerId } },
      update: { accountCount: a.accountCount },
      create: { agentId, payerId, accountCount: a.accountCount },
    });
    assignmentCount += 1;
  }
  console.log(`Upserted ${assignmentCount} payer assignments.`);

  const taskStatusMap: Record<string, "OPEN" | "IN_PROGRESS" | "DONE" | "CANCELLED"> = {
    Open: "OPEN",
    "In Progress": "IN_PROGRESS",
    Done: "DONE",
    Cancelled: "CANCELLED",
  };
  let taskCount = 0;
  for (const t of TASKS) {
    const existing = await prisma.followUpTask.findFirst({ where: { mattRef: t.mattRef } });
    if (existing) continue; // no natural unique key beyond mattRef; don't duplicate on re-seed
    const payerId = await resolvePayerId(t.payer, t.payerGroup);
    const assignedToId = t.assignedTo ? agentIdByFullName.get(t.assignedTo) ?? null : null;
    await prisma.followUpTask.create({
      data: {
        mattRef: t.mattRef,
        payerId,
        status: taskStatusMap[t.status] ?? "OPEN",
        assignedToId,
        notes: t.notes,
      },
    });
    taskCount += 1;
  }
  console.log(`Created ${taskCount} follow-up tasks.`);

  // -----------------------------------------------------------------
  // Summary
  // -----------------------------------------------------------------
  const [
    industryCount,
    categoryCount,
    careerCount,
    skillCount,
    schoolCount,
    programCount,
    questionCount,
    opsAgentCount,
    payerCount,
    reasonCodeCount,
  ] = await Promise.all([
    prisma.industry.count(),
    prisma.careerCategory.count(),
    prisma.career.count(),
    prisma.skill.count(),
    prisma.school.count(),
    prisma.program.count(),
    prisma.quizQuestion.count(),
    prisma.opsAgent.count(),
    prisma.payer.count(),
    prisma.reasonCode.count(),
  ]);

  console.log("\nSeed summary:");
  console.log(`  Industries:      ${industryCount}`);
  console.log(`  Categories:      ${categoryCount}`);
  console.log(`  Careers:         ${careerCount}`);
  console.log(`  Skills:          ${skillCount}`);
  console.log(`  Schools:         ${schoolCount}`);
  console.log(`  Programs:        ${programCount}`);
  console.log(`  Quiz questions:  ${questionCount}`);
  console.log(`  Ops agents:      ${opsAgentCount}`);
  console.log(`  Payers:          ${payerCount}`);
  console.log(`  Reason codes:    ${reasonCodeCount}`);
  console.log("\nSeed complete.");
}

main()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
