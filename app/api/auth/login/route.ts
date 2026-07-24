import { NextResponse } from "next/server";
import { ADMIN_COOKIE, signAdminToken } from "@/lib/auth";
import { env } from "@/lib/env";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { username?: string; password?: string };

    if (body.username !== env.adminUsername() || body.password !== env.adminPassword()) {
      return NextResponse.json({ error: "Invalid username or password." }, { status: 401 });
    }

    const token = await signAdminToken();
    const response = NextResponse.json({ ok: true });

    response.cookies.set({
      name: ADMIN_COOKIE,
      value: token,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 8
    });

    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to sign in." }, { status: 500 });
  }
}
