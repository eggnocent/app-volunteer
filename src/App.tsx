function App() {
  return (
    <main className="min-h-svh bg-background px-6 py-10 text-foreground">
      <section className="mx-auto flex max-w-4xl flex-col gap-4 rounded-lg border bg-card p-6 shadow-sm">
        <div className="flex size-12 items-center justify-center rounded-md bg-primary font-heading text-2xl font-bold text-primary-foreground">
          M
        </div>
        <div>
          <p className="text-sm font-semibold uppercase text-primary">Migunani</p>
          <h1 className="mt-2 font-heading text-3xl font-bold md:text-5xl">
            Foundation siap untuk marketplace volunteer.
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Step 1 menyiapkan React, Vite, Tailwind, shadcn-ready utilities,
            routing package, icon, motion, font, dan token warna brand.
          </p>
        </div>
      </section>
    </main>
  )
}

export default App
