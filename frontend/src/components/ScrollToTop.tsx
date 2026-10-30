import { useEffect, useState } from 'react'
import { ArrowUp } from 'lucide-react'

const SCROLL_THRESHOLD = 320

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(
    () => window.scrollY > SCROLL_THRESHOLD,
  )

  useEffect(() => {
    const updateVisibility = () => {
      setIsVisible(window.scrollY > SCROLL_THRESHOLD)
    }

    window.addEventListener('scroll', updateVisibility, { passive: true })
    return () => window.removeEventListener('scroll', updateVisibility)
  }, [])

  const scrollToTop = () => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? 'instant' : 'smooth',
    })
  }

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Scroll to top"
      aria-hidden={!isVisible}
      tabIndex={isVisible ? 0 : -1}
      className={`fixed bottom-5 right-5 z-[70] flex size-11 items-center justify-center rounded-full border border-[#e8b47d]/70 bg-[#202633] text-[#e8b47d] shadow-lg shadow-[#171b24]/25 transition-all duration-300 hover:-translate-y-1 hover:border-[#e8b47d] hover:bg-[#a94f0b] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a94f0b] sm:bottom-7 sm:right-7 ${
        isVisible
          ? 'translate-y-0 opacity-100'
          : 'pointer-events-none translate-y-3 opacity-0'
      }`}
    >
      <ArrowUp size={19} strokeWidth={2} aria-hidden="true" />
    </button>
  )
}
