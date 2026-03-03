// T048, T059, T074, T085, T092, T101, T102: React Router + lazy loading
// T005 [US1]: /login route + PrivateRoute guard

import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { Spinner } from '@/components/ui/Spinner'
import { ErrorBoundary } from '@/components/layout/ErrorBoundary'
import { ToastContainer } from '@/components/ui/ToastContainer'
import { PrivateRoute } from '@/components/auth/PrivateRoute'

// T092/T101/T102: Lazy-load each page — each becomes a separate JS chunk
const Dashboard          = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })))
const GameCreate         = lazy(() => import('./pages/GameCreate').then(m => ({ default: m.GameCreate })))
const GameDetail         = lazy(() => import('./pages/GameDetail').then(m => ({ default: m.GameDetail })))
const CashAdjust         = lazy(() => import('./pages/CashAdjust').then(m => ({ default: m.CashAdjust })))
const TransactionHistory = lazy(() => import('./pages/TransactionHistory').then(m => ({ default: m.TransactionHistory })))
const GameHistory        = lazy(() => import('./pages/GameHistory').then(m => ({ default: m.GameHistory })))
// T005: Login page — public route (no PrivateRoute)
const LoginPage          = lazy(() => import('./pages/Login').then(m => ({ default: m.LoginPage })))

function PageFallback() {
  return (
    <div className="min-h-screen bg-brand-gray-light flex items-center justify-center">
      <Spinner size="lg" />
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Suspense fallback={<PageFallback />}>
          <Routes>
            {/* Public — accessible without login */}
            <Route path="/login"                      element={<LoginPage />} />

            {/* Protected — redirect to /login when not authenticated */}
            <Route path="/"                       element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/game/new"               element={<PrivateRoute><GameCreate /></PrivateRoute>} />
            <Route path="/game/:id"               element={<PrivateRoute><GameDetail /></PrivateRoute>} />
            <Route path="/cash/adjust"            element={<PrivateRoute><CashAdjust /></PrivateRoute>} />
            <Route path="/history/transactions"   element={<PrivateRoute><TransactionHistory /></PrivateRoute>} />
            <Route path="/history/games"          element={<PrivateRoute><GameHistory /></PrivateRoute>} />
          </Routes>
        </Suspense>
        <ToastContainer />
      </ErrorBoundary>
    </BrowserRouter>
  )
}

export default App
