import { memo, useState } from "react";
import { Link } from "react-router-dom";

const hasRating = (r) => r && r !== "N/A" && !isNaN(Number(r));

// Poster card for the movie / TV grids. Uses the real poster ratio (2:3) so nothing is cropped,
// fades the image in once it has loaded, and shows a titled placeholder when there's no poster.
const MovieCard = ({ imageUrl, title, year, rating, link }) => {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const hasPoster = imageUrl && imageUrl !== "N/A" && !failed;

  return (
    <article>
      <Link
        to={link}
        className="group block rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400/70"
      >
        <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-white/5 ring-1 ring-white/10 transition duration-300 group-hover:-translate-y-1 group-hover:ring-white/25 group-hover:shadow-[0_12px_30px_-10px_rgba(168,85,247,0.45)]">
          {hasPoster ? (
            <img
              className={`h-full w-full object-cover transition duration-500 group-hover:scale-105 ${
                loaded ? "opacity-100" : "opacity-0"
              }`}
              src={imageUrl}
              alt={title}
              loading="lazy"
              decoding="async"
              onLoad={() => setLoaded(true)}
              onError={() => setFailed(true)}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-900/40 to-rose-900/30 p-3 text-center text-sm font-semibold text-white/70">
              {title}
            </div>
          )}

          {/* shimmer while the poster downloads */}
          {hasPoster && !loaded && <div className="absolute inset-0 animate-pulse bg-white/5" />}

          {hasRating(rating) && (
            <span className="absolute right-2 top-2 flex items-center gap-1 rounded-md bg-black/60 px-1.5 py-0.5 text-xs font-semibold text-amber-300 backdrop-blur-sm">
              ★ {rating}
            </span>
          )}

          {/* hover: darken from the bottom + play button */}
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <span className="flex h-12 w-12 scale-90 items-center justify-center rounded-full bg-white/90 text-black shadow-lg transition-transform duration-300 group-hover:scale-100">
              <svg viewBox="0 0 24 24" className="ml-0.5 h-5 w-5" fill="currentColor" aria-hidden="true">
                <path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z" />
              </svg>
            </span>
          </div>
        </div>

        <div className="px-0.5 pt-2.5">
          <p className="truncate font-gilroy text-sm font-semibold text-gray-100 transition-colors group-hover:text-white 3xl:text-xl">
            {title}
          </p>
          <p className="mt-0.5 text-xs text-gray-400 3xl:text-base">{year}</p>
        </div>
      </Link>
    </article>
  );
};

export default memo(MovieCard);
