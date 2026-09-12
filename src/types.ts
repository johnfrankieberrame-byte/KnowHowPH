export type RemoteRating = "Fully Remote Friendly" | "Hybrid" | "On-site";
export type MarketSaturation = "Undersupplied" | "Balanced" | "Oversupplied";

export interface Job {
  id: number;
  title: string;
  category: string;
  description: string;
  tasks: string[];
  skills: string[];
  tools: string[];
  pathway: string[];
  min_salary: number;
  avg_salary: number;
  max_salary: number;
  market_saturation: MarketSaturation;
  growth_outlook: string;
  remote_rating: RemoteRating;
}

export const CATEGORIES = [
  "All",
  "Technology",
  "Outsourcing",
  "Healthcare",
  "Engineering",
  "Finance",
  "Marketing",
  "Education",
  "Government",
  "Creative",
  "Trades",
  "Entrepreneurship",
] as const;

export type Category = (typeof CATEGORIES)[number];

export type LikertValue = 1 | 2 | 3 | 4 | 5;

export interface QuizQuestion {
  id: string;
  section: string;
  sectionWeight: number;
  text: string;
  type: "likert" | "rating" | "choice";
  choices?: string[];
}

export interface QuizAnswers {
  [questionId: string]: LikertValue | number | string;
}

export interface CareerMatch {
  career: string;
  compatibility: number;
  reason: string;
  salaryRange: string;
  demand: string;
  remotePotential: string;
  pathway: string;
}

export interface QuizResult {
  matches: CareerMatch[];
  summary: string;
  educationRecommendation: string;
  skillTips: string[];
  marketInsights: string;
}
