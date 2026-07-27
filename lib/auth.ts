import { cookies } from "next/headers";
import { SignJWT } from "jose/jwt/sign";
import { jwtVerify } from "jose/jwt/verify";
import { env } from "@/lib/env";

export const ADMIN_COOKIE = "admin_token";
const encoder = new TextEncoder();

const getSecret = () => encoder.encode(env.jwtSecret());

export const signAdminToken = async () => {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(getSecret());
};

export const verifyAdminToken = async (token: string | undefined) => {
  if (!token) {
    return false;
  }

  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload.role === "admin";
  } catch {
    return false;
  }
};

export const getSessionFromCookies = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  return verifyAdminToken(token);
};
