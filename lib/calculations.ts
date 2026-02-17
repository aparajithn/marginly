import { Client, TeamMember, TimeEntry, ClientProfitability, MonthlySummary } from './types'
import { startOfMonth, endOfMonth, isWithinInterval, parseISO, getDaysInMonth, getDate } from 'date-fns'

export function calculateClientProfitability(
  client: Client,
  timeEntries: TimeEntry[],
  teamMembers: TeamMember[],
  month: Date = new Date()
): ClientProfitability {
  const start = startOfMonth(month)
  const end = endOfMonth(month)

  const memberMap = new Map(teamMembers.map(m => [m.id, m]))

  const monthEntries = timeEntries.filter(entry => {
    const entryDate = parseISO(entry.date)
    return isWithinInterval(entryDate, { start, end })
  })

  const clientEntries = monthEntries.filter(e => e.clientId === client.id)

  let spent = 0
  let hoursLogged = 0
  clientEntries.forEach(entry => {
    const member = memberMap.get(entry.teamMemberId)
    if (member) {
      spent += entry.hours * member.costRate
      hoursLogged += entry.hours
    }
  })

  const revenue = client.monthlyRetainer
  const margin = revenue - spent
  const marginPercent = revenue > 0 ? (margin / revenue) * 100 : 0

  // Burn rate projection
  const totalDays = getDaysInMonth(month)
  const daysPassed = Math.min(getDate(new Date()), totalDays)
  const burnRate = daysPassed > 0 ? spent / daysPassed : 0
  const projectedEndOfMonthSpent = burnRate * totalDays

  const projectedMargin = revenue - projectedEndOfMonthSpent
  const projectedMarginPercent = revenue > 0 ? (projectedMargin / revenue) * 100 : 0

  const burnPercent = revenue > 0 ? (spent / revenue) * 100 : 0

  // At risk if projected margin < 30% OR already negative
  const isAtRisk = projectedMarginPercent < 30 || marginPercent < 0

  return {
    client,
    revenue,
    spent,
    margin,
    marginPercent,
    hoursLogged,
    projectedEndOfMonthSpent,
    projectedMarginPercent,
    isAtRisk,
    burnPercent,
  }
}

export function calculateMonthlySummary(profitabilities: ClientProfitability[]): MonthlySummary {
  const totalRevenue = profitabilities.reduce((sum, p) => sum + p.revenue, 0)
  const totalSpent = profitabilities.reduce((sum, p) => sum + p.spent, 0)
  const totalMargin = totalRevenue - totalSpent
  const overallMarginPercent = totalRevenue > 0 ? (totalMargin / totalRevenue) * 100 : 0

  return {
    totalRevenue,
    totalSpent,
    totalMargin,
    overallMarginPercent,
    clientCount: profitabilities.length,
    atRiskCount: profitabilities.filter(p => p.isAtRisk).length,
  }
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`
}
