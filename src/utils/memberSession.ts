import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const SECRET = new TextEncoder().encode(
  process.env.MEMBER_SESSION_SECRET || "FALLBACK_SECRET_CHANGE_ME_IN_PRODUCTION"
);

const COOKIE_NAME = "member_session";

export type MemberPayload = {
  memberId: string;
  username: string;
  tenantId: string;
};

export async function createMemberSession(payload: MemberPayload): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET);
}

export async function getMemberSession(): Promise<MemberPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;

    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as MemberPayload;
  } catch {
    return null;
  }
}

export async function setMemberSessionCookie(payload: MemberPayload) {
  const token = await createMemberSession(payload);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });
}

export async function clearMemberSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
