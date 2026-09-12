import type { QuizQuestion } from "../types";

export const quizQuestions: QuizQuestion[] = [
  // 1. Personality & Motivation — 30%
  { id: "q1", section: "Personality & Motivation", sectionWeight: 30, text: "I enjoy solving problems using logic and data.", type: "likert" },
  { id: "q2", section: "Personality & Motivation", sectionWeight: 30, text: "I thrive in roles where I interact with people daily.", type: "likert" },
  { id: "q3", section: "Personality & Motivation", sectionWeight: 30, text: "I enjoy being creative and generating new ideas.", type: "likert" },
  { id: "q4", section: "Personality & Motivation", sectionWeight: 30, text: "I like structured, rules-based work.", type: "likert" },

  // 2. Work Style & Remote Preference — 15%
  { id: "q5", section: "Work Style & Remote Preference", sectionWeight: 15, text: "I prefer flexible hours over strict 9-5.", type: "likert" },
  { id: "q6", section: "Work Style & Remote Preference", sectionWeight: 15, text: "I enjoy working remotely from home.", type: "likert" },
  { id: "q7", section: "Work Style & Remote Preference", sectionWeight: 15, text: "I like team collaboration more than independent work.", type: "likert" },
  { id: "q8", section: "Work Style & Remote Preference", sectionWeight: 15, text: "I am comfortable with high-pressure, fast-paced environments.", type: "likert" },

  // 3. Skills Assessment — 25%
  { id: "q9", section: "Skills Assessment", sectionWeight: 25, text: "Rate your proficiency in technology & software tools (Excel, SQL, programming).", type: "rating" },
  { id: "q10", section: "Skills Assessment", sectionWeight: 25, text: "Rate your communication skills.", type: "rating" },
  { id: "q11", section: "Skills Assessment", sectionWeight: 25, text: "Rate your creative skills (design, writing, content creation).", type: "rating" },
  { id: "q12", section: "Skills Assessment", sectionWeight: 25, text: "Rate your leadership / project management skills.", type: "rating" },

  // 4. Income & Career Goals — 10%
  { id: "q13", section: "Income & Career Goals", sectionWeight: 10, text: "My ideal starting salary range is...", type: "choice", choices: ["< PHP 20k", "PHP 20k-40k", "PHP 40k-60k", "PHP 60k+"] },
  { id: "q14", section: "Income & Career Goals", sectionWeight: 10, text: "I prioritize salary over work-life balance.", type: "likert" },

  // 5. Education Readiness — 10%
  { id: "q15", section: "Education Readiness", sectionWeight: 10, text: "I am willing to pursue a relevant college degree or technical certification.", type: "likert" },
  { id: "q16", section: "Education Readiness", sectionWeight: 10, text: "I prefer learning through online courses or TESDA certifications.", type: "likert" },

  // 6. Risk & Ambition — 10%
  { id: "q17", section: "Risk & Ambition", sectionWeight: 10, text: "I am willing to switch careers for higher pay or growth.", type: "likert" },
  { id: "q18", section: "Risk & Ambition", sectionWeight: 10, text: "I am interested in entrepreneurship or freelancing.", type: "likert" },
];
