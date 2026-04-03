import pb from './pb'

export async function login(email: string, password: string) {
  return pb.collection('users').authWithPassword(email, password)
}

export function logout() {
  pb.authStore.clear()
}

export function isAuthenticated(): boolean {
  return pb.authStore.isValid
}

export function getCurrentUser() {
  return pb.authStore.model
}

export function onAuthChange(
  callback: (token: string, model: Record<string, unknown> | null) => void,
) {
  return pb.authStore.onChange(callback)
}

export function getAuthToken(): string {
  return pb.authStore.token
}
