import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { ForbiddenError, UnauthorizedError } from "@/lib/auth/session";

export type ApiErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "RATE_LIMITED"
  | "CONFLICT"
  | "INTERNAL_ERROR";

export class ApiError extends Error {
  code: ApiErrorCode;
  status: number;
  fieldErrors?: Record<string, string[]>;

  constructor(code: ApiErrorCode, message: string, status: number, fieldErrors?: Record<string, string[]>) {
    super(message);
    this.code = code;
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

export function notFound(message = "Resource not found.") {
  return new ApiError("NOT_FOUND", message, 404);
}

export function conflict(message: string) {
  return new ApiError("CONFLICT", message, 409);
}

export function rateLimited(message = "Too many requests. Please try again shortly.") {
  return new ApiError("RATE_LIMITED", message, 429);
}

function errorBody(code: ApiErrorCode, message: string, fieldErrors?: Record<string, string[]>) {
  return { error: { code, message, ...(fieldErrors ? { fieldErrors } : {}) } };
}

/** Wraps a route handler body, converting known errors into consistent JSON responses. */
export function withApiErrorHandling<Ctx = unknown>(
  handler: (req: Request, ctx: Ctx) => Promise<NextResponse>
) {
  return async (req: Request, ctx: Ctx) => {
    try {
      return await handler(req, ctx);
    } catch (err) {
      if (err instanceof ZodError) {
        return NextResponse.json(
          errorBody("VALIDATION_ERROR", "Invalid request data.", err.flatten().fieldErrors as Record<string, string[]>),
          { status: 400 }
        );
      }
      if (err instanceof UnauthorizedError) {
        return NextResponse.json(errorBody("UNAUTHORIZED", err.message), { status: 401 });
      }
      if (err instanceof ForbiddenError) {
        return NextResponse.json(errorBody("FORBIDDEN", err.message), { status: 403 });
      }
      if (err instanceof ApiError) {
        return NextResponse.json(errorBody(err.code, err.message, err.fieldErrors), { status: err.status });
      }
      console.error("[api] unhandled error", err);
      return NextResponse.json(errorBody("INTERNAL_ERROR", "Something went wrong. Please try again."), {
        status: 500,
      });
    }
  };
}
