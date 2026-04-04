import { describe, it, expect } from 'vitest'
import { isNotFoundError } from './errors'

describe('isNotFoundError', () => {
  it('returns true for an object with status 404', () => {
    expect(isNotFoundError({ status: 404 })).toBe(true)
  })

  it('returns true for PocketBase-like ClientResponseError with status 404', () => {
    expect(isNotFoundError({ status: 404, message: 'The requested resource was not found.' })).toBe(true)
  })

  it('returns false for status 500', () => {
    expect(isNotFoundError({ status: 500 })).toBe(false)
  })

  it('returns false for status 401', () => {
    expect(isNotFoundError({ status: 401 })).toBe(false)
  })

  it('returns false for a generic Error', () => {
    expect(isNotFoundError(new Error('Not found'))).toBe(false)
  })

  it('returns false for null', () => {
    expect(isNotFoundError(null)).toBe(false)
  })

  it('returns false for undefined', () => {
    expect(isNotFoundError(undefined)).toBe(false)
  })

  it('returns false for a string', () => {
    expect(isNotFoundError('not found')).toBe(false)
  })

  it('returns false for a number', () => {
    expect(isNotFoundError(404)).toBe(false)
  })
})
