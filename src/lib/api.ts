import { NextResponse } from "next/server";

export function successResponse<T>(data: T, status = 200): NextResponse {
  return NextResponse.json({ success: true, data }, { status });
}

export function errorResponse(
  code: string,
  message: string,
  status: number,
  details?: unknown,
): NextResponse {
  return NextResponse.json(
    { success: false, error: { code, message, ...(details ? { details } : {}) } },
    { status },
  );
}

export interface PaginatedData<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export function paginatedResponse<T>(
  data: PaginatedData<T>,
  status = 200,
): NextResponse {
  return NextResponse.json({ success: true, data }, { status });
}
