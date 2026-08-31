export type SeedQuestion = {
  prompt: string;
  explanation: string;
  options: { text: string; correct?: boolean }[];
};

export type SeedLesson = {
  slug: string;
  title: string;
  summary: string;
  objectives: string[];
  estimatedMinutes: number;
  content: string;
};

export type SeedModule = {
  slug: string;
  title: string;
  summary: string;
  objectives: string[];
  passingScore?: number;
  lessons: SeedLesson[];
  quiz: {
    title: string;
    description: string;
    questions: SeedQuestion[];
  };
};

export type SeedCourse = {
  slug: string;
  title: string;
  language: string;
  tagline: string;
  description: string;
  icon: string;
  accent: string;
  order: number;
  outcomes: string[];
  modules: SeedModule[];
};
