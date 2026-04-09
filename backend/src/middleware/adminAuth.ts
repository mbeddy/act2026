import { createMiddleware } from "hono/factory";
import { SignJWT, jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "dev-jwt-secret-change-in-production";
const secret = new TextEncoder().encode(JWT_SECRET);

export async function signAdminToken(): Promise<string> {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(secret);
}

export const adminAuth = createMiddleware(async (c, next) => {
  const authHeader = c.req.header("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return c.json({ error: { message: "Unauthorized", code: "UNAUTHORIZED" } }, 401);
  }
  const token = authHeader.slice(7);
  try {
    await jwtVerify(token, secret);
    await next();
  } catch {
    return c.json({ error: { message: "Invalid or expired token", code: "INVALID_TOKEN" } }, 401);
  }
});
