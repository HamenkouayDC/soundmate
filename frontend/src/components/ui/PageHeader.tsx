type PageHeaderProps = {
  label: string
  title: string
  description: string
}

export function PageHeader({ label, title, description }: PageHeaderProps) {
  return (
    <div className="mb-8">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#9c20c7]">
        {label}
      </p>

      <h1 className="mt-2 max-w-3xl text-4xl font-black text-[#100516] md:text-5xl">
        {title}
      </h1>

      <p className="mt-4 max-w-2xl text-base leading-7 text-gray-600">
        {description}
      </p>
    </div>
  )
}