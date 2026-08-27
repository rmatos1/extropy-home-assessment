import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import type { User } from "@extropy/shared";
import { MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH } from "@extropy/shared";

import {
  TOKEN_EXPIRATION_TIME,
  EMAIL_PATTERN,
  SESSION_COOKIE_NAME,
} from "./auth.constants";

export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET environment variable is not configured");
  }

  return secret;
}

export function validateEmail(email: string): void {
  if (!EMAIL_PATTERN.test(email)) {
    throw new Error("INVALID_EMAIL");
  }
}

export function validatePassword(password: string): void {
  if (
    password.length < MIN_PASSWORD_LENGTH ||
    password.length > MAX_PASSWORD_LENGTH
  ) {
    throw new Error("INVALID_PASSWORD");
  }
}

export function generateToken(user: User): string {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
    },
    getJwtSecret(),
    {
      expiresIn: TOKEN_EXPIRATION_TIME,
    }
  );
}

export function createSessionCookie(token: string, maxAge?: number): string {
  return [
    `${SESSION_COOKIE_NAME}=${token}`,
    "HttpOnly",
    "Secure",
    "SameSite=Lax",
    "Path=/",
    ...(maxAge !== undefined ? [`Max-Age=${maxAge}`] : []),
  ].join("; ");
}

export function getTokenFromCookie(cookieHeader: string | undefined): string {
  const sessionCookie = cookieHeader
    ?.split(";")
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(`${SESSION_COOKIE_NAME}=`));

  if (!sessionCookie) {
    throw new Error("UNAUTHORIZED");
  }

  return sessionCookie.slice(`${SESSION_COOKIE_NAME}=`.length);
}

export function getAuthenticatedUserId(
  cookieHeader: string | undefined
): string {
  const token = getTokenFromCookie(cookieHeader);

  const payload = jwt.verify(token, getJwtSecret());

  if (
    typeof payload !== "object" ||
    payload === null ||
    typeof payload.sub !== "string"
  ) {
    throw new Error("UNAUTHORIZED");
  }

  return payload.sub;
}
