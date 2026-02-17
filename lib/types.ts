export interface User {
  id: string
  email: string
  name: string
  createdAt: string
}

export interface Client {
  id: string
  userId: string
  name: string
  monthlyRetainer: number
  color: string
  isActive: boolean
  createdAt: string
}

export interface TeamMember {
  id: string
  userId: string
  name: string
  costRate: number
  isActive: boolean
  createdAt: string
}

export interface TimeEntry {
  id: string
  userId: string
  clientId: string
  teamMemberId: string
  date: string
  hours: number
  note: string
  createdAt: string
}

export interface ClientProfitability {
  client: Client
  revenue: number
  spent: number
  margin: number
  marginPercent: number
  hoursLogged: number
  projectedEndOfMonthSpent: number
  projectedMarginPercent: number
  isAtRisk: boolean
  burnPercent: number
}

export interface MonthlySummary {
  totalRevenue: number
  totalSpent: number
  totalMargin: number
  overallMarginPercent: number
  clientCount: number
  atRiskCount: number
}
