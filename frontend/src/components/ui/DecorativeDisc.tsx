type DecorativeDiscProps = {
  position?: 'left' | 'right'
  opacity?: string
}

export function DecorativeDisc({
  position = 'right',
  opacity = '0.08',
}: DecorativeDiscProps) {
  const positionClass =
    position === 'right' ? '-right-40 top-28' : '-left-40 top-28'

  return (
    <div
      className={`pointer-events-none absolute ${positionClass} hidden h-[520px] w-[520px] rounded-full blur-[0.5px] lg:block`}
      style={{
        opacity,
        background:
          'radial-gradient(circle at center, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.9) 7%, rgba(185,80,190,0.55) 8%, rgba(185,80,190,0.55) 14%, transparent 15%, transparent 28%, rgba(255,255,255,0.25) 29%, rgba(255,255,255,0.25) 31%, transparent 32%), conic-gradient(from 40deg, #160014, #7c0b78, #e13cff, #5d0a68, #ff70d9, #26001f, #b912bf, #160014)',
        boxShadow: '0 0 120px rgba(217,35,255,0.22)',
      }}
    />
  )
}
