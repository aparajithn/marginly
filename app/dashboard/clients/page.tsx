'use client'

import { useState, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { Plus, Edit2, Trash2, Users, ToggleLeft, ToggleRight, X, Check } from 'lucide-react'
import { getUser } from '@/lib/auth'
import { getClients, saveClient, deleteClient } from '@/lib/storage'
import { Client } from '@/lib/types'
import { formatCurrency } from '@/lib/calculations'

const COLOR_PRESETS = [
  '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#06b6d4', '#f97316', '#ec4899', '#14b8a6', '#84cc16'
]

const defaultForm = {
  name: '',
  monthlyRetainer: '',
  color: '#6366f1',
  isActive: true,
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(defaultForm)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [userId, setUserId] = useState<string>('')

  useEffect(() => {
    const user = getUser()
    if (!user) return
    setUserId(user.id)
    setClients(getClients(user.id))
  }, [])

  const refresh = () => setClients(getClients(userId))

  const openCreate = () => {
    setForm(defaultForm)
    setEditingId(null)
    setShowForm(true)
  }

  const openEdit = (client: Client) => {
    setForm({
      name: client.name,
      monthlyRetainer: client.monthlyRetainer.toString(),
      color: client.color,
      isActive: client.isActive,
    })
    setEditingId(client.id)
    setShowForm(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const retainer = parseFloat(form.monthlyRetainer)
    if (isNaN(retainer) || retainer <= 0) return

    const client: Client = {
      id: editingId || uuidv4(),
      userId,
      name: form.name.trim(),
      monthlyRetainer: retainer,
      color: form.color,
      isActive: form.isActive,
      createdAt: editingId
        ? (clients.find(c => c.id === editingId)?.createdAt || new Date().toISOString())
        : new Date().toISOString(),
    }

    saveClient(client)
    refresh()
    setShowForm(false)
    setEditingId(null)
  }

  const handleDelete = (id: string) => {
    deleteClient(id)
    refresh()
    setDeleteConfirm(null)
  }

  const toggleActive = (client: Client) => {
    saveClient({ ...client, isActive: !client.isActive })
    refresh()
  }

  const activeClients = clients.filter(c => c.isActive)
  const inactiveClients = clients.filter(c => !c.isActive)

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
          <p className="text-gray-500 mt-1">{activeClients.length} active · {inactiveClients.length} inactive</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Client
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingId ? 'Edit Client' : 'Add Client'}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Client Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Acme Corp"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Monthly Retainer ($) *</label>
                <input
                  type="number"
                  value={form.monthlyRetainer}
                  onChange={e => setForm(f => ({ ...f, monthlyRetainer: e.target.value }))}
                  placeholder="5000"
                  required
                  min="1"
                  step="0.01"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Color Tag</label>
                <div className="flex flex-wrap gap-2">
                  {COLOR_PRESETS.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, color }))}
                      className="w-8 h-8 rounded-full transition-transform hover:scale-110 relative"
                      style={{ backgroundColor: color }}
                    >
                      {form.color === color && (
                        <Check className="w-4 h-4 text-white absolute inset-0 m-auto" />
                      )}
                    </button>
                  ))}
                </div>
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
                  {editingId ? 'Save Changes' : 'Add Client'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Client List */}
      {clients.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="font-semibold text-gray-700 mb-2">No clients yet</h3>
          <p className="text-gray-400 text-sm mb-4">Add your first client to get started</p>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700"
          >
            <Plus className="w-4 h-4" /> Add Client
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {clients.map(client => (
            <div key={client.id} className={`bg-white rounded-xl border ${!client.isActive ? 'border-gray-100 opacity-60' : 'border-gray-100'} shadow-sm p-5`}>
              <div className="flex items-center gap-4">
                <div className="w-4 h-12 rounded-full shrink-0" style={{ backgroundColor: client.color }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">{client.name}</h3>
                    {!client.isActive && (
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Inactive</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    {formatCurrency(client.monthlyRetainer)}/month retainer
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => toggleActive(client)}
                    className="p-2 text-gray-400 hover:text-indigo-600 transition-colors rounded-lg hover:bg-indigo-50"
                    title={client.isActive ? 'Deactivate' : 'Activate'}
                  >
                    {client.isActive ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={() => openEdit(client)}
                    className="p-2 text-gray-400 hover:text-indigo-600 transition-colors rounded-lg hover:bg-indigo-50"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  {deleteConfirm === client.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDelete(client.id)}
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
                      onClick={() => setDeleteConfirm(client.id)}
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
    </div>
  )
}
