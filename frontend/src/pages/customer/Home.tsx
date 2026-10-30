import { useEffect, useState } from 'react'
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Clock3,
  Flame,
  Leaf,
  MapPin,
  Star,
  X,
} from 'lucide-react'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'

const pillars = [
  {
    categoryId: 'cat-1',
    name: 'Pizza',
    detail: 'Fresh from the oven',
    image:
      'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=480&q=85',
  },
  {
    categoryId: 'cat-2',
    name: 'Burgers',
    detail: 'Juicy patties & crisp sides',
    image:
      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=480&q=85',
  },
  {
    categoryId: 'cat-3',
    name: 'Pasta',
    detail: 'Comfort in every bowl',
    image:
      'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=480&q=85',
  },
  {
    categoryId: 'cat-4',
    name: 'Salads',
    detail: 'Fresh from the garden',
    image:
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=480&q=85',
  },
  {
    categoryId: 'cat-5',
    name: 'Desserts',
    detail: 'A sweet finish',
    image:
      'https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=480&q=85',
  },
  {
    categoryId: 'cat-6',
    name: 'Drinks',
    detail: 'Refreshments & coffee',
    image:
      'https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=480&q=85',
  },
]

const signatureDishes = [
  {
    name: 'Braised Lamb Shank',
    description: 'Slow-braised lamb, saffron rice, toasted almonds.',
    course: 'The house signature',
    price: '850',
    tag: 'Guest favourite',
    rating: 4.9,
    prepTimeMinutes: 45,
    image:
      'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=90',
  },
  {
    name: 'Truffle Hummus',
    description: 'Silken chickpeas, black truffle, warm stone bread.',
    course: 'To begin',
    price: '320',
    tag: 'Vegetarian',
    rating: 4.8,
    prepTimeMinutes: 15,
    image:
      'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=90',
  },
  {
    name: 'Stone-Grilled Nile Perch',
    description: 'Charred lemon, garden herbs, seasonal greens.',
    course: 'From the fire',
    price: '720',
    tag: 'Fresh catch',
    rating: 4.7,
    prepTimeMinutes: 30,
    image:
      'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=900&q=90',
  },
  {
    name: 'Cardamom Stone Pot',
    description: 'Tender grains, slow-roasted vegetables, cardamom.',
    course: 'A little comfort',
    price: '280',
    tag: 'Plant based',
    rating: 4.6,
    prepTimeMinutes: 25,
    image:
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=90',
  },
]

const reviews = [
  {
    quote:
      'An architectural revelation. The braised lamb over saffron polenta rewrites modern Middle Eastern gastronomy.',
    author: 'Markus Van Der Bilt',
    source: 'Financial Times',
  },
  {
    quote:
      'Eating off raw Egyptian basalt while inhaling saffron vapours creates an almost religious sensory stillness.',
    author: 'Nouran B. Gamil',
    source: 'Epicure Cairo',
  },
  {
    quote:
      'Undoubtedly the highest culinary achievement on Zamalek Island. Book at least three weeks in advance.',
    author: 'Chef Alain Roustand',
    source: 'Gault & Millau',
  },
]

export default function Home() {
  const [selectedDish, setSelectedDish] = useState<
    (typeof signatureDishes)[number] | null
  >(null)

  useEffect(() => {
    if (!selectedDish) return

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedDish(null)
    }

    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [selectedDish])

  return (
    <div className="customer-page min-h-screen bg-[#f7f7fc] text-[#202633]">
      <div className="bg-[#171b24] px-5 py-2 text-center text-[9px] uppercase tracking-[0.2em] text-white/65 sm:px-8 sm:text-left lg:px-12">
        Open for dinner · Kitchen closes at 10 pm · Cairo, Egypt
      </div>
      <Navbar />

      <main>
        <section
          id="home"
          className="relative isolate overflow-hidden bg-[#252b38] text-white"
        >
          <div className="absolute inset-0 -z-10">
            <img
              src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=2200&q=90"
              alt=""
              className="size-full object-cover opacity-25"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#202633] via-[#202633]/95 to-[#202633]/55" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#202633]/55 to-transparent" />
          </div>

          <div className="mx-auto grid max-w-7xl items-center gap-8 px-5 py-12 sm:px-8 md:min-h-[420px] md:grid-cols-[1.05fr_0.95fr] md:py-12 lg:min-h-[520px] lg:gap-12 lg:px-12 lg:py-16">
            <div className="max-w-2xl">
              <div className="mb-8 flex flex-wrap gap-2">
                <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[9px] uppercase tracking-[0.15em] text-white/75">
                  ★ Michelin Guide recommended
                </span>
                <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[9px] uppercase tracking-[0.15em] text-white/75">
                  Best fine dining in Cairo
                </span>
              </div>

              <p className="mb-4 text-[10px] uppercase tracking-[0.28em] text-[#d9a66d]">
                Zamalek sanctuary · Nile Delta terroir
              </p>
              <h1 className="max-w-xl font-serif text-4xl leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
                Where earthly stone meets{' '}
                <span className="block font-light italic text-[#e8b47d]">
                  golden saffron.
                </span>
              </h1>
              <p className="mt-6 max-w-lg text-sm leading-7 text-white/70 sm:text-base">
                A sensory symphony celebrating the meeting of Levantine
                culinary legacy, Egyptian organic harvests, and the luminous
                amber aura of Iranian saffron over volcanic basalt.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="/menu"
                  className="inline-flex items-center gap-2 bg-[#a94f0b] px-5 py-3.5 text-[10px] font-semibold uppercase tracking-[0.14em] transition hover:bg-[#c1661b]"
                >
                  Explore the menu <ArrowRight size={15} aria-hidden="true" />
                </a>
                <a
                  href="/reservation"
                  className="inline-flex items-center gap-2 border border-white/25 px-5 py-3.5 text-[10px] font-semibold uppercase tracking-[0.14em] transition hover:border-[#e8b47d] hover:text-[#e8b47d]"
                >
                  Reserve a table <ArrowUpRight size={14} aria-hidden="true" />
                </a>
              </div>

              <div className="mt-12 grid max-w-md grid-cols-3 gap-5 border-t border-white/15 pt-5">
                <div>
                  <p className="font-serif text-2xl text-[#e8b47d]">4,800+</p>
                  <p className="mt-1 text-[9px] uppercase tracking-[0.16em] text-white/55">
                    Plates shared
                  </p>
                </div>
                <div>
                  <p className="font-serif text-2xl text-[#e8b47d]">100%</p>
                  <p className="mt-1 text-[9px] uppercase tracking-[0.16em] text-white/55">
                    Delta provenance
                  </p>
                </div>
                <div>
                  <p className="font-serif text-2xl text-[#e8b47d]">32</p>
                  <p className="mt-1 text-[9px] uppercase tracking-[0.16em] text-white/55">
                    Basalt table covers
                  </p>
                </div>
              </div>
            </div>

            <article className="relative mx-auto w-full max-w-md overflow-hidden border border-white/10 bg-[#171b24]/80 p-2 shadow-2xl shadow-black/30">
              <div className="relative h-60 overflow-hidden sm:h-72">
                <img
                  src="https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1100&q=90"
                  alt="A carefully plated signature dish at Saffron and Stone"
                  className="size-full object-cover"
                />
                <span className="absolute left-4 top-4 inline-flex items-center gap-2 bg-[#202633]/85 px-3 py-2 text-[9px] uppercase tracking-[0.15em] text-white">
                  <Flame size={13} className="text-[#e8b47d]" aria-hidden="true" />
                  From our stone hearth
                </span>
              </div>
              <div className="flex items-center justify-between gap-4 px-4 py-4">
                <div>
                  <p className="text-[9px] uppercase tracking-[0.18em] text-[#d9a66d]">
                    House signature
                  </p>
                  <h2 className="mt-1 font-serif text-xl">Imperial Saffron Lamb</h2>
                </div>
                <p className="shrink-0 text-right text-xs font-semibold">
                  1,450
                  <span className="mt-1 block text-[9px] font-normal text-white/55">
                    EGP
                  </span>
                </p>
              </div>
            </article>
          </div>

          <a
            href="#flavours"
            aria-label="Scroll to curated flavours"
            className="absolute bottom-5 left-1/2 hidden -translate-x-1/2 text-white/55 transition hover:text-white md:block"
          >
            <ArrowDown size={18} aria-hidden="true" />
          </a>
        </section>

        <section id="flavours" className="scroll-mt-24 bg-[#fbfbfe] py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
            <div className="mb-9 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="text-[9px] uppercase tracking-[0.25em] text-[#a94f0b]">
                  Sensory taxonomy
                </p>
                <h2 className="mt-2 font-serif text-3xl text-[#202633] sm:text-4xl">
                  Curated pillars of flavour
                </h2>
              </div>
              <p className="max-w-sm text-xs leading-6 text-[#747583]">
                Six harmonious culinary acts, orchestrating fire, spice, and
                quiet precision in an ancient Egyptian tradition.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {pillars.map((pillar) => (
                <a
                  key={pillar.categoryId}
                  href={`/menu?categoryId=${encodeURIComponent(pillar.categoryId)}`}
                  aria-label={`Browse ${pillar.name} menu`}
                  className="group text-center"
                >
                  <div className="aspect-square overflow-hidden rounded-sm bg-[#e6e6ef]">
                    <img
                      src={pillar.image}
                      alt=""
                      loading="lazy"
                      className="size-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  </div>
                  <h3 className="mt-3 font-serif text-base text-[#202633]">
                    {pillar.name}
                  </h3>
                  <p className="mt-1 text-[9px] uppercase tracking-[0.12em] text-[#858592]">
                    {pillar.detail}
                  </p>
                </a>
              ))}
            </div>
          </div>
        </section>

        <section
          id="signature"
          className="scroll-mt-24 bg-[#f0f1fc] py-16 sm:py-20"
        >
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
            <div className="mb-9 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="text-[9px] uppercase tracking-[0.25em] text-[#a94f0b]">
                  Executive culinary ledger
                </p>
                <h2 className="mt-2 font-serif text-3xl text-[#202633] sm:text-4xl">
                  Signature tasting compositions
                </h2>
              </div>
              <p className="text-xs text-[#747583]">
                Prices displayed in Egyptian Pound <span className="text-[#a94f0b]">●</span>
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {signatureDishes.map((dish) => (
                <article
                  key={dish.name}
                  className="overflow-hidden rounded-sm bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={dish.image}
                      alt={dish.name}
                      loading="lazy"
                      className="size-full object-cover transition duration-500 hover:scale-105"
                    />
                    <span className="absolute left-3 top-3 rounded-sm bg-white/90 px-2.5 py-1.5 text-[9px] font-medium text-[#383846]">
                      {dish.tag}
                    </span>
                  </div>
                  <div className="p-4">
                    <p className="text-[9px] uppercase tracking-[0.16em] text-[#a94f0b]">
                      {dish.course}
                    </p>
                    <h3 className="mt-1 font-serif text-xl text-[#202633]">
                      {dish.name}
                    </h3>
                    <p className="mt-2 min-h-10 text-xs leading-5 text-[#747583]">
                      {dish.description}
                    </p>
                    <div className="mt-4 flex items-center justify-between border-t border-[#ededf2] pt-3">
                      <p>
                        <span className="block text-[8px] uppercase tracking-[0.17em] text-[#8c8c99]">
                          Price
                        </span>
                        <span className="mt-0.5 block text-sm font-semibold text-[#a94f0b]">
                          {dish.price} EGP
                        </span>
                      </p>
                      <button
                        type="button"
                        onClick={() => setSelectedDish(dish)}
                        aria-label={`Discover ${dish.name}`}
                        className="inline-flex items-center gap-2 rounded-sm bg-[#f0f1fc] px-3 py-2 text-[10px] font-medium text-[#333746] transition hover:bg-[#e2e4f7] dark:bg-[#272e3a] dark:text-[#eeeae2] dark:hover:bg-[#343b49]"
                      >
                        Discover <ArrowUpRight size={13} aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          id="story"
          className="scroll-mt-24 bg-[#fbfbfe] py-16 sm:py-24"
        >
          <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 sm:px-8 md:grid-cols-2 lg:gap-16 lg:px-12">
            <div className="relative grid grid-cols-[1fr_0.75fr] items-center gap-3">
              <img
                src="https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=900&q=85"
                alt="Our chef preparing a dish in the kitchen"
                loading="lazy"
                className="aspect-[4/5] w-full rounded-sm object-cover"
              />
              <div className="space-y-3">
                <div className="bg-[#202633] p-4 text-white">
                  <p className="text-[8px] uppercase tracking-[0.17em] text-[#e8b47d]">
                    Executive chef
                  </p>
                  <p className="mt-1 font-serif text-base">Karim Al-Husseini</p>
                  <p className="mt-1 text-[10px] leading-4 text-white/60">
                    Ex-Le Manoir, Paris & Zamalek resident
                  </p>
                </div>
                <img
                  src="https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=700&q=85"
                  alt="A warm, thoughtful restaurant kitchen"
                  loading="lazy"
                  className="aspect-[3/4] w-full rounded-sm object-cover"
                />
              </div>
            </div>

            <div id="philosophy" className="scroll-mt-24">
              <p className="text-[9px] uppercase tracking-[0.25em] text-[#a94f0b]">
                Philosophy & terroir
              </p>
              <h2 className="mt-2 font-serif text-3xl leading-tight text-[#202633] sm:text-4xl">
                Honouring the sacred soil of Egypt with Persian golden grace.
              </h2>
              <p className="mt-5 text-sm leading-7 text-[#747583]">
                Every dish at Saffron & Stone begins with an ancient geography.
                We bypass mass supply chains to collaborate intimately with
                small agricultural sanctuaries: pristine saffron crocuses grown
                in Sinai&apos;s temperate pockets, heirloom dates from Fayoum,
                and stone-mined directly from Abu Zaabal quarries.
              </p>
              <div className="mt-6 space-y-3">
                <div className="flex gap-3 border border-[#e7e8f2] bg-[#f3f4fc] p-4">
                  <Leaf size={17} className="mt-0.5 shrink-0 text-[#a94f0b]" aria-hidden="true" />
                  <div>
                    <h3 className="text-xs font-semibold text-[#333746]">
                      Direct botanical provenance
                    </h3>
                    <p className="mt-1 text-[11px] leading-5 text-[#747583]">
                      Cold-pressed virgin olive harvests and desert herbs
                      harvested at first light.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 border border-[#e7e8f2] bg-[#f3f4fc] p-4">
                  <Flame size={17} className="mt-0.5 shrink-0 text-[#a94f0b]" aria-hidden="true" />
                  <div>
                    <h3 className="text-xs font-semibold text-[#333746]">
                      Hand-carved volcanic plateware
                    </h3>
                    <p className="mt-1 text-[11px] leading-5 text-[#747583]">
                      Each basalt plate holds the mineral energy of the Nile,
                      maintaining exact temperature without artificial elements.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
            <div className="text-center">
              <p className="text-[9px] uppercase tracking-[0.25em] text-[#a94f0b]">
                From Our Clients
              </p>
              <h2 className="mt-2 font-serif text-3xl text-[#202633] sm:text-4xl">
                A table worth talking about
              </h2>
              <div className="mt-5 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 font-serif text-xs uppercase tracking-[0.16em] text-[#555665]">
                <span>Financial Times</span>
                <span className="italic">Harper&apos;s Bazaar</span>
                <span>Gault & Millau</span>
                <span>Le Figaro Voyage</span>
              </div>
            </div>
            <div className="mt-9 grid gap-4 md:grid-cols-3">
              {reviews.map((review) => (
                <figure
                  key={review.author}
                  className="group relative overflow-hidden border border-transparent bg-[#f0f1fc] p-6 transition-all duration-300 ease-out after:absolute after:inset-x-8 after:top-0 after:h-px after:bg-gradient-to-r after:from-transparent after:via-[#d6a36a]/0 after:to-transparent after:transition-colors after:duration-300 hover:-translate-y-1.5 hover:border-[#d6a36a]/45 hover:bg-white hover:shadow-xl hover:shadow-[#202633]/10 hover:after:via-[#d6a36a]/80 motion-reduce:transform-none motion-reduce:transition-none sm:p-7"
                >
                  <div
                    aria-label="Five out of five stars"
                    className="flex gap-1 text-[#a94f0b] transition-transform duration-300 group-hover:scale-105 motion-reduce:transform-none motion-reduce:transition-none"
                  >
                    {Array.from({ length: 5 }, (_, index) => (
                      <Star key={index} size={11} fill="currentColor" aria-hidden="true" />
                    ))}
                  </div>
                  <blockquote className="mt-4 font-serif text-lg italic leading-7 text-[#303342]">
                    “{review.quote}”
                  </blockquote>
                  <figcaption className="mt-5 text-[9px] uppercase tracking-[0.13em] text-[#747583]">
                    <span className="block font-semibold text-[#303342]">
                      {review.author}
                    </span>
                    <span className="mt-1 block">{review.source}</span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        <section
          id="reservation"
          className="scroll-mt-24 bg-[#252b38] py-14 text-white sm:py-16"
        >
          <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 md:grid-cols-[1.1fr_0.9fr] lg:px-12">
            <div className="bg-white/10 p-6 sm:p-8">
              <p className="text-[9px] uppercase tracking-[0.22em] text-[#e8b47d]">
                Table concierge
              </p>
              <h2 className="mt-2 font-serif text-3xl">Secure your evening</h2>
              <p className="mt-2 max-w-md text-xs leading-6 text-white/60">
                A small number of tables, thoughtfully set for an unhurried
                evening by the Nile.
              </p>
              <a
                href="/reservation"
                className="mt-6 inline-flex w-full items-center justify-center gap-2 bg-[#a94f0b] px-5 py-3.5 text-[10px] font-semibold uppercase tracking-[0.14em] transition hover:bg-[#c1661b] sm:w-auto"
              >
                Request a reservation <ArrowUpRight size={14} aria-hidden="true" />
              </a>
            </div>

            <div id="contact" className="scroll-mt-24 self-center">
              <p className="text-[9px] uppercase tracking-[0.22em] text-[#e8b47d]">
                Private guests
              </p>
              <h2 className="mt-2 font-serif text-3xl">The Saffron Ledger</h2>
              <p className="mt-3 text-xs leading-6 text-white/60">
                Receive seasonal menus, private invitations, and notes from our
                kitchen. For a more personal evening, our concierge is always
                pleased to help.
              </p>
              <div className="mt-5 flex flex-wrap gap-x-5 gap-y-3 text-[10px] text-white/65">
                <span className="inline-flex items-center gap-2">
                  <MapPin size={14} className="text-[#e8b47d]" aria-hidden="true" />
                  Zamalek, Cairo
                </span>
                <span className="inline-flex items-center gap-2">
                  <Clock3 size={14} className="text-[#e8b47d]" aria-hidden="true" />
                  Dinner, 6 pm – 10 pm
                </span>
              </div>
              <a
                href="mailto:concierge@saffronandstone.eg"
                className="mt-5 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.15em] text-[#e8b47d] hover:text-white"
              >
                Contact the concierge <ArrowRight size={13} aria-hidden="true" />
              </a>
            </div>
          </div>
        </section>
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
            aria-labelledby="signature-dish-title"
            className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto bg-white shadow-2xl dark:bg-[#1b212c]"
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
                src={selectedDish.image}
                alt={selectedDish.name}
                className="size-full object-cover"
              />
              <span className="absolute bottom-3 left-3 bg-[#202633]/90 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-white">
                {selectedDish.tag}
              </span>
            </div>
            <div className="p-5 sm:p-7">
              <p className="text-[9px] uppercase tracking-[0.18em] text-[#a94f0b]">
                {selectedDish.course}
              </p>
              <h2
                id="signature-dish-title"
                className="mt-1 font-serif text-2xl text-[#202633] dark:text-[#eeeae2] sm:text-3xl"
              >
                {selectedDish.name}
              </h2>
              <p className="mt-3 text-sm leading-6 text-[#747583] dark:text-[#c1c4ce]">
                {selectedDish.description}
              </p>
              <dl className="mt-5 grid grid-cols-2 gap-3">
                <div className="border border-[#e7e7ef] bg-[#f7f7fc] p-3 dark:border-[#3a414e] dark:bg-[#272e3a]">
                  <dt className="text-[8px] uppercase tracking-[0.13em] text-[#858592]">
                    Guest rating
                  </dt>
                  <dd className="mt-1 inline-flex items-center gap-1.5 text-sm font-semibold text-[#303342] dark:text-[#eeeae2]">
                    <Star
                      size={14}
                      fill="currentColor"
                      className="text-[#a94f0b]"
                      aria-hidden="true"
                    />
                    {selectedDish.rating.toFixed(1)} / 5
                  </dd>
                </div>
                <div className="border border-[#e7e7ef] bg-[#f7f7fc] p-3 dark:border-[#3a414e] dark:bg-[#272e3a]">
                  <dt className="text-[8px] uppercase tracking-[0.13em] text-[#858592]">
                    Preparation
                  </dt>
                  <dd className="mt-1 inline-flex items-center gap-1.5 text-sm font-semibold text-[#303342] dark:text-[#eeeae2]">
                    <Clock3 size={14} className="text-[#a94f0b]" aria-hidden="true" />
                    {selectedDish.prepTimeMinutes} minutes
                  </dd>
                </div>
                <div className="border border-[#e7e7ef] bg-[#f7f7fc] p-3 dark:border-[#3a414e] dark:bg-[#272e3a]">
                  <dt className="text-[8px] uppercase tracking-[0.13em] text-[#858592]">
                    Tasting price
                  </dt>
                  <dd className="mt-1 font-serif text-lg font-semibold text-[#a94f0b]">
                    {selectedDish.price} EGP
                  </dd>
                </div>
                <div className="border border-[#e7e7ef] bg-[#f7f7fc] p-3 dark:border-[#3a414e] dark:bg-[#272e3a]">
                  <dt className="text-[8px] uppercase tracking-[0.13em] text-[#858592]">
                    Selection
                  </dt>
                  <dd className="mt-1 text-sm font-semibold text-[#303342] dark:text-[#eeeae2]">
                    {selectedDish.tag}
                  </dd>
                </div>
              </dl>
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#ededf2] pt-4 dark:border-[#3a414e]">
                <span className="text-[9px] text-[#858592]">
                  Prepared with care in our kitchen
                </span>
                <a
                  href="/menu"
                  className="inline-flex items-center gap-2 bg-[#a94f0b] px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.1em] text-white transition hover:bg-[#c1661b]"
                >
                  Explore the full menu
                  <ArrowRight size={14} aria-hidden="true" />
                </a>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}
