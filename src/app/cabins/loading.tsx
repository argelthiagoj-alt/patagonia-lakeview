/**
 * Skeleton premium para `/cabins` (catálogo).
 * Reusa la clase `.shimmer` declarada en globals.css.
 */
export default function Loading() {
  return (
    <div className="container-page space-y-8 pt-28 pb-24">
      <div className="space-y-3">
        <span className="shimmer block h-6 w-40 rounded-md" />
        <span className="shimmer block h-9 w-72 rounded-md" />
      </div>
      <span className="shimmer block h-12 w-full rounded-2xl" />
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <li key={i} className="space-y-3">
            <span className="shimmer block aspect-[5/4] w-full rounded-[2rem]" />
            <span className="shimmer block h-5 w-3/4 rounded-md" />
            <span className="shimmer block h-4 w-1/2 rounded-md" />
          </li>
        ))}
      </ul>
    </div>
  );
}
