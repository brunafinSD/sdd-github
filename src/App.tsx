// T048, T059, T074, T085, T092, T101, T102: React Router + lazy loading

import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { Spinner } from '@/components/ui/Spinner'
import { ErrorBoundary } from '@/components/layout/ErrorBoundary'
import { ToastContainer } from '@/components/ui/ToastContainer'

// T092/T101/T102: Lazy-load each page — each becomes a separate JS chunk
const Dashboard          = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })))
const GameCreate         = lazy(() => import('./pages/GameCreate').then(m => ({ default: m.GameCreate })))
const GameDetail         = lazy(() => import('./pages/GameDetail').then(m => ({ default: m.GameDetail })))
const CashAdjust         = lazy(() => import('./pages/CashAdjust').then(m => ({ default: m.CashAdjust })))
const TransactionHistory = lazy(() => import('./pages/TransactionHistory').then(m => ({ default: m.TransactionHistory })))
const GameHistory        = lazy(() => import('./pages/GameHistory').then(m => ({ default: m.GameHistory })))

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
            <Route path="/"                       element={<Dashboard />} />
            <Route path="/game/new"               element={<GameCreate />} />
            <Route path="/game/:id"               element={<GameDetail />} />
            <Route path="/cash/adjust"            element={<CashAdjust />} />
            <Route path="/history/transactions"   element={<TransactionHistory />} />
            <Route path="/history/games"          element={<GameHistory />} />
          </Routes>
        </Suspense>
        <ToastContainer />
      </ErrorBoundary>
    </BrowserRouter>
  )
}

export default App
