import type { ReactNode } from 'react'

type TagVariant = 'genre' | 'artist' | 'dark' | 'neutral'

type TagProps = {
  children: ReactNode
  variant?: TagVariant
}

const variantClasses: Record<TagVariant, string> = {
  genre: 'border-[#d923ff] bg-[#fff8c7] text-[#100516]',
  artist: 'border-[#d923ff] bg-[#f8c7ff] text-[#100516]',
  dark: 'border-white/10 bg-white/15 text-white',
  neutral: 'border-[#d923ff]/40 bg-[#f8f0ff] text-[#100516]',
}

export function Tag({ children, variant = 'neutral' }: TagProps) {
  return (
    <span
      className={`rounded-full border px-4 py-1.5 text-xs font-bold ${variantClasses[variant]}`}
    >
      {children}
    </span>
  )
}
