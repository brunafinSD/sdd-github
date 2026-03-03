// T004 [US1, US2]: Login page — fake auth with hardcoded credentials

import { useState, useEffect } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuthStore } from '@/store/authStore'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

// ── Schema ────────────────────────────────────────────────────────────────────
const loginSchema = z.object({
  username: z.string().min(1, 'Usuário obrigatório'),
  password: z.string().min(1, 'Senha obrigatória'),
})

type LoginFormData = z.infer<typeof loginSchema>

// ── Page ──────────────────────────────────────────────────────────────────────
export function LoginPage() {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)
  const login = useAuthStore(s => s.login)
  const navigate = useNavigate()

  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) })

  // Clear global error whenever user types in either field
  useEffect(() => {
    const sub = watch(() => setFormError(null))
    return () => sub.unsubscribe()
  }, [watch])

  // Already authenticated — go straight to dashboard
  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  const onSubmit = async (data: LoginFormData) => {
    setSubmitting(true)
    try {
      const success = login(data.username.trim(), data.password.trim())
      if (success) {
        navigate('/', { replace: true })
      } else {
        setFormError('Usuário ou senha inválidos')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-brand-gray-light flex flex-col items-center justify-center p-6">
      {/* Logo */}
      <div className="text-center mb-8">
        <div className='bg-brand-green/20 rounded-full'>
        <img
          src="/icon.png"
          alt="Fut da quinta"
          className="w-24 h-24 mx-auto p-2"
        />
        </div>
        <h1 className="text-4xl font-bold text-brand-blue">Fut da quinta</h1>
        <p className="text-sm text-gray-400 mt-1">Gestão do fut da quinta</p>
      </div>

      {/* Form card */}
      <Card padding="md" className="w-full max-w-sm">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <Input
            label="Usuário"
            autoComplete="username"
            autoCapitalize="none"
            error={errors.username?.message}
            {...register('username')}
          />

          <Input
            label="Senha"
            type="password"
            autoComplete="current-password"
            error={errors.password?.message}
            {...register('password')}
          />

          {/* Generic error — US2: never reveals which field is wrong */}
          {formError && (
            <p
              role="alert"
              className="text-sm text-brand-red bg-brand-red/10 border border-brand-red/20 rounded-lg px-3 py-2"
            >
              {formError}
            </p>
          )}

          <div className="pt-1">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              disabled={submitting}
            >
              Entrar
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
