import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Activity,
  Bell,
  ChefHat,
  CircleDollarSign,
  Clock3,
  Download,
  LayoutDashboard,
  LogOut,
  Menu as MenuIcon,
  MoreHorizontal,
  PackageCheck,
  Search,
  ShoppingBag,
  TrendingUp,
  Users,
  UtensilsCrossed,
  X,
} from 'lucide-react'
import ThemeToggle from '../../components/ThemeToggle'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

interface OrderItem {
  menuItemId: string
  name: string
  quantity: number
  unitPrice: number
}

interface Order {
  id: string
  orderNumber: string
  customerId: string
  customerName: string
  customerPhone: string
  items: OrderItem[]
  orderType: 'delivery' | 'pickup'
  deliveryAddress: string
  status: string
  paymentMethod: string
  paymentStatus: string
  subtotal: number
  deliveryFee: number
  total: number
  createdAt: string
}

interface MenuDish {
  id: string
  name: string
  price: number
  available: boolean
  imageUrl: string
}

interface Customer {
  id: string
  fullName: string
  createdAt: string
}

interface DailySales {
  day: string
  revenue: number
  orders: number
}

interface PopularDish {
  id: string
  name: string
  imageUrl: string
  quantity: number
  revenue: number
}

type OrderStatus = 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled'
type Period = '7d' | '30d' | 'all'

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001'
).replace(/\/$/, '')

const STATUS_OPTIONS: OrderStatus[] = [
  'pending',
  'preparing',
  'ready',
  'completed',
  'cancelled',
]

const PIE_COLORS: Record<OrderStatus, string> = {
  completed: '#6e9a78',
  preparing: '#d59b57',
  ready: '#8296bd',
  pending: '#c76c3b',
  cancelled: '#b8bac5',
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...init?.headers,
    },
  })

  if (!response.ok) {
    throw new Error(`Request failed (${response.status} ${response.statusText})`)
  }

  return response.json() as Promise<T>
}

function formatPrice(value: number) {
  return `${new Intl.NumberFormat('en-EG', {
    maximumFractionDigits: 0,
  }).format(value)} EGP`
}

function formatShortDate(value: string) {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
  }).format(new Date(value))
}

function getStatusLabel(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

function escapeCsv(value: string | number) {
  const text = String(value)
  return `"${text.replaceAll('"', '""')}"`
}

function downloadOrdersCsv(orders: Order[]) {
  const rows = [
    ['Order', 'Customer', 'Status', 'Type', 'Payment', 'Total EGP', 'Created at'],
    ...orders.map((order) => [
      order.orderNumber,
      order.customerName,
      order.status,
      order.orderType,
      order.paymentMethod,
      order.total,
      order.createdAt,
    ]),
  ]
  const csv = rows.map((row) => row.map(escapeCsv).join(',')).join('\r\n')
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = 'saffron-stone-orders.csv'
  link.click()
  URL.revokeObjectURL(url)
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([])
  const [menu, setMenu] = useState<MenuDish[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [period, setPeriod] = useState<Period>('7d')
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null)
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)

  const loadDashboard = useCallback(
    () =>
      Promise.all([
        requestJson<Order[]>('/orders'),
        requestJson<MenuDish[]>('/menu'),
        requestJson<Customer[]>('/customers'),
      ]),
    [],
  )

  const applyDashboardData = useCallback(
    ([orderData, menuData, customerData]: [
      Order[],
      MenuDish[],
      Customer[],
    ]) => {
      setOrders(orderData)
      setMenu(menuData)
      setCustomers(customerData)
    },
    [],
  )

  const handleLoadError = useCallback((loadError: unknown) => {
    setError(
      loadError instanceof Error
        ? loadError.message
        : 'Unable to load restaurant analytics.',
    )
  }, [])

  useEffect(() => {
    let active = true
    void loadDashboard()
      .then((data) => {
        if (active) applyDashboardData(data)
      })
      .catch((loadError: unknown) => {
        if (active) handleLoadError(loadError)
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })

    return () => {
      active = false
    }
  }, [applyDashboardData, handleLoadError, loadDashboard])

  const retryDashboard = () => {
    setError('')
    setIsLoading(true)
    void loadDashboard()
      .then(applyDashboardData)
      .catch(handleLoadError)
      .finally(() => setIsLoading(false))
  }

  const completedOrders = orders.filter((order) => order.status === 'completed')
  const revenue = completedOrders.reduce((sum, order) => sum + order.total, 0)
  const pendingOrders = orders.filter((order) => order.status === 'pending').length
  const unavailableDishes = menu.filter((dish) => !dish.available).length
  const averageOrder = completedOrders.length
    ? revenue / completedOrders.length
    : 0

  const orderStatusData = useMemo(
    () =>
      STATUS_OPTIONS.map((status) => ({
        name: getStatusLabel(status),
        value: orders.filter((order) => order.status === status).length,
        color: PIE_COLORS[status],
      })).filter((status) => status.value > 0),
    [orders],
  )

  const salesData = useMemo<DailySales[]>(() => {
    const now = new Date()
    const dayCount = period === '7d' ? 7 : period === '30d' ? 30 : 14
    const firstDay = new Date(now)

    if (period === 'all') {
      firstDay.setDate(firstDay.getDate() - 13)
    } else {
      firstDay.setDate(firstDay.getDate() - (dayCount - 1))
    }
    firstDay.setHours(0, 0, 0, 0)

    const days = Array.from({ length: dayCount }, (_, index) => {
      const date = new Date(firstDay)
      date.setDate(firstDay.getDate() + index)
      return date
    })
    const byDate = new Map(
      days.map((date) => [
        date.toLocaleDateString('en-CA'),
        {
          day: new Intl.DateTimeFormat('en', {
            day: 'numeric',
            month: period === '30d' ? undefined : 'short',
          }).format(date),
          revenue: 0,
          orders: 0,
        },
      ]),
    )

    orders
      .filter((order) => order.status === 'completed')
      .forEach((order) => {
        const key = new Date(order.createdAt).toLocaleDateString('en-CA')
        const day = byDate.get(key)
        if (day) {
          day.revenue += order.total
          day.orders += 1
        }
      })

    return Array.from(byDate.values())
  }, [orders, period])

  const popularDishes = useMemo<PopularDish[]>(() => {
    const totals = new Map<string, { quantity: number; revenue: number; name: string }>()

    orders
      .filter((order) => order.status !== 'cancelled')
      .forEach((order) => {
        order.items.forEach((item) => {
          const current = totals.get(item.menuItemId) ?? {
            quantity: 0,
            revenue: 0,
            name: item.name,
          }
          current.quantity += item.quantity
          current.revenue += item.quantity * item.unitPrice
          totals.set(item.menuItemId, current)
        })
      })

    return Array.from(totals.entries())
      .map(([id, item]) => ({
        id,
        ...item,
        imageUrl: menu.find((dish) => dish.id === id)?.imageUrl ?? '',
      }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5)
  }, [menu, orders])

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLocaleLowerCase()
    return [...orders]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .filter(
        (order) =>
          !query ||
          order.orderNumber.toLocaleLowerCase().includes(query) ||
          order.customerName.toLocaleLowerCase().includes(query) ||
          order.status.toLocaleLowerCase().includes(query),
      )
      .slice(0, 8)
  }, [orders, search])

  const updateOrderStatus = async (order: Order, status: OrderStatus) => {
    if (order.status === status) return
    setUpdatingOrderId(order.id)
    setError('')
    try {
      const updated = await requestJson<Order>(
        `/orders/${encodeURIComponent(order.id)}`,
        {
          method: 'PATCH',
          body: JSON.stringify({ status }),
        },
      )
      setOrders((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      )
    } catch (updateError) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : `Could not update ${order.orderNumber}.`,
      )
    } finally {
      setUpdatingOrderId(null)
    }
  }

  const statCards = [
    {
      label: 'Completed revenue',
      value: formatPrice(revenue),
      note: `${completedOrders.length} completed orders`,
      icon: CircleDollarSign,
      tone: 'bg-[#f7efe5] text-[#a66a2c]',
    },
    {
      label: 'Total orders',
      value: String(orders.length),
      note: `${pendingOrders} awaiting confirmation`,
      icon: ShoppingBag,
      tone: 'bg-[#edf0fb] text-[#6578aa]',
    },
    {
      label: 'Menu compositions',
      value: String(menu.length),
      note: `${unavailableDishes} currently unavailable`,
      icon: UtensilsCrossed,
      tone: 'bg-[#edf4ee] text-[#66866b]',
    },
    {
      label: 'Patron ledger',
      value: String(customers.length),
      note: `Average order ${formatPrice(averageOrder)}`,
      icon: Users,
      tone: 'bg-[#f5ecf1] text-[#996b82]',
    },
  ]

  const navContent = (
    <>
      <a href="/admin" className="flex items-center gap-3 px-5 py-5">
        <span className="flex size-9 items-center justify-center rounded-full border border-[#d6a36a] font-serif text-[#e2b77f]">
          S
        </span>
        <span>
          <span className="block font-serif text-xs tracking-[0.12em] text-white">SAFFRON & STONE</span>
          <span className="mt-1 block text-[8px] uppercase tracking-[0.2em] text-white/45">Admin portal</span>
        </span>
      </a>
      <nav aria-label="Admin navigation" className="mt-6 px-3">
        <p className="px-3 pb-2 text-[8px] uppercase tracking-[0.19em] text-white/35">Workspace</p>
        <a
          href="/admin"
          className="flex items-center gap-3 border-l-2 border-[#d6a36a] bg-white/10 px-3 py-3 text-xs text-white"
        >
          <LayoutDashboard size={16} className="text-[#e2b77f]" aria-hidden="true" />
          Overview
        </a>
        <a
          href="#orders"
          onClick={() => setIsMobileNavOpen(false)}
          className="mt-1 flex items-center gap-3 border-l-2 border-transparent px-3 py-3 text-xs text-white/60 transition hover:bg-white/5 hover:text-white"
        >
          <ShoppingBag size={16} aria-hidden="true" />
          Orders
          <span className="ml-auto rounded-full bg-[#a94f0b] px-2 py-0.5 text-[8px] text-white">
            {pendingOrders}
          </span>
        </a>
        <a
          href="/menu"
          className="mt-1 flex items-center gap-3 border-l-2 border-transparent px-3 py-3 text-xs text-white/60 transition hover:bg-white/5 hover:text-white"
        >
          <UtensilsCrossed size={16} aria-hidden="true" />
          Culinary ledger
        </a>
      </nav>
      <div className="mt-auto border-t border-white/10 p-4">
        <a href="/" className="flex items-center gap-3 px-2 py-2 text-[10px] text-white/55 hover:text-white">
          <LogOut size={14} aria-hidden="true" /> Return to storefront
        </a>
      </div>
    </>
  )

  return (
    <div className="min-h-screen bg-[#f7f7fa] text-[#262a35]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col bg-[#222936] lg:flex">
        {navContent}
      </aside>

      <div className="lg:pl-60">
        <header className="sticky top-0 z-20 border-b border-[#e9e9ee] bg-white/95 backdrop-blur">
          <div className="flex h-[60px] items-center justify-between gap-4 px-5 sm:px-7 lg:px-9">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                aria-label={isMobileNavOpen ? 'Close admin menu' : 'Open admin menu'}
                onClick={() => setIsMobileNavOpen((open) => !open)}
                className="flex size-9 items-center justify-center border border-[#e9e9ee] text-[#444957] lg:hidden"
              >
                {isMobileNavOpen ? <X size={17} /> : <MenuIcon size={17} />}
              </button>
              <div>
                <p className="text-[8px] uppercase tracking-[0.17em] text-[#a66a2c]">
                  Tuesday · Zamalek, Cairo
                </p>
                <h1 className="truncate font-serif text-lg sm:text-xl">Sanctuary overview</h1>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <ThemeToggle />
              <span className="hidden text-right sm:block">
                <span className="block text-[10px] font-semibold">Sanctuary manager</span>
                <span className="block text-[8px] text-[#92939d]">Administrator</span>
              </span>
              <span className="flex size-8 items-center justify-center rounded-full bg-[#f0f1fc] text-xs font-semibold text-[#7b5b40]">
                SM
              </span>
              <button
                type="button"
                aria-label="Notifications"
                className="relative flex size-8 items-center justify-center text-[#626573] hover:text-[#a94f0b]"
              >
                <Bell size={17} aria-hidden="true" />
                {pendingOrders > 0 && (
                  <span className="absolute right-0.5 top-0.5 size-2 rounded-full bg-[#a94f0b]" />
                )}
              </button>
            </div>
          </div>
        </header>

        {isMobileNavOpen && (
          <div className="fixed inset-0 z-40 bg-[#151a24]/50 lg:hidden">
            <aside className="absolute inset-y-0 left-0 flex w-64 flex-col bg-[#222936]">
              {navContent}
            </aside>
            <button
              type="button"
              aria-label="Close admin menu"
              onClick={() => setIsMobileNavOpen(false)}
              className="absolute inset-0 -z-10"
            />
          </div>
        )}

        <main className="mx-auto max-w-[1500px] px-5 py-6 sm:px-7 lg:px-9 lg:py-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-[9px] uppercase tracking-[0.2em] text-[#a66a2c]">
                Operational intelligence
              </p>
              <h2 className="mt-1 font-serif text-3xl">Good evening, Sanctuary.</h2>
              <p className="mt-1 text-xs text-[#858592]">
                Here&apos;s how Saffron & Stone is performing.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex border border-[#e7e7ec] bg-white p-1">
                {([
                  ['7d', '7 days'],
                  ['30d', '30 days'],
                  ['all', 'Recent'],
                ] as const).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={period === value}
                    onClick={() => setPeriod(value)}
                    className={`px-3 py-2 text-[9px] transition ${
                      period === value
                        ? 'bg-[#252b38] text-white'
                        : 'text-[#676a77] hover:text-[#a94f0b]'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => downloadOrdersCsv(filteredOrders)}
                disabled={orders.length === 0}
                className="inline-flex items-center gap-2 border border-[#e7e7ec] bg-white px-3 py-2.5 text-[9px] text-[#555967] transition hover:border-[#d6a36a] disabled:opacity-50"
              >
                <Download size={13} aria-hidden="true" /> Export orders
              </button>
            </div>
          </div>

          {error && (
            <div role="alert" className="mt-5 flex flex-wrap items-center justify-between gap-3 border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-900">
              <span>{error} · Check the JSON Server at {API_BASE_URL}.</span>
              <button
                type="button"
                onClick={retryDashboard}
                className="font-semibold underline"
              >
                Retry
              </button>
            </div>
          )}

          {isLoading ? (
            <div role="status" className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 8 }, (_, index) => (
                <div key={index} className="h-36 animate-pulse bg-white shadow-sm" />
              ))}
              <span className="sr-only">Loading restaurant analytics...</span>
            </div>
          ) : !error && (
            <>
              <section aria-label="Restaurant key performance indicators" className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {statCards.map((card) => {
                  const Icon = card.icon
                  return (
                    <article key={card.label} className="border border-[#ededf0] bg-white p-4 shadow-sm sm:p-5">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-[9px] font-medium uppercase tracking-[0.1em] text-[#858592]">{card.label}</p>
                          <p className="mt-2 font-serif text-2xl text-[#252a35]">{card.value}</p>
                        </div>
                        <span className={`flex size-9 items-center justify-center ${card.tone}`}>
                          <Icon size={17} aria-hidden="true" />
                        </span>
                      </div>
                      <p className="mt-3 border-t border-[#f0f0f3] pt-3 text-[9px] text-[#858592]">{card.note}</p>
                    </article>
                  )
                })}
              </section>

              <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(280px,0.8fr)]">
                <article className="border border-[#ededf0] bg-white p-4 shadow-sm sm:p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-[8px] uppercase tracking-[0.17em] text-[#a66a2c]">Revenue performance</p>
                      <h2 className="mt-1 font-serif text-xl">Completed order sales</h2>
                      <p className="mt-1 text-[9px] text-[#858592]">
                        Completed orders only · EGP · {period === '7d' ? 'Last 7 days' : period === '30d' ? 'Last 30 days' : 'Recent 14 days'}
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[9px] text-[#66866b]">
                      <TrendingUp size={13} aria-hidden="true" />
                      {completedOrders.length} settled orders
                    </span>
                  </div>
                  <div className="mt-5 h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={salesData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                        <defs>
                          <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#b57942" stopOpacity={0.25} />
                            <stop offset="95%" stopColor="#b57942" stopOpacity={0.01} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid stroke="#eeedf0" strokeDasharray="3 5" vertical={false} />
                        <XAxis
                          dataKey="day"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: '#92939d', fontSize: 9 }}
                          minTickGap={period === '30d' ? 28 : 8}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: '#92939d', fontSize: 9 }}
                          tickFormatter={(value: number) => value === 0 ? '0' : `${value}`}
                          width={45}
                        />
                        <Tooltip
                          formatter={(value) => [formatPrice(Number(value)), 'Sales']}
                          contentStyle={{
                            border: '1px solid #e8e7eb',
                            borderRadius: 2,
                            fontSize: 10,
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="revenue"
                          stroke="#a66a2c"
                          strokeWidth={2}
                          fill="url(#salesFill)"
                          activeDot={{ r: 4, fill: '#a66a2c', stroke: '#fff', strokeWidth: 2 }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </article>

                <article className="border border-[#ededf0] bg-white p-4 shadow-sm sm:p-5">
                  <div>
                    <p className="text-[8px] uppercase tracking-[0.17em] text-[#a66a2c]">Order fulfillment</p>
                    <h2 className="mt-1 font-serif text-xl">Ledger by status</h2>
                    <p className="mt-1 text-[9px] text-[#858592]">Current status across all placed orders</p>
                  </div>
                  <div className="relative mt-2 h-48">
                    {orders.length === 0 ? (
                      <div className="flex h-full items-center justify-center text-xs text-[#858592]">No orders to chart</div>
                    ) : (
                      <>
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={orderStatusData}
                              dataKey="value"
                              nameKey="name"
                              innerRadius={56}
                              outerRadius={78}
                              paddingAngle={3}
                              stroke="none"
                            >
                              {orderStatusData.map((item) => (
                                <Cell key={item.name} fill={item.color} />
                              ))}
                            </Pie>
                            <Tooltip
                              formatter={(value, name) => [value, name]}
                              contentStyle={{ border: '1px solid #e8e7eb', borderRadius: 2, fontSize: 10 }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                          <span className="font-serif text-2xl">{orders.length}</span>
                          <span className="text-[8px] uppercase tracking-[0.14em] text-[#858592]">orders</span>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="space-y-2 border-t border-[#f0f0f3] pt-3">
                    {orderStatusData.map((item) => (
                      <div key={item.name} className="flex items-center justify-between text-[9px]">
                        <span className="flex items-center gap-2 text-[#686a76]">
                          <span className="size-2 rounded-full" style={{ backgroundColor: item.color }} />
                          {item.name}
                        </span>
                        <span className="font-semibold">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </article>
              </section>

              <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(300px,0.8fr)]">
                <article id="orders" className="scroll-mt-20 border border-[#ededf0] bg-white shadow-sm">
                  <div className="flex flex-col justify-between gap-3 border-b border-[#f0f0f3] p-4 sm:flex-row sm:items-center sm:px-5">
                    <div>
                      <p className="text-[8px] uppercase tracking-[0.17em] text-[#a66a2c]">Service in motion</p>
                      <h2 className="mt-1 font-serif text-xl">Recent orders</h2>
                    </div>
                    <label className="flex h-9 items-center gap-2 border border-[#e8e8ed] px-3 text-[#888995] sm:w-56">
                      <Search size={13} aria-hidden="true" />
                      <input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search ledger..."
                        aria-label="Search orders"
                        className="w-full bg-transparent text-[10px] text-[#343744] outline-none placeholder:text-[#a0a0aa]"
                      />
                    </label>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[690px] border-collapse text-left">
                      <thead>
                        <tr className="bg-[#fafafd] text-[8px] uppercase tracking-[0.12em] text-[#858592]">
                          <th className="px-4 py-3 font-medium sm:px-5">Order</th>
                          <th className="px-3 py-3 font-medium">Patron</th>
                          <th className="px-3 py-3 font-medium">Date</th>
                          <th className="px-3 py-3 font-medium">Fulfillment</th>
                          <th className="px-3 py-3 font-medium">Total</th>
                          <th className="px-3 py-3 font-medium">Status</th>
                          <th className="px-3 py-3 font-medium"><span className="sr-only">Actions</span></th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredOrders.map((order) => (
                          <tr key={order.id} className="border-t border-[#f0f0f3] text-[9px] transition hover:bg-[#fcfcfe]">
                            <td className="whitespace-nowrap px-4 py-3 font-semibold text-[#353846] sm:px-5">
                              {order.orderNumber}
                            </td>
                            <td className="px-3 py-3">
                              <span className="block font-medium text-[#383a47]">{order.customerName}</span>
                              <span className="mt-1 block text-[8px] text-[#92939d]">{order.customerPhone}</span>
                            </td>
                            <td className="whitespace-nowrap px-3 py-3 text-[#777986]">
                              {formatShortDate(order.createdAt)}
                            </td>
                            <td className="px-3 py-3 capitalize text-[#777986]">
                              {order.orderType}
                            </td>
                            <td className="whitespace-nowrap px-3 py-3 font-semibold text-[#363845]">
                              {formatPrice(order.total)}
                            </td>
                            <td className="px-3 py-3">
                              <span className={`inline-flex items-center gap-1.5 whitespace-nowrap ${
                                order.status === 'completed'
                                  ? 'text-[#5f8569]'
                                  : order.status === 'cancelled'
                                    ? 'text-[#90919a]'
                                    : order.status === 'pending'
                                      ? 'text-[#b46e3b]'
                                      : 'text-[#6478a8]'
                              }`}>
                                <span className="size-1.5 rounded-full" style={{ backgroundColor: PIE_COLORS[order.status as OrderStatus] ?? '#b8bac5' }} />
                                {getStatusLabel(order.status)}
                              </span>
                            </td>
                            <td className="px-3 py-3">
                              <label className="sr-only" htmlFor={`status-${order.id}`}>Update {order.orderNumber} status</label>
                              <select
                                id={`status-${order.id}`}
                                value={order.status}
                                disabled={updatingOrderId === order.id}
                                onChange={(event) => void updateOrderStatus(order, event.target.value as OrderStatus)}
                                className="max-w-24 border border-[#e8e8ed] bg-white px-1.5 py-1 text-[8px] outline-none focus:border-[#d6a36a] disabled:opacity-50"
                              >
                                {STATUS_OPTIONS.map((status) => (
                                  <option key={status} value={status}>{getStatusLabel(status)}</option>
                                ))}
                              </select>
                            </td>
                          </tr>
                        ))}
                        {filteredOrders.length === 0 && (
                          <tr>
                            <td colSpan={7} className="px-5 py-10 text-center text-xs text-[#858592]">
                              No orders match this search.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex items-center justify-between border-t border-[#f0f0f3] px-4 py-3 text-[8px] text-[#858592] sm:px-5">
                    <span>Showing {filteredOrders.length} of {orders.length} orders</span>
                    <span>Manage a status to update its ledger record</span>
                  </div>
                </article>

                <article className="border border-[#ededf0] bg-white p-4 shadow-sm sm:p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[8px] uppercase tracking-[0.17em] text-[#a66a2c]">Guest favourites</p>
                      <h2 className="mt-1 font-serif text-xl">Most ordered dishes</h2>
                    </div>
                    <MoreHorizontal size={17} className="text-[#92939d]" aria-hidden="true" />
                  </div>
                  <p className="mt-1 text-[9px] text-[#858592]">Units from non-cancelled order snapshots</p>
                  <div className="mt-4 space-y-3">
                    {popularDishes.map((dish, index) => (
                      <div key={dish.id} className="flex items-center gap-3">
                        <span className="w-4 text-[9px] text-[#9b9ba5]">{String(index + 1).padStart(2, '0')}</span>
                        {dish.imageUrl ? (
                          <img src={dish.imageUrl} alt="" className="size-10 rounded-sm object-cover" />
                        ) : (
                          <span className="flex size-10 items-center justify-center bg-[#f0f1fc] text-[#777986]">
                            <ChefHat size={15} aria-hidden="true" />
                          </span>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[10px] font-medium text-[#363845]">{dish.name}</p>
                          <p className="mt-1 text-[8px] text-[#90919a]">{dish.quantity} ordered</p>
                        </div>
                        <p className="whitespace-nowrap text-[9px] font-semibold text-[#a66a2c]">
                          {formatPrice(dish.revenue)}
                        </p>
                      </div>
                    ))}
                    {popularDishes.length === 0 && (
                      <p className="py-8 text-center text-xs text-[#858592]">No order items yet.</p>
                    )}
                  </div>
                </article>
              </section>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border border-[#e9e9ee] bg-white px-4 py-3 text-[9px] text-[#7d7f8a]">
                <span className="inline-flex items-center gap-2">
                  <Activity size={13} className="text-[#66866b]" aria-hidden="true" />
                  Live overview from the restaurant ledger
                </span>
                <span className="inline-flex items-center gap-2">
                  <PackageCheck size={13} aria-hidden="true" />
                  Revenue counts completed orders only
                </span>
                <span className="inline-flex items-center gap-2">
                  <Clock3 size={13} aria-hidden="true" />
                  Refreshed when this page loads
                </span>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  )
}
