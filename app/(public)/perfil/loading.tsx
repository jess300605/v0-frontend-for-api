export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <div className="h-8 w-48 animate-pulse rounded bg-muted mb-8" />
        <div className="h-96 animate-pulse rounded-lg bg-muted" />
      </div>
    </div>
  )
}
