import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import type { User } from "@extropy/shared";

import { createUser, getUserByEmail, getUserById } from "./auth.repository";
import { BCRYPT_SALT_ROUNDS } from "./auth.constants";
import type { SignupInput, LoginInput } from "./auth.types";
import {
  generateToken,
  getAuthenticatedUserId,
  validateEmail,
  validatePassword,
} from "./auth.helpers";

export async function signup(input: SignupInput): Promise<string> {
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

  return generateToken(user);
}

export async function login(input: LoginInput): Promise<string> {
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

  return generateToken(user);
}

export async function getCurrentUser(
  cookieHeader: string | undefined
): Promise<Pick<User, "id" | "email">> {
  const userId = getAuthenticatedUserId(cookieHeader);

  const user = await getUserById(userId);

  if (!user) {
    throw new Error("UNAUTHORIZED");
  }

  return {
    id: user.id,
    email: user.email,
  };
}
