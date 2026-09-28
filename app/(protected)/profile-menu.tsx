'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { LogOut, PencilLine, UserRound } from 'lucide-react'
import { logoutUser } from '@/app/actions/auth'

type ProfileMenuProps = {
  name: string
  email: string
  image?: string | null
  accountType: string
  roleLabel: string
  compact?: boolean
}

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

export function ProfileMenu({
  name,
  email,
  image,
  accountType,
  roleLabel,
  compact = false,
}: ProfileMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const firstItemRef = useRef<HTMLAnchorElement>(null)
  const safeImage = image && (/^https?:\/\//i.test(image) || image.startsWith('/') || image.startsWith('data:image/'))
    ? image
    : null

  useEffect(() => {
    if (!isOpen) return

    firstItemRef.current?.focus()

    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false)
        triggerRef.current?.focus()
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-label={compact ? `Buka menu profil ${name}` : undefined}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
        className={`group flex min-h-12 items-center text-left transition-all duration-200 active:scale-[0.98] focus-visible:ring-[#FF6B00]/40 ${
          compact
            ? 'h-12 w-12 justify-center rounded-full border border-[#E2E8F0] bg-white p-1.5 hover:border-[#CBD5E1] hover:bg-[#F8FAFC]'
            : 'w-fit max-w-[280px] gap-3 rounded-[8px] px-2 py-1.5 hover:bg-[#F1F5F9]'
        }`}
      >
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-white bg-[#0F172A] bg-cover bg-center text-xs font-extrabold text-white shadow-[0_0_0_1px_#E2E8F0]"
          style={safeImage ? { backgroundImage: `url(${JSON.stringify(safeImage)})` } : undefined}
          role={safeImage ? 'img' : undefined}
          aria-label={safeImage ? `Foto profil ${name}` : undefined}
          aria-hidden={safeImage ? undefined : true}
        >
          {!safeImage && (getInitials(name) || <UserRound className="h-4 w-4" />)}
        </span>

        {!compact && (
          <>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-bold leading-5 text-[#0F172A]">{name}</span>
              <span className="block truncate text-xs font-semibold leading-4 text-[#64748B]">{roleLabel}</span>
            </span>
          </>
        )}
      </button>

      {isOpen && (
        <div
          role="menu"
          aria-label="Menu profil"
          className="absolute right-0 top-[calc(100%+8px)] z-[60] w-[min(320px,calc(100vw-24px))] overflow-hidden rounded-[16px] border border-[#CBD5E1] bg-white shadow-[0_10px_15px_-3px_rgba(15,23,42,0.14),0_4px_6px_-4px_rgba(15,23,42,0.08)]"
        >
          <div className="border-b border-[#E2E8F0] px-4 py-4">
            <div className="flex items-start gap-3">
              <span
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#0F172A] bg-cover bg-center text-sm font-extrabold text-white"
                style={safeImage ? { backgroundImage: `url(${JSON.stringify(safeImage)})` } : undefined}
                aria-hidden="true"
              >
                {!safeImage && (getInitials(name) || <UserRound className="h-5 w-5" />)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold text-[#0F172A]">{name}</p>
                <p className="truncate text-xs text-[#64748B]">{email}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-[#FFF7ED] px-2 py-1 text-[11px] font-bold text-[#9A3412]">
                    {accountType}
                  </span>
                  {roleLabel !== accountType && (
                    <span className="min-w-0 truncate text-xs font-semibold text-[#334155]">{roleLabel}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="p-2">
            <Link
              ref={firstItemRef}
              href="/dashboard/profile"
              role="menuitem"
              onClick={() => setIsOpen(false)}
              className="flex min-h-11 items-center gap-3 rounded-[8px] px-3 text-sm font-semibold text-[#0F172A] hover:bg-[#F1F5F9] focus-visible:ring-[#FF6B00]/40"
            >
              <PencilLine className="h-4 w-4 text-[#FF6B00]" aria-hidden="true" />
              Edit profil
            </Link>

            <form action={logoutUser}>
              <button
                type="submit"
                role="menuitem"
                className="flex min-h-11 w-full items-center gap-3 rounded-[8px] px-3 text-sm font-semibold text-[#B91C1C] hover:bg-[#FEF2F2] focus-visible:ring-[#B91C1C]/30"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                Keluar akun
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
