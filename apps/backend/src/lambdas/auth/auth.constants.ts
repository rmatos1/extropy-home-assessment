import { MIN_PASSWORD_LENGTH, MAX_PASSWORD_LENGTH } from "@extropy/shared";

export const EMAIL_INDEX_NAME = "EmailIndex";
export const TOKEN_EXPIRATION_TIME = "1h";
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const BCRYPT_SALT_ROUNDS = 12;
export const ERROR_MESSAGES = {
  INVALID_EMAIL: "Invalid email format",
  INVALID_PASSWORD: `Password must be at least ${MIN_PASSWORD_LENGTH} and at most ${MAX_PASSWORD_LENGTH} characters long`,
};
