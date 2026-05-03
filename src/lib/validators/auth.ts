import { z } from "zod";

export const LoginSchema = z.object({
  email: z.string().email("올바른 이메일 형식이 아닙니다."),
  password: z.string().min(8, "비밀번호는 최소 8자 이상이어야 합니다."),
});

export type LoginInput = z.infer<typeof LoginSchema>;

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(8, "비밀번호는 최소 8자 이상이어야 합니다."),
  newPassword: z.string().min(8, "새 비밀번호는 최소 8자 이상이어야 합니다."),
});

export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>;
