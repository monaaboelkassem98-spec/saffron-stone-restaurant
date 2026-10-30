import { Globe2 } from 'lucide-react'

const socialLinkClassName =
  'group flex size-10 items-center justify-center rounded-full border border-transparent text-white/60 transition duration-300 hover:-translate-y-1 hover:border-[#d6a36a]/45 hover:bg-[#d6a36a]/10 hover:text-[#e8b47d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e8b47d]'

function InstagramIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden="true"
      className="size-[17px]"
    >
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.6" cy="6.7" r=".8" fill="currentColor" stroke="none" />
    </svg>
  )
}

function FacebookIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className="size-[17px]"
    >
      <path d="M13.45 21v-8.2h2.76l.41-3.2h-3.17V7.56c0-.93.26-1.56 1.59-1.56h1.7V3.14A22.4 22.4 0 0 0 14.26 3c-2.46 0-4.14 1.5-4.14 4.26V9.6H7.34v3.2h2.78V21h3.33Z" />
    </svg>
  )
}

function TripadvisorIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
      className="size-[19px]"
    >
      <path d="M3 8.5c2.2-2.4 5.2-3.6 9-3.6s6.8 1.2 9 3.6l-2.2 2.1a5.2 5.2 0 0 1-7.1 7.6l-.7-.7-.7.7a5.2 5.2 0 0 1-7.1-7.6L3 8.5Z" />
      <circle cx="7.6" cy="12.5" r="2.1" />
      <circle cx="16.4" cy="12.5" r="2.1" />
      <circle cx="7.6" cy="12.5" r=".6" fill="currentColor" />
      <circle cx="16.4" cy="12.5" r=".6" fill="currentColor" />
      <path d="m10.5 15 1.5 1.5 1.5-1.5" />
    </svg>
  )
}

const socialLinks = [
  { label: 'Instagram', icon: <InstagramIcon /> },
  { label: 'Facebook', icon: <FacebookIcon /> },
  { label: 'Tripadvisor', icon: <TripadvisorIcon /> },
  { label: 'Website', icon: <Globe2 size={17} strokeWidth={1.6} aria-hidden="true" /> },
]

export default function Footer() {
  return (
    <footer className="bg-[#202633] text-white">
      <div className="mx-auto max-w-[1440px] px-5 py-9 sm:px-8 lg:px-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_auto]">
          <div>
            <a href="/" className="font-serif text-sm tracking-[0.13em]">
              SAFFRON <span className="text-[#e8b47d]">&</span> STONE
            </a>
            <p className="mt-3 max-w-xs text-[10px] leading-5 text-white/55">
              An architectural culinary sanctuary in the historic heart of
              Cairo, celebrating organic Delta provenance and shared moments.
            </p>
          </div>
          <div>
            <h2 className="text-[9px] font-semibold uppercase tracking-[0.17em] text-[#e8b47d]">
              Reservations & service
            </h2>
            <p className="mt-3 text-[10px] leading-5 text-white/60">
              Tuesday – Sunday, 6:00 PM – 10:00 PM
              <br />
              <a
                className="transition hover:text-[#e8b47d]"
                href="mailto:concierge@saffronandstone.eg"
              >
                concierge@saffronandstone.eg
              </a>
            </p>
          </div>
          <div>
            <h2 className="text-[9px] font-semibold uppercase tracking-[0.17em] text-[#e8b47d]">
              Sanctuary coordinates
            </h2>
            <p className="mt-3 text-[10px] leading-5 text-white/60">
              12 Hassan Sabry Street, Zamalek
              <br />
              Cairo, Arab Republic of Egypt
            </p>
          </div>
          <div>
            <h2 className="text-[9px] font-semibold uppercase tracking-[0.17em] text-[#e8b47d]">
              Follow our table
            </h2>
            <nav aria-label="Social media" className="mt-3 flex gap-2">
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  href="#"
                  aria-label={link.label}
                  title={link.label}
                  className={socialLinkClassName}
                >
                  {link.icon}
                </a>
              ))}
            </nav>
          </div>
        </div>
        <div className="mt-8 flex flex-col justify-between gap-3 border-t border-white/10 pt-4 text-[8px] uppercase tracking-[0.12em] text-white/40 sm:flex-row">
          <span>© 2025 Saffron & Stone Hospitality Group. All rights reserved.</span>
          <a href="/reservation" className="transition hover:text-[#e8b47d]">
            Private dining · Concierge booking
          </a>
        </div>
      </div>
    </footer>
  )
}
