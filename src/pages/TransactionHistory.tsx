// T081, T083, T086: TransactionHistory page — todas as movimentações com filtro de data

import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCashStore } from '@/store/cashStore'
import { Header } from '@/components/layout/Header'
import { Container } from '@/components/layout/Container'
import { BottomNav } from '@/components/layout/BottomNav'
import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import { TransactionList } from '@/components/cash/TransactionList'
import { DateRangeFilter, type DateRange } from '@/components/cash/DateRangeFilter'

function isoFirstOfMonth(): string {
  const d = new Date()
  d.setDate(1)
  return d.toISOString().split('T')[0]
}

function isoLastOfMonth(): string {
  const d = new Date()
  d.setMonth(d.getMonth() + 1, 0)
  return d.toISOString().split('T')[0]
}

export function TransactionHistory() {
  const navigate = useNavigate()
  const { transactions, loading, loadTransactions } = useCashStore()

  // T083: default = este mês
  const [range, setRange] = useState<DateRange>({
    startDate: isoFirstOfMonth(),
    endDate: isoLastOfMonth(),
  })

  useEffect(() => {
    loadTransactions()
  }, [loadTransactions])

  // T083: filter in-memory (store always has all transactions after loadTransactions)
  const filtered = useMemo(() => {
    const start = new Date(range.startDate + 'T00:00:00')
    const end   = new Date(range.endDate   + 'T23:59:59')
    return transactions.filter(t => t.createdAt >= start && t.createdAt <= end)
  }, [transactions, range])

  return (
    <div className="min-h-screen bg-brand-gray-light pb-20">
      <Header title="Histórico" />

      {/* T086: Tab switcher between history views */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 flex">
          <button
            className="px-4 py-3 text-sm font-semibold text-brand-blue border-b-2 border-brand-blue"
          >
            Movimentações
          </button>
          <button
            onClick={() => navigate('/history/games')}
            className="px-4 py-3 text-sm text-gray-500 hover:text-brand-blue transition-colors"
          >
            Partidas
          </button>
        </div>
      </div>

      <Container maxWidth="md">
        <div className="space-y-4 py-6">

          {/* Filtro de data */}
          <Card padding="md">
            <h2 className="text-sm font-semibold text-brand-gray-dark mb-3">Filtrar por período</h2>
            <DateRangeFilter value={range} onChange={setRange} />
          </Card>

          {/* Lista */}
          <Card padding="md">
            <h2 className="text-lg font-bold text-brand-gray-dark mb-4">
              Movimentações{filtered.length > 0 && ` (${filtered.length})`}
            </h2>

            {loading ? (
              <div className="flex justify-center py-8">
                <Spinner size="md" />
              </div>
            ) : (
              <TransactionList transactions={filtered} />
            )}
          </Card>
        </div>
      </Container>

      <BottomNav />
    </div>
  )
}
