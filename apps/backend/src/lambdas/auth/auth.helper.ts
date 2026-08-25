import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import type { User } from "@extropy/shared";
import { MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH } from "@extropy/shared";

import { createUser, getUserByEmail } from "./auth.repository";
import {
  TOKEN_EXPIRATION_TIME,
  EMAIL_PATTERN,
  BCRYPT_SALT_ROUNDS,
} from "./auth.constants";
import { SignupInput, LoginInput, AuthResult } from "./auth.types";

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET environment variable is not configured");
  }

  return secret;
}

function validateEmail(email: string): void {
  if (!EMAIL_PATTERN.test(email)) {
    throw new Error("INVALID_EMAIL");
  }
}

function validatePassword(password: string): void {
  if (
    password.length < MIN_PASSWORD_LENGTH ||
    password.length > MAX_PASSWORD_LENGTH
  ) {
    throw new Error("INVALID_PASSWORD");
  }
}

function generateToken(user: User): string {
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

export async function signup(input: SignupInput): Promise<AuthResult> {
  const email = input.email.trim().toLowerCase();

  validateEmail(email);
  validatePassword(input.password);

  const existingUser = await getUserByEmail(email);

  if (existingUser) {
    throw new Error("USER_EMAIL_ALREADY_EXISTS");
  }

  const now = new Date().toISOString();

  const passwordHash = await bcrypt.hash(input.password, BCRYPT_SALT_ROUNDS);

  const user: User = {
    id: crypto.randomUUID(),
    email,
    passwordHash,
    createdAt: now,
    updatedAt: now,
  };

  await createUser(user);

  return {
    token: generateToken(user),
  };
}

export async function login(input: LoginInput): Promise<AuthResult> {
  const email = input.email.trim().toLowerCase();

  validateEmail(email);

  const user = await getUserByEmail(email);

  if (!user) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const passwordMatches = await bcrypt.compare(
    input.password,
    user.passwordHash
  );

  if (!passwordMatches) {
    throw new Error("INVALID_CREDENTIALS");
  }

  return {
    token: generateToken(user),
  };
}

export function getAuthenticatedUserId(
  authorizationHeader: string | undefined
): string {
  if (!authorizationHeader?.startsWith("Bearer ")) {
    throw new Error("UNAUTHORIZED");
  }

  const token = authorizationHeader.slice("Bearer ".length);

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
