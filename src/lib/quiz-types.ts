/** Shared quiz payload shapes, safe to import from client components. */

export type QuizQuestionForTaking = {
  id: string;
  prompt: string;
  options: { id: string; text: string }[];
};

export type QuizForTaking = {
  attemptId: string;
  module: { slug: string; title: string; passingScore: number };
  course: { slug: string; title: string };
  quiz: { title: string; description: string };
  questions: QuizQuestionForTaking[];
};

export type GradedQuestion = {
  id: string;
  prompt: string;
  explanation: string;
  yourOptionId: string | null;
  correctOptionId: string;
  correct: boolean;
  options: { id: string; text: string; isCorrect: boolean; chosen: boolean }[];
};

export type GradedResult = {
  attemptId: string;
  score: number;
  total: number;
  percentage: number;
  passed: boolean;
  passingScore: number;
  bestScore: number;
  moduleCompleted: boolean;
  nextModule: { slug: string; title: string } | null;
  nextModuleUnlocked: boolean;
  courseSlug: string;
  courseTitle: string;
  moduleSlug: string;
  moduleTitle: string;
  questions: GradedQuestion[];
};
