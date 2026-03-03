// T073, T077, T095: CashAdjust page with toast feedback

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCashStore } from '@/store/cashStore'
import { Header } from '@/components/layout/Header'
import { Container } from '@/components/layout/Container'
import { Card } from '@/components/ui/Card'
import { CashAdjustForm, type CashAdjustFormData } from '@/components/cash/CashAdjustForm'
import { toMoney } from '@/types/money'
import { toast } from '@/store/toastStore'

export function CashAdjust() {
  const navigate = useNavigate()
  const { addManualEntry, addManualExit, loading } = useCashStore()
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (data: CashAdjustFormData) => {
    setError(null)
    try {
      const raw = parseFloat(data.amount.replace(',', '.'))

      if (data.type === 'entrada') {
        await addManualEntry(toMoney(raw), data.description, data.justification)
        toast.success('Entrada registrada com sucesso!')
      } else {
        await addManualExit(toMoney(-raw), data.description, data.justification)
        toast.success('Saída registrada com sucesso!')
      }

      navigate('/')
    } catch (err) {
      const msg = (err as Error).message
      setError(msg)
      toast.error(msg)
    }
  }

  return (
    <div className="min-h-screen bg-brand-gray-light">
      <Header title="Ajustar Caixa" onBack={() => navigate('/')} />

      <Container maxWidth="md">
        <div className="space-y-6 py-6">

          {error && (
            <p className="text-sm text-brand-red bg-brand-red/10 border border-brand-red/30 rounded-lg px-4 py-3" role="alert">
              {error}
            </p>
          )}

          <Card padding="md">
            <h2 className="text-lg font-bold text-brand-gray-dark mb-6">Novo Ajuste</h2>
            <CashAdjustForm onSubmit={handleSubmit} loading={loading} />
          </Card>
        </div>
      </Container>
    </div>
  )
}
