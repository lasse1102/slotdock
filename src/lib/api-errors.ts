import { NextResponse } from "next/server";

/** Standard error response shape: { error: CODE, message: string } */
export function apiError(
  code: string,
  message: string,
  status: number,
  extra?: Record<string, unknown>
) {
  return NextResponse.json({ error: code, message, ...extra }, { status });
}

export const unauthorized = () =>
  apiError("UNAUTHORIZED", "Nicht autorisiert", 401);

/** Safely parse JSON body. Returns [body, null] on success or [null, errorResponse] on failure. */
export async function parseJsonBody(
  request: Request
): Promise<[unknown, null] | [null, NextResponse]> {
  try {
    return [await request.json(), null];
  } catch {
    return [
      null,
      apiError("INVALID_JSON", "Ungültiger Request-Body", 400),
    ];
  }
}
