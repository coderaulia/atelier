import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import ErrorBoundary from './components/ErrorBoundary'
import ToolSkeleton from './components/ToolSkeleton'
import { TOOLS } from './lib/tools'
import AppShell from './wrappers/AppShell'
import MarketingWrapper from './wrappers/MarketingWrapper'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import VerifyEmailNotice from './pages/VerifyEmailNotice'
import PrivacyPolicy from './pages/legal/PrivacyPolicy'
import TermsOfService from './pages/legal/TermsOfService'
import RefundPolicy from './pages/legal/RefundPolicy'
import Dashboard from './pages/app/Dashboard'

const Account = lazy(() => import('./pages/Account'))

// Admin pages (per-page AdminLayout, no shared shell)
const AdminOverview = lazy(() => import('./pages/Admin/Overview'))
const AdminUsers = lazy(() => import('./pages/Admin/Users'))
const AdminUserDetail = lazy(() => import('./pages/Admin/UserDetail'))
const AdminTransactions = lazy(() => import('./pages/Admin/Transactions'))
const AdminErrors = lazy(() => import('./pages/Admin/Errors'))
const Receipt = lazy(() => import('./pages/Receipt'))

export default function App() {
  return (
    <Routes>
      {/* ── Public marketing ─────────────────────── */}
      <Route path="/" element={<Landing />} />
      <Route path="/pricing" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/verify-email" element={<VerifyEmailNotice />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<TermsOfService />} />
      <Route path="/refund" element={<RefundPolicy />} />
      <Route
        path="/receipt"
        element={
          <Suspense fallback={null}>
            <Receipt />
          </Suspense>
        }
      />

      {/* ── Public tool pages (MarketingWrapper) ──── */}
      {TOOLS.map((tool) => (
        <Route
          key={tool.publicPath}
          path={tool.publicPath}
          element={
            <MarketingWrapper tool={tool}>
              <ErrorBoundary>
                <Suspense fallback={<ToolSkeleton />}>
                  <tool.component />
                </Suspense>
              </ErrorBoundary>
            </MarketingWrapper>
          }
        />
      ))}

      {/* ── Protected /app/* (AppShell) ───────────── */}
      <Route path="/app" element={<AppShell />}>
        <Route index element={<Navigate to="/app/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        {TOOLS.map((tool) => {
          const subPath = tool.appPath.replace('/app/', '')
          return (
            <Route
              key={tool.appPath}
              path={`${subPath}/*`}
              element={
                <ErrorBoundary>
                  <Suspense fallback={<ToolSkeleton />}>
                    <tool.component />
                  </Suspense>
                </ErrorBoundary>
              }
            />
          )
        })}
        <Route
          path="account"
          element={
            <Suspense fallback={null}>
              <Account />
            </Suspense>
          }
        />
      </Route>

      {/* Legacy /account redirect */}
      <Route path="/account" element={<Navigate to="/app/account" replace />} />

      {/* ── Admin (per-page AdminLayout) ─────────── */}
      <Route
        path="/admin"
        element={
          <Suspense fallback={null}>
            <AdminOverview />
          </Suspense>
        }
      />
      <Route
        path="/admin/users"
        element={
          <Suspense fallback={null}>
            <AdminUsers />
          </Suspense>
        }
      />
      <Route
        path="/admin/users/:id"
        element={
          <Suspense fallback={null}>
            <AdminUserDetail />
          </Suspense>
        }
      />
      <Route
        path="/admin/transactions"
        element={
          <Suspense fallback={null}>
            <AdminTransactions />
          </Suspense>
        }
      />
      <Route
        path="/admin/errors"
        element={
          <Suspense fallback={null}>
            <AdminErrors />
          </Suspense>
        }
      />

      {/* 404 */}
      <Route
        path="*"
        element={
          <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#f8fafc', background: '#0a0f1e' }}>
            <h1 style={{ fontSize: '4rem', marginBottom: '1rem' }}>404</h1>
            <p style={{ color: 'rgba(226,232,240,0.68)', marginBottom: '1.5rem' }}>This page doesn't exist.</p>
            <a href="/" style={{ color: 'hsl(43 96% 62%)', fontWeight: 700 }}>Back to home</a>
          </main>
        }
      />
    </Routes>
  )
}
