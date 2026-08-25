export type SignupInput = {
  email: string;
  password: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type AuthResult = {
  token: string;
};

export type AuthRequest = {
  email: string;
  password: string;
};
