export type Role = "rep" | "manager" | "admin";
export type ReportStatus = "draft" | "submitted" | "reviewed";
export type VisitType = "visit" | "call" | "video" | "email";
export type TargetSection = "problem" | "plan";
export type NotificationType = "comment" | "reminder" | "reviewed";
export type CustomerGrade = "A" | "B" | "C";

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: Role;
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface PaginationQuery {
  page?: number;
  pageSize?: number;
}
