// Placeholder matching MovieCard's layout (2:3 poster + title + year), in the dark theme.
const MovieCardSkeleton = () => (
  <article aria-hidden="true">
    <div className="aspect-[2/3] animate-pulse rounded-xl bg-white/[0.06] ring-1 ring-white/5" />
    <div className="px-0.5 pt-2.5 space-y-2">
      <div className="h-3.5 w-3/4 animate-pulse rounded bg-white/10" />
      <div className="h-3 w-1/4 animate-pulse rounded bg-white/[0.06]" />
    </div>
  </article>
);

export default MovieCardSkeleton;
