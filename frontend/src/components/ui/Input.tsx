import type { InputHTMLAttributes } from 'react'

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string
}

export function Input({ label, className = '', ...props }: InputProps) {
  return (
    <label className="block">
      {label && (
        <span className="mb-2 block text-sm font-bold text-[#100516]">
          {label}
        </span>
      )}

      <input
        className={`w-full rounded-2xl border border-[#d923ff]/45 bg-white/80 px-4 py-3 text-sm text-[#100516] outline-none transition placeholder:text-gray-500 focus:border-[#d923ff] focus:ring-4 focus:ring-[#d923ff]/20 read-only:focus:ring-0 ${className}`}
        {...props}
      />
    </label>
  )
}