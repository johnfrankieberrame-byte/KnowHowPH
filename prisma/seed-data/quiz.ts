// Quiz content for the KnowHow PH POC seed: sections, questions, and options.
// QuizOption.traitWeights must match the QuizOptionValue shape from
// lib/quiz/scoring.ts: { traits: Partial<Record<TraitKey, number>>, constraints?: ConstraintKey[] }

import type { QuizQuestionType, QuizSectionKey } from "@prisma/client";

export interface QuizOptionDef {
  label: string;
  value: string;
  order: number;
  traits: Record<string, number>;
  constraints?: string[];
}

export interface QuizQuestionDef {
  type: QuizQuestionType;
  prompt: string;
  helpText?: string;
  order: number;
  isRequired: boolean;
  options: QuizOptionDef[];
}

export interface QuizSectionDef {
  key: QuizSectionKey;
  title: string;
  description: string;
  weight: number;
  order: number;
  questions: QuizQuestionDef[];
}

function likert(
  order: number,
  prompt: string,
  trait: string,
  scale: [number, number, number, number, number],
  helpText?: string
): QuizQuestionDef {
  const labels = ["Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"];
  return {
    type: "LIKERT_5",
    prompt,
    helpText,
    order,
    isRequired: true,
    options: labels.map((label, i) => ({
      label,
      value: String(i + 1),
      order: i + 1,
      traits: { [trait]: scale[i] },
    })),
  };
}

export const QUIZ_SECTIONS: QuizSectionDef[] = [
  // ---------------------------------------------------------------------
  {
    key: "PERSONALITY_MOTIVATION",
    title: "Personality & motivation",
    description: "How you naturally think, work with others, and approach problems.",
    weight: 0.3,
    order: 1,
    questions: [
      likert(1, "I enjoy breaking down complex problems into logical steps.", "analytical", [10, 30, 50, 70, 90]),
      likert(2, "I like coming up with new ideas or creative solutions rather than following a fixed process.", "creative", [10, 30, 50, 70, 90]),
      likert(3, "I feel energized after a day of talking with lots of different people.", "people_oriented", [10, 30, 50, 70, 90]),
      likert(4, "I prefer clear rules and defined procedures over figuring things out as I go.", "structured", [10, 30, 50, 70, 90]),
      {
        type: "SINGLE_SELECT",
        prompt: "Which best describes how you like to work day-to-day?",
        order: 5,
        isRequired: true,
        options: [
          { label: "Mostly on my own, with minimal check-ins", value: "solo", order: 1, traits: { independent: 85, collaborative: 20 } },
          { label: "A mix, but leaning independent", value: "lean_solo", order: 2, traits: { independent: 65, collaborative: 40 } },
          { label: "A balanced mix of both", value: "balanced", order: 3, traits: { independent: 50, collaborative: 50 } },
          { label: "A mix, but leaning team-based", value: "lean_team", order: 4, traits: { independent: 35, collaborative: 65 } },
          { label: "Constantly working closely with a team", value: "team", order: 5, traits: { independent: 15, collaborative: 85 } },
        ],
      },
      {
        type: "SCENARIO",
        prompt: "Your team is falling behind on a group project deadline. What's your instinct?",
        helpText: "Pick the response that feels most natural to you, not the 'correct' one.",
        order: 6,
        isRequired: true,
        options: [
          { label: "Step up, assign tasks, and drive the plan forward", value: "lead", order: 1, traits: { leadership: 85, independent: 40 } },
          { label: "Get everyone talking to sort out the blockers together", value: "communicate", order: 2, traits: { communication: 80, collaborative: 70 } },
          { label: "Focus on my own part and trust others to handle theirs", value: "focus_own", order: 3, traits: { independent: 70, collaborative: 20 } },
          { label: "Wait for a manager or team lead to direct the response", value: "wait", order: 4, traits: { structured: 60, leadership: 15 } },
        ],
      },
      {
        type: "MULTI_SELECT",
        prompt: "Which of these describe you? Select all that apply.",
        order: 7,
        isRequired: true,
        options: [
          { label: "I naturally take charge in group settings", value: "takes_charge", order: 1, traits: { leadership: 80 } },
          { label: "I explain complex things in ways others easily understand", value: "explains_well", order: 2, traits: { communication: 80 } },
          { label: "I like generating lots of new ideas", value: "idea_generator", order: 3, traits: { creative: 75 } },
          { label: "I prefer to double-check facts and think before acting", value: "double_check", order: 4, traits: { analytical: 65, structured: 55 } },
          { label: "I'd rather work through a problem alone than in a group brainstorm", value: "solo_thinker", order: 5, traits: { independent: 70 } },
          { label: "I enjoy coordinating with teammates throughout the day", value: "coordinator", order: 6, traits: { collaborative: 75, people_oriented: 60 } },
        ],
      },
    ],
  },

  // ---------------------------------------------------------------------
  {
    key: "SKILLS_STRENGTHS",
    title: "Skills & strengths",
    description: "The kinds of tasks and tools you're naturally strong at or drawn to.",
    weight: 0.25,
    order: 2,
    questions: [
      likert(1, "I'd rather build, fix, or work with physical things than sit at a desk all day.", "hands_on", [10, 30, 50, 70, 90]),
      likert(2, "I catch small errors or inconsistencies that others often miss.", "detail_oriented", [10, 30, 50, 70, 90]),
      likert(3, "I'm comfortable learning new software, apps, or digital tools quickly.", "digital_fluency", [10, 30, 50, 70, 90]),
      likert(4, "I enjoy working with numbers, spreadsheets, or data to find patterns.", "quantitative", [10, 30, 50, 70, 90]),
      {
        type: "SKILL_RATING",
        prompt: "How would you rate your comfort with hands-on or technical tasks (repairs, tools, equipment)?",
        order: 5,
        isRequired: true,
        options: [
          { label: "Not confident at all", value: "1", order: 1, traits: { hands_on: 15 } },
          { label: "A little", value: "2", order: 2, traits: { hands_on: 35 } },
          { label: "Somewhat confident", value: "3", order: 3, traits: { hands_on: 55 } },
          { label: "Confident", value: "4", order: 4, traits: { hands_on: 75 } },
          { label: "Very confident, I do this often", value: "5", order: 5, traits: { hands_on: 90 } },
        ],
      },
      {
        type: "SCENARIO",
        prompt: "You're handed a messy spreadsheet of raw data and asked to find the story in it. What's your reaction?",
        order: 6,
        isRequired: true,
        options: [
          { label: "Excited — I love digging into data to find patterns", value: "excited", order: 1, traits: { quantitative: 85, analytical: 70, detail_oriented: 60 } },
          { label: "Fine, as long as there's a clear template to follow", value: "fine_with_template", order: 2, traits: { quantitative: 55, structured: 60 } },
          { label: "I'd try, but I'd need to learn the tools first", value: "need_to_learn", order: 3, traits: { quantitative: 40, digital_fluency: 45 } },
          { label: "I'd rather hand this off to someone who enjoys data work", value: "delegate", order: 4, traits: { quantitative: 20, digital_fluency: 30 } },
        ],
      },
    ],
  },

  // ---------------------------------------------------------------------
  {
    key: "WORK_STYLE_FLEXIBILITY",
    title: "Work style & flexibility",
    description: "How and where you want to work, and how much routine vs. flexibility you prefer.",
    weight: 0.15,
    order: 3,
    questions: [
      likert(1, "I prefer a flexible schedule where I can set my own hours over a fixed 9-to-5.", "flexibility_preference", [10, 30, 50, 70, 90]),
      likert(2, "I'd rather have a stable, predictable routine than one that changes a lot.", "stability_preference", [10, 30, 50, 70, 90]),
      {
        type: "SINGLE_SELECT",
        prompt: "Which best describes your ideal work location?",
        helpText: "Be honest — this helps us rule out careers that wouldn't fit your setup.",
        order: 3,
        isRequired: true,
        options: [
          { label: "I only want fully remote work — no commuting, ever", value: "remote_only", order: 1, traits: { remote_preference: 95, flexibility_preference: 70 }, constraints: ["remote_only"] },
          { label: "Mostly remote, but open to occasional office or site visits", value: "mostly_remote", order: 2, traits: { remote_preference: 75 } },
          { label: "A hybrid mix of home and office/site work", value: "hybrid", order: 3, traits: { remote_preference: 50 } },
          { label: "Mostly on-site, but flexible about which location", value: "mostly_onsite", order: 4, traits: { remote_preference: 25 } },
          { label: "I want to be on-site or in the field — remote work doesn't appeal to me", value: "onsite_only", order: 5, traits: { remote_preference: 10 } },
        ],
      },
      {
        type: "MULTI_SELECT",
        prompt: "Which of these matter to you in a job? Select all that apply.",
        order: 4,
        isRequired: true,
        options: [
          { label: "Being able to work from anywhere with an internet connection", value: "work_anywhere", order: 1, traits: { remote_preference: 80 } },
          { label: "Having the same routine and expectations every day", value: "same_routine", order: 2, traits: { stability_preference: 75 } },
          { label: "Being able to shift my hours around personal commitments", value: "shift_hours", order: 3, traits: { flexibility_preference: 80 } },
          { label: "Working somewhere with clear, predictable career steps", value: "clear_steps", order: 4, traits: { stability_preference: 65, structured: 55 } },
          { label: "Not being tied to one desk or location", value: "not_tied_down", order: 5, traits: { flexibility_preference: 70, remote_preference: 40 } },
        ],
      },
      {
        type: "SCENARIO",
        prompt: "You're offered a choice between a stable, predictable job and a fast-changing role with variable hours. Which pulls you more?",
        order: 5,
        isRequired: true,
        options: [
          { label: "The stable role, hands down", value: "stable", order: 1, traits: { stability_preference: 85, risk_tolerance: 20 } },
          { label: "Leaning stable, but I'd consider the other option for the right opportunity", value: "lean_stable", order: 2, traits: { stability_preference: 65, risk_tolerance: 40 } },
          { label: "Leaning fast-changing — I like variety even if it's less predictable", value: "lean_variable", order: 3, traits: { stability_preference: 30, flexibility_preference: 70, risk_tolerance: 65 } },
          { label: "The fast-changing role, without a doubt", value: "variable", order: 4, traits: { stability_preference: 15, flexibility_preference: 85, risk_tolerance: 80 } },
        ],
      },
      likert(
        6,
        "I get restless doing the exact same tasks every day.",
        "stability_preference",
        [90, 70, 50, 30, 10],
        "This one is scored in reverse — restlessness with routine suggests a lower preference for stability."
      ),
    ],
  },

  // ---------------------------------------------------------------------
  {
    key: "SALARY_GOALS",
    title: "Salary & career goals",
    description: "How much income and financial growth factor into your career choice.",
    weight: 0.1,
    order: 4,
    questions: [
      likert(1, "Maximizing my income is one of the most important factors in choosing a career.", "income_priority", [10, 30, 50, 70, 90]),
      {
        type: "SINGLE_SELECT",
        prompt: "If you had to choose, which matters more to you?",
        order: 2,
        isRequired: true,
        options: [
          { label: "Passion for the work, even if the pay is modest", value: "passion", order: 1, traits: { income_priority: 20 } },
          { label: "A balance of both passion and pay", value: "balance", order: 2, traits: { income_priority: 50 } },
          { label: "Pay and growth potential, even if the work itself isn't my passion", value: "pay", order: 3, traits: { income_priority: 85 } },
        ],
      },
      {
        type: "SCENARIO",
        prompt: "You're offered two entry-level jobs: one pays more but is less interesting, the other pays less but excites you. Which do you pick?",
        order: 3,
        isRequired: true,
        options: [
          { label: "Higher pay, without hesitation", value: "pay_now", order: 1, traits: { income_priority: 90 } },
          { label: "Higher pay, but I'd feel torn", value: "pay_torn", order: 2, traits: { income_priority: 70 } },
          { label: "The more interesting job, but I'd keep an eye on my finances", value: "interest_cautious", order: 3, traits: { income_priority: 35 } },
          { label: "The more interesting job — pay is secondary right now", value: "interest_now", order: 4, traits: { income_priority: 15 } },
        ],
      },
      {
        type: "MULTI_SELECT",
        prompt: "Which financial goals matter most to you in the next few years? Select all that apply.",
        order: 4,
        isRequired: true,
        options: [
          { label: "Earning enough to support my family", value: "support_family", order: 1, traits: { income_priority: 70 } },
          { label: "Building savings quickly", value: "build_savings", order: 2, traits: { income_priority: 65 } },
          { label: "Being able to afford a comfortable lifestyle soon", value: "comfortable_lifestyle", order: 3, traits: { income_priority: 75 } },
          { label: "I'm more focused on learning than earning right now", value: "focus_learning", order: 4, traits: { income_priority: 20 } },
        ],
      },
      likert(
        5,
        "I'd rather take a lower-paying job with strong long-term growth than a higher-paying job with a low ceiling.",
        "income_priority",
        [85, 65, 50, 35, 15],
        "This one is scored in reverse — prioritizing long-term growth suggests income right now matters less."
      ),
    ],
  },

  // ---------------------------------------------------------------------
  {
    key: "EDUCATION_READINESS",
    title: "Education & qualification readiness",
    description: "How much schooling, training, or licensure you're ready to commit to.",
    weight: 0.1,
    order: 5,
    questions: [
      likert(1, "I'm willing to spend several years in school (college or beyond) if it leads to the right career.", "education_readiness", [10, 30, 50, 70, 90]),
      likert(2, "I'm willing to study for and pass a licensure or certification exam if a career requires it.", "certification_readiness", [10, 30, 50, 70, 90]),
      {
        type: "SINGLE_SELECT",
        prompt: "How do you feel about further formal schooling or licensure exams?",
        helpText: "Be honest — this helps us rule out careers that require a commitment you're not ready for.",
        order: 3,
        isRequired: true,
        options: [
          {
            label: "I don't want to commit to more formal schooling or licensure exams — I want to start earning as soon as possible",
            value: "no_more_school",
            order: 1,
            traits: { education_readiness: 15, certification_readiness: 15 },
            constraints: ["no_further_study", "no_licensure"],
          },
          { label: "I'd consider a short course or certificate, but not a full degree", value: "short_course_only", order: 2, traits: { education_readiness: 40, certification_readiness: 55 } },
          { label: "I'm open to a 2-4 year degree if it's worth it", value: "open_to_degree", order: 3, traits: { education_readiness: 70, certification_readiness: 60 } },
          { label: "I'm fully committed to whatever schooling or licensure a career requires, even years of it", value: "fully_committed", order: 4, traits: { education_readiness: 90, certification_readiness: 85 } },
        ],
      },
      {
        type: "SKILL_RATING",
        prompt: "How prepared do you feel to study independently (online courses, textbooks, self-paced learning)?",
        order: 4,
        isRequired: true,
        options: [
          { label: "Not prepared at all", value: "1", order: 1, traits: { education_readiness: 15 } },
          { label: "A little prepared", value: "2", order: 2, traits: { education_readiness: 35 } },
          { label: "Somewhat prepared", value: "3", order: 3, traits: { education_readiness: 55 } },
          { label: "Well prepared", value: "4", order: 4, traits: { education_readiness: 75 } },
          { label: "Very well prepared, I do this often", value: "5", order: 5, traits: { education_readiness: 90 } },
        ],
      },
      {
        type: "SCENARIO",
        prompt: "A career you're excited about requires passing a licensure exam after a 4-year degree. How do you react?",
        order: 5,
        isRequired: true,
        options: [
          { label: "That's a dealbreaker for me", value: "dealbreaker", order: 1, traits: { certification_readiness: 10, education_readiness: 20 } },
          { label: "I'd hesitate, but might still pursue it if the payoff is clear", value: "hesitate", order: 2, traits: { certification_readiness: 45, education_readiness: 45 } },
          { label: "I'd commit to it without much hesitation", value: "commit", order: 3, traits: { certification_readiness: 75, education_readiness: 75 } },
          { label: "I'd be excited — formal credentials motivate me", value: "excited_credentials", order: 4, traits: { certification_readiness: 90, education_readiness: 85 } },
        ],
      },
    ],
  },

  // ---------------------------------------------------------------------
  {
    key: "RISK_AMBITION",
    title: "Risk, ambition & transition readiness",
    description: "Your comfort with uncertainty, and how much you're drawn to building something of your own.",
    weight: 0.1,
    order: 6,
    questions: [
      likert(1, "I'd rather build my own business than work for someone else long-term.", "entrepreneurship", [10, 30, 50, 70, 90]),
      likert(2, "I'm comfortable with uncertainty, like not knowing exactly how my income will look month to month.", "risk_tolerance", [10, 30, 50, 70, 90]),
      {
        type: "SCENARIO",
        prompt: "A friend invites you to join a risky but promising startup instead of a stable job offer. What do you do?",
        order: 3,
        isRequired: true,
        options: [
          { label: "Take the stable job — I don't like uncertainty", value: "take_stable", order: 1, traits: { risk_tolerance: 15, entrepreneurship: 20 } },
          { label: "Lean toward stable, but ask more questions about the startup", value: "lean_stable_ask", order: 2, traits: { risk_tolerance: 40, entrepreneurship: 35 } },
          { label: "Lean toward the startup if the team seems solid", value: "lean_startup", order: 3, traits: { risk_tolerance: 65, entrepreneurship: 60 } },
          { label: "Join the startup without much hesitation", value: "join_startup", order: 4, traits: { risk_tolerance: 85, entrepreneurship: 80 } },
        ],
      },
      {
        type: "MULTI_SELECT",
        prompt: "Which of these appeal to you? Select all that apply.",
        order: 4,
        isRequired: true,
        options: [
          { label: "Starting my own business or side hustle someday", value: "own_business", order: 1, traits: { entrepreneurship: 80 } },
          { label: "Freelancing or working with multiple clients instead of one employer", value: "freelancing", order: 2, traits: { entrepreneurship: 55, risk_tolerance: 55, independent: 60 } },
          { label: "Switching careers entirely if a better opportunity comes along", value: "switching_careers", order: 3, traits: { risk_tolerance: 70 } },
          { label: "Sticking with one long-term employer for security", value: "one_employer", order: 4, traits: { risk_tolerance: 20, entrepreneurship: 15 } },
        ],
      },
      {
        type: "SKILL_RATING",
        prompt: "How confident are you handling financial or career uncertainty (irregular income, unclear next steps)?",
        order: 5,
        isRequired: true,
        options: [
          { label: "Not confident at all", value: "1", order: 1, traits: { risk_tolerance: 15 } },
          { label: "A little confident", value: "2", order: 2, traits: { risk_tolerance: 35 } },
          { label: "Somewhat confident", value: "3", order: 3, traits: { risk_tolerance: 55 } },
          { label: "Confident", value: "4", order: 4, traits: { risk_tolerance: 75 } },
          { label: "Very confident, I thrive in uncertainty", value: "5", order: 5, traits: { risk_tolerance: 90 } },
        ],
      },
      {
        type: "SINGLE_SELECT",
        prompt: "Which best matches your long-term ambition?",
        order: 6,
        isRequired: true,
        options: [
          { label: "Build and grow my own business", value: "build_business", order: 1, traits: { entrepreneurship: 90, risk_tolerance: 75 } },
          { label: "Rise into a leadership role within a company", value: "rise_leadership", order: 2, traits: { entrepreneurship: 45, leadership: 75 } },
          { label: "Become a top specialist or expert in my field", value: "become_expert", order: 3, traits: { entrepreneurship: 25, quantitative: 40 } },
          { label: "Have a stable, secure job I can rely on", value: "stable_job", order: 4, traits: { entrepreneurship: 10, risk_tolerance: 15, stability_preference: 70 } },
        ],
      },
    ],
  },
];
