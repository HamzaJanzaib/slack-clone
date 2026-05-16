export type AuthFieldErrors = {
  email?: string
  password?: string
  confirmPassword?: string
}

export function validateEmail(email: string): string | undefined {
  if (!email.trim()) return "Email is required"
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return "Enter a valid email address"
  }
  return undefined
}

export function validatePassword(password: string): string | undefined {
  if (!password) return "Password is required"
  if (password.length < 8) return "Password must be at least 8 characters"
  return undefined
}

export function validateConfirmPassword(
  password: string,
  confirmPassword: string
): string | undefined {
  if (!confirmPassword) return "Please confirm your password"
  if (password !== confirmPassword) return "Passwords do not match"
  return undefined
}

export function validateSignInForm(
  email: string,
  password: string
): AuthFieldErrors {
  const errors: AuthFieldErrors = {}
  const emailError = validateEmail(email)
  const passwordError = validatePassword(password)
  if (emailError) errors.email = emailError
  if (passwordError) errors.password = passwordError
  return errors
}

export function validateSignUpForm(
  email: string,
  password: string,
  confirmPassword: string
): AuthFieldErrors {
  const errors: AuthFieldErrors = {}
  const emailError = validateEmail(email)
  const passwordError = validatePassword(password)
  const confirmPasswordError = validateConfirmPassword(password, confirmPassword)
  if (emailError) errors.email = emailError
  if (passwordError) errors.password = passwordError
  if (confirmPasswordError) errors.confirmPassword = confirmPasswordError
  return errors
}

export function hasAuthErrors(errors: AuthFieldErrors): boolean {
  return Object.keys(errors).length > 0
}
