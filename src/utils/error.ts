/**
 * Safely extracts error message from unknown error type
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  return String(error)
}

/**
 * Checks if error message matches the expected message
 */
export function isErrorMessage(error: unknown, message: string): boolean {
  return getErrorMessage(error) === message
}

/**
 * Type guard to check if value is an Error instance
 */
export function isError(error: unknown): error is Error {
  return error instanceof Error
}
