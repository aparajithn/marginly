'use client'

import { useState, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { Plus, Edit2, Trash2, UserCheck, X, ToggleLeft, ToggleRight } from 'lucide-react'
import { getUser } from '@/lib/auth'
import { getTeamMembers, saveTeamMember, deleteTeamMember } from '@/lib/storage'
import { TeamMember } from '@/lib/types'
import { formatCurrency } from '@/lib/calculations'

const defaultForm = {
  name: '',
  costRate: '',
  isActive: true,
}

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(defaultForm)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [userId, setUserId] = useState<string>('')

  useEffect(() => {
    const user = getUser()
    if (!user) return
    setUserId(user.id)
    setMembers(getTeamMembers(user.id))
  }, [])

  const refresh = () => setMembers(getTeamMembers(userId))

  const openCreate = () => {
    setForm(defaultForm)
    setEditingId(null)
    setShowForm(true)
  }

  const openEdit = (member: TeamMember) => {
    setForm({
      name: member.name,
      costRate: member.costRate.toString(),
      isActive: member.isActive,
    })
    setEditingId(member.id)
    setShowForm(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const rate = parseFloat(form.costRate)
    if (isNaN(rate) || rate <= 0) return

    const member: TeamMember = {
      id: editingId || uuidv4(),
      userId,
      name: form.name.trim(),
      costRate: rate,
      isActive: form.isActive,
      createdAt: editingId
        ? (members.find(m => m.id === editingId)?.createdAt || new Date().toISOString())
        : new Date().toISOString(),
    }

    saveTeamMember(member)
    refresh()
    setShowForm(false)
    setEditingId(null)
  }

  const handleDelete = (id: string) => {
    deleteTeamMember(id)
    refresh()
    setDeleteConfirm(null)
  }

  const toggleActive = (member: TeamMember) => {
    saveTeamMember({ ...member, isActive: !member.isActive })
    refresh()
  }

  const active = members.filter(m => m.isActive)
  const inactive = members.filter(m => !m.isActive)

  // Calculate avg cost rate
  const avgRate = active.length > 0
    ? active.reduce((sum, m) => sum + m.costRate, 0) / active.length
    : 0

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Members</h1>
          <p className="text-gray-500 mt-1">
            {active.length} active · avg {formatCurrency(avgRate)}/hr blended rate
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Member
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingId ? 'Edit Team Member' : 'Add Team Member'}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Alex Rivera"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Blended Cost Rate ($/hr) *</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                  <input
                    type="number"
                    value={form.costRate}
                    onChange={e => setForm(f => ({ ...f, costRate: e.target.value }))}
                    placeholder="65"
                    required
                    min="1"
                    step="0.01"
                    className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">/hr</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Include salary, benefits, overhead — all-in cost to your agency
                </p>
              </div>

              {editingId && (
                <div className="flex items-center gap-3">
                  <label className="text-sm font-medium text-gray-700">Active</label>
                  <button
                    type="button"
                    onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))}
                    className={`relative w-11 h-6 rounded-full transition-colors ${form.isActive ? 'bg-indigo-600' : 'bg-gray-200'}`}
                  >
                    <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.isActive ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </button>
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
                  {editingId ? 'Save Changes' : 'Add Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Members List */}
      {members.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <UserCheck className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="font-semibold text-gray-700 mb-2">No team members yet</h3>
          <p className="text-gray-400 text-sm mb-4">Add team members to track time costs accurately</p>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700"
          >
            <Plus className="w-4 h-4" /> Add Member
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {members.map(member => (
            <div key={member.id} className={`bg-white rounded-xl border border-gray-100 shadow-sm p-5 ${!member.isActive ? 'opacity-60' : ''}`}>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center shrink-0">
                  <span className="text-indigo-600 font-semibold text-sm">
                    {member.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">{member.name}</h3>
                    {!member.isActive && (
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Inactive</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    {formatCurrency(member.costRate)}/hr blended cost rate ·{' '}
                    {formatCurrency(member.costRate * 160)}/mo full-time equivalent
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => toggleActive(member)}
                    className="p-2 text-gray-400 hover:text-indigo-600 transition-colors rounded-lg hover:bg-indigo-50"
                    title={member.isActive ? 'Deactivate' : 'Activate'}
                  >
                    {member.isActive ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={() => openEdit(member)}
                    className="p-2 text-gray-400 hover:text-indigo-600 transition-colors rounded-lg hover:bg-indigo-50"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  {deleteConfirm === member.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDelete(member.id)}
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
                      onClick={() => setDeleteConfirm(member.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cost breakdown */}
      {active.length > 0 && (
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 p-6">
          <h2 className="text-sm font-semibold text-indigo-800 mb-3 uppercase tracking-wide">Cost Breakdown</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-indigo-600">Avg Blended Rate</p>
              <p className="text-2xl font-bold text-indigo-900">{formatCurrency(avgRate)}/hr</p>
            </div>
            <div>
              <p className="text-xs text-indigo-600">Max Monthly Cost</p>
              <p className="text-2xl font-bold text-indigo-900">{formatCurrency(avgRate * 160 * active.length)}</p>
              <p className="text-xs text-indigo-500">if all full-time</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
