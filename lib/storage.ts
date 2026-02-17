import { createClient } from '@/lib/supabase/client'
import { Client, TeamMember, TimeEntry } from './types'

// ─── Clients ──────────────────────────────────────────────────────────────────

export async function getClients(userId: string): Promise<Client[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })

  if (error || !data) return []

  return data.map(row => ({
    id: row.id,
    userId: row.user_id,
    name: row.name,
    monthlyRetainer: Number(row.monthly_retainer),
    color: row.color,
    isActive: row.is_active,
    createdAt: row.created_at,
  }))
}

export async function saveClient(client: Client): Promise<void> {
  const supabase = createClient()
  await supabase.from('clients').upsert({
    id: client.id,
    user_id: client.userId,
    name: client.name,
    monthly_retainer: client.monthlyRetainer,
    color: client.color,
    is_active: client.isActive,
    created_at: client.createdAt,
  })
}

export async function deleteClient(id: string): Promise<void> {
  const supabase = createClient()
  await supabase.from('clients').delete().eq('id', id)
}

export async function getClientById(id: string): Promise<Client | undefined> {
  const supabase = createClient()
  const { data } = await supabase.from('clients').select('*').eq('id', id).single()
  if (!data) return undefined
  return {
    id: data.id,
    userId: data.user_id,
    name: data.name,
    monthlyRetainer: Number(data.monthly_retainer),
    color: data.color,
    isActive: data.is_active,
    createdAt: data.created_at,
  }
}

// ─── Team Members ─────────────────────────────────────────────────────────────

export async function getTeamMembers(userId: string): Promise<TeamMember[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('team_members')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })

  if (error || !data) return []

  return data.map(row => ({
    id: row.id,
    userId: row.user_id,
    name: row.name,
    costRate: Number(row.cost_rate),
    isActive: row.is_active,
    createdAt: row.created_at,
  }))
}

export async function saveTeamMember(member: TeamMember): Promise<void> {
  const supabase = createClient()
  await supabase.from('team_members').upsert({
    id: member.id,
    user_id: member.userId,
    name: member.name,
    cost_rate: member.costRate,
    is_active: member.isActive,
    created_at: member.createdAt,
  })
}

export async function deleteTeamMember(id: string): Promise<void> {
  const supabase = createClient()
  await supabase.from('team_members').delete().eq('id', id)
}

// ─── Time Entries ─────────────────────────────────────────────────────────────

export async function getTimeEntries(userId: string): Promise<TimeEntry[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('time_entries')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })

  if (error || !data) return []

  return data.map(row => ({
    id: row.id,
    userId: row.user_id,
    clientId: row.client_id,
    teamMemberId: row.team_member_id,
    date: row.date,
    hours: Number(row.hours),
    note: row.note || '',
    createdAt: row.created_at,
  }))
}

export async function saveTimeEntry(entry: TimeEntry): Promise<void> {
  const supabase = createClient()
  await supabase.from('time_entries').upsert({
    id: entry.id,
    user_id: entry.userId,
    client_id: entry.clientId,
    team_member_id: entry.teamMemberId,
    date: entry.date,
    hours: entry.hours,
    note: entry.note,
    created_at: entry.createdAt,
  })
}

export async function deleteTimeEntry(id: string): Promise<void> {
  const supabase = createClient()
  await supabase.from('time_entries').delete().eq('id', id)
}

export async function getTimeEntriesByClient(userId: string, clientId: string): Promise<TimeEntry[]> {
  const entries = await getTimeEntries(userId)
  return entries.filter(e => e.clientId === clientId)
}

// ─── Seed Demo Data ───────────────────────────────────────────────────────────

export async function seedDemoData(userId: string): Promise<void> {
  const { v4: uuidv4 } = await import('uuid')
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()

  const clientsData: Client[] = [
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

  const membersData: TeamMember[] = [
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

  await Promise.all(clientsData.map(c => saveClient(c)))
  await Promise.all(membersData.map(m => saveTeamMember(m)))

  const days = [3, 5, 7, 9, 11, 13, 15]
  const entries: TimeEntry[] = []

  days.forEach(day => {
    entries.push({
      id: uuidv4(), userId, clientId: clientsData[0].id,
      teamMemberId: membersData[0].id,
      date: new Date(year, month, day).toISOString().split('T')[0],
      hours: 4, note: 'SEO optimization', createdAt: new Date().toISOString()
    })
    entries.push({
      id: uuidv4(), userId, clientId: clientsData[1].id,
      teamMemberId: membersData[1].id,
      date: new Date(year, month, day).toISOString().split('T')[0],
      hours: 3, note: 'PPC campaign management', createdAt: new Date().toISOString()
    })
    entries.push({
      id: uuidv4(), userId, clientId: clientsData[2].id,
      teamMemberId: membersData[2].id,
      date: new Date(year, month, day).toISOString().split('T')[0],
      hours: 5, note: 'Social media content', createdAt: new Date().toISOString()
    })
  })

  await Promise.all(entries.map(e => saveTimeEntry(e)))
}
