export default function ProviderProfileLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl animate-pulse space-y-8" aria-label="Memuat profil dan portfolio mitra">
      <div className="h-5 w-48 rounded bg-[#E2E8F0]" />
      <div className="h-64 rounded-[16px] bg-[#CBD5E1]" />
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="h-80 rounded-[16px] bg-[#E2E8F0]" />
          <div className="h-80 rounded-[16px] bg-[#E2E8F0]" />
        </div>
        <div className="h-64 rounded-[16px] bg-[#E2E8F0]" />
      </div>
    </div>
  )
}
