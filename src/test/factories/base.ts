let counter = 0

/** Generates a unique string ID suitable for test entities */
export function generateId(): string {
  counter++
  return `test_${counter}_${Date.now().toString(36)}`
}

/** Resets the ID counter — call in test setup if deterministic IDs are needed */
export function resetIdCounter(): void {
  counter = 0
}

/** Merges default values with optional overrides to build a test entity */
export function buildEntity<T extends Record<string, unknown>>(
  defaults: T,
  overrides?: Partial<T>,
): T {
  return { ...defaults, ...overrides }
}

/** Builds a list of test entities using a builder function */
export function buildList<T>(
  builder: (overrides?: Partial<T>) => T,
  count: number,
  overrides?: Partial<T>,
): T[] {
  return Array.from({ length: count }, () => builder(overrides))
}
