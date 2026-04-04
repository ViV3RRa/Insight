/**
 * Check if an error is a PocketBase "not found" (404) error.
 * PocketBase throws ClientResponseError with a `status` property.
 * Only these errors should be swallowed in catch blocks that expect
 * a record to potentially not exist.
 */
export function isNotFoundError(error: unknown): boolean {
  return (
    error != null &&
    typeof error === 'object' &&
    'status' in error &&
    (error as { status: number }).status === 404
  )
}
