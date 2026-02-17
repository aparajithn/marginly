import { v4 as uuidv4 } from 'uuid'
import { User } from './types'
import { setCurrentUser, getCurrentUser } from './storage'

type StoredUser = { id: string; email: string; name: string; createdAt: string; passwordHash: string }

function getUserByEmail(email: string): StoredUser | undefined {
  if (typeof window === 'undefined') return undefined
  const users: StoredUser[] = JSON.parse(localStorage.getItem('marginly_users') || '[]')
  return users.find(u => u.email.toLowerCase() === email.toLowerCase())
}

// Simple hash for demo purposes (not production-safe)
function hashPassword(password: string): string {
  let hash = 0
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return hash.toString(16)
}

interface AuthResult {
  success: boolean
  user?: User
  error?: string
}

export function register(email: string, password: string, name: string): AuthResult {
  const existing = getUserByEmail(email)
  if (existing) {
    return { success: false, error: 'An account with this email already exists.' }
  }

  if (password.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters.' }
  }

  const user: User = {
    id: uuidv4(),
    email,
    name,
    createdAt: new Date().toISOString(),
  }

  // Store user with hashed password
  const userWithHash = { ...user, passwordHash: hashPassword(password) }
  if (typeof window !== 'undefined') {
    const users = JSON.parse(localStorage.getItem('marginly_users') || '[]')
    users.push(userWithHash)
    localStorage.setItem('marginly_users', JSON.stringify(users))
  }

  setCurrentUser(user)
  return { success: true, user }
}

export function login(email: string, password: string): AuthResult {
  if (typeof window === 'undefined') return { success: false, error: 'Server error' }

  const users: StoredUser[] = JSON.parse(localStorage.getItem('marginly_users') || '[]')
  const userWithHash = users.find(u => u.email.toLowerCase() === email.toLowerCase())

  if (!userWithHash) {
    return { success: false, error: 'No account found with this email.' }
  }

  if (userWithHash.passwordHash !== hashPassword(password)) {
    return { success: false, error: 'Incorrect password.' }
  }

  const user: User = {
    id: userWithHash.id,
    email: userWithHash.email,
    name: userWithHash.name,
    createdAt: userWithHash.createdAt,
  }

  setCurrentUser(user)
  return { success: true, user }
}

export function logout(): void {
  setCurrentUser(null)
}

export function getUser(): User | null {
  return getCurrentUser()
}
