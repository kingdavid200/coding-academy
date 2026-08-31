import { z } from "zod";

/** Shared field schemas ------------------------------------------------- */

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, "Enter your email address.")
  .max(254, "That email address is too long.")
  .email("Enter a valid email address.");

export const nameSchema = z
  .string()
  .trim()
  .min(2, "Enter your name.")
  .max(80, "That name is too long.");

export const passwordSchema = z
  .string()
  .min(10, "Use at least 10 characters.")
  .max(200, "That password is too long.");

const slugSchema = z
  .string()
  .trim()
  .min(1)
  .max(60)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens.");

/** Auth ---------------------------------------------------------------- */

export const signupSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  courseSlug: slugSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Enter your password."),
  next: z.string().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Enter your current password."),
  newPassword: passwordSchema,
});

export const updateAccountSchema = z.object({
  name: nameSchema,
});

export const enrollSchema = z.object({
  courseSlug: slugSchema,
});

/** Quiz -------------------------------------------------------------- */

export const quizSubmissionSchema = z.object({
  attemptId: z.string().min(1),
  responses: z
    .array(
      z.object({
        questionId: z.string().min(1),
        optionId: z.string().min(1).nullable(),
      }),
    )
    .min(1, "Answer at least one question."),
});

/** Admin: courses -------------------------------------------------- */

export const courseInputSchema = z.object({
  slug: slugSchema,
  title: z.string().trim().min(2).max(120),
  language: z.string().trim().min(1).max(40),
  tagline: z.string().trim().min(2).max(200),
  description: z.string().trim().min(10).max(2000),
  outcomes: z.array(z.string().trim().min(1).max(200)).max(12).default([]),
  icon: z.string().trim().max(40).default("code"),
  accent: z
    .string()
    .trim()
    .regex(/^#[0-9a-fA-F]{6}$/, "Use a hex colour like #2563eb.")
    .default("#2563eb"),
  order: z.number().int().min(0).max(999).default(0),
  published: z.boolean().default(true),
});

export const courseUpdateSchema = courseInputSchema.partial();

/** Admin: modules ------------------------------------------------- */

export const moduleInputSchema = z.object({
  courseId: z.string().min(1),
  slug: slugSchema,
  title: z.string().trim().min(2).max(120),
  summary: z.string().trim().min(10).max(600),
  objectives: z.array(z.string().trim().min(1).max(240)).max(12).default([]),
  passingScore: z.number().int().min(1).max(100).default(80),
  published: z.boolean().default(true),
});

export const moduleUpdateSchema = moduleInputSchema.omit({ courseId: true }).partial();

export const reorderSchema = z.object({
  ids: z.array(z.string().min(1)).min(1),
});

/** Admin: lessons ----------------------------------------------- */

export const lessonInputSchema = z.object({
  moduleId: z.string().min(1),
  slug: slugSchema,
  title: z.string().trim().min(2).max(120),
  summary: z.string().trim().min(10).max(400),
  objectives: z.array(z.string().trim().min(1).max(240)).max(12).default([]),
  content: z.string().trim().min(20).max(40000),
  estimatedMinutes: z.number().int().min(1).max(180).default(8),
});

export const lessonUpdateSchema = lessonInputSchema.omit({ moduleId: true }).partial();

/** Admin: quizzes & questions -------------------------------- */

export const quizInputSchema = z.object({
  moduleId: z.string().min(1),
  title: z.string().trim().min(2).max(120),
  description: z.string().trim().min(5).max(600),
});

export const quizUpdateSchema = quizInputSchema.omit({ moduleId: true }).partial();

export const questionInputSchema = z.object({
  quizId: z.string().min(1),
  prompt: z.string().trim().min(5).max(600),
  explanation: z.string().trim().min(5).max(1000),
  options: z
    .array(
      z.object({
        text: z.string().trim().min(1).max(300),
        isCorrect: z.boolean(),
      }),
    )
    .min(2, "Add at least two options.")
    .max(6)
    .refine((opts) => opts.filter((o) => o.isCorrect).length === 1, {
      message: "Exactly one option must be correct.",
    }),
});

export const questionUpdateSchema = questionInputSchema.omit({ quizId: true }).partial();

export const settingsSchema = z.object({
  defaultPassingScore: z.number().int().min(1).max(100),
  applyToExistingModules: z.boolean().default(false),
});
