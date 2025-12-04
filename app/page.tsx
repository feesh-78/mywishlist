export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-center font-mono text-sm">
        <h1 className="text-6xl font-bold text-center mb-8 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          MyWishList
        </h1>
        <p className="text-xl text-center text-muted-foreground mb-12">
          Partagez vos envies avec vos proches
        </p>
        <div className="grid gap-4 text-center lg:grid-cols-3">
          <div className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 dark:hover:border-neutral-700 dark:hover:bg-neutral-800/30">
            <h2 className="mb-3 text-2xl font-semibold">
              Wishlists{" "}
              <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                →
              </span>
            </h2>
            <p className="m-0 max-w-[30ch] text-sm opacity-50">
              Créez autant de listes que vous voulez pour toutes vos occasions
            </p>
          </div>

          <div className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 dark:hover:border-neutral-700 dark:hover:bg-neutral-800/30">
            <h2 className="mb-3 text-2xl font-semibold">
              Social{" "}
              <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                →
              </span>
            </h2>
            <p className="m-0 max-w-[30ch] text-sm opacity-50">
              Suivez vos amis et découvrez leurs envies
            </p>
          </div>

          <div className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 dark:hover:border-neutral-700 dark:hover:bg-neutral-800/30">
            <h2 className="mb-3 text-2xl font-semibold">
              Parrainage{" "}
              <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                →
              </span>
            </h2>
            <p className="m-0 max-w-[30ch] text-sm opacity-50">
              Partagez vos codes promo et liens de parrainage
            </p>
          </div>
        </div>
        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            🚀 Application en cours de développement
          </p>
        </div>
      </div>
    </main>
  );
}
