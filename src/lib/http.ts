import { NextResponse } from "next/server";
import { ZodError } from "zod";

/**
 * Consistent JSON envelope for every API route. User-facing messages only —
 * stack traces, Prisma errors and internal paths are never sent to the client.
 */

export type ApiError = {
  error: string;
  code: string;
  fields?: Record<string, string>;
};

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, { status: 200, ...init });
}

export function created<T>(data: T) {
  return NextResponse.json(data, { status: 201 });
}

export function noContent() {
  return new NextResponse(null, { status: 204 });
}

export function fail(
  status: number,
  code: string,
  message: string,
  fields?: Record<string, string>,
) {
  const body: ApiError = { error: message, code };
  if (fields) body.fields = fields;
  return NextResponse.json(body, { status });
}

export const badRequest = (msg = "The request was invalid.", fields?: Record<string, string>) =>
  fail(400, "bad_request", msg, fields);
export const unauthorized = (msg = "You need to sign in to do that.") =>
  fail(401, "unauthorized", msg);
export const forbidden = (msg = "You do not have permission to do that.") =>
  fail(403, "forbidden", msg);
export const notFound = (msg = "That resource could not be found.") =>
  fail(404, "not_found", msg);
export const conflict = (msg = "That conflicts with something that already exists.") =>
  fail(409, "conflict", msg);
export const tooMany = (msg = "Too many attempts. Please wait and try again.") =>
  fail(429, "rate_limited", msg);

/** Wraps a route handler so unexpected errors become a clean 500. */
export function route<A extends unknown[]>(
  handler: (...args: A) => Promise<Response>,
) {
  return async (...args: A): Promise<Response> => {
    try {
      return await handler(...args);
    } catch (err) {
      if (err instanceof ZodError) {
        const fields: Record<string, string> = {};
        for (const issue of err.issues) {
          const key = issue.path.join(".") || "form";
          if (!fields[key]) fields[key] = issue.message;
        }
        return badRequest("Please check the highlighted fields.", fields);
      }
      if (err instanceof HttpError) {
        return fail(err.status, err.code, err.message, err.fields);
      }
      console.error("Unhandled API error:", err);
      return fail(500, "server_error", "Something went wrong on our end. Please try again.");
    }
  };
}

export class HttpError extends Error {
  status: number;
  code: string;
  fields?: Record<string, string>;
  constructor(status: number, code: string, message: string, fields?: Record<string, string>) {
    super(message);
    this.status = status;
    this.code = code;
    this.fields = fields;
  }
}
