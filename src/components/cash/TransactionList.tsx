// T079, T090: TransactionList component

import { TransactionListItem } from './TransactionListItem'
import type { Transaction } from '@/types/cash'

interface TransactionListProps {
  transactions: Transaction[]
}

export function TransactionList({ transactions }: TransactionListProps) {
  // T090: Empty state
  if (transactions.length === 0) {
    return (
      <p className="text-sm text-gray-400 text-center py-8">
        Nenhuma movimentação encontrada.
      </p>
    )
  }

  return (
    <ul className="divide-y divide-gray-100">
      {transactions.map(t => (
        <TransactionListItem key={t.id} transaction={t} />
      ))}
    </ul>
  )
}
