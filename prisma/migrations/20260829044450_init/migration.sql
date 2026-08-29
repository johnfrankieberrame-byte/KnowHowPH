-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "PublicationStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('POC_SEED', 'UNVERIFIED', 'VERIFIED', 'NEEDS_REVIEW', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "SourceType" AS ENUM ('GOVERNMENT', 'SCHOOL', 'EMPLOYER', 'JOB_PLATFORM', 'PROFESSIONAL_BODY', 'RESEARCH', 'INTERNAL_POC', 'OTHER');

-- CreateEnum
CREATE TYPE "EducationLevel" AS ENUM ('HIGH_SCHOOL', 'TESDA_CERTIFICATE', 'ASSOCIATE_OR_DIPLOMA', 'BACHELORS', 'POSTGRADUATE', 'LICENSE_REQUIRED', 'VARIES');

-- CreateEnum
CREATE TYPE "PathwayType" AS ENUM ('DEGREE', 'TESDA', 'CERTIFICATION', 'BOOTCAMP', 'SELF_STUDY', 'APPRENTICESHIP', 'PORTFOLIO', 'LICENSURE');

-- CreateEnum
CREATE TYPE "RatingLevel" AS ENUM ('VERY_LOW', 'LOW', 'MODERATE', 'HIGH', 'VERY_HIGH');

-- CreateEnum
CREATE TYPE "EntryDifficulty" AS ENUM ('EASY', 'MODERATE', 'HARD', 'VERY_HARD');

-- CreateEnum
CREATE TYPE "SalaryDataStatus" AS ENUM ('POC_ESTIMATE', 'VERIFIED', 'NEEDS_REVIEW');

-- CreateEnum
CREATE TYPE "MetricType" AS ENUM ('SALARY', 'DEMAND', 'SATURATION', 'REMOTE_VIABILITY', 'FREELANCE_VIABILITY');

-- CreateEnum
CREATE TYPE "SkillCategory" AS ENUM ('TECHNICAL', 'HUMAN');

-- CreateEnum
CREATE TYPE "SkillLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');

-- CreateEnum
CREATE TYPE "SchoolType" AS ENUM ('PUBLIC', 'PRIVATE', 'STATE_UNIVERSITY_COLLEGE', 'TRAINING_PROVIDER', 'ONLINE_PROVIDER');

-- CreateEnum
CREATE TYPE "CredentialType" AS ENUM ('DEGREE', 'DIPLOMA', 'CERTIFICATE', 'TESDA_ALIGNED', 'BOOTCAMP', 'SHORT_COURSE');

-- CreateEnum
CREATE TYPE "DeliveryMode" AS ENUM ('IN_PERSON', 'ONLINE', 'HYBRID');

-- CreateEnum
CREATE TYPE "QuizSectionKey" AS ENUM ('PERSONALITY_MOTIVATION', 'SKILLS_STRENGTHS', 'WORK_STYLE_FLEXIBILITY', 'SALARY_GOALS', 'EDUCATION_READINESS', 'RISK_AMBITION');

-- CreateEnum
CREATE TYPE "QuizQuestionType" AS ENUM ('LIKERT_5', 'SINGLE_SELECT', 'MULTI_SELECT', 'SKILL_RATING', 'SCENARIO');

-- CreateEnum
CREATE TYPE "QuizAttemptStatus" AS ENUM ('IN_PROGRESS', 'SUBMITTED', 'ABANDONED');

-- CreateEnum
CREATE TYPE "AiGenerationStatus" AS ENUM ('PENDING', 'SUCCEEDED', 'FAILED', 'BLOCKED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "displayName" TEXT,
    "avatarUrl" TEXT,
    "region" TEXT,
    "provinceCity" TEXT,
    "educationLevel" "EducationLevel",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Industry" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "publicationStatus" "PublicationStatus" NOT NULL DEFAULT 'PUBLISHED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Industry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CareerCategory" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "industryId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "publicationStatus" "PublicationStatus" NOT NULL DEFAULT 'PUBLISHED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CareerCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Career" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "shortDescription" TEXT NOT NULL,
    "longDescription" TEXT NOT NULL,
    "primaryIndustryId" TEXT NOT NULL,
    "primaryCategoryId" TEXT NOT NULL,
    "responsibilities" TEXT[],
    "goodFitIf" TEXT[],
    "challengingIf" TEXT[],
    "workEnvironment" TEXT NOT NULL,
    "workStyleSummary" TEXT,
    "educationLevel" "EducationLevel" NOT NULL,
    "entryDifficulty" "EntryDifficulty" NOT NULL,
    "timeToEntryMinMonths" INTEGER NOT NULL,
    "timeToEntryMaxMonths" INTEGER NOT NULL,
    "remoteViability" "RatingLevel" NOT NULL,
    "freelanceViability" "RatingLevel" NOT NULL,
    "entryLevelTitle" TEXT,
    "midLevelTitle" TEXT,
    "seniorLevelTitle" TEXT,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "publicationStatus" "PublicationStatus" NOT NULL DEFAULT 'DRAFT',
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'POC_SEED',
    "lastReviewedAt" TIMESTAMP(3),
    "nextReviewDueAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Career_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CareerAlias" (
    "id" TEXT NOT NULL,
    "careerId" TEXT NOT NULL,
    "alias" TEXT NOT NULL,

    CONSTRAINT "CareerAlias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Skill" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "SkillCategory" NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Skill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CareerSkill" (
    "id" TEXT NOT NULL,
    "careerId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "proficiency" "SkillLevel" NOT NULL DEFAULT 'BEGINNER',
    "isCore" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "CareerSkill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkStyleTag" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "WorkStyleTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CareerWorkStyleTag" (
    "id" TEXT NOT NULL,
    "careerId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "CareerWorkStyleTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CareerPathway" (
    "id" TEXT NOT NULL,
    "careerId" TEXT NOT NULL,
    "type" "PathwayType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "typicalDurationMonths" INTEGER,
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CareerPathway_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Certification" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "issuingBody" TEXT NOT NULL,
    "description" TEXT,
    "isLicensure" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Certification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CareerCertification" (
    "id" TEXT NOT NULL,
    "careerId" TEXT NOT NULL,
    "certificationId" TEXT NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,

    CONSTRAINT "CareerCertification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DataSource" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "publisher" TEXT NOT NULL,
    "url" TEXT,
    "sourceType" "SourceType" NOT NULL,
    "sourceDate" TIMESTAMP(3),
    "retrievedDate" TIMESTAMP(3),
    "methodologySummary" TEXT,
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'UNVERIFIED',
    "notes" TEXT,
    "archivedUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DataSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CareerMetric" (
    "id" TEXT NOT NULL,
    "careerId" TEXT NOT NULL,
    "metricType" "MetricType" NOT NULL,
    "salaryMin" INTEGER,
    "salaryMax" INTEGER,
    "currency" TEXT NOT NULL DEFAULT 'PHP',
    "rating" "RatingLevel",
    "geography" TEXT NOT NULL DEFAULT 'Philippines',
    "experienceLevel" TEXT,
    "periodLabel" TEXT,
    "methodologyNote" TEXT,
    "status" "SalaryDataStatus" NOT NULL DEFAULT 'POC_ESTIMATE',
    "effectiveDate" TIMESTAMP(3),
    "sourceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CareerMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CareerSourceReference" (
    "id" TEXT NOT NULL,
    "careerId" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "fieldContext" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CareerSourceReference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "School" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "SchoolType" NOT NULL,
    "region" TEXT NOT NULL,
    "provinceCity" TEXT NOT NULL,
    "website" TEXT,
    "description" TEXT NOT NULL,
    "accreditationNote" TEXT,
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'POC_SEED',
    "publicationStatus" "PublicationStatus" NOT NULL DEFAULT 'PUBLISHED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "School_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Program" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "credentialType" "CredentialType" NOT NULL,
    "durationLabel" TEXT NOT NULL,
    "deliveryMode" "DeliveryMode" NOT NULL,
    "admissionNotes" TEXT,
    "tuitionNote" TEXT,
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'POC_SEED',
    "publicationStatus" "PublicationStatus" NOT NULL DEFAULT 'PUBLISHED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Program_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SchoolProgram" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "tuitionNoteOverride" TEXT,
    "notes" TEXT,
    "sourceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SchoolProgram_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgramCareer" (
    "id" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "careerId" TEXT NOT NULL,
    "relevanceNote" TEXT,

    CONSTRAINT "ProgramCareer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavedCareer" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "careerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavedCareer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quiz" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Quiz_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuizSection" (
    "id" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "key" "QuizSectionKey" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "QuizSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuizQuestion" (
    "id" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "type" "QuizQuestionType" NOT NULL,
    "prompt" TEXT NOT NULL,
    "helpText" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "QuizQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuizOption" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "traitWeights" JSONB NOT NULL,

    CONSTRAINT "QuizOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CareerQuizProfile" (
    "id" TEXT NOT NULL,
    "careerId" TEXT NOT NULL,
    "idealTraits" JSONB NOT NULL,
    "acceptableRanges" JSONB NOT NULL,
    "traitWeights" JSONB NOT NULL,
    "hardConstraints" JSONB,
    "boosts" JSONB,
    "calculationVersion" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CareerQuizProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuizAttempt" (
    "id" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "userId" TEXT,
    "anonymousId" TEXT,
    "status" "QuizAttemptStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "currentStep" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submittedAt" TIMESTAMP(3),

    CONSTRAINT "QuizAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuizAnswer" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "valueJson" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuizAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuizResult" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "resultToken" TEXT NOT NULL,
    "userId" TEXT,
    "traitScores" JSONB NOT NULL,
    "sectionScores" JSONB NOT NULL,
    "calculationVersion" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "QuizResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuizResultCareer" (
    "id" TEXT NOT NULL,
    "quizResultId" TEXT NOT NULL,
    "careerId" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,
    "rawScore" DOUBLE PRECISION NOT NULL,
    "adjustedScore" DOUBLE PRECISION NOT NULL,
    "scoreBreakdown" JSONB NOT NULL,
    "matchReasons" TEXT[],
    "tradeOffs" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuizResultCareer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiGeneration" (
    "id" TEXT NOT NULL,
    "quizResultId" TEXT NOT NULL,
    "status" "AiGenerationStatus" NOT NULL DEFAULT 'PENDING',
    "model" TEXT,
    "promptVersion" TEXT,
    "requestPayloadSummary" JSONB,
    "responseJson" JSONB,
    "errorMessage" TEXT,
    "latencyMs" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiGeneration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminAuditLog" (
    "id" TEXT NOT NULL,
    "actorUserId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "changesJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CareerSecondaryCategories" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_CareerRelated" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Industry_slug_key" ON "Industry"("slug");

-- CreateIndex
CREATE INDEX "Industry_publicationStatus_idx" ON "Industry"("publicationStatus");

-- CreateIndex
CREATE UNIQUE INDEX "CareerCategory_slug_key" ON "CareerCategory"("slug");

-- CreateIndex
CREATE INDEX "CareerCategory_industryId_idx" ON "CareerCategory"("industryId");

-- CreateIndex
CREATE INDEX "CareerCategory_publicationStatus_idx" ON "CareerCategory"("publicationStatus");

-- CreateIndex
CREATE UNIQUE INDEX "Career_slug_key" ON "Career"("slug");

-- CreateIndex
CREATE INDEX "Career_primaryIndustryId_idx" ON "Career"("primaryIndustryId");

-- CreateIndex
CREATE INDEX "Career_primaryCategoryId_idx" ON "Career"("primaryCategoryId");

-- CreateIndex
CREATE INDEX "Career_publicationStatus_idx" ON "Career"("publicationStatus");

-- CreateIndex
CREATE INDEX "Career_verificationStatus_idx" ON "Career"("verificationStatus");

-- CreateIndex
CREATE INDEX "Career_educationLevel_idx" ON "Career"("educationLevel");

-- CreateIndex
CREATE INDEX "Career_entryDifficulty_idx" ON "Career"("entryDifficulty");

-- CreateIndex
CREATE INDEX "Career_remoteViability_idx" ON "Career"("remoteViability");

-- CreateIndex
CREATE INDEX "Career_freelanceViability_idx" ON "Career"("freelanceViability");

-- CreateIndex
CREATE INDEX "CareerAlias_alias_idx" ON "CareerAlias"("alias");

-- CreateIndex
CREATE UNIQUE INDEX "CareerAlias_careerId_alias_key" ON "CareerAlias"("careerId", "alias");

-- CreateIndex
CREATE UNIQUE INDEX "Skill_slug_key" ON "Skill"("slug");

-- CreateIndex
CREATE INDEX "Skill_category_idx" ON "Skill"("category");

-- CreateIndex
CREATE INDEX "CareerSkill_skillId_idx" ON "CareerSkill"("skillId");

-- CreateIndex
CREATE UNIQUE INDEX "CareerSkill_careerId_skillId_key" ON "CareerSkill"("careerId", "skillId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkStyleTag_slug_key" ON "WorkStyleTag"("slug");

-- CreateIndex
CREATE INDEX "CareerWorkStyleTag_tagId_idx" ON "CareerWorkStyleTag"("tagId");

-- CreateIndex
CREATE UNIQUE INDEX "CareerWorkStyleTag_careerId_tagId_key" ON "CareerWorkStyleTag"("careerId", "tagId");

-- CreateIndex
CREATE INDEX "CareerPathway_careerId_idx" ON "CareerPathway"("careerId");

-- CreateIndex
CREATE UNIQUE INDEX "Certification_slug_key" ON "Certification"("slug");

-- CreateIndex
CREATE INDEX "CareerCertification_certificationId_idx" ON "CareerCertification"("certificationId");

-- CreateIndex
CREATE UNIQUE INDEX "CareerCertification_careerId_certificationId_key" ON "CareerCertification"("careerId", "certificationId");

-- CreateIndex
CREATE INDEX "DataSource_sourceType_idx" ON "DataSource"("sourceType");

-- CreateIndex
CREATE INDEX "DataSource_verificationStatus_idx" ON "DataSource"("verificationStatus");

-- CreateIndex
CREATE INDEX "CareerMetric_careerId_metricType_idx" ON "CareerMetric"("careerId", "metricType");

-- CreateIndex
CREATE INDEX "CareerMetric_sourceId_idx" ON "CareerMetric"("sourceId");

-- CreateIndex
CREATE INDEX "CareerSourceReference_careerId_idx" ON "CareerSourceReference"("careerId");

-- CreateIndex
CREATE INDEX "CareerSourceReference_sourceId_idx" ON "CareerSourceReference"("sourceId");

-- CreateIndex
CREATE UNIQUE INDEX "School_slug_key" ON "School"("slug");

-- CreateIndex
CREATE INDEX "School_region_idx" ON "School"("region");

-- CreateIndex
CREATE INDEX "School_type_idx" ON "School"("type");

-- CreateIndex
CREATE INDEX "School_verificationStatus_idx" ON "School"("verificationStatus");

-- CreateIndex
CREATE UNIQUE INDEX "Program_slug_key" ON "Program"("slug");

-- CreateIndex
CREATE INDEX "Program_credentialType_idx" ON "Program"("credentialType");

-- CreateIndex
CREATE INDEX "Program_deliveryMode_idx" ON "Program"("deliveryMode");

-- CreateIndex
CREATE INDEX "Program_verificationStatus_idx" ON "Program"("verificationStatus");

-- CreateIndex
CREATE INDEX "SchoolProgram_programId_idx" ON "SchoolProgram"("programId");

-- CreateIndex
CREATE UNIQUE INDEX "SchoolProgram_schoolId_programId_key" ON "SchoolProgram"("schoolId", "programId");

-- CreateIndex
CREATE INDEX "ProgramCareer_careerId_idx" ON "ProgramCareer"("careerId");

-- CreateIndex
CREATE UNIQUE INDEX "ProgramCareer_programId_careerId_key" ON "ProgramCareer"("programId", "careerId");

-- CreateIndex
CREATE INDEX "SavedCareer_careerId_idx" ON "SavedCareer"("careerId");

-- CreateIndex
CREATE UNIQUE INDEX "SavedCareer_userId_careerId_key" ON "SavedCareer"("userId", "careerId");

-- CreateIndex
CREATE UNIQUE INDEX "Quiz_slug_key" ON "Quiz"("slug");

-- CreateIndex
CREATE INDEX "Quiz_isActive_idx" ON "Quiz"("isActive");

-- CreateIndex
CREATE INDEX "QuizSection_quizId_idx" ON "QuizSection"("quizId");

-- CreateIndex
CREATE UNIQUE INDEX "QuizSection_quizId_key_key" ON "QuizSection"("quizId", "key");

-- CreateIndex
CREATE INDEX "QuizQuestion_sectionId_idx" ON "QuizQuestion"("sectionId");

-- CreateIndex
CREATE INDEX "QuizOption_questionId_idx" ON "QuizOption"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "CareerQuizProfile_careerId_key" ON "CareerQuizProfile"("careerId");

-- CreateIndex
CREATE INDEX "QuizAttempt_userId_idx" ON "QuizAttempt"("userId");

-- CreateIndex
CREATE INDEX "QuizAttempt_anonymousId_idx" ON "QuizAttempt"("anonymousId");

-- CreateIndex
CREATE INDEX "QuizAttempt_status_idx" ON "QuizAttempt"("status");

-- CreateIndex
CREATE INDEX "QuizAnswer_questionId_idx" ON "QuizAnswer"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "QuizAnswer_attemptId_questionId_key" ON "QuizAnswer"("attemptId", "questionId");

-- CreateIndex
CREATE UNIQUE INDEX "QuizResult_attemptId_key" ON "QuizResult"("attemptId");

-- CreateIndex
CREATE UNIQUE INDEX "QuizResult_resultToken_key" ON "QuizResult"("resultToken");

-- CreateIndex
CREATE INDEX "QuizResult_userId_idx" ON "QuizResult"("userId");

-- CreateIndex
CREATE INDEX "QuizResult_resultToken_idx" ON "QuizResult"("resultToken");

-- CreateIndex
CREATE INDEX "QuizResultCareer_careerId_idx" ON "QuizResultCareer"("careerId");

-- CreateIndex
CREATE UNIQUE INDEX "QuizResultCareer_quizResultId_careerId_key" ON "QuizResultCareer"("quizResultId", "careerId");

-- CreateIndex
CREATE INDEX "AiGeneration_quizResultId_idx" ON "AiGeneration"("quizResultId");

-- CreateIndex
CREATE INDEX "AiGeneration_status_idx" ON "AiGeneration"("status");

-- CreateIndex
CREATE INDEX "AdminAuditLog_actorUserId_idx" ON "AdminAuditLog"("actorUserId");

-- CreateIndex
CREATE INDEX "AdminAuditLog_entityType_entityId_idx" ON "AdminAuditLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "AdminAuditLog_createdAt_idx" ON "AdminAuditLog"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "_CareerSecondaryCategories_AB_unique" ON "_CareerSecondaryCategories"("A", "B");

-- CreateIndex
CREATE INDEX "_CareerSecondaryCategories_B_index" ON "_CareerSecondaryCategories"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_CareerRelated_AB_unique" ON "_CareerRelated"("A", "B");

-- CreateIndex
CREATE INDEX "_CareerRelated_B_index" ON "_CareerRelated"("B");

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CareerCategory" ADD CONSTRAINT "CareerCategory_industryId_fkey" FOREIGN KEY ("industryId") REFERENCES "Industry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Career" ADD CONSTRAINT "Career_primaryIndustryId_fkey" FOREIGN KEY ("primaryIndustryId") REFERENCES "Industry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Career" ADD CONSTRAINT "Career_primaryCategoryId_fkey" FOREIGN KEY ("primaryCategoryId") REFERENCES "CareerCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CareerAlias" ADD CONSTRAINT "CareerAlias_careerId_fkey" FOREIGN KEY ("careerId") REFERENCES "Career"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CareerSkill" ADD CONSTRAINT "CareerSkill_careerId_fkey" FOREIGN KEY ("careerId") REFERENCES "Career"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CareerSkill" ADD CONSTRAINT "CareerSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CareerWorkStyleTag" ADD CONSTRAINT "CareerWorkStyleTag_careerId_fkey" FOREIGN KEY ("careerId") REFERENCES "Career"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CareerWorkStyleTag" ADD CONSTRAINT "CareerWorkStyleTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "WorkStyleTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CareerPathway" ADD CONSTRAINT "CareerPathway_careerId_fkey" FOREIGN KEY ("careerId") REFERENCES "Career"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CareerCertification" ADD CONSTRAINT "CareerCertification_careerId_fkey" FOREIGN KEY ("careerId") REFERENCES "Career"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CareerCertification" ADD CONSTRAINT "CareerCertification_certificationId_fkey" FOREIGN KEY ("certificationId") REFERENCES "Certification"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CareerMetric" ADD CONSTRAINT "CareerMetric_careerId_fkey" FOREIGN KEY ("careerId") REFERENCES "Career"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CareerMetric" ADD CONSTRAINT "CareerMetric_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "DataSource"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CareerSourceReference" ADD CONSTRAINT "CareerSourceReference_careerId_fkey" FOREIGN KEY ("careerId") REFERENCES "Career"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CareerSourceReference" ADD CONSTRAINT "CareerSourceReference_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "DataSource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchoolProgram" ADD CONSTRAINT "SchoolProgram_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchoolProgram" ADD CONSTRAINT "SchoolProgram_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchoolProgram" ADD CONSTRAINT "SchoolProgram_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "DataSource"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramCareer" ADD CONSTRAINT "ProgramCareer_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramCareer" ADD CONSTRAINT "ProgramCareer_careerId_fkey" FOREIGN KEY ("careerId") REFERENCES "Career"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedCareer" ADD CONSTRAINT "SavedCareer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedCareer" ADD CONSTRAINT "SavedCareer_careerId_fkey" FOREIGN KEY ("careerId") REFERENCES "Career"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizSection" ADD CONSTRAINT "QuizSection_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizQuestion" ADD CONSTRAINT "QuizQuestion_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "QuizSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizOption" ADD CONSTRAINT "QuizOption_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "QuizQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CareerQuizProfile" ADD CONSTRAINT "CareerQuizProfile_careerId_fkey" FOREIGN KEY ("careerId") REFERENCES "Career"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizAttempt" ADD CONSTRAINT "QuizAttempt_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizAttempt" ADD CONSTRAINT "QuizAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizAnswer" ADD CONSTRAINT "QuizAnswer_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "QuizAttempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizAnswer" ADD CONSTRAINT "QuizAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "QuizQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizResult" ADD CONSTRAINT "QuizResult_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "QuizAttempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizResult" ADD CONSTRAINT "QuizResult_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizResultCareer" ADD CONSTRAINT "QuizResultCareer_quizResultId_fkey" FOREIGN KEY ("quizResultId") REFERENCES "QuizResult"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizResultCareer" ADD CONSTRAINT "QuizResultCareer_careerId_fkey" FOREIGN KEY ("careerId") REFERENCES "Career"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiGeneration" ADD CONSTRAINT "AiGeneration_quizResultId_fkey" FOREIGN KEY ("quizResultId") REFERENCES "QuizResult"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminAuditLog" ADD CONSTRAINT "AdminAuditLog_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CareerSecondaryCategories" ADD CONSTRAINT "_CareerSecondaryCategories_A_fkey" FOREIGN KEY ("A") REFERENCES "Career"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CareerSecondaryCategories" ADD CONSTRAINT "_CareerSecondaryCategories_B_fkey" FOREIGN KEY ("B") REFERENCES "CareerCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CareerRelated" ADD CONSTRAINT "_CareerRelated_A_fkey" FOREIGN KEY ("A") REFERENCES "Career"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CareerRelated" ADD CONSTRAINT "_CareerRelated_B_fkey" FOREIGN KEY ("B") REFERENCES "Career"("id") ON DELETE CASCADE ON UPDATE CASCADE;
