import { useMemo, useState, type FormEvent } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  Clock3,
  Heart,
  Leaf,
  LockKeyhole,
  MapPin,
  ShieldCheck,
  Users,
  Wine,
} from 'lucide-react'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'

const serviceTimes = [
  '6:00 PM',
  '6:30 PM',
  '7:00 PM',
  '8:00 PM',
  '8:30 PM',
  '9:00 PM',
  '9:45 PM',
  '10:15 PM',
]

const atmospheres = [
  {
    name: "Basalt Chef's Hearth",
    description: 'Direct view of live mangrove embers and the theatre of the stone hearth.',
    detail: 'Front row fire seating',
    available: true,
  },
  {
    name: 'The Nile Terrace Alcove',
    description: 'Panoramic Zamalek river twilight, sheltered from open-air evening weather.',
    detail: 'Acoustic serenity',
    available: true,
  },
  {
    name: 'The Botanical Cellar',
    description: 'Enclosed temperature-controlled sanctuary with rare botanical vintages.',
    detail: 'Cellar tasting reserve',
    available: true,
  },
  {
    name: 'The Private Sovereign Chamber',
    description: 'A discreet, soundproofed chamber for family celebrations and private appointments.',
    detail: 'Pre-approval required',
    available: false,
  },
]

const tastingMenus = [
  {
    name: 'The Sovereign Tasting Ledger',
    detail: 'Seven courses with botanical pairings, Wagyū, Nile perch, and Persian saffron.',
    price: 3800,
    tag: '7 courses',
  },
  {
    name: 'À la Carte Botanical Fire',
    detail: 'Individual explorations from the hearth, cellar, and seasonal Nile catch.',
    price: 2200,
    tag: 'Personal selections',
  },
  {
    name: 'Imperial Beluga & Saffron Flight',
    detail: 'Royal caviar, Persian saffron, and a rare Champagne pairing.',
    price: 5900,
    tag: 'Grand occasion',
  },
]

const occasions = [
  'Romantic dinner',
  'Anniversary',
  'Executive gala',
  'Epicurean quest',
]

const dietaryOptions = [
  '100% halal verified',
  'Gluten sensitive',
  'Dairy / lactose intolerant',
  'Shellfish & crustacean free',
  'Nut & sesame restraint',
]

function getLocalDateString(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatSelectedDate(value: string) {
  if (!value) return 'Choose a date'
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${value}T12:00:00`))
}

export default function Reservation() {
  const today = getLocalDateString(new Date())
  const [reservationDate, setReservationDate] = useState(today)
  const [selectedTime, setSelectedTime] = useState('8:00 PM')
  const [guestCount, setGuestCount] = useState(2)
  const [atmosphere, setAtmosphere] = useState(atmospheres[0].name)
  const [tastingMenu, setTastingMenu] = useState(tastingMenus[0].name)
  const [occasion, setOccasion] = useState(occasions[0])
  const [dietaryNeeds, setDietaryNeeds] = useState<string[]>([
    '100% halal verified',
  ])
  const [title, setTitle] = useState('Mr.')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [conciergeNotes, setConciergeNotes] = useState('')
  const [requestSubmitted, setRequestSubmitted] = useState(false)

  const selectedAtmosphere =
    atmospheres.find((item) => item.name === atmosphere) ?? atmospheres[0]
  const selectedMenu =
    tastingMenus.find((item) => item.name === tastingMenu) ?? tastingMenus[0]

  const requestEmail = useMemo(() => {
    const subject = `Table reservation request — ${fullName}`
    const body = [
      `Guest: ${title} ${fullName}`,
      `Phone: ${phone}`,
      `Email: ${email}`,
      `Date: ${formatSelectedDate(reservationDate)}`,
      `Time: ${selectedTime}`,
      `Guests: ${guestCount}`,
      `Atmosphere: ${atmosphere}`,
      `Tasting selection: ${tastingMenu}`,
      `Occasion: ${occasion}`,
      `Dietary needs: ${dietaryNeeds.join(', ') || 'None specified'}`,
      `Concierge notes: ${conciergeNotes || 'None'}`,
    ].join('\n')

    return `mailto:concierge@saffronandstone.eg?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  }, [
    atmosphere,
    conciergeNotes,
    dietaryNeeds,
    email,
    fullName,
    guestCount,
    occasion,
    phone,
    reservationDate,
    selectedTime,
    tastingMenu,
    title,
  ])

  const toggleDietaryNeed = (option: string) => {
    setDietaryNeeds((current) =>
      current.includes(option)
        ? current.filter((item) => item !== option)
        : [...current, option],
    )
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setRequestSubmitted(true)
  }

  if (requestSubmitted) {
    return (
      <div className="customer-page min-h-screen bg-[#f7f7fc] text-[#202633]">
        <div className="bg-[#171b24] px-5 py-2 text-[9px] uppercase tracking-[0.2em] text-white/65 sm:px-8 lg:px-12">
          Open for dinner · Kitchen closes at 10 pm · Cairo, Egypt
        </div>
        <Navbar />
        <main className="mx-auto flex min-h-[65vh] max-w-2xl flex-col items-center justify-center px-5 py-16 text-center">
          <span className="flex size-16 items-center justify-center rounded-full bg-[#edf4eb] text-[#46714b]">
            <Check size={28} aria-hidden="true" />
          </span>
          <p className="mt-6 text-[9px] uppercase tracking-[0.22em] text-[#a94f0b]">
            The Basalt Hearth & Table Sanctuary
          </p>
          <h1 className="mt-2 font-serif text-4xl">Your request is ready</h1>
          <p className="mt-3 max-w-lg text-sm leading-6 text-[#747583]">
            We&apos;ve prepared your reservation details for{' '}
            <strong className="text-[#202633]">{fullName}</strong> on{' '}
            <strong className="text-[#202633]">
              {formatSelectedDate(reservationDate)}
            </strong>{' '}
            at <strong className="text-[#202633]">{selectedTime}</strong> for{' '}
            <strong className="text-[#202633]">{guestCount} guests</strong>.
          </p>
          <p className="mt-4 max-w-lg text-xs leading-5 text-[#858592]">
            This demo does not save reservations to a server. Send the prepared
            request to our concierge to confirm your table.
          </p>
          <a
            href={requestEmail}
            className="mt-7 inline-flex items-center gap-2 bg-[#a94f0b] px-5 py-3.5 text-[10px] font-semibold uppercase tracking-[0.13em] text-white transition hover:bg-[#c1661b]"
          >
            Email the concierge <ArrowRight size={14} aria-hidden="true" />
          </a>
          <button
            type="button"
            onClick={() => setRequestSubmitted(false)}
            className="mt-4 inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#747583] hover:text-[#a94f0b]"
          >
            <ArrowLeft size={13} aria-hidden="true" /> Edit reservation
          </button>
        </main>
      </div>
    )
  }

  return (
    <div className="customer-page min-h-screen bg-[#f7f7fc] text-[#202633]">
      <div className="bg-[#171b24] px-5 py-2 text-[9px] uppercase tracking-[0.18em] text-white/70 sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-[1440px] justify-between gap-3">
          <span>● Open for dinner · Kitchen closes 11:30 pm · Cairo, Egypt</span>
          <span className="hidden sm:inline">EGP (Egyptian Pound) · Admin portal →</span>
        </div>
      </div>
      <Navbar />

      <main>
        <section className="border-b border-[#e5e6f0] bg-[#f7f7fc]">
          <div className="mx-auto max-w-[1440px] px-5 py-7 sm:px-8 lg:px-12 lg:py-9">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-[#fbede2] px-3 py-1.5 text-[8px] font-semibold uppercase tracking-[0.13em] text-[#a94f0b]">
                ● Live service booking · Evening service
              </span>
              <span className="rounded-full bg-[#f0f1fc] px-3 py-1.5 text-[8px] uppercase tracking-[0.13em] text-[#555563]">
                ★ Michelin Guide recommended
              </span>
              <span className="rounded-full bg-[#f0f1fc] px-3 py-1.5 text-[8px] uppercase tracking-[0.13em] text-[#555563]">
                Sommelier cellar access included
              </span>
            </div>
            <div className="mt-5 grid items-end gap-5 md:grid-cols-[1fr_auto]">
              <div>
                <p className="text-[10px] text-[#a94f0b]">
                  ✧ Palace District · Zamalek Island
                </p>
                <h1 className="mt-1 max-w-3xl font-serif text-4xl leading-[1.08] sm:text-5xl lg:text-6xl">
                  The Basalt Hearth & Table Sanctuary
                </h1>
                <p className="mt-3 max-w-2xl text-xs leading-6 text-[#747583] sm:text-sm">
                  Reserve an immersive culinary journey. Experience bespoke
                  table seating from intimate Nile-facing alcoves to the
                  Executive Chef&apos;s glowing basalt fire counter.
                </p>
              </div>
              <div className="flex items-center gap-3 bg-[#f0f1fc] p-3 sm:min-w-64">
                <span className="flex size-10 items-center justify-center bg-white text-[#a94f0b]">
                  <CalendarDays size={17} aria-hidden="true" />
                </span>
                <div>
                  <p className="text-[8px] uppercase tracking-[0.14em] text-[#858592]">
                    Available this evening
                  </p>
                  <p className="mt-1 text-[10px] font-semibold">
                    5 tables reserved · 3 retained
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <form
          onSubmit={handleSubmit}
          className="mx-auto grid max-w-[1440px] items-start gap-5 px-5 py-6 sm:px-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.65fr)] lg:gap-6 lg:px-12 lg:py-8"
        >
          <div className="space-y-5">
            <section className="bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#a94f0b] text-[10px] font-semibold text-white">
                    01
                  </span>
                  <div>
                    <h2 className="font-serif text-xl">Party Size & Atmosphere Zone</h2>
                    <p className="mt-1 text-[10px] text-[#858592]">
                      Select your ideal seating and dining experience.
                    </p>
                  </div>
                </div>
                <span className="hidden text-[8px] uppercase tracking-[0.12em] text-[#858592] sm:block">
                  Step 1 of 4
                </span>
              </div>

              <fieldset className="mt-5">
                <legend className="text-[8px] font-semibold uppercase tracking-[0.13em] text-[#777785]">
                  Number of honoured guests
                </legend>
                <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-6">
                  {[1, 2, 4, 6, 8, 10].map((count) => (
                    <button
                      key={count}
                      type="button"
                      aria-pressed={guestCount === count}
                      onClick={() => setGuestCount(count)}
                      className={`flex min-h-11 flex-col items-center justify-center border px-2 py-2 text-[9px] uppercase transition ${
                        guestCount === count
                          ? 'border-[#a94f0b] bg-[#a94f0b] text-white'
                          : 'border-transparent bg-[#f0f1fc] text-[#555563] hover:border-[#d6a36a]'
                      }`}
                    >
                      <span className="font-semibold">{count}</span>
                      <span className="mt-0.5 text-[7px]">
                        {count === 1 ? 'guest' : count === 10 ? '10+' : 'guests'}
                      </span>
                    </button>
                  ))}
                </div>
              </fieldset>

              <fieldset className="mt-5">
                <legend className="text-[8px] font-semibold uppercase tracking-[0.13em] text-[#777785]">
                  Sanctuary atmosphere & seating preference
                </legend>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  {atmospheres.map((item) => (
                    <button
                      key={item.name}
                      type="button"
                      aria-pressed={atmosphere === item.name}
                      disabled={!item.available}
                      onClick={() => setAtmosphere(item.name)}
                      className={`border p-3 text-left transition disabled:cursor-not-allowed disabled:opacity-55 ${
                        atmosphere === item.name
                          ? 'border-[#a94f0b] bg-[#fbf4ee]'
                          : 'border-transparent bg-[#f7f7fc] hover:border-[#d6a36a]'
                      }`}
                    >
                      <span className="flex items-start justify-between gap-2">
                        <span className="font-serif text-sm">{item.name}</span>
                        {atmosphere === item.name && (
                          <Check
                            size={13}
                            className="shrink-0 text-[#a94f0b]"
                            aria-hidden="true"
                          />
                        )}
                      </span>
                      <span className="mt-1 block text-[9px] leading-4 text-[#858592]">
                        {item.description}
                      </span>
                      <span className="mt-2 block text-[8px] font-semibold uppercase tracking-[0.1em] text-[#a94f0b]">
                        {item.available ? item.detail : 'By prior arrangement'}
                      </span>
                    </button>
                  ))}
                </div>
              </fieldset>
            </section>

            <section className="bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#a94f0b] text-[10px] font-semibold text-white">
                    02
                  </span>
                  <div>
                    <h2 className="font-serif text-xl">Calendar & Service Seating</h2>
                    <p className="mt-1 text-[10px] text-[#858592]">
                      Choose your dining date and synchronized course pacing.
                    </p>
                  </div>
                </div>
                <span className="hidden text-[8px] uppercase tracking-[0.12em] text-[#858592] sm:block">
                  Step 2 of 4
                </span>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-[minmax(0,1fr)_200px]">
                <label className="block">
                  <span className="mb-1.5 block text-[8px] font-semibold uppercase tracking-[0.12em] text-[#777785]">
                    Reservation date
                  </span>
                  <span className="flex items-center gap-2 bg-[#f0f1fc] px-3">
                    <CalendarDays size={14} className="text-[#a94f0b]" aria-hidden="true" />
                    <input
                      required
                      type="date"
                      min={today}
                      value={reservationDate}
                      onChange={(event) => setReservationDate(event.target.value)}
                      className="min-h-11 w-full bg-transparent text-xs outline-none"
                    />
                  </span>
                </label>
                <div className="flex items-end gap-2 bg-[#f7f7fc] p-3 text-[9px]">
                  <MapPin size={14} className="shrink-0 text-[#a94f0b]" aria-hidden="true" />
                  <span>
                    <span className="block font-semibold">Zamalek, Cairo</span>
                    <span className="mt-0.5 block text-[#858592]">
                      {formatSelectedDate(reservationDate)}
                    </span>
                  </span>
                </div>
              </div>

              <fieldset className="mt-5">
                <legend className="text-[8px] font-semibold uppercase tracking-[0.13em] text-[#777785]">
                  Available evening service times
                </legend>
                <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {serviceTimes.map((time) => (
                    <button
                      key={time}
                      type="button"
                      aria-pressed={selectedTime === time}
                      onClick={() => setSelectedTime(time)}
                      className={`min-h-10 border px-2 py-2 text-[10px] transition ${
                        selectedTime === time
                          ? 'border-[#a94f0b] bg-[#a94f0b] font-semibold text-white'
                          : 'border-transparent bg-[#f0f1fc] text-[#555563] hover:border-[#d6a36a]'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </fieldset>
            </section>

            <section className="bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#a94f0b] text-[10px] font-semibold text-white">
                    03
                  </span>
                  <div>
                    <h2 className="font-serif text-xl">Experience & Dietary Precision</h2>
                    <p className="mt-1 text-[10px] text-[#858592]">
                      Curated tasting courses and elegant selections.
                    </p>
                  </div>
                </div>
                <span className="hidden text-[8px] uppercase tracking-[0.12em] text-[#858592] sm:block">
                  Step 3 of 4
                </span>
              </div>

              <fieldset className="mt-5">
                <legend className="text-[8px] font-semibold uppercase tracking-[0.13em] text-[#777785]">
                  Primary culinary journey selection
                </legend>
                <div className="mt-2 space-y-2">
                  {tastingMenus.map((item) => (
                    <label
                      key={item.name}
                      className={`flex cursor-pointer items-start gap-3 border p-3 transition ${
                        tastingMenu === item.name
                          ? 'border-[#a94f0b] bg-[#fbf4ee]'
                          : 'border-transparent bg-[#f7f7fc] hover:border-[#d6a36a]'
                      }`}
                    >
                      <input
                        type="radio"
                        name="tasting-menu"
                        value={item.name}
                        checked={tastingMenu === item.name}
                        onChange={() => setTastingMenu(item.name)}
                        className="mt-1 accent-[#a94f0b]"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-2 font-serif text-sm">
                          {item.name}
                          <span className="bg-[#e9eaf4] px-2 py-0.5 font-sans text-[7px] uppercase tracking-[0.1em] text-[#666674]">
                            {item.tag}
                          </span>
                        </span>
                        <span className="mt-1 block text-[9px] leading-4 text-[#858592]">
                          {item.detail}
                        </span>
                      </span>
                      <span className="shrink-0 text-right">
                        <span className="block text-xs font-semibold text-[#a94f0b]">
                          EGP {item.price.toLocaleString('en-EG')}
                        </span>
                        <span className="mt-0.5 block text-[8px] text-[#858592]">per guest</span>
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <fieldset className="mt-5">
                <legend className="text-[8px] font-semibold uppercase tracking-[0.13em] text-[#777785]">
                  Celebration occasion
                </legend>
                <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {occasions.map((item, index) => (
                    <button
                      key={item}
                      type="button"
                      aria-pressed={occasion === item}
                      onClick={() => setOccasion(item)}
                      className={`flex min-h-14 flex-col items-center justify-center gap-1 border px-2 text-[8px] transition ${
                        occasion === item
                          ? 'border-[#a94f0b] bg-[#fbf4ee] text-[#a94f0b]'
                          : 'border-transparent bg-[#f0f1fc] text-[#555563] hover:border-[#d6a36a]'
                      }`}
                    >
                      {index === 0 ? (
                        <Heart size={13} aria-hidden="true" />
                      ) : index === 1 ? (
                        <Wine size={13} aria-hidden="true" />
                      ) : index === 2 ? (
                        <Users size={13} aria-hidden="true" />
                      ) : (
                        <Leaf size={13} aria-hidden="true" />
                      )}
                      {item}
                    </button>
                  ))}
                </div>
              </fieldset>

              <fieldset className="mt-5">
                <legend className="text-[8px] font-semibold uppercase tracking-[0.13em] text-[#777785]">
                  Dietary safeguards & accompaniments
                </legend>
                <div className="mt-2 flex flex-wrap gap-2">
                  {dietaryOptions.map((option) => (
                    <label
                      key={option}
                      className="inline-flex cursor-pointer items-center gap-1.5 bg-[#f0f1fc] px-2.5 py-2 text-[8px] text-[#555563]"
                    >
                      <input
                        type="checkbox"
                        checked={dietaryNeeds.includes(option)}
                        onChange={() => toggleDietaryNeed(option)}
                        className="accent-[#a94f0b]"
                      />
                      {option}
                    </label>
                  ))}
                </div>
              </fieldset>
            </section>

            <section className="bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#a94f0b] text-[10px] font-semibold text-white">
                    04
                  </span>
                  <div>
                    <h2 className="font-serif text-xl">Patron Registry & Concierge Notes</h2>
                    <p className="mt-1 text-[10px] text-[#858592]">
                      Confidential guest coordinates for the host.
                    </p>
                  </div>
                </div>
                <span className="hidden text-[8px] uppercase tracking-[0.12em] text-[#858592] sm:block">
                  Step 4 of 4
                </span>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-[8px] font-semibold uppercase tracking-[0.12em] text-[#777785]">
                    Honorific
                  </span>
                  <select
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    className="min-h-10 w-full bg-[#f0f1fc] px-3 text-xs outline-none focus:ring-1 focus:ring-[#d6a36a]"
                  >
                    <option>Mr.</option>
                    <option>Ms.</option>
                    <option>Mrs.</option>
                    <option>Dr.</option>
                    <option>Chef</option>
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-[8px] font-semibold uppercase tracking-[0.12em] text-[#777785]">
                    Preparation patron full name
                  </span>
                  <input
                    required
                    autoComplete="name"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    placeholder="Your full name"
                    className="min-h-10 w-full bg-[#f0f1fc] px-3 text-xs outline-none focus:ring-1 focus:ring-[#d6a36a]"
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-[8px] font-semibold uppercase tracking-[0.12em] text-[#777785]">
                    Primary mobile / WhatsApp
                  </span>
                  <input
                    required
                    type="tel"
                    autoComplete="tel"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    placeholder="+20 100 829 4110"
                    className="min-h-10 w-full bg-[#f0f1fc] px-3 text-xs outline-none focus:ring-1 focus:ring-[#d6a36a]"
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-[8px] font-semibold uppercase tracking-[0.12em] text-[#777785]">
                    Email address
                  </span>
                  <input
                    required
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    className="min-h-10 w-full bg-[#f0f1fc] px-3 text-xs outline-none focus:ring-1 focus:ring-[#d6a36a]"
                  />
                </label>
                <label className="block sm:col-span-2">
                  <span className="mb-1.5 block text-[8px] font-semibold uppercase tracking-[0.12em] text-[#777785]">
                    Bespoke notes for the concierge & executive butler
                  </span>
                  <textarea
                    rows={3}
                    value={conciergeNotes}
                    onChange={(event) => setConciergeNotes(event.target.value)}
                    placeholder="Special requests, accessibility needs, or a note for your celebration..."
                    className="w-full resize-y bg-[#f0f1fc] px-3 py-2.5 text-xs leading-5 outline-none focus:ring-1 focus:ring-[#d6a36a]"
                  />
                </label>
              </div>

              <p className="mt-4 flex items-start gap-2 bg-[#f7f7fc] p-3 text-[9px] leading-4 text-[#747583]">
                <LockKeyhole size={13} className="mt-0.5 shrink-0 text-[#a94f0b]" aria-hidden="true" />
                Your details are used only to prepare this reservation request.
                This demo does not store or transmit your information.
              </p>
            </section>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-5">
            <section className="overflow-hidden bg-white shadow-lg shadow-[#202633]/10">
              <div className="relative h-40">
                <img
                  src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1000&q=85"
                  alt="A warmly lit dining room at Saffron & Stone"
                  className="size-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#171b24]/80 to-transparent" />
                <p className="absolute bottom-3 left-4 font-serif text-lg text-white">
                  Saffron & Stone · Zamalek
                </p>
              </div>

              <div className="p-5">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-[8px] font-semibold uppercase tracking-[0.17em] text-[#a94f0b]">
                      Reservation ledger
                    </p>
                    <h2 className="mt-1 font-serif text-xl">Your evening</h2>
                  </div>
                  <span className="bg-[#f0f1fc] px-2.5 py-1 text-[8px] text-[#555563]">
                    Draft
                  </span>
                </div>

                <dl className="mt-4 space-y-3 border-b border-[#ededf2] pb-4 text-[10px]">
                  <div className="flex justify-between gap-4">
                    <dt className="inline-flex items-center gap-2 text-[#858592]">
                      <CalendarDays size={12} aria-hidden="true" /> Date
                    </dt>
                    <dd className="text-right font-medium">{formatSelectedDate(reservationDate)}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="inline-flex items-center gap-2 text-[#858592]">
                      <Clock3 size={12} aria-hidden="true" /> Seating time
                    </dt>
                    <dd className="text-right font-medium">{selectedTime}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="inline-flex items-center gap-2 text-[#858592]">
                      <Users size={12} aria-hidden="true" /> Patrons
                    </dt>
                    <dd className="text-right font-medium">
                      {guestCount} {guestCount === 1 ? 'guest' : 'guests'}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-[#858592]">Sanctuary atmosphere</dt>
                    <dd className="max-w-36 text-right font-medium">{selectedAtmosphere.name}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-[#858592]">Culinary flight</dt>
                    <dd className="text-right font-medium">{selectedMenu.tag}</dd>
                  </div>
                </dl>

                <div className="mt-4 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[8px] font-semibold uppercase tracking-[0.12em] text-[#858592]">
                      Tasting ledger estimate
                    </p>
                    <p className="mt-1 text-[9px] text-[#858592]">
                      EGP {selectedMenu.price.toLocaleString('en-EG')} × {guestCount} guests
                    </p>
                  </div>
                  <p className="font-serif text-xl font-semibold text-[#a94f0b]">
                    EGP {(selectedMenu.price * guestCount).toLocaleString('en-EG')}
                  </p>
                </div>
                <p className="mt-2 text-[8px] leading-4 text-[#92929d]">
                  Estimate only. Final selections and pricing are confirmed by the concierge.
                </p>

                <button
                  type="submit"
                  className="mt-5 flex w-full items-center justify-center gap-2 bg-[#a94f0b] px-4 py-3.5 text-[9px] font-semibold uppercase tracking-[0.1em] text-white shadow-sm transition hover:bg-[#c1661b]"
                >
                  Prepare reservation request <ArrowRight size={14} aria-hidden="true" />
                </button>
                <p className="mt-3 flex items-start gap-2 text-[8px] leading-4 text-[#858592]">
                  <ShieldCheck size={12} className="mt-0.5 shrink-0 text-[#a94f0b]" aria-hidden="true" />
                  No deposit is collected through this demo booking form.
                </p>
              </div>
            </section>

            <section className="bg-[#202633] p-4 text-white">
              <p className="inline-flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.13em] text-[#e8b47d]">
                <Wine size={13} aria-hidden="true" /> Cellar & concierge
              </p>
              <p className="mt-2 text-[10px] leading-5 text-white/70">
                For larger parties, private chambers, or bespoke cellar pairings,
                our concierge will be pleased to assist.
              </p>
              <a
                href="mailto:concierge@saffronandstone.eg"
                className="mt-3 inline-flex items-center gap-2 text-[9px] font-semibold text-[#e8b47d] hover:text-white"
              >
                concierge@saffronandstone.eg <ArrowRight size={12} aria-hidden="true" />
              </a>
            </section>
          </aside>
        </form>

        <section className="mx-auto max-w-[1440px] px-5 pb-10 sm:px-8 lg:px-12">
          <div className="border-t border-[#e5e6f0] pt-6">
            <p className="text-[8px] uppercase tracking-[0.18em] text-[#a94f0b]">
              Sanctuary protocol
            </p>
            <h2 className="mt-1 font-serif text-2xl">Dining Etiquette & Hospitality Safeguards</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {[
                ['Smart formal attire', 'Please dress for an intimate evening in our dining chambers.'],
                ['15-minute grace period', 'We hold your table for fifteen minutes after the reserved time.'],
                ['Private vintage', 'Personal cellar requests can be arranged with advance notice.'],
                ['Palace valet concierge', 'Complimentary valet service is available at Zamalek Palace District.'],
              ].map(([titleText, body]) => (
                <article key={titleText} className="bg-[#f0f1fc] p-4">
                  <h3 className="font-serif text-sm">{titleText}</h3>
                  <p className="mt-1 text-[9px] leading-4 text-[#747583]">{body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
