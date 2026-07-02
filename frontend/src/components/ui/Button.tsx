import type { ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonVariant = 'primary' | 'dark' | 'light' | 'ghost'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode
  variant?: ButtonVariant
  fullWidth?: boolean
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-[#d923ff] text-white shadow-[0_0_25px_rgba(217,35,255,0.35)] hover:bg-[#c316ef]',
  dark: 'bg-[#100516] text-white hover:bg-[#d923ff]',
  light: 'bg-white text-[#100516] hover:bg-[#f8f0ff]',
  ghost: 'bg-white/10 text-white hover:bg-white/20',
}

export function Button({
  children,
  variant = 'primary',
  fullWidth = false,
  className = '',
  type = 'button',
  ...props
}: ButtonProps) {
  const widthClass = fullWidth ? 'w-full' : ''

  return (
    <button
      className={`rounded-2xl px-6 py-3 text-sm font-bold transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60 ${variantClasses[variant]} ${widthClass} ${className}`}
      type={type}
      {...props}
    >
      {children}
    </button>
  )
}
