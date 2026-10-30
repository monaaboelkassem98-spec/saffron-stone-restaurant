import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ArrowDownWideNarrow,
  ArrowUpRight,
  Check,
  ChefHat,
  ChevronDown,
  Clock3,
  Minus,
  Plus,
  Search,
  ShoppingBag,
  Star,
  Trash2,
  UtensilsCrossed,
  X,
} from 'lucide-react'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'

interface Category {
  id: string
  name: string
  slug?: string
  description?: string
  imageUrl?: string
  sortOrder?: number
  isActive?: boolean
}

interface MenuDish {
  id: string
  name: string
  description: string
  price: number
  categoryId: string
  imageUrl: string
  available: boolean
  isFeatured?: boolean
  prepTimeMinutes?: number
  rating?: number
}

interface CartRow {
  id: string
  menuItemId: string
  quantity: number
  note?: string
}

type SortOrder = 'featured' | 'rating' | 'price-asc' | 'price-desc'

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

  return response.json() as Promise<T>
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-EG', {
    maximumFractionDigits: 0,
  }).format(price)
}

export default function Menu() {
  const [categories, setCategories] = useState<Category[]>([])
  const [dishes, setDishes] = useState<MenuDish[]>([])
  const [cart, setCart] = useState<CartRow[]>([])
  const [selectedCategory, setSelectedCategory] = useState(
    () => new URLSearchParams(window.location.search).get('categoryId') ?? 'all',
  )
  const [search, setSearch] = useState('')
  const [featuredOnly, setFeaturedOnly] = useState(false)
  const [availableOnly, setAvailableOnly] = useState(false)
  const [sortOrder, setSortOrder] = useState<SortOrder>('featured')
  const [isLoading, setIsLoading] = useState(true)
  const [pageError, setPageError] = useState('')
  const [cartError, setCartError] = useState('')
  const [busyDishId, setBusyDishId] = useState<string | null>(null)
  const [busyCartId, setBusyCartId] = useState<string | null>(null)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [selectedDish, setSelectedDish] = useState<MenuDish | null>(null)

  const loadPage = useCallback(
    () =>
      Promise.all([
        requestJson<Category[]>('/categories'),
        requestJson<MenuDish[]>('/menu'),
        requestJson<CartRow[]>('/cart'),
      ]),
    [],
  )

  const applyPageData = useCallback(
    ([categoryData, dishData, cartData]: [
      Category[],
      MenuDish[],
      CartRow[],
    ]) => {
      setCategories(
        categoryData
          .filter((category) => category.isActive !== false)
          .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
      )
      setDishes(dishData)
      setCart(cartData)
    },
    [],
  )

  const handlePageError = useCallback((error: unknown) => {
    setPageError(
      error instanceof Error
        ? error.message
        : 'Unable to load the menu. Please try again.',
    )
  }, [])

  useEffect(() => {
    let active = true
    void loadPage()
      .then((data) => {
        if (active) applyPageData(data)
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
  }, [applyPageData, handlePageError, loadPage])

  const retryPage = () => {
    setIsLoading(true)
    setPageError('')
    void loadPage()
      .then(applyPageData)
      .catch(handlePageError)
      .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    const openCartFromHash = () => {
      if (window.location.hash === '#cart') setIsCartOpen(true)
    }

    openCartFromHash()
    window.addEventListener('hashchange', openCartFromHash)
    return () => window.removeEventListener('hashchange', openCartFromHash)
  }, [])

  useEffect(() => {
    if (!selectedDish) return

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedDish(null)
    }

    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [selectedDish])

  const filteredDishes = useMemo(() => {
    const query = search.trim().toLocaleLowerCase()

    const result = dishes.filter((dish) => {
      const matchesCategory =
        selectedCategory === 'all' || dish.categoryId === selectedCategory
      const matchesSearch =
        !query ||
        dish.name.toLocaleLowerCase().includes(query) ||
        dish.description.toLocaleLowerCase().includes(query)
      const matchesFeatured = !featuredOnly || dish.isFeatured
      const matchesAvailability = !availableOnly || dish.available

      return (
        matchesCategory &&
        matchesSearch &&
        matchesFeatured &&
        matchesAvailability
      )
    })

    return result.sort((a, b) => {
      if (sortOrder === 'price-asc') return a.price - b.price
      if (sortOrder === 'price-desc') return b.price - a.price
      if (sortOrder === 'rating') return (b.rating ?? 0) - (a.rating ?? 0)
      return Number(Boolean(b.isFeatured)) - Number(Boolean(a.isFeatured))
    })
  }, [
    availableOnly,
    dishes,
    featuredOnly,
    search,
    selectedCategory,
    sortOrder,
  ])

  const cartDishes = useMemo(
    () =>
      cart.flatMap((row) => {
        const dish = dishes.find((item) => item.id === row.menuItemId)
        return dish ? [{ row, dish }] : []
      }),
    [cart, dishes],
  )

  const cartCount = cart.reduce((total, row) => total + row.quantity, 0)
  const cartTotal = cartDishes.reduce(
    (total, item) => total + item.row.quantity * item.dish.price,
    0,
  )

  const addToCart = async (dish: MenuDish) => {
    setBusyDishId(dish.id)
    setCartError('')

    try {
      const existingRow = cart.find((row) => row.menuItemId === dish.id)

      if (existingRow) {
        await requestJson<CartRow>(`/cart/${encodeURIComponent(existingRow.id)}`, {
          method: 'PATCH',
          body: JSON.stringify({ quantity: existingRow.quantity + 1 }),
        })
      } else {
        await requestJson<CartRow>('/cart', {
          method: 'POST',
          body: JSON.stringify({
            menuItemId: dish.id,
            quantity: 1,
            note: '',
            addedAt: new Date().toISOString(),
          }),
        })
      }

      setCart(await requestJson<CartRow[]>('/cart'))
    } catch (error) {
      setCartError(
        error instanceof Error
          ? error.message
          : 'Could not add this dish to your cart.',
      )
    } finally {
      setBusyDishId(null)
    }
  }

  const updateQuantity = async (row: CartRow, quantity: number) => {
    setBusyCartId(row.id)
    setCartError('')

    try {
      if (quantity < 1) {
        await requestJson<void>(`/cart/${encodeURIComponent(row.id)}`, {
          method: 'DELETE',
        })
      } else {
        await requestJson<CartRow>(`/cart/${encodeURIComponent(row.id)}`, {
          method: 'PATCH',
          body: JSON.stringify({ quantity }),
        })
      }

      setCart(await requestJson<CartRow[]>('/cart'))
    } catch (error) {
      setCartError(
        error instanceof Error
          ? error.message
          : 'Could not update your cart.',
      )
    } finally {
      setBusyCartId(null)
    }
  }

  const visibleCart = (
    <div className="flex h-full flex-col">
      <div className="flex items-start justify-between border-b border-[#e8e8f0] px-5 py-5">
        <div>
          <p className="text-[9px] uppercase tracking-[0.2em] text-[#a94f0b]">
            Your tasting cart
          </p>
          <h2 className="mt-1 font-serif text-2xl text-[#202633]">
            A table for you
          </h2>
          <p className="mt-1 text-[10px] text-[#858592]">
            {cartCount} {cartCount === 1 ? 'selection' : 'selections'} · EGP
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsCartOpen(false)}
          aria-label="Close cart"
          className="rounded-full p-2 text-[#777785] transition hover:bg-[#f0f1fc] md:hidden"
        >
          <X size={17} />
        </button>
      </div>

      {cartError && (
        <p role="alert" className="mx-4 mt-4 rounded-sm bg-red-50 px-3 py-2 text-xs text-red-800">
          {cartError}
        </p>
      )}

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
        {cartDishes.length === 0 ? (
          <div className="flex h-full min-h-48 flex-col items-center justify-center text-center">
            <ShoppingBag size={25} className="text-[#b0b0bd]" aria-hidden="true" />
            <p className="mt-3 font-serif text-lg text-[#393a47]">
              Your cart is waiting
            </p>
            <p className="mt-1 max-w-48 text-xs leading-5 text-[#858592]">
              Add a dish from our menu and we&apos;ll save you a place.
            </p>
          </div>
        ) : (
          cartDishes.map(({ row, dish }) => (
            <article
              key={row.id}
              className="flex gap-3 border-b border-[#ededf2] pb-3 last:border-0"
            >
              <img
                src={dish.imageUrl}
                alt=""
                className="size-[68px] shrink-0 rounded-sm object-cover"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-serif text-sm leading-5 text-[#202633]">
                    {dish.name}
                  </h3>
                  <button
                    type="button"
                    onClick={() => void updateQuantity(row, 0)}
                    disabled={busyCartId === row.id}
                    aria-label={`Remove ${dish.name} from cart`}
                    className="shrink-0 p-1 text-[#92929e] hover:text-[#a94f0b] disabled:opacity-50"
                  >
                    <Trash2 size={13} aria-hidden="true" />
                  </button>
                </div>
                <p className="mt-1 text-[11px] font-semibold text-[#a94f0b]">
                  {formatPrice(dish.price * row.quantity)} EGP
                </p>
                <div className="mt-2 inline-flex items-center gap-2 border border-[#e7e7ef] px-1.5 py-1">
                  <button
                    type="button"
                    onClick={() => void updateQuantity(row, row.quantity - 1)}
                    disabled={busyCartId === row.id}
                    aria-label={`Decrease ${dish.name} quantity`}
                    className="p-0.5 text-[#6d6d7b] hover:text-[#a94f0b] disabled:opacity-50"
                  >
                    <Minus size={12} aria-hidden="true" />
                  </button>
                  <span className="min-w-4 text-center text-[10px]">{row.quantity}</span>
                  <button
                    type="button"
                    onClick={() => void updateQuantity(row, row.quantity + 1)}
                    disabled={busyCartId === row.id}
                    aria-label={`Increase ${dish.name} quantity`}
                    className="p-0.5 text-[#6d6d7b] hover:text-[#a94f0b] disabled:opacity-50"
                  >
                    <Plus size={12} aria-hidden="true" />
                  </button>
                </div>
              </div>
            </article>
          ))
        )}
      </div>

      <div className="border-t border-[#e8e8f0] p-5">
        <div className="flex items-center justify-between text-xs text-[#737381]">
          <span>Subtotal</span>
          <span>{formatPrice(cartTotal)} EGP</span>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs font-semibold text-[#202633]">Total tasting investment</span>
          <span className="font-serif text-xl font-semibold text-[#a94f0b]">
            {formatPrice(cartTotal)} EGP
          </span>
        </div>
        <a
          href="/checkout"
          className={`mt-4 flex w-full items-center justify-center gap-2 px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] transition ${
            cartCount > 0
              ? 'bg-[#a94f0b] text-white hover:bg-[#c1661b]'
              : 'pointer-events-none bg-[#e8e8f0] text-[#9a9aa5]'
          }`}
          aria-disabled={cartCount === 0}
        >
          Continue to checkout <ArrowUpRight size={14} aria-hidden="true" />
        </a>
        <p className="mt-3 text-center text-[9px] uppercase tracking-[0.12em] text-[#9696a0]">
          A table · Butler priority service
        </p>
      </div>
    </div>
  )

  return (
    <div className="customer-page min-h-screen bg-[#f7f7fc] text-[#202633]">
      <div className="bg-[#171b24] px-5 py-2 text-[9px] uppercase tracking-[0.2em] text-white/65 sm:px-8 lg:px-12">
        Open for dinner · Kitchen closes at 10 pm · Cairo, Egypt
      </div>
      <Navbar />

      <main>
        <section className="border-b border-[#e8e8f0] bg-[#f0f1fc]">
          <div className="mx-auto max-w-[1440px] px-5 py-8 sm:px-8 lg:px-12 lg:py-10">
            <p className="text-[9px] uppercase tracking-[0.23em] text-[#a94f0b]">
              ◆ Grand autumn service · Cairo botanical cellar
            </p>
            <div className="mt-2 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div className="max-w-2xl">
                <h1 className="font-serif text-4xl leading-tight text-[#202633] sm:text-5xl">
                  The Culinary Ledger
                </h1>
                <p className="mt-2 max-w-xl text-xs leading-6 text-[#747583] sm:text-sm">
                  Charred Nile Delta seasonality infused with certified
                  single-origin spices, aged with care, and brought to your
                  table over hand-carved basalt.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <div className="flex min-w-40 items-center gap-3 border border-white bg-white/70 px-4 py-3">
                  <span className="flex size-9 items-center justify-center rounded-sm bg-[#fbede2] text-[#a94f0b]">
                    <ChefHat size={17} aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block text-[8px] uppercase tracking-[0.16em] text-[#898994]">
                      Kitchen status
                    </span>
                    <span className="mt-1 block text-[10px] font-medium text-[#313241]">
                      <span className="mr-1.5 inline-block size-1.5 rounded-full bg-emerald-500" />
                      Service active · Table 14
                    </span>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCartOpen(true)}
                  className="flex min-w-40 items-center gap-3 bg-[#a94f0b] px-4 py-3 text-left text-white transition hover:bg-[#c1661b] md:hidden"
                >
                  <ShoppingBag size={18} aria-hidden="true" />
                  <span>
                    <span className="block text-[8px] uppercase tracking-[0.16em] text-white/70">
                      Your order
                    </span>
                    <span className="mt-1 block text-[10px] font-medium">
                      {cartCount} items · {formatPrice(cartTotal)} EGP
                    </span>
                  </span>
                </button>
              </div>
            </div>
          </div>
        </section>

        <div className="mx-auto grid max-w-[1440px] gap-6 px-5 py-6 sm:px-8 md:grid-cols-[minmax(0,1fr)_210px] md:gap-4 lg:px-12 lg:py-8 xl:grid-cols-[minmax(0,1fr)_280px] xl:gap-8">
          <section aria-label="Restaurant menu">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <label className="flex min-h-10 flex-1 items-center gap-3 border border-[#e4e5ef] bg-white px-3.5 text-[#858592] xl:max-w-sm">
                <Search size={15} aria-hidden="true" />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search dishes, saffron, wagyu, sumac..."
                  aria-label="Search menu dishes"
                  className="w-full bg-transparent text-xs text-[#202633] outline-none placeholder:text-[#9a9aa5]"
                />
              </label>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  aria-pressed={featuredOnly}
                  onClick={() => setFeaturedOnly((value) => !value)}
                  className={`inline-flex items-center gap-1.5 border px-3 py-2 text-[9px] uppercase tracking-[0.08em] transition ${
                    featuredOnly
                      ? 'border-[#a94f0b] bg-[#a94f0b] text-white'
                      : 'border-[#e4e5ef] bg-white text-[#666674] hover:border-[#c5a17e]'
                  }`}
                >
                  <Star size={12} aria-hidden="true" /> Chef&apos;s signatures
                </button>
                <button
                  type="button"
                  aria-pressed={availableOnly}
                  onClick={() => setAvailableOnly((value) => !value)}
                  className={`inline-flex items-center gap-1.5 border px-3 py-2 text-[9px] uppercase tracking-[0.08em] transition ${
                    availableOnly
                      ? 'border-[#a94f0b] bg-[#a94f0b] text-white'
                      : 'border-[#e4e5ef] bg-white text-[#666674] hover:border-[#c5a17e]'
                  }`}
                >
                  <Check size={12} aria-hidden="true" /> Available now
                </button>
                <label className="relative flex items-center gap-2 border border-[#e4e5ef] bg-white px-3 py-2 text-[9px] text-[#666674]">
                  <ArrowDownWideNarrow size={13} aria-hidden="true" />
                  <span className="sr-only">Sort dishes</span>
                  <select
                    value={sortOrder}
                    onChange={(event) => setSortOrder(event.target.value as SortOrder)}
                    aria-label="Sort dishes"
                    className="appearance-none bg-transparent pr-4 text-[9px] outline-none"
                  >
                    <option value="featured">Most celebrated</option>
                    <option value="rating">Highest rated</option>
                    <option value="price-asc">Price: low to high</option>
                    <option value="price-desc">Price: high to low</option>
                  </select>
                  <ChevronDown
                    size={12}
                    className="pointer-events-none absolute right-2"
                    aria-hidden="true"
                  />
                </label>
              </div>
            </div>

            <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
              <button
                type="button"
                aria-pressed={selectedCategory === 'all'}
                onClick={() => setSelectedCategory('all')}
                className={`shrink-0 px-4 py-2.5 text-[10px] font-medium transition ${
                  selectedCategory === 'all'
                    ? 'bg-[#a94f0b] text-white'
                    : 'border border-[#e4e5ef] bg-white text-[#555563] hover:border-[#c5a17e]'
                }`}
              >
                All offerings ({dishes.length})
              </button>
              {categories.map((category) => {
                const count = dishes.filter(
                  (dish) => dish.categoryId === category.id,
                ).length

                return (
                  <button
                    key={category.id}
                    type="button"
                    aria-pressed={selectedCategory === category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`shrink-0 px-4 py-2.5 text-[10px] font-medium transition ${
                      selectedCategory === category.id
                        ? 'bg-[#a94f0b] text-white'
                        : 'border border-[#e4e5ef] bg-white text-[#555563] hover:border-[#c5a17e]'
                    }`}
                  >
                    {category.name} ({count})
                  </button>
                )
              })}
            </div>

            {pageError && (
              <div
                role="alert"
                className="mt-6 flex flex-col items-start justify-between gap-4 border border-red-200 bg-red-50 p-5 sm:flex-row sm:items-center"
              >
                <div>
                  <p className="text-sm font-semibold text-red-900">
                    We couldn&apos;t load the culinary ledger.
                  </p>
                  <p className="mt-1 text-xs text-red-800">{pageError}</p>
                  <p className="mt-1 text-[10px] text-red-700">
                    Check that the JSON Server is running at {API_BASE_URL}.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={retryPage}
                  className="shrink-0 bg-red-900 px-4 py-2 text-xs font-medium text-white hover:bg-red-800"
                >
                  Try again
                </button>
              </div>
            )}

            {isLoading ? (
              <div
                role="status"
                className="grid gap-3 py-6 sm:grid-cols-2 md:grid-cols-3"
              >
                {Array.from({ length: 6 }, (_, index) => (
                  <div
                    key={index}
                    className="h-[360px] animate-pulse bg-white shadow-sm"
                  >
                    <div className="h-48 bg-[#e7e8f1]" />
                    <div className="space-y-3 p-4">
                      <div className="h-4 w-3/4 bg-[#e7e8f1]" />
                      <div className="h-3 w-full bg-[#f0f1f6]" />
                      <div className="h-8 w-1/2 bg-[#f0f1f6]" />
                    </div>
                  </div>
                ))}
                <span className="sr-only">Loading menu...</span>
              </div>
            ) : !pageError && filteredDishes.length === 0 ? (
              <div className="mt-6 flex min-h-60 flex-col items-center justify-center border border-dashed border-[#d9dae5] bg-white px-6 text-center">
                <UtensilsCrossed size={24} className="text-[#a94f0b]" aria-hidden="true" />
                <h2 className="mt-3 font-serif text-xl">Nothing on the ledger just yet</h2>
                <p className="mt-1 max-w-sm text-xs leading-5 text-[#858592]">
                  Try another category or search term to find your next favourite.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearch('')
                    setFeaturedOnly(false)
                    setAvailableOnly(false)
                    setSelectedCategory('all')
                  }}
                  className="mt-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#a94f0b] hover:text-[#7e3907]"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <>
                <div className="mt-6 flex items-center justify-between border-b border-[#e5e5ee] pb-3">
                  <h2 className="font-serif text-lg text-[#202633]">
                    Curation <span className="text-[#a94f0b]">•</span>
                    <span className="ml-1 font-sans text-[10px] text-[#858592]">
                      Showing {filteredDishes.length} considered compositions
                    </span>
                  </h2>
                  <p className="hidden text-[8px] uppercase tracking-[0.16em] text-[#858592] sm:block">
                    Kitchen currency: EGP
                  </p>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                  {filteredDishes.map((dish) => {
                    const category = categories.find(
                      (item) => item.id === dish.categoryId,
                    )

                    return (
                      <article
                        key={dish.id}
                        className="group flex flex-col overflow-hidden border border-[#e7e7ef] bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
                      >
                        <div className="relative h-36 overflow-hidden bg-[#e8e8ee] sm:h-40">
                          <img
                            src={dish.imageUrl}
                            alt={dish.name}
                            loading="lazy"
                            className="size-full object-cover transition duration-500 group-hover:scale-105"
                          />
                          <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3">
                            <span className="bg-[#202633]/90 px-2.5 py-1.5 text-[8px] font-semibold uppercase tracking-[0.12em] text-white">
                              {dish.isFeatured ? 'Chef’s signature' : category?.name ?? 'From the kitchen'}
                            </span>
                            {!dish.available && (
                              <span className="bg-white/90 px-2.5 py-1.5 text-[8px] font-semibold uppercase tracking-[0.12em] text-[#858592]">
                                Unavailable
                              </span>
                            )}
                          </div>
                          {typeof dish.rating === 'number' && (
                            <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 bg-[#202633]/85 px-2 py-1 text-[9px] text-white">
                              <Star
                                size={11}
                                fill="currentColor"
                                className="text-[#e7b26f]"
                                aria-hidden="true"
                              />
                              {dish.rating.toFixed(1)} / 5
                            </span>
                          )}
                        </div>

                        <div className="flex flex-1 flex-col p-3 sm:p-4">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-serif text-base leading-5 text-[#202633] sm:text-lg">
                              {dish.name}
                            </h3>
                            {typeof dish.prepTimeMinutes === 'number' && (
                              <span className="inline-flex shrink-0 items-center gap-1 text-[9px] text-[#858592]">
                                <Clock3 size={11} aria-hidden="true" />
                                {dish.prepTimeMinutes} min
                              </span>
                            )}
                          </div>
                          <p className="mt-2 min-h-10 text-[10px] leading-4 text-[#777784]">
                            {dish.description}
                          </p>
                          <div className="mt-auto flex flex-wrap gap-1.5 pt-3">
                            {dish.isFeatured && (
                              <span className="border border-[#ead5c4] bg-[#fbf4ee] px-2 py-1 text-[8px] uppercase tracking-[0.08em] text-[#925025]">
                                House selection
                              </span>
                            )}
                            <span
                              className={`inline-flex items-center gap-1 border px-2 py-1 text-[8px] uppercase tracking-[0.08em] ${
                                dish.available
                                  ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                                  : 'border-[#e7e7ef] bg-[#f0f1fc] text-[#777784]'
                              }`}
                            >
                              <span
                                className={`size-1.5 rounded-full ${
                                  dish.available ? 'bg-emerald-600' : 'bg-[#92929d]'
                                }`}
                              />
                              {dish.available ? 'Available' : 'Currently unavailable'}
                            </span>
                          </div>

                          <div className="mt-4 flex items-end justify-between gap-2 border-t border-[#ededf2] pt-3">
                            <p>
                              <span className="block text-[8px] uppercase tracking-[0.15em] text-[#92929d]">
                                Tasting price
                              </span>
                              <span className="mt-0.5 block font-serif text-xl font-semibold text-[#a94f0b]">
                                {formatPrice(dish.price)} EGP
                              </span>
                            </p>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => setSelectedDish(dish)}
                                aria-label={`Discover ${dish.name}`}
                                className="inline-flex items-center gap-1 border border-[#e7e7ef] bg-white px-2.5 py-2.5 text-[9px] font-medium text-[#555563] transition hover:border-[#d6a36a] hover:text-[#a94f0b]"
                              >
                                Discover
                              </button>
                              <button
                                type="button"
                                onClick={() => void addToCart(dish)}
                                disabled={!dish.available || busyDishId === dish.id}
                                className="inline-flex items-center gap-1 bg-[#a94f0b] px-2.5 py-2.5 text-[9px] font-semibold text-white transition hover:bg-[#c1661b] disabled:cursor-not-allowed disabled:bg-[#d4d4dc] disabled:text-[#777784]"
                              >
                                {busyDishId === dish.id ? (
                                  <>
                                    <span className="size-3 animate-spin rounded-full border border-white/40 border-t-white" />
                                    Adding
                                  </>
                                ) : (
                                  <>
                                    <Plus size={12} aria-hidden="true" />
                                    Add
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </article>
                    )
                  })}
                </div>
              </>
            )}
          </section>

          <aside
            id="cart"
            className="sticky top-5 hidden h-[calc(100vh-2.5rem)] min-h-[480px] border border-[#e7e7ef] bg-white shadow-lg shadow-[#202633]/5 md:block"
          >
            {visibleCart}
          </aside>
        </div>
      </main>

      <Footer />

      {selectedDish && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-[#171b24]/65 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedDish(null)
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="dish-details-title"
            className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto bg-white shadow-2xl"
          >
            <button
              type="button"
              onClick={() => setSelectedDish(null)}
              aria-label="Close dish details"
              className="absolute right-3 top-3 z-10 flex size-9 items-center justify-center rounded-full bg-[#202633]/85 text-white transition hover:bg-[#a94f0b]"
            >
              <X size={17} aria-hidden="true" />
            </button>
            <div className="relative h-56 bg-[#e8e8ee] sm:h-64">
              <img
                src={selectedDish.imageUrl}
                alt={selectedDish.name}
                className="size-full object-cover"
              />
              <span className="absolute bottom-3 left-3 bg-[#202633]/90 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-white">
                {selectedDish.isFeatured ? 'Chef’s signature' : categories.find((category) => category.id === selectedDish.categoryId)?.name ?? 'From the kitchen'}
              </span>
            </div>

            <div className="p-5 sm:p-7">
              <p className="text-[9px] uppercase tracking-[0.18em] text-[#a94f0b]">
                Culinary composition · {selectedDish.id}
              </p>
              <h2
                id="dish-details-title"
                className="mt-1 font-serif text-2xl text-[#202633] sm:text-3xl"
              >
                {selectedDish.name}
              </h2>
              <p className="mt-3 text-sm leading-6 text-[#747583]">
                {selectedDish.description}
              </p>

              <dl className="mt-5 grid grid-cols-2 gap-3">
                <div className="border border-[#e7e7ef] bg-[#f7f7fc] p-3">
                  <dt className="text-[8px] uppercase tracking-[0.13em] text-[#858592]">
                    Guest rating
                  </dt>
                  <dd className="mt-1 inline-flex items-center gap-1.5 text-sm font-semibold text-[#303342]">
                    {typeof selectedDish.rating === 'number' ? (
                      <>
                        <Star
                          size={14}
                          fill="currentColor"
                          className="text-[#a94f0b]"
                          aria-hidden="true"
                        />
                        {selectedDish.rating.toFixed(1)} / 5
                      </>
                    ) : (
                      'Not yet rated'
                    )}
                  </dd>
                </div>
                <div className="border border-[#e7e7ef] bg-[#f7f7fc] p-3">
                  <dt className="text-[8px] uppercase tracking-[0.13em] text-[#858592]">
                    Preparation
                  </dt>
                  <dd className="mt-1 inline-flex items-center gap-1.5 text-sm font-semibold text-[#303342]">
                    <Clock3 size={14} className="text-[#a94f0b]" aria-hidden="true" />
                    {typeof selectedDish.prepTimeMinutes === 'number'
                      ? `${selectedDish.prepTimeMinutes} minutes`
                      : 'To be confirmed'}
                  </dd>
                </div>
                <div className="border border-[#e7e7ef] bg-[#f7f7fc] p-3">
                  <dt className="text-[8px] uppercase tracking-[0.13em] text-[#858592]">
                    Availability
                  </dt>
                  <dd
                    className={`mt-1 inline-flex items-center gap-1.5 text-sm font-semibold ${
                      selectedDish.available ? 'text-emerald-700' : 'text-[#777784]'
                    }`}
                  >
                    <span
                      className={`size-2 rounded-full ${
                        selectedDish.available ? 'bg-emerald-600' : 'bg-[#92929d]'
                      }`}
                    />
                    {selectedDish.available ? 'Available to order' : 'Currently unavailable'}
                  </dd>
                </div>
                <div className="border border-[#e7e7ef] bg-[#f7f7fc] p-3">
                  <dt className="text-[8px] uppercase tracking-[0.13em] text-[#858592]">
                    Price
                  </dt>
                  <dd className="mt-1 font-serif text-lg font-semibold text-[#a94f0b]">
                    {formatPrice(selectedDish.price)} EGP
                  </dd>
                </div>
              </dl>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#ededf2] pt-4">
                <span className="text-[9px] text-[#858592]">
                  {selectedDish.isFeatured ? 'Selected by our chef' : 'Prepared fresh to order'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    void addToCart(selectedDish)
                    if (selectedDish.available) setSelectedDish(null)
                  }}
                  disabled={!selectedDish.available || busyDishId === selectedDish.id}
                  className="inline-flex items-center gap-2 bg-[#a94f0b] px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.1em] text-white transition hover:bg-[#c1661b] disabled:cursor-not-allowed disabled:bg-[#d4d4dc]"
                >
                  <Plus size={14} aria-hidden="true" />
                  {busyDishId === selectedDish.id ? 'Adding...' : 'Add to cart'}
                </button>
              </div>
              {cartError && (
                <p role="alert" className="mt-3 text-xs text-red-700">
                  {cartError}
                </p>
              )}
            </div>
          </section>
        </div>
      )}

      {isCartOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <button
            type="button"
            aria-label="Close cart"
            onClick={() => setIsCartOpen(false)}
            className="absolute inset-0 bg-[#171b24]/55"
          />
          <aside
            aria-label="Your tasting cart"
            className="absolute inset-y-0 right-0 flex w-full max-w-sm flex-col bg-white shadow-2xl"
          >
            {visibleCart}
          </aside>
        </div>
      )}
    </div>
  )
}
