import { useState } from 'react'
import { Menu as MenuIcon, ShoppingBag, X } from 'lucide-react'
import ThemeToggle from './ThemeToggle'

const links = [
  { label: 'Home', href: '/' },
  { label: 'Menu', href: '/menu' },
  { label: 'Reservation', href: '/reservation' },
  { label: 'Our story', href: '/#story' },
  { label: 'Contact us', href: '/#contact' },
]

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const currentPath = window.location.pathname.replace(/\/$/, '') || '/'

  const closeMenu = () => setIsMenuOpen(false)

  return (
    <header className="relative z-50 border-b border-[#e8e8ec] bg-[#fbfbfe] text-[#202633]">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-3 px-5 py-3 sm:px-8 lg:px-12">
        <a
          href="/"
          aria-label="Saffron and Stone home"
          className="flex shrink-0 items-center gap-2.5"
          onClick={closeMenu}
        >
          <span className="flex size-8 items-center justify-center rounded-full border border-[#d6a36a] font-serif text-base text-[#a94f0b]">
            S
          </span>
          <span className="leading-tight">
            <span className="block font-serif text-xs tracking-[0.12em] sm:text-sm">
              SAFFRON <span className="text-[#a94f0b]">&</span> STONE
            </span>
            <span className="mt-0.5 block text-[7px] uppercase tracking-[0.22em] text-[#858592]">
              Haute cuisine · Cairo
            </span>
          </span>
        </a>

        <nav
          aria-label="Main navigation"
          className="hidden items-center gap-3 xl:gap-6 md:flex"
        >
          {links.map((link) => {
            const isActive =
              link.href === currentPath ||
              (link.href === '/#story' &&
                currentPath === '/' &&
                window.location.hash !== '#contact') ||
              (link.href === '/#contact' &&
                currentPath === '/' &&
                window.location.hash === '#contact')

            return (
              <a
                key={link.href}
                href={link.href}
                aria-current={isActive ? 'page' : undefined}
                className={`whitespace-nowrap text-[9px] transition xl:text-[10px] ${
                  isActive
                    ? 'font-semibold text-[#a94f0b]'
                    : 'text-[#555563] hover:text-[#a94f0b]'
                }`}
              >
                {link.label}
              </a>
            )
          })}
        </nav>

        <div className="hidden shrink-0 items-center gap-2 md:flex">
          <ThemeToggle />
          <a
            href="/checkout"
            aria-label="Open tasting cart"
            className="relative flex size-8 items-center justify-center border border-[#e6e6ec] text-[#343542] transition hover:border-[#d6a36a] hover:text-[#a94f0b]"
          >
            <ShoppingBag size={15} aria-hidden="true" />
          </a>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setIsMenuOpen((open) => !open)}
            className="flex size-9 items-center justify-center border border-[#e6e6ec] text-[#343542] dark:border-[#414755] dark:text-[#e8b47d]"
          >
            {isMenuOpen ? <X size={18} /> : <MenuIcon size={18} />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <nav
          id="mobile-navigation"
          aria-label="Mobile navigation"
          className="absolute inset-x-0 top-full flex flex-col gap-1 border-t border-[#e8e8ec] bg-[#fbfbfe] px-5 py-4 shadow-xl dark:border-[#343b48] dark:bg-[#191e28] md:hidden"
        >
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={closeMenu}
              className="px-3 py-3 text-xs text-[#555563] transition hover:bg-[#f0f1fc] hover:text-[#a94f0b] dark:text-[#c2c4cd] dark:hover:bg-[#252b38]"
            >
              {link.label}
            </a>
          ))}
          <a
            href="/checkout"
            onClick={closeMenu}
            className="flex items-center gap-2 px-3 py-3 text-xs text-[#555563] transition hover:bg-[#f0f1fc] hover:text-[#a94f0b] dark:text-[#c2c4cd] dark:hover:bg-[#252b38]"
          >
            <ShoppingBag size={14} aria-hidden="true" /> Your tasting cart
          </a>
        </nav>
      )}
    </header>
  )
}
