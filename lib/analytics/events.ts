/** Canonical analytics event names + payload shapes. Never include PII or raw quiz answers. */
export type AnalyticsEvent =
  | { name: "homepage_cta_clicked"; props: { cta: "explore_careers" | "take_quiz" | "search" } }
  | { name: "career_search_performed"; props: { query: string; resultCount: number } }
  | { name: "career_filter_applied"; props: { filterKey: string; filterValue: string } }
  | { name: "career_viewed"; props: { careerSlug: string; industrySlug: string } }
  | { name: "career_saved"; props: { careerSlug: string } }
  | { name: "career_comparison_started"; props: { careerSlugs: string[] } }
  | { name: "quiz_started"; props: { quizSlug: string } }
  | { name: "quiz_section_completed"; props: { sectionKey: string } }
  | { name: "quiz_completed"; props: { quizSlug: string; durationSeconds: number } }
  | { name: "quiz_result_viewed"; props: { resultToken: string } }
  | { name: "ai_insight_requested"; props: { resultToken: string } }
  | { name: "school_program_viewed"; props: { slug: string; kind: "school" | "program" } };
