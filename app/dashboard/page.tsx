'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { AlertTriangle, TrendingUp, TrendingDown, DollarSign, Users, Clock, BarChart3 } from 'lucide-react'
import { getUser } from '@/lib/auth'
import { getClients, getTeamMembers, getTimeEntries } from '@/lib/storage'
import { calculateClientProfitability, calculateMonthlySummary, formatCurrency, formatPercent } from '@/lib/calculations'
import { ClientProfitability } from '@/lib/types'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function DashboardPage() {
  const [profitabilities, setProfitabilities] = useState<ClientProfitability[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<'margin' | 'revenue' | 'spent'>('margin')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  useEffect(() => {
    const user = getUser()
    if (!user) return

    const clients = getClients(user.id).filter(c => c.isActive)
    const teamMembers = getTeamMembers(user.id)
    const timeEntries = getTimeEntries(user.id)

    const profs = clients.map(client =>
      calculateClientProfitability(client, timeEntries, teamMembers)
    )

    setProfitabilities(profs)
    setLoading(false)
  }, [])

  const summary = calculateMonthlySummary(profitabilities)

  const sorted = [...profitabilities].sort((a, b) => {
    const aVal = sortBy === 'margin' ? a.marginPercent : sortBy === 'revenue' ? a.revenue : a.spent
    const bVal = sortBy === 'margin' ? b.marginPercent : sortBy === 'revenue' ? b.revenue : b.spent
    return sortDir === 'desc' ? bVal - aVal : aVal - bVal
  })

  const chartData = profitabilities.map(p => ({
    name: p.client.name.split(' ')[0],
    revenue: p.revenue,
    spent: p.spent,
    margin: Math.max(0, p.margin),
    color: p.client.color,
  }))

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-7xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">{format(new Date(), 'MMMM yyyy')} · Profitability Overview</p>
      </div>

      {/* At-risk alert */}
      {summary.atRiskCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
          <div>
            <span className="font-semibold text-amber-800">
              {summary.atRiskCount} client{summary.atRiskCount > 1 ? 's' : ''} at risk
            </span>
            <span className="text-amber-700 ml-2 text-sm">
              — projected to finish below 30% margin this month
            </span>
          </div>
        </div>
      )}

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Monthly Revenue',
            value: formatCurrency(summary.totalRevenue),
            icon: DollarSign,
            color: 'text-indigo-600',
            bg: 'bg-indigo-50',
          },
          {
            label: 'Total Spent',
            value: formatCurrency(summary.totalSpent),
            icon: Clock,
            color: 'text-orange-600',
            bg: 'bg-orange-50',
          },
          {
            label: 'Net Margin',
            value: `${formatCurrency(summary.totalMargin)} (${formatPercent(summary.overallMarginPercent)})`,
            icon: summary.totalMargin >= 0 ? TrendingUp : TrendingDown,
            color: summary.totalMargin >= 0 ? 'text-emerald-600' : 'text-red-600',
            bg: summary.totalMargin >= 0 ? 'bg-emerald-50' : 'bg-red-50',
          },
          {
            label: 'Active Clients',
            value: `${summary.clientCount}`,
            icon: Users,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
          },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</span>
              <div className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
            </div>
            <p className="text-lg font-bold text-gray-900">{value}</p>
          </div>
        ))}
      </div>

      {/* Profitability cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Client Profitability</h2>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>Sort by:</span>
            {(['margin', 'revenue', 'spent'] as const).map(key => (
              <button
                key={key}
                onClick={() => {
                  if (sortBy === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
                  else { setSortBy(key); setSortDir('desc') }
                }}
                className={`px-3 py-1 rounded-lg capitalize transition-colors ${sortBy === key ? 'bg-indigo-100 text-indigo-700 font-medium' : 'hover:bg-gray-100'}`}
              >
                {key} {sortBy === key && (sortDir === 'desc' ? '↓' : '↑')}
              </button>
            ))}
          </div>
        </div>

        {profitabilities.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
            <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-700 mb-2">No clients yet</h3>
            <p className="text-gray-400 text-sm mb-4">Add your first client to start tracking profitability</p>
            <a href="/dashboard/clients" className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">
              Add Client
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {sorted.map(prof => (
              <ProfitabilityCard key={prof.client.id} profitability={prof} />
            ))}
          </div>
        )}
      </div>

      {/* Chart */}
      {profitabilities.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Revenue vs. Cost by Client</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6b7280' }} />
              <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
              <Tooltip
                formatter={(value: number | string, name: string) => [formatCurrency(Number(value)), (name as string).charAt(0).toUpperCase() + (name as string).slice(1)]}
                contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }}
              />
              <Bar dataKey="revenue" name="Revenue" fill="#6366f1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="spent" name="Spent" fill="#f97316" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Summary table */}
      {profitabilities.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Monthly Summary</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 text-xs text-gray-500 font-medium uppercase tracking-wide">
                  <th className="text-left px-6 py-3">Client</th>
                  <th className="text-right px-6 py-3">Revenue</th>
                  <th className="text-right px-6 py-3">Spent</th>
                  <th className="text-right px-6 py-3">Margin $</th>
                  <th className="text-right px-6 py-3">Margin %</th>
                  <th className="text-right px-6 py-3">Hours</th>
                  <th className="text-center px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {sorted.map(prof => (
                  <tr key={prof.client.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: prof.client.color }} />
                        <span className="font-medium text-gray-900 text-sm">{prof.client.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-gray-700">{formatCurrency(prof.revenue)}</td>
                    <td className="px-6 py-4 text-right text-sm text-gray-700">{formatCurrency(prof.spent)}</td>
                    <td className={`px-6 py-4 text-right text-sm font-semibold ${prof.margin >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {formatCurrency(prof.margin)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`text-sm font-bold ${prof.marginPercent >= 30 ? 'text-emerald-600' : prof.marginPercent >= 0 ? 'text-amber-600' : 'text-red-600'}`}>
                        {formatPercent(prof.marginPercent)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-gray-500">{prof.hoursLogged.toFixed(1)}h</td>
                    <td className="px-6 py-4 text-center">
                      {prof.isAtRisk ? (
                        <span className="inline-flex items-center gap-1 bg-red-50 text-red-600 text-xs px-2 py-1 rounded-full font-medium">
                          <AlertTriangle className="w-3 h-3" /> At Risk
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-600 text-xs px-2 py-1 rounded-full font-medium">
                          ✓ On Track
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

function ProfitabilityCard({ profitability: p }: { profitability: ClientProfitability }) {
  const marginColor = p.marginPercent >= 40 ? 'text-emerald-600' : p.marginPercent >= 20 ? 'text-amber-600' : 'text-red-600'
  const burnBarColor = p.burnPercent > 80 ? 'bg-red-500' : p.burnPercent > 60 ? 'bg-amber-500' : 'bg-indigo-500'

  return (
    <div className={`bg-white rounded-xl border ${p.isAtRisk ? 'border-red-200' : 'border-gray-100'} shadow-sm p-5 relative overflow-hidden`}>
      {/* Color accent */}
      <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: p.client.color }} />

      {/* Header */}
      <div className="flex items-start justify-between mb-4 mt-1">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full shrink-0 mt-0.5" style={{ backgroundColor: p.client.color }} />
          <h3 className="font-semibold text-gray-900">{p.client.name}</h3>
        </div>
        {p.isAtRisk && (
          <span className="flex items-center gap-1 text-xs bg-red-50 text-red-600 px-2 py-1 rounded-full font-medium shrink-0">
            <AlertTriangle className="w-3 h-3" />
            At Risk
          </span>
        )}
      </div>

      {/* Stats */}
      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Revenue</span>
          <span className="font-medium text-gray-900">{formatCurrency(p.revenue)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Spent</span>
          <span className="font-medium text-gray-900">{formatCurrency(p.spent)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Hours</span>
          <span className="font-medium text-gray-900">{p.hoursLogged.toFixed(1)}h</span>
        </div>
      </div>

      {/* Margin */}
      <div className="border-t border-gray-100 pt-3">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-gray-700">Margin</span>
          <div className="text-right">
            <span className={`font-bold text-lg ${marginColor}`}>{formatCurrency(p.margin)}</span>
            <span className={`text-sm ml-1 ${marginColor}`}>({formatPercent(p.marginPercent)})</span>
          </div>
        </div>

        {/* Burn bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-gray-400">
            <span>Budget burn</span>
            <span>{formatPercent(p.burnPercent)}</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${burnBarColor}`}
              style={{ width: `${Math.min(100, p.burnPercent)}%` }}
            />
          </div>
        </div>

        {/* Projection */}
        {p.projectedEndOfMonthSpent > p.spent && (
          <div className="mt-2 text-xs text-gray-400">
            Projected EOM spend:{' '}
            <span className={p.isAtRisk ? 'text-red-500 font-medium' : 'text-gray-600'}>
              {formatCurrency(p.projectedEndOfMonthSpent)} ({formatPercent(p.projectedMarginPercent)} margin)
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
