"use server"

import { auth } from "@convex-dev/auth/nextjs/server";

export type SignInPayload = {
  email: string
  password: string
}

export type SignUpPayload = {
  email: string
  password: string
}

export async function signInWithEmail(payload: SignInPayload): Promise<void> {
  await auth.signIn("password", {
    email: payload.email,
    password: payload.password,
    flow: "signIn",
    redirect: true,
    redirectTo: "/",
  });
}

export async function signUpWithEmail(payload: SignUpPayload): Promise<void> {
  await auth.signIn("password", {
    email: payload.email,
    password: payload.password,
    flow: "signUp",
    redirect: true,
    redirectTo: "/",
  });
}

export async function signInWithGoogle(): Promise<void> {
  await auth.signIn("google", {
    redirect: true,
    redirectTo: "/",
  });
}

export async function signInWithGithub(): Promise<void> {
  await auth.signIn("github", {
    redirect: true,
    redirectTo: "/",
  });
}

export type RequestPasswordResetPayload = {
  email: string
}

export type ResetPasswordPayload = {
  token: string
  password: string
}

export async function requestPasswordReset(
  _payload: RequestPasswordResetPayload
): Promise<void> {
  // TODO: implement password reset email
}

export async function resetPassword(_payload: ResetPasswordPayload): Promise<void> {
  // TODO: implement password reset
}
