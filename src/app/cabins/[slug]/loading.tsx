/**
 * Skeleton premium para `/cabins/[slug]`.
 * Se muestra mientras el server hace el fetch del detalle, gallery y
 * reviews. Mantiene la grilla final para que no haya layout shift.
 */
export default function Loading() {
  return (
    <div className="space-y-12 pb-24">
      <header className="container-page space-y-3 pt-24 pb-6">
        <div className="flex gap-2">
          <Bar w={90} h={20} />
          <Bar w={130} h={20} />
        </div>
        <Bar w={420} h={40} />
        <div className="flex flex-wrap gap-4">
          <Bar w={140} h={14} />
          <Bar w={180} h={14} />
        </div>
      </header>

      <div className="container-page">
        <div className="grid h-[60vh] grid-cols-1 gap-2 overflow-hidden rounded-[2rem] md:grid-cols-4 md:grid-rows-2">
          <div className="shimmer md:col-span-2 md:row-span-2" />
          <div className="shimmer hidden md:block" />
          <div className="shimmer hidden md:block" />
          <div className="shimmer hidden md:block" />
          <div className="shimmer hidden md:block" />
        </div>
      </div>

      <div className="container-page grid gap-12 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <Bar w={200} h={24} />
          <Bar w="100%" h={16} />
          <Bar w="80%" h={16} />
          <Bar w="65%" h={16} />
          <div className="grid grid-cols-2 gap-3 pt-3 sm:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Bar key={i} w="100%" h={48} />
            ))}
          </div>
        </div>
        <div className="space-y-3">
          <Bar w="100%" h={260} />
        </div>
      </div>
    </div>
  );
}

function Bar({ w, h }: { w: number | string; h: number }) {
  return (
    <span
      className="shimmer block rounded-md"
      style={{
        width: typeof w === "number" ? `${w}px` : w,
        height: `${h}px`,
      }}
    />
  );
}
