"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginAction } from "./actions";

// ── Validation schema ────────────────────────────────────────────────────────

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "이메일을 입력해 주세요.")
    .email("올바른 이메일 형식이 아닙니다."),
  password: z
    .string()
    .min(1, "비밀번호를 입력해 주세요.")
    .min(8, "비밀번호는 최소 8자 이상이어야 합니다."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

// ── Component ────────────────────────────────────────────────────────────────

export default function LoginPage() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (values: LoginFormValues) => {
    setServerError(null);
    startTransition(async () => {
      const result = await loginAction(values.email, values.password);
      // loginAction redirects on success, so result is only returned on failure
      if (result && !result.success) {
        setServerError(result.message);
      }
    });
  };

  return (
    <Card className="w-full max-w-sm shadow-md">
      <CardHeader className="pb-4">
        <CardTitle className="text-center text-xl font-semibold">
          영업 일일 보고 시스템
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          aria-label="로그인 폼"
        >
          {/* Server-level error (wrong credentials etc.) */}
          {serverError && (
            <div
              role="alert"
              className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600"
            >
              {serverError}
            </div>
          )}

          {/* Email */}
          <div className="mb-4">
            <Label htmlFor="email" className="mb-1.5 block">
              이메일
            </Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="hong@example.com"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "email-error" : undefined}
              disabled={isPending}
              {...register("email")}
            />
            {errors.email && (
              <p id="email-error" className="mt-1 text-xs text-red-500">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="mb-6">
            <Label htmlFor="password" className="mb-1.5 block">
              비밀번호
            </Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="비밀번호 (최소 8자)"
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? "password-error" : undefined}
              disabled={isPending}
              {...register("password")}
            />
            {errors.password && (
              <p id="password-error" className="mt-1 text-xs text-red-500">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Submit */}
          <Button
            type="submit"
            className="w-full"
            disabled={isPending}
            aria-label="로그인"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                로그인 중...
              </>
            ) : (
              "로그인"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
