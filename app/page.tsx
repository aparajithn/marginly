'use client'

import Link from 'next/link'
import { TrendingUp, Clock, Users, AlertTriangle, CheckCircle, ArrowRight, BarChart3, DollarSign, Zap } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-lg">Marginly</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-600">
            <a href="#how-it-works" className="hover:text-indigo-600 transition-colors">How it works</a>
            <a href="#pricing" className="hover:text-indigo-600 transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              Log in
            </Link>
            <Link
              href="/register"
              className="bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              Start Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 text-sm px-4 py-2 rounded-full mb-8 font-medium">
            <Zap className="w-4 h-4" />
            Real-time margin visibility for agencies
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
            Stop Discovering You Lost{' '}
            <span className="text-indigo-600">Money on Clients</span>{' '}
            Last Month
          </h1>
          <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
            Marginly shows agency owners their real profit margin per client — in real-time, not at month-end. No more VLOOKUP spreadsheets.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-xl hover:bg-indigo-700 transition-all font-semibold text-lg shadow-lg shadow-indigo-200"
            >
              Start Free — No Credit Card
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-8 py-4 rounded-xl hover:bg-gray-200 transition-all font-semibold text-lg"
            >
              View Demo →
            </Link>
          </div>
          <p className="mt-4 text-sm text-gray-400">14-day trial · No credit card · 2 min setup</p>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-8 border border-indigo-100">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { name: 'Acme Corp', revenue: '$8,000', spent: '$4,200', margin: '$3,800', pct: '47.5%', color: '#6366f1', risk: false },
                { name: 'TechStart Inc', revenue: '$5,000', spent: '$4,100', margin: '$900', pct: '18%', color: '#ef4444', risk: true },
                { name: 'Local Bistro', revenue: '$2,500', spent: '$950', margin: '$1,550', pct: '62%', color: '#10b981', risk: false },
              ].map(client => (
                <div key={client.name} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: client.color }} />
                      <span className="font-semibold text-sm text-gray-900">{client.name}</span>
                    </div>
                    {client.risk && (
                      <span className="flex items-center gap-1 text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full font-medium">
                        <AlertTriangle className="w-3 h-3" />
                        At Risk
                      </span>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Revenue</span><span className="font-medium text-gray-900">{client.revenue}</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Spent</span><span className="font-medium text-gray-900">{client.spent}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between text-sm">
                      <span className="font-semibold text-gray-700">Margin</span>
                      <div className="text-right">
                        <span className={`font-bold ${client.risk ? 'text-red-600' : 'text-emerald-600'}`}>{client.margin}</span>
                        <span className="text-xs text-gray-400 ml-1">({client.pct})</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Up and running in minutes</h2>
            <p className="text-lg text-gray-500">No complex setup. No data migrations. Just clarity.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { icon: Users, step: '01', title: 'Add your team', desc: 'Enter each team member and their hourly cost rate' },
              { icon: DollarSign, step: '02', title: 'Add clients', desc: 'Set each client\'s monthly retainer amount' },
              { icon: Clock, step: '03', title: 'Log time', desc: 'Quickly log who worked on what and for how long' },
              { icon: BarChart3, step: '04', title: 'See your margins', desc: 'Real-time profit margin per client, automatically calculated' },
            ].map(({ icon: Icon, step, title, desc }) => (
              <div key={step} className="text-center p-6 bg-white rounded-xl border border-gray-100 shadow-sm">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-6 h-6 text-indigo-600" />
                </div>
                <div className="text-xs font-bold text-indigo-400 mb-2">STEP {step}</div>
                <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Know before it's too late</h2>
              <div className="space-y-4">
                {[
                  { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-50', title: 'Burn-rate warnings', desc: 'Get alerted when a client\'s projected end-of-month margin drops below 30%' },
                  { icon: BarChart3, color: 'text-indigo-500', bg: 'bg-indigo-50', title: 'Per-client profitability', desc: 'See revenue, cost, and margin for every client — for the current month' },
                  { icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-50', title: 'Projections', desc: 'Day-by-day burn rate extrapolated to end-of-month so you can course-correct' },
                  { icon: CheckCircle, color: 'text-blue-500', bg: 'bg-blue-50', title: 'Simple to use', desc: 'Built for owners, not accountants. No training required.' },
                ].map(({ icon: Icon, color, bg, title, desc }) => (
                  <div key={title} className="flex gap-4">
                    <div className={`w-10 h-10 ${bg} rounded-lg flex items-center justify-center shrink-0`}>
                      <Icon className={`w-5 h-5 ${color}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
                      <p className="text-sm text-gray-500">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-white">
              <div className="text-xs text-gray-400 mb-4 font-mono">MONTHLY SUMMARY</div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-300 text-sm">Total Revenue</span>
                  <span className="font-bold text-white">$15,500</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300 text-sm">Total Spent</span>
                  <span className="font-bold text-red-400">$9,250</span>
                </div>
                <div className="border-t border-gray-700 pt-3 flex justify-between">
                  <span className="text-gray-300 text-sm font-semibold">Net Margin</span>
                  <span className="font-bold text-emerald-400 text-lg">$6,250 (40.3%)</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-700">
                <div className="flex items-center gap-2 text-amber-400">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm font-medium">1 client at risk this month</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Simple, transparent pricing</h2>
            <p className="text-lg text-gray-500">One price. All features. No surprises.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: 'Solo',
                price: '$29',
                period: '/month',
                desc: 'Perfect for freelancers and solo consultants',
                features: ['1 user', 'Up to 10 clients', 'Unlimited time entries', 'Profitability dashboard', 'Burn-rate warnings'],
                cta: 'Start Free Trial',
                highlighted: false,
              },
              {
                name: 'Team',
                price: '$59',
                period: '/month',
                desc: 'For growing agencies with multiple people',
                features: ['Up to 5 users', 'Unlimited clients', 'Everything in Solo', 'Team cost tracking', 'Export to CSV'],
                cta: 'Start Free Trial',
                highlighted: true,
              },
              {
                name: 'Studio',
                price: '$99',
                period: '/month',
                desc: 'For established agencies managing many clients',
                features: ['Unlimited users', 'Unlimited clients', 'Everything in Team', 'Priority support', 'API access'],
                cta: 'Start Free Trial',
                highlighted: false,
              },
            ].map(plan => (
              <div
                key={plan.name}
                className={`rounded-2xl p-8 border ${plan.highlighted
                  ? 'bg-indigo-600 border-indigo-500 text-white shadow-xl shadow-indigo-200 scale-105'
                  : 'bg-white border-gray-200 text-gray-900'
                }`}
              >
                <div className={`text-sm font-semibold mb-2 ${plan.highlighted ? 'text-indigo-200' : 'text-indigo-600'}`}>
                  {plan.highlighted && <span className="bg-white text-indigo-600 text-xs px-2 py-0.5 rounded-full mr-2">POPULAR</span>}
                  {plan.name}
                </div>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className={`text-sm ${plan.highlighted ? 'text-indigo-200' : 'text-gray-400'}`}>{plan.period}</span>
                </div>
                <p className={`text-sm mb-6 ${plan.highlighted ? 'text-indigo-200' : 'text-gray-500'}`}>{plan.desc}</p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <CheckCircle className={`w-4 h-4 shrink-0 ${plan.highlighted ? 'text-indigo-200' : 'text-indigo-500'}`} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register"
                  className={`block text-center py-3 px-6 rounded-xl font-semibold transition-all ${plan.highlighted
                    ? 'bg-white text-indigo-600 hover:bg-indigo-50'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-gray-400 mt-6">All plans include a 14-day free trial. No credit card required.</p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Ready to know your real margins?
          </h2>
          <p className="text-xl text-gray-500 mb-8">
            Join hundreds of agency owners who stopped guessing and started knowing.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-xl hover:bg-indigo-700 transition-all font-semibold text-lg shadow-lg shadow-indigo-200"
          >
            Start Free — 14 Day Trial
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-indigo-600 rounded-md flex items-center justify-center">
              <TrendingUp className="w-3 h-3 text-white" />
            </div>
            <span className="font-bold text-gray-900">Marginly</span>
          </div>
          <p className="text-sm text-gray-400">© 2026 Marginly. Built for agency owners who want to be profitable.</p>
        </div>
      </footer>
    </div>
  )
}
