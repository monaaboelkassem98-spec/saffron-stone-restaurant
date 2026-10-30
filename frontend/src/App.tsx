import { lazy, Suspense } from 'react'
import ScrollToTop from './components/ScrollToTop'

const Home = lazy(() => import('./pages/customer/Home'))
const Menu = lazy(() => import('./pages/customer/Menu'))
const Checkout = lazy(() => import('./pages/customer/Checkout'))
const Reservation = lazy(() => import('./pages/customer/Reservation'))
const LazyAdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))

function App() {
  const path = window.location.pathname.replace(/\/$/, '') || '/'
  const Page =
    path === '/admin'
      ? LazyAdminDashboard
      : path === '/checkout'
        ? Checkout
        : path === '/reservation'
          ? Reservation
          : path === '/menu'
            ? Menu
            : Home

  return (
    <>
      <Suspense
        fallback={
          <main className="flex min-h-screen items-center justify-center bg-[#f7f7fa] text-sm text-[#747583]">
            Loading Saffron & Stone...
          </main>
        }
      >
        <Page />
      </Suspense>
      <ScrollToTop />
    </>
  )
}

export default App
