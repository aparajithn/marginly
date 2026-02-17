import { createClient } from '@/lib/supabase/client'
import { User } from './types'

export interface AuthResult {
  success: boolean
  user?: User
  error?: string
}

export async function register(email: string, password: string, name: string): Promise<AuthResult> {
  const supabase = createClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
    },
  })

  if (error || !data.user) {
    return { success: false, error: error?.message || 'Registration failed' }
  }

  // Create profile
  await supabase.from('profiles').upsert({
    id: data.user.id,
    email: data.user.email!,
    name,
  })

  const user: User = {
    id: data.user.id,
    email: data.user.email!,
    name,
    createdAt: data.user.created_at,
  }

  return { success: true, user }
}

export async function login(email: string, password: string): Promise<AuthResult> {
  const supabase = createClient()

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error || !data.user) {
    return { success: false, error: error?.message || 'Login failed' }
  }

  const name = data.user.user_metadata?.name || email.split('@')[0]
  const user: User = {
    id: data.user.id,
    email: data.user.email!,
    name,
    createdAt: data.user.created_at,
  }

  return { success: true, user }
}

export async function logout(): Promise<void> {
  const supabase = createClient()
  await supabase.auth.signOut()
}

export async function getUser(): Promise<User | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  return {
    id: user.id,
    email: user.email!,
    name: user.user_metadata?.name || user.email!.split('@')[0],
    createdAt: user.created_at,
  }
}
