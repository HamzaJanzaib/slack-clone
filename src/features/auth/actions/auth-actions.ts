export type SignInPayload = {
  email: string
  password: string
}

export type SignUpPayload = {
  email: string
  password: string
}

export async function signInWithEmail(_payload: SignInPayload): Promise<void> {
  // TODO: implement email sign in
}

export async function signUpWithEmail(_payload: SignUpPayload): Promise<void> {
  // TODO: implement email sign up
}

export async function signInWithGoogle(): Promise<void> {
  // TODO: implement Google OAuth
}

export async function signInWithGithub(): Promise<void> {
  // TODO: implement Github OAuth
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
