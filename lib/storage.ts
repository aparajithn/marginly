import { v4 as uuidv4 } from 'uuid'
import { Client, TeamMember, TimeEntry, User } from './types'

const KEYS = {
  USERS: 'marginly_users',
  CURRENT_USER: 'marginly_current_user',
  CLIENTS: 'marginly_clients',
  TEAM_MEMBERS: 'marginly_team_members',
  TIME_ENTRIES: 'marginly_time_entries',
}

function getItem<T>(key: string): T[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function setItem<T>(key: string, data: T[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(key, JSON.stringify(data))
}

// Users
export function getUsers(): User[] {
  return getItem<User>(KEYS.USERS)
}

export function saveUser(user: User): void {
  const users = getUsers()
  const idx = users.findIndex(u => u.id === user.id)
  if (idx >= 0) {
    users[idx] = user
  } else {
    users.push(user)
  }
  setItem(KEYS.USERS, users)
}

export function getUserByEmail(email: string): User | undefined {
  return getUsers().find(u => u.email.toLowerCase() === email.toLowerCase())
}

export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(KEYS.CURRENT_USER)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function setCurrentUser(user: User | null): void {
  if (typeof window === 'undefined') return
  if (user) {
    localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user))
  } else {
    localStorage.removeItem(KEYS.CURRENT_USER)
  }
}

// Clients
export function getClients(userId: string): Client[] {
  return getItem<Client>(KEYS.CLIENTS).filter(c => c.userId === userId)
}

export function saveClient(client: Client): void {
  const all = getItem<Client>(KEYS.CLIENTS)
  const idx = all.findIndex(c => c.id === client.id)
  if (idx >= 0) {
    all[idx] = client
  } else {
    all.push(client)
  }
  setItem(KEYS.CLIENTS, all)
}

export function deleteClient(id: string): void {
  const all = getItem<Client>(KEYS.CLIENTS).filter(c => c.id !== id)
  setItem(KEYS.CLIENTS, all)
}

export function getClientById(id: string): Client | undefined {
  return getItem<Client>(KEYS.CLIENTS).find(c => c.id === id)
}

// Team Members
export function getTeamMembers(userId: string): TeamMember[] {
  return getItem<TeamMember>(KEYS.TEAM_MEMBERS).filter(m => m.userId === userId)
}

export function saveTeamMember(member: TeamMember): void {
  const all = getItem<TeamMember>(KEYS.TEAM_MEMBERS)
  const idx = all.findIndex(m => m.id === member.id)
  if (idx >= 0) {
    all[idx] = member
  } else {
    all.push(member)
  }
  setItem(KEYS.TEAM_MEMBERS, all)
}

export function deleteTeamMember(id: string): void {
  const all = getItem<TeamMember>(KEYS.TEAM_MEMBERS).filter(m => m.id !== id)
  setItem(KEYS.TEAM_MEMBERS, all)
}

// Time Entries
export function getTimeEntries(userId: string): TimeEntry[] {
  return getItem<TimeEntry>(KEYS.TIME_ENTRIES).filter(e => e.userId === userId)
}

export function saveTimeEntry(entry: TimeEntry): void {
  const all = getItem<TimeEntry>(KEYS.TIME_ENTRIES)
  const idx = all.findIndex(e => e.id === entry.id)
  if (idx >= 0) {
    all[idx] = entry
  } else {
    all.push(entry)
  }
  setItem(KEYS.TIME_ENTRIES, all)
}

export function deleteTimeEntry(id: string): void {
  const all = getItem<TimeEntry>(KEYS.TIME_ENTRIES).filter(e => e.id !== id)
  setItem(KEYS.TIME_ENTRIES, all)
}

export function getTimeEntriesByClient(userId: string, clientId: string): TimeEntry[] {
  return getTimeEntries(userId).filter(e => e.clientId === clientId)
}

// Seed demo data
export function seedDemoData(userId: string): void {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()

  const clients: Client[] = [
    {
      id: uuidv4(), userId, name: 'Acme Corp', monthlyRetainer: 8000,
      color: '#6366f1', isActive: true, createdAt: new Date().toISOString()
    },
    {
      id: uuidv4(), userId, name: 'TechStart Inc', monthlyRetainer: 5000,
      color: '#10b981', isActive: true, createdAt: new Date().toISOString()
    },
    {
      id: uuidv4(), userId, name: 'Local Bistro', monthlyRetainer: 2500,
      color: '#f59e0b', isActive: true, createdAt: new Date().toISOString()
    },
  ]

  const members: TeamMember[] = [
    {
      id: uuidv4(), userId, name: 'Alex Rivera', costRate: 65,
      isActive: true, createdAt: new Date().toISOString()
    },
    {
      id: uuidv4(), userId, name: 'Sam Chen', costRate: 85,
      isActive: true, createdAt: new Date().toISOString()
    },
    {
      id: uuidv4(), userId, name: 'Jordan Blake', costRate: 45,
      isActive: true, createdAt: new Date().toISOString()
    },
  ]

  clients.forEach(c => saveClient(c))
  members.forEach(m => saveTeamMember(m))

  const entries: TimeEntry[] = []
  const days = [3, 5, 7, 9, 11, 13, 15]
  days.forEach(day => {
    entries.push({
      id: uuidv4(), userId, clientId: clients[0].id,
      teamMemberId: members[0].id,
      date: new Date(year, month, day).toISOString().split('T')[0],
      hours: 4, note: 'SEO optimization', createdAt: new Date().toISOString()
    })
    entries.push({
      id: uuidv4(), userId, clientId: clients[1].id,
      teamMemberId: members[1].id,
      date: new Date(year, month, day).toISOString().split('T')[0],
      hours: 3, note: 'PPC campaign management', createdAt: new Date().toISOString()
    })
    entries.push({
      id: uuidv4(), userId, clientId: clients[2].id,
      teamMemberId: members[2].id,
      date: new Date(year, month, day).toISOString().split('T')[0],
      hours: 5, note: 'Social media content', createdAt: new Date().toISOString()
    })
  })

  entries.forEach(e => saveTimeEntry(e))
}
