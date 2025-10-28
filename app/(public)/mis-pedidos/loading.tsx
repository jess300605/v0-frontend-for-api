export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="h-8 w-48 animate-pulse rounded bg-muted mb-8" />
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-32 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    </div>
  )
}
