// T067-T070, T076: CashAdjustForm with React Hook Form + Zod validation

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'

// T076: Zod schema with justification validation (min 5, max 500)
const cashAdjustSchema = z.object({
  type: z.enum(['entrada', 'saida']),
  amount: z
    .string()
    .min(1, 'Informe o valor')
    .refine(v => parseFloat(v.replace(',', '.')) > 0, 'O valor deve ser maior que zero'),
  description: z.string().min(1, 'Informe uma descrição').max(100, 'Máximo 100 caracteres'),
  justification: z
    .string()
    .min(5, 'Justificativa mínima de 5 caracteres')
    .max(500, 'Máximo 500 caracteres')
})

export type CashAdjustFormData = z.infer<typeof cashAdjustSchema>

interface CashAdjustFormProps {
  onSubmit: (data: CashAdjustFormData) => Promise<void>
  loading?: boolean
}

export function CashAdjustForm({ onSubmit, loading }: CashAdjustFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<CashAdjustFormData>({
    resolver: zodResolver(cashAdjustSchema),
    defaultValues: { type: 'entrada' }
  })

  const type = watch('type')

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      {/* T068: Entry type radio */}
      <div>
        <p className="block text-sm font-medium text-brand-gray-dark mb-2">Tipo de ajuste</p>
        <div className="flex gap-3">
          <label className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 cursor-pointer transition-colors ${
            type === 'entrada'
              ? 'border-brand-green bg-brand-green/10 text-brand-green'
              : 'border-gray-200 text-gray-500 hover:border-gray-300'
          }`}>
            <input type="radio" value="entrada" {...register('type')} className="sr-only" />
            <span className="text-lg">↑</span>
            <span className="font-medium">Entrada</span>
          </label>
          <label className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 cursor-pointer transition-colors ${
            type === 'saida'
              ? 'border-brand-red bg-brand-red/10 text-brand-red'
              : 'border-gray-200 text-gray-500 hover:border-gray-300'
          }`}>
            <input type="radio" value="saida" {...register('type')} className="sr-only" />
            <span className="text-lg">↓</span>
            <span className="font-medium">Saída</span>
          </label>
        </div>
      </div>

      {/* T069: Amount input */}
      <Input
        label="Valor (R$)"
        type="number"
        step="0.01"
        min="0.01"
        placeholder="0,00"
        error={errors.amount?.message}
        {...register('amount')}
      />

      {/* Description */}
      <Input
        label="Descrição"
        placeholder="Ex: Doação João, Compra bolas..."
        error={errors.description?.message}
        {...register('description')}
      />

      {/* T070: Justification textarea */}
      <div>
        <label className="block text-sm font-medium text-brand-gray-dark mb-1">
          Justificativa <span className="text-brand-red">*</span>
        </label>
        <textarea
          className={`w-full h-28 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue resize-none ${
            errors.justification ? 'border-brand-red' : 'border-gray-300'
          }`}
          placeholder="Descreva o motivo do ajuste (mín. 5 caracteres)..."
          aria-invalid={!!errors.justification}
          {...register('justification')}
        />
        {errors.justification && (
          <p className="mt-1 text-sm text-brand-red" role="alert">{errors.justification.message}</p>
        )}
      </div>

      <Button
        type="submit"
        variant={type === 'entrada' ? 'secondary' : 'danger'}
        size="lg"
        fullWidth
        disabled={loading}
      >
        {loading
          ? <Spinner size="sm" />
          : type === 'entrada' ? '↑ Registrar Entrada' : '↓ Registrar Saída'}
      </Button>
    </form>
  )
}
