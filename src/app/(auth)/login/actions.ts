"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { AuthUser, ApiResponse } from "@/types";

interface LoginResponseData {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  user: AuthUser;
}

interface LoginActionResult {
  success: false;
  message: string;
}

export async function loginAction(
  email: string,
  password: string,
): Promise<LoginActionResult> {
  const baseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    `http://localhost:${process.env.PORT ?? 3000}`;

  let data: LoginResponseData;

  try {
    const res = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      cache: "no-store",
    });

    const json: ApiResponse<LoginResponseData> = await res.json();

    if (!json.success) {
      return {
        success: false,
        message: "이메일 또는 비밀번호가 올바르지 않습니다.",
      };
    }

    data = json.data;
  } catch {
    return {
      success: false,
      message: "서버와 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.",
    };
  }

  const cookieStore = await cookies();
  cookieStore.set("auth-token", data.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: data.expiresIn,
    path: "/",
  });

  redirect("/dashboard");
}
