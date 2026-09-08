/**
 * Parses raw error objects from Convex/Auth into user-friendly messages.
 */
export function parseAuthError(error: unknown): string {
  const msg = error instanceof Error ? error.message : String(error);
  
  if (msg.includes("Invalid credentials") || msg.includes("Invalid email or password")) {
    return "The email or password you entered is incorrect.";
  }
  if (msg.includes("Email already in use") || msg.includes("User already exists")) {
    return "This email is already associated with an account. Try logging in.";
  }
  if (msg.includes("User not found")) {
    return "We couldn't find an account with that email.";
  }
  if (msg.toLowerCase().includes("password")) {
    return "Your password does not meet the minimum security requirements.";
  }
  
  // Fallback for completely unknown errors
  return "An unexpected error occurred. Please try again.";
}
