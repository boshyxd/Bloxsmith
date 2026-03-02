export default function MaintenancePage() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-6">
          <div className="flex items-center justify-center h-12 w-12 bg-secondary rounded-none">
            <img src="/logos/bloxsmith-icon.svg" alt="Bloxsmith" className="h-7 w-7" />
          </div>
        </div>
        <h1 className="text-2xl font-medium text-foreground mb-3">Under Construction</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Bloxsmith is being updated. Check back shortly.
        </p>
      </div>
    </main>
  )
}
