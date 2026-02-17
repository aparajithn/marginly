'use client'

import { useState, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { Plus, Trash2, Clock, X, Filter, Calendar } from 'lucide-react'
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns'
import { getUser } from '@/lib/auth'
import { getClients, getTeamMembers, getTimeEntries, saveTimeEntry, deleteTimeEntry } from '@/lib/storage'
import { Client, TeamMember, TimeEntry } from '@/lib/types'
import { formatCurrency } from '@/lib/calculations'

const today = new Date().toISOString().split('T')[0]

const defaultForm = {
  clientId: '',
  teamMemberId: '',
  date: today,
  hours: '',
  note: '',
}

export default function TimeEntriesPage() {
  const [entries, setEntries] = useState<TimeEntry[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [members, setMembers] = useState<TeamMember[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(defaultForm)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [filterClient, setFilterClient] = useState<string>('')
  const [filterMember, setFilterMember] = useState<string>('')
  const [userId, setUserId] = useState<string>('')

  useEffect(() => {
    const user = getUser()
    if (!user) return
    setUserId(user.id)
    setClients(getClients(user.id).filter(c => c.isActive))
    setMembers(getTeamMembers(user.id).filter(m => m.isActive))
    setEntries(getTimeEntries(user.id))
  }, [])

  const refresh = (uid = userId) => setEntries(getTimeEntries(uid))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const hours = parseFloat(form.hours)
    if (!form.clientId || !form.teamMemberId || isNaN(hours) || hours <= 0) return

    const entry: TimeEntry = {
      id: uuidv4(),
      userId,
      clientId: form.clientId,
      teamMemberId: form.teamMemberId,
      date: form.date,
      hours,
      note: form.note.trim(),
      createdAt: new Date().toISOString(),
    }

    saveTimeEntry(entry)
    refresh()
    setForm(f => ({ ...defaultForm, clientId: f.clientId, teamMemberId: f.teamMemberId }))
    setShowForm(false)
  }

  const handleDelete = (id: string) => {
    deleteTimeEntry(id)
    refresh()
    setDeleteConfirm(null)
  }

  const clientMap = new Map(clients.map(c => [c.id, c]))
  const memberMap = new Map(members.map(m => [m.id, m]))

  // Apply filters and sort by date desc
  const filtered = entries
    .filter(e => !filterClient || e.clientId === filterClient)
    .filter(e => !filterMember || e.teamMemberId === filterMember)
    .sort((a, b) => b.date.localeCompare(a.date))

  // Group by month
  const grouped: Record<string, TimeEntry[]> = {}
  filtered.forEach(e => {
    const key = e.date.substring(0, 7) // YYYY-MM
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(e)
  })

  // This month summary
  const now = new Date()
  const thisMonth = entries.filter(e => {
    const d = parseISO(e.date)
    return isWithinInterval(d, { start: startOfMonth(now), end: endOfMonth(now) })
  })
  const thisMonthHours = thisMonth.reduce((sum, e) => sum + e.hours, 0)
  const thisMonthCost = thisMonth.reduce((sum, e) => {
    const m = memberMap.get(e.teamMemberId)
    return sum + (m ? e.hours * m.costRate : 0)
  }, 0)

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Time Entries</h1>
          <p className="text-gray-500 mt-1">
            {thisMonthHours.toFixed(1)} hours this month · {formatCurrency(thisMonthCost)} cost
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Log Time
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Log Time</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Client *</label>
                <select
                  value={form.clientId}
                  onChange={e => setForm(f => ({ ...f, clientId: e.target.value }))}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
                >
                  <option value="">Select client...</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Team Member *</label>
                <select
                  value={form.teamMemberId}
                  onChange={e => setForm(f => ({ ...f, teamMemberId: e.target.value }))}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
                >
                  <option value="">Select team member...</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id}>{m.name} ({formatCurrency(m.costRate)}/hr)</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Date *</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Hours *</label>
                  <input
                    type="number"
                    value={form.hours}
                    onChange={e => setForm(f => ({ ...f, hours: e.target.value }))}
                    placeholder="2.5"
                    required
                    min="0.1"
                    step="0.25"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Note</label>
                <input
                  type="text"
                  value={form.note}
                  onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
                  placeholder="e.g. SEO keyword research, client call..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>

              {/* Cost preview */}
              {form.teamMemberId && form.hours && parseFloat(form.hours) > 0 && (
                <div className="bg-indigo-50 rounded-xl p-3 text-sm">
                  <span className="text-indigo-600 font-medium">Cost: </span>
                  <span className="text-indigo-800 font-bold">
                    {formatCurrency(
                      (memberMap.get(form.teamMemberId)?.costRate || 0) * parseFloat(form.hours)
                    )}
                  </span>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700"
                >
                  Log Time
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Filters */}
      {entries.length > 0 && (
        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={filterClient}
            onChange={e => setFilterClient(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Clients</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select
            value={filterMember}
            onChange={e => setFilterMember(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Members</option>
            {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
          {(filterClient || filterMember) && (
            <button
              onClick={() => { setFilterClient(''); setFilterMember('') }}
              className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1"
            >
              <X className="w-3 h-3" /> Clear
            </button>
          )}
          <span className="ml-auto text-sm text-gray-400">{filtered.length} entries</span>
        </div>
      )}

      {/* Entries */}
      {entries.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="font-semibold text-gray-700 mb-2">No time entries yet</h3>
          <p className="text-gray-400 text-sm mb-4">Start logging time to track client profitability</p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700"
          >
            <Plus className="w-4 h-4" /> Log First Entry
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).sort(([a], [b]) => b.localeCompare(a)).map(([monthKey, monthEntries]) => {
            const monthDate = parseISO(`${monthKey}-01`)
            const monthHours = monthEntries.reduce((sum, e) => sum + e.hours, 0)
            const monthCost = monthEntries.reduce((sum, e) => {
              const m = memberMap.get(e.teamMemberId)
              return sum + (m ? e.hours * m.costRate : 0)
            }, 0)

            return (
              <div key={monthKey}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <h3 className="font-semibold text-gray-700 text-sm">
                      {format(monthDate, 'MMMM yyyy')}
                    </h3>
                  </div>
                  <div className="h-px flex-1 bg-gray-100" />
                  <span className="text-xs text-gray-400">
                    {monthHours.toFixed(1)}h · {formatCurrency(monthCost)}
                  </span>
                </div>

                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                  {monthEntries.map((entry, idx) => {
                    const client = clientMap.get(entry.clientId)
                    const member = memberMap.get(entry.teamMemberId)
                    const cost = member ? entry.hours * member.costRate : 0

                    return (
                      <div key={entry.id} className={`px-5 py-4 flex items-center gap-4 ${idx > 0 ? 'border-t border-gray-50' : ''}`}>
                        <div className="w-2 h-10 rounded-full shrink-0" style={{ backgroundColor: client?.color || '#6366f1' }} />

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="font-medium text-sm text-gray-900">{client?.name || 'Unknown'}</span>
                            <span className="text-gray-300 text-xs">·</span>
                            <span className="text-sm text-gray-500">{member?.name || 'Unknown'}</span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-gray-400">
                            <span>{format(parseISO(entry.date), 'MMM d, yyyy')}</span>
                            {entry.note && (
                              <>
                                <span>·</span>
                                <span className="truncate">{entry.note}</span>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <p className="text-sm font-semibold text-gray-900">{entry.hours}h</p>
                          <p className="text-xs text-gray-400">{formatCurrency(cost)}</p>
                        </div>

                        {deleteConfirm === entry.id ? (
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => handleDelete(entry.id)}
                              className="px-2 py-1 text-xs bg-red-100 text-red-600 rounded-lg hover:bg-red-200 font-medium"
                            >
                              Delete
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(entry.id)}
                            className="p-2 text-gray-300 hover:text-red-500 transition-colors shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
