import { http, HttpResponse } from 'msw'

/** Default MSW handlers for PocketBase endpoints */
export const handlers = [
  // Generic collection list — returns empty list
  http.get('/api/collections/:collection/records', () => {
    return HttpResponse.json({
      page: 1,
      perPage: 30,
      totalPages: 0,
      totalItems: 0,
      items: [],
    })
  }),

  // Auth with password — returns mock auth response
  http.post('/api/collections/users/auth-with-password', () => {
    return HttpResponse.json({
      token: 'mock-jwt-token',
      record: {
        id: 'user_001',
        email: 'test@example.com',
        name: 'Test User',
        created: '2026-01-01T00:00:00.000Z',
        updated: '2026-01-01T00:00:00.000Z',
      },
    })
  }),
]
