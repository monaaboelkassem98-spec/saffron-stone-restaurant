import { useCallback, useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import {
  ArrowLeft,
  Check,
  Clock3,
  CreditCard,
  LockKeyhole,
  MapPin,
  ShieldCheck,
  Smartphone,
  Truck,
  Wallet,
} from 'lucide-react'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'

interface MenuDish {
  id: string
  name: string
  description: string
  price: number
  imageUrl: string
  available: boolean
}

interface CartRow {
  id: string
  menuItemId: string
  quantity: number
  note?: string
}

interface Customer {
  id: string
  fullName: string
  email: string
  phone: string
  address: string
  createdAt: string
}

interface Restaurant {
  currency: string
  deliveryFee: number
  name: string
}

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
  paymentMethod: 'card' | 'cash' | 'mobile_wallet'
  paymentStatus: 'paid' | 'unpaid'
  subtotal: number
  deliveryFee: number
  total: number
  notes: string
  createdAt: string
}

type OrderType = 'delivery' | 'pickup'
type DeliveryWindow = 'asap' | 'evening'
type PaymentMethod = 'card' | 'mobile_wallet' | 'cash'

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001'
).replace(/\/$/, '')

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

  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}

function formatPrice(value: number, currency = 'EGP') {
  return `${new Intl.NumberFormat('en-EG', {
    maximumFractionDigits: 0,
  }).format(value)} ${currency}`
}

export default function Checkout() {
  const [cart, setCart] = useState<CartRow[]>([])
  const [dishes, setDishes] = useState<MenuDish[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [restaurant, setRestaurant] = useState<Restaurant>({
    currency: 'EGP',
    deliveryFee: 30,
    name: 'Saffron & Stone',
  })
  const [orderType, setOrderType] = useState<OrderType>('delivery')
  const [deliveryWindow, setDeliveryWindow] = useState<DeliveryWindow>('asap')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')
  const [district, setDistrict] = useState('')
  const [notes, setNotes] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [pageError, setPageError] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [cleanupWarning, setCleanupWarning] = useState('')
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null)

  const loadCheckout = useCallback(
    () =>
      Promise.all([
        requestJson<CartRow[]>('/cart'),
        requestJson<MenuDish[]>('/menu'),
        requestJson<Customer[]>('/customers'),
        requestJson<Restaurant>('/restaurant'),
      ]),
    [],
  )

  const applyCheckoutData = useCallback(
    ([cartRows, menuItems, customerRows, restaurantData]: [
      CartRow[],
      MenuDish[],
      Customer[],
      Restaurant,
    ]) => {
      setCart(cartRows)
      setDishes(menuItems)
      setCustomers(customerRows)
      setRestaurant(restaurantData)
    },
    [],
  )

  const handlePageError = useCallback((error: unknown) => {
    setPageError(
      error instanceof Error ? error.message : 'Unable to load checkout.',
    )
  }, [])

  useEffect(() => {
    let active = true
    void loadCheckout()
      .then((data) => {
        if (active) applyCheckoutData(data)
      })
      .catch((error: unknown) => {
        if (active) handlePageError(error)
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })

    return () => {
      active = false
    }
  }, [applyCheckoutData, handlePageError, loadCheckout])

  const retryCheckout = () => {
    setPageError('')
    setIsLoading(true)
    void loadCheckout()
      .then(applyCheckoutData)
      .catch(handlePageError)
      .finally(() => setIsLoading(false))
  }

  const cartItems = useMemo(
    () =>
      cart.flatMap((row) => {
        const dish = dishes.find((item) => item.id === row.menuItemId)
        return dish ? [{ row, dish }] : []
      }),
    [cart, dishes],
  )

  const subtotal = cartItems.reduce(
    (total, { row, dish }) => total + dish.price * row.quantity,
    0,
  )
  const deliveryFee = orderType === 'delivery' ? restaurant.deliveryFee : 0
  const total = subtotal + deliveryFee

  const handlePlaceOrder = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitError('')
    setCleanupWarning('')

    if (cartItems.length === 0) {
      setSubmitError('Your cart is empty. Add a dish before placing your order.')
      return
    }

    const unavailableItem = cartItems.find(({ dish }) => !dish.available)
    if (unavailableItem) {
      setSubmitError(`${unavailableItem.dish.name} is no longer available. Please remove it from your cart.`)
      return
    }

    if (orderType === 'delivery' && !address.trim()) {
      setSubmitError('Enter your delivery street address to continue.')
      return
    }

    setIsSubmitting(true)

    try {
      let customer = customers.find(
        (entry) => entry.phone.replace(/\s+/g, '') === phone.replace(/\s+/g, ''),
      )

      if (!customer) {
        customer = await requestJson<Customer>('/customers', {
          method: 'POST',
          body: JSON.stringify({
            fullName: fullName.trim(),
            email: email.trim(),
            phone: phone.trim(),
            address: orderType === 'delivery' ? address.trim() : '',
            createdAt: new Date().toISOString(),
          }),
        })
      }

      const itemSnapshots: OrderItem[] = cartItems.map(({ row, dish }) => ({
        menuItemId: dish.id,
        name: dish.name,
        quantity: row.quantity,
        unitPrice: dish.price,
      }))
      const orderPayload = {
        orderNumber: `ORD-${Date.now()}`,
        customerId: customer.id,
        customerName: fullName.trim(),
        customerPhone: phone.trim(),
        items: itemSnapshots,
        orderType,
        deliveryAddress:
          orderType === 'delivery'
            ? [address.trim(), district.trim()].filter(Boolean).join(', ')
            : '',
        status: 'pending',
        paymentMethod,
        paymentStatus: 'unpaid',
        subtotal,
        deliveryFee,
        total,
        notes: [
          notes.trim(),
          deliveryWindow === 'asap' ? 'Immediate service' : 'Evening Grand Dinner',
          paymentMethod === 'card' || paymentMethod === 'mobile_wallet'
            ? 'Demo payment selection; no payment was processed'
            : '',
        ]
          .filter(Boolean)
          .join(' · '),
        createdAt: new Date().toISOString(),
      }

      const order = await requestJson<Order>('/orders', {
        method: 'POST',
        body: JSON.stringify(orderPayload),
      })

      setPlacedOrder(order)
      const deletions = await Promise.allSettled(
        cart.map((row) =>
          requestJson<void>(`/cart/${encodeURIComponent(row.id)}`, {
            method: 'DELETE',
          }),
        ),
      )
      const failedDeletions = deletions.filter(
        (result) => result.status === 'rejected',
      ).length
      setCart(
        cart.filter((_, index) => deletions[index]?.status === 'rejected'),
      )

      if (failedDeletions > 0) {
        setCleanupWarning(
          `Your order is confirmed, but ${failedDeletions} cart item${failedDeletions === 1 ? '' : 's'} could not be cleared. Please contact the concierge if they remain in your cart.`,
        )
      }
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : 'We could not place your order. Please try again.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (placedOrder) {
    return (
      <div className="customer-page min-h-screen bg-[#f7f7fc] text-[#202633]">
        <Navbar />
        <main className="mx-auto flex min-h-[65vh] max-w-2xl flex-col items-center justify-center px-5 py-16 text-center">
          <span className="flex size-16 items-center justify-center rounded-full bg-[#edf4eb] text-[#46714b]">
            <Check size={28} aria-hidden="true" />
          </span>
          <p className="mt-6 text-[9px] uppercase tracking-[0.22em] text-[#a94f0b]">
            Your table is being prepared
          </p>
          <h1 className="mt-2 font-serif text-4xl">Order received</h1>
          <p className="mt-3 text-sm text-[#747583]">
            Your order number is{' '}
            <span className="font-semibold text-[#202633]">
              {placedOrder.orderNumber}
            </span>
            .
          </p>
          <p className="mt-2 font-serif text-2xl text-[#a94f0b]">
            {formatPrice(placedOrder.total, restaurant.currency)}
          </p>
          {cleanupWarning && (
            <p role="status" className="mt-5 max-w-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-900">
              {cleanupWarning}
            </p>
          )}
          <a
            href="/menu"
            className="mt-7 inline-flex items-center gap-2 bg-[#a94f0b] px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.13em] text-white transition hover:bg-[#c1661b]"
          >
            Return to the menu
          </a>
        </main>
      </div>
    )
  }

  return (
    <div className="customer-page min-h-screen bg-[#f7f7fc] text-[#202633]">
      <div className="bg-[#202633] px-5 py-1.5 text-[8px] uppercase tracking-[0.17em] text-white/70 sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-[1440px] justify-between gap-4">
          <span>● Open for dinner · Kitchen closes 11:30 pm · Cairo, Egypt</span>
          <span className="hidden sm:inline">EGP (Egyptian Pound) · Admin portal →</span>
        </div>
      </div>
      <Navbar />

      <main>
        <div className="border-b border-[#e5e6f0] bg-[#f0f1fc]">
          <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-3 px-5 py-3 sm:px-8 lg:px-12">
            <p className="text-[9px] uppercase tracking-[0.13em] text-[#777785]">
              <span className="font-semibold text-[#a94f0b]">Haute reserve</span>
              <span className="mx-2">•</span>
              Encrypted checkout chamber
            </p>
            <ol aria-label="Checkout progress" className="flex flex-wrap items-center gap-2 text-[9px]">
              <li className="inline-flex items-center gap-1.5 font-semibold text-[#a94f0b]">
                <span className="flex size-4 items-center justify-center rounded-full bg-[#a94f0b] text-[8px] text-white">1</span>
                Dining style
              </li>
              <span className="hidden h-px w-6 bg-[#d2a27b] sm:block" />
              <li className="inline-flex items-center gap-1.5 text-[#555563]">
                <span className="flex size-4 items-center justify-center rounded-full bg-[#a94f0b] text-[8px] text-white">2</span>
                Delivery & schedule
              </li>
              <span className="hidden h-px w-6 bg-[#d8d8e2] sm:block" />
              <li className="inline-flex items-center gap-1.5 text-[#858592]">
                <span className="flex size-4 items-center justify-center rounded-full bg-[#e1e2ec] text-[8px]">3</span>
                Payment & seal
              </li>
            </ol>
            <span className="inline-flex items-center gap-1 text-[8px] uppercase tracking-[0.1em] text-[#747583]">
              <LockKeyhole size={11} aria-hidden="true" /> Demo secure checkout
            </span>
          </div>
        </div>

        <div className="mx-auto grid max-w-[1440px] items-start gap-5 px-5 py-6 sm:px-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(300px,0.9fr)] lg:gap-6 lg:px-12 lg:py-7">
          <form id="checkout-form" onSubmit={(event) => void handlePlaceOrder(event)} className="space-y-5">
            {pageError && (
              <div role="alert" className="border border-red-200 bg-red-50 p-4 text-xs text-red-900">
                <p className="font-semibold">Checkout details could not be loaded.</p>
                <p className="mt-1">{pageError}</p>
                <button
                  type="button"
                  onClick={retryCheckout}
                  className="mt-2 font-semibold underline"
                >
                  Try again
                </button>
              </div>
            )}
            {submitError && (
              <p role="alert" className="border border-red-200 bg-red-50 p-3 text-xs text-red-900">
                {submitError}
              </p>
            )}

            <section className="bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-[#a94f0b]">
                    Fulfillment method
                  </p>
                  <h1 className="mt-1 font-serif text-2xl">Curated dining experience</h1>
                </div>
                <span className="rounded-full bg-[#f0f1fc] px-3 py-1.5 text-[9px] text-[#555563]">
                  ● Bespoke prep: 45–55 mins
                </span>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  aria-pressed={orderType === 'delivery'}
                  onClick={() => setOrderType('delivery')}
                  className={`relative min-h-24 border p-4 text-left transition ${
                    orderType === 'delivery'
                      ? 'border-[#e8e9f1] bg-[#f1f2fc]'
                      : 'border-transparent bg-[#fbfbfe] hover:border-[#e8e9f1]'
                  }`}
                >
                  <Truck size={16} className="text-[#a94f0b]" aria-hidden="true" />
                  <span className="absolute right-3 top-3 text-[#a94f0b]">
                    {orderType === 'delivery' ? <Check size={14} /> : null}
                  </span>
                  <span className="mt-2 block font-serif text-base">White-glove delivery</span>
                  <span className="mt-1 block text-[10px] leading-4 text-[#7b7b88]">
                    Cloché-sealed porcelain temperature containers brought to your residence.
                  </span>
                </button>
                <button
                  type="button"
                  aria-pressed={orderType === 'pickup'}
                  onClick={() => setOrderType('pickup')}
                  className={`relative min-h-24 border p-4 text-left transition ${
                    orderType === 'pickup'
                      ? 'border-[#e8e9f1] bg-[#f1f2fc]'
                      : 'border-transparent bg-[#fbfbfe] hover:border-[#e8e9f1]'
                  }`}
                >
                  <MapPin size={16} className="text-[#7b8390]" aria-hidden="true" />
                  <span className="absolute right-3 top-3 text-[#a94f0b]">
                    {orderType === 'pickup' ? <Check size={14} /> : null}
                  </span>
                  <span className="mt-2 block font-serif text-base">Estate curbside pickup</span>
                  <span className="mt-1 block text-[10px] leading-4 text-[#7b7b88]">
                    Valet curbside transfer at our Zamalek sanctuary driveway.
                  </span>
                </button>
              </div>
            </section>

            <section className="bg-white p-5 shadow-sm sm:p-6">
              <p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-[#a94f0b]">
                Patron identification
              </p>
              <h2 className="mt-1 font-serif text-2xl">Personal coordinates</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-[8px] font-semibold uppercase tracking-[0.12em] text-[#777785]">
                    Full name & title
                  </span>
                  <input
                    required
                    autoComplete="name"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    placeholder="Your full name"
                    className="w-full bg-[#f0f1fc] px-3 py-2.5 text-xs outline-none transition focus:ring-1 focus:ring-[#d6a36a]"
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-[8px] font-semibold uppercase tracking-[0.12em] text-[#777785]">
                    Primary mobile
                  </span>
                  <input
                    required
                    type="tel"
                    autoComplete="tel"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    placeholder="+20 100 847 9201"
                    className="w-full bg-[#f0f1fc] px-3 py-2.5 text-xs outline-none transition focus:ring-1 focus:ring-[#d6a36a]"
                  />
                </label>
                <label className="block sm:col-span-2">
                  <span className="mb-1.5 block text-[8px] font-semibold uppercase tracking-[0.12em] text-[#777785]">
                    Receipt & concierge email
                  </span>
                  <input
                    required
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-[#f0f1fc] px-3 py-2.5 text-xs outline-none transition focus:ring-1 focus:ring-[#d6a36a]"
                  />
                </label>
                {orderType === 'delivery' && (
                  <>
                    <label className="block sm:col-span-2">
                      <span className="mb-1.5 block text-[8px] font-semibold uppercase tracking-[0.12em] text-[#777785]">
                        Street & residence / villa
                      </span>
                      <input
                        required
                        autoComplete="street-address"
                        value={address}
                        onChange={(event) => setAddress(event.target.value)}
                        placeholder="Building, street, and apartment"
                        className="w-full bg-[#f0f1fc] px-3 py-2.5 text-xs outline-none transition focus:ring-1 focus:ring-[#d6a36a]"
                      />
                    </label>
                    <label className="block sm:col-span-2">
                      <span className="mb-1.5 block text-[8px] font-semibold uppercase tracking-[0.12em] text-[#777785]">
                        Cairo district
                      </span>
                      <input
                        required
                        autoComplete="address-level2"
                        value={district}
                        onChange={(event) => setDistrict(event.target.value)}
                        placeholder="Zamalek, Maadi, Dokki..."
                        className="w-full bg-[#f0f1fc] px-3 py-2.5 text-xs outline-none transition focus:ring-1 focus:ring-[#d6a36a]"
                      />
                    </label>
                  </>
                )}
                <label className="block sm:col-span-2">
                  <span className="mb-1.5 block text-[8px] font-semibold uppercase tracking-[0.12em] text-[#777785]">
                    White-glove delivery instructions
                  </span>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    placeholder="Any directions for your concierge?"
                    className="w-full resize-y bg-[#f0f1fc] px-3 py-2.5 text-xs outline-none transition focus:ring-1 focus:ring-[#d6a36a]"
                  />
                </label>
              </div>
            </section>

            <section className="bg-white p-5 shadow-sm sm:p-6">
              <p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-[#a94f0b]">
                Pacing & service hour
              </p>
              <h2 className="mt-1 font-serif text-2xl">Delivery window</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  aria-pressed={deliveryWindow === 'asap'}
                  onClick={() => setDeliveryWindow('asap')}
                  className={`border p-4 text-left transition ${
                    deliveryWindow === 'asap'
                      ? 'border-[#a94f0b] bg-[#a94f0b] text-white'
                      : 'border-transparent bg-[#f0f1fc] text-[#303342] hover:border-[#d6a36a]'
                  }`}
                >
                  <span className="flex items-center justify-between font-serif text-base">
                    Immediate fire (ASAP)
                    <Clock3 size={14} aria-hidden="true" />
                  </span>
                  <span className={`mt-1 block text-[10px] leading-4 ${deliveryWindow === 'asap' ? 'text-white/75' : 'text-[#777785]'}`}>
                    Cooked to order, dispatched under thermal cloche seal.
                  </span>
                </button>
                <button
                  type="button"
                  aria-pressed={deliveryWindow === 'evening'}
                  onClick={() => setDeliveryWindow('evening')}
                  className={`border p-4 text-left transition ${
                    deliveryWindow === 'evening'
                      ? 'border-[#a94f0b] bg-[#a94f0b] text-white'
                      : 'border-transparent bg-[#f0f1fc] text-[#303342] hover:border-[#d6a36a]'
                  }`}
                >
                  <span className="flex items-center justify-between font-serif text-base">
                    Evening grand dinner
                    <Clock3 size={14} aria-hidden="true" />
                  </span>
                  <span className={`mt-1 block text-[10px] leading-4 ${deliveryWindow === 'evening' ? 'text-white/75' : 'text-[#777785]'}`}>
                    Reserved service window: 8:30 pm – 9:15 pm tonight.
                  </span>
                </button>
              </div>
            </section>

            <section className="bg-white p-5 shadow-sm sm:p-6">
              <p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-[#a94f0b]">
                Fiscal settlement
              </p>
              <h2 className="mt-1 font-serif text-2xl">Payment sanctuary</h2>
              <div className="mt-4 grid grid-cols-3 gap-1 bg-[#f0f1fc] p-1">
                {([
                  ['card', CreditCard, 'Card / Meeza'],
                  ['mobile_wallet', Smartphone, 'Apple / Google Pay'],
                  ['cash', Wallet, 'Cash on delivery'],
                ] as const).map(([method, Icon, label]) => (
                  <button
                    key={method}
                    type="button"
                    aria-pressed={paymentMethod === method}
                    onClick={() => setPaymentMethod(method)}
                    className={`flex min-h-9 items-center justify-center gap-1 px-1 text-[8px] transition sm:text-[9px] ${
                      paymentMethod === method
                        ? 'bg-white text-[#a94f0b] shadow-sm'
                        : 'text-[#666674] hover:text-[#a94f0b]'
                    }`}
                  >
                    <Icon size={12} aria-hidden="true" />
                    {label}
                  </button>
                ))}
              </div>

              {paymentMethod === 'card' ? (
                <div className="mt-4 rounded-sm bg-gradient-to-br from-[#252b38] to-[#454b5a] p-5 text-white shadow-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-serif text-[10px] tracking-[0.17em] text-[#e2c29f]">
                      SAFFRON & STONE RESERVE
                    </span>
                    <CreditCard size={16} className="text-[#e2c29f]" aria-hidden="true" />
                  </div>
                  <div className="mt-5 h-6 w-9 rounded-sm bg-gradient-to-br from-[#f1d880] to-[#9b7412]" />
                  <p className="mt-5 font-mono text-sm tracking-[0.18em]">••••  ••••  ••••  ••••</p>
                  <div className="mt-3 flex justify-between text-[8px] uppercase tracking-[0.12em] text-white/55">
                    <span>Secure demo card selection</span>
                    <span>No payment processed</span>
                  </div>
                </div>
              ) : (
                <div className="mt-4 flex min-h-28 items-center gap-4 bg-[#f0f1fc] p-5">
                  {paymentMethod === 'cash' ? (
                    <Wallet size={23} className="shrink-0 text-[#a94f0b]" aria-hidden="true" />
                  ) : (
                    <Smartphone size={23} className="shrink-0 text-[#a94f0b]" aria-hidden="true" />
                  )}
                  <div>
                    <p className="font-serif text-lg">
                      {paymentMethod === 'cash' ? 'Settle at your door' : 'Mobile wallet'}
                    </p>
                    <p className="mt-1 text-[10px] leading-4 text-[#777785]">
                      {paymentMethod === 'cash'
                        ? 'Pay the concierge upon delivery or pickup. No online payment is taken.'
                        : 'This demo records your preferred method only. No wallet is charged.'}
                    </p>
                  </div>
                </div>
              )}
              <p className="mt-3 flex items-start gap-2 text-[9px] leading-4 text-[#858592]">
                <ShieldCheck size={13} className="mt-0.5 shrink-0 text-[#a94f0b]" aria-hidden="true" />
                This checkout is a demonstration. Do not enter real card details; no financial transaction occurs.
              </p>
            </section>
          </form>

          <aside className="overflow-hidden bg-white shadow-lg shadow-[#202633]/10 lg:sticky lg:top-5">
            <div className="flex items-center justify-between px-5 pb-3 pt-5 sm:px-6">
              <div>
                <p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-[#a94f0b]">
                  Order chamber
                </p>
                <h2 className="mt-1 font-serif text-2xl">Curated ledger</h2>
              </div>
              <span className="rounded-full bg-[#f0f1fc] px-2.5 py-1 text-[8px] tracking-[0.1em] text-[#555563]">
                {cartItems.length} selections
              </span>
            </div>

            {pageError ? (
              <div className="p-6 text-xs text-[#777785]">
                Cart details are unavailable until the server reconnects.
              </div>
            ) : isLoading ? (
              <div role="status" className="space-y-3 px-5 py-5">
                <div className="h-14 animate-pulse bg-[#f0f1fc]" />
                <div className="h-14 animate-pulse bg-[#f0f1fc]" />
                <span className="sr-only">Loading your order...</span>
              </div>
            ) : cartItems.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <p className="font-serif text-lg">The ledger is empty</p>
                <a href="/menu" className="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold text-[#a94f0b]">
                  <ArrowLeft size={12} aria-hidden="true" /> Return to the menu
                </a>
              </div>
            ) : (
              <div className="space-y-3 px-5 sm:px-6">
                {cartItems.map(({ row, dish }) => (
                  <article key={row.id} className="flex gap-3">
                    <img
                      src={dish.imageUrl}
                      alt=""
                      className="size-12 shrink-0 rounded-sm object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-serif text-sm leading-5">{dish.name}</h3>
                        <span className="shrink-0 text-[10px] font-semibold text-[#a94f0b]">
                          {formatPrice(dish.price * row.quantity, restaurant.currency)}
                        </span>
                      </div>
                      <p className="mt-0.5 line-clamp-2 text-[9px] leading-4 text-[#858592]">
                        {dish.description}
                      </p>
                      <p className="mt-0.5 text-[8px] text-[#858592]">
                        Qty: {row.quantity}
                        {row.note ? ` · ${row.note}` : ''}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            )}

            <div className="mx-5 mt-4 flex items-center justify-between bg-[#f0f1fc] px-3 py-2.5 text-[9px] sm:mx-6">
              <span className="font-medium">★ Chef&apos;s compliment</span>
              <span className="text-[8px] uppercase tracking-[0.12em] text-[#777785]">Gifted</span>
              <span className="sr-only">Saffron petit fours and mint essence</span>
            </div>
            <p className="px-8 pt-1 text-center text-[8px] leading-4 text-[#858592]">
              Saffron petit fours & mint essence
            </p>

            <div className="space-y-2 px-5 pt-4 text-[10px] sm:px-6">
              <div className="flex justify-between text-[#777785]">
                <span>Culinary subtotal</span>
                <span>{formatPrice(subtotal, restaurant.currency)}</span>
              </div>
              <div className="flex justify-between text-[#777785]">
                <span>
                  {orderType === 'delivery' ? 'White-glove courier fee' : 'Estate pickup'}
                </span>
                <span>{formatPrice(deliveryFee, restaurant.currency)}</span>
              </div>
              <p className="text-[8px] leading-4 text-[#92929d]">
                No additional tax or payment processing is applied in this demo.
              </p>
            </div>

            <div className="mx-5 mt-3 flex items-center justify-between border border-[#181c25] bg-[#252b38] px-4 py-3 text-white sm:mx-6">
              <div>
                <p className="text-[8px] font-semibold uppercase tracking-[0.14em] text-[#e3c7a8]">
                  Grand total due
                </p>
                <p className="mt-1 text-[8px] text-white/55">
                  Inclusive of applicable delivery
                </p>
              </div>
              <p className="text-right font-serif text-2xl leading-6">
                {formatPrice(total, restaurant.currency)}
              </p>
            </div>

            <div className="flex justify-between gap-3 px-5 py-3 text-[8px] font-medium uppercase tracking-[0.08em] text-[#747583] sm:px-6">
              <span className="inline-flex items-center gap-1">
                <ShieldCheck size={11} className="text-[#a94f0b]" aria-hidden="true" />
                Demo checkout
              </span>
              <span className="inline-flex items-center gap-1">
                <Check size={11} className="text-[#a94f0b]" aria-hidden="true" />
                Order verified
              </span>
            </div>

            <div className="px-5 pb-5 sm:px-6">
              <button
                type="submit"
                form="checkout-form"
                disabled={isLoading || Boolean(pageError) || isSubmitting || cartItems.length === 0}
                className="flex w-full items-center justify-center gap-2 bg-[#a94f0b] px-4 py-3.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-white shadow-sm transition hover:bg-[#c1661b] disabled:cursor-not-allowed disabled:bg-[#d2d2da]"
              >
                <LockKeyhole size={13} aria-hidden="true" />
                {isSubmitting
                  ? 'Securing your order...'
                  : `Authorize & place order · ${formatPrice(total, restaurant.currency)}`}
              </button>
              <p className="mt-3 text-center text-[8px] leading-4 text-[#858592]">
                By placing your order, you agree to our concierge service and
                reservation policy.
              </p>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  )
}
