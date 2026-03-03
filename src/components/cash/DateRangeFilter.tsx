// T080: DateRangeFilter component

import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export interface DateRange {
  startDate: string // ISO fecha YYYY-MM-DD
  endDate: string
}

interface DateRangeFilterProps {
  value: DateRange
  onChange: (range: DateRange) => void
}

function isoToday(): string {
  return new Date().toISOString().split('T')[0]
}

function isoFirstOfMonth(offsetMonths = 0): string {
  const d = new Date()
  d.setMonth(d.getMonth() + offsetMonths, 1)
  return d.toISOString().split('T')[0]
}

function isoLastOfMonth(offsetMonths = 0): string {
  const d = new Date()
  d.setMonth(d.getMonth() + offsetMonths + 1, 0)
  return d.toISOString().split('T')[0]
}

export function DateRangeFilter({ value, onChange }: DateRangeFilterProps) {
  const presets = [
    {
      label: 'Este mês',
      range: { startDate: isoFirstOfMonth(0), endDate: isoLastOfMonth(0) },
    },
    {
      label: 'Mês passado',
      range: { startDate: isoFirstOfMonth(-1), endDate: isoLastOfMonth(-1) },
    },
    {
      label: 'Tudo',
      range: { startDate: '2000-01-01', endDate: isoToday() },
    },
  ]

  return (
    <div className="space-y-3">
      {/* Quick presets */}
      <div className="flex gap-2 flex-wrap">
        {presets.map(p => (
          <Button
            key={p.label}
            variant="ghost"
            size="sm"
            onClick={() => onChange(p.range)}
            className={
              value.startDate === p.range.startDate && value.endDate === p.range.endDate
                ? 'ring-2 ring-brand-blue'
                : ''
            }
          >
            {p.label}
          </Button>
        ))}
      </div>

      {/* Manual range */}
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="De"
          type="date"
          value={value.startDate}
          onChange={e => onChange({ ...value, startDate: e.target.value })}
        />
        <Input
          label="Até"
          type="date"
          value={value.endDate}
          onChange={e => onChange({ ...value, endDate: e.target.value })}
        />
      </div>
    </div>
  )
}
