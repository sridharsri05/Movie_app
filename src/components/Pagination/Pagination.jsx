import { useEffect } from "react";
import {
  resetSearchResults,
  selectCurrentPage,
  selectSearchQuery,
  selectTotalResults,
  setCurrentPage,
  setDataLoading,
  setSearchResults,
  setTotalResults,
} from "../../Redux/searchSlice";
import { useDispatch, useSelector } from "react-redux";
import { enrichSearchResults } from "../../api/enrichSearchResults";
import { useSearchByQueryQuery } from "../../Redux/Services/MovieApi";

const PAGE_SIZE = 10; // OMDb returns 10 results per page

// Page numbers to show: always first and last, a window around the current page, gaps as "…".
const pageList = (current, total) => {
  const pages = new Set([1, total, current - 1, current, current + 1]);
  if (current <= 3) [2, 3, 4].forEach((p) => pages.add(p));
  if (current >= total - 2) [total - 1, total - 2, total - 3].forEach((p) => pages.add(p));
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const out = [];
  sorted.forEach((p, i) => {
    if (i && p - sorted[i - 1] > 1) out.push(`gap-${p}`);
    out.push(p);
  });
  return out;
};

const Arrow = ({ dir, disabled, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    aria-label={dir < 0 ? "Previous page" : "Next page"}
    className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-white ring-1 ring-white/10 transition hover:bg-white/15 disabled:pointer-events-none disabled:opacity-30"
  >
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={dir < 0 ? "M15 18l-6-6 6-6" : "M9 18l6-6-6-6"} />
    </svg>
  </button>
);

// Loads OMDb search results for the current query/page into Redux, and renders the pager.
const Pagination = () => {
  const dispatch = useDispatch();
  const SearchQuery = useSelector(selectSearchQuery);
  const currentPage = useSelector(selectCurrentPage);
  const totalResults = useSelector(selectTotalResults);

  // `currentData` (not `data`): while a new page loads, `data` still holds the previous page, which
  // made page 3 re-render before page 4 arrived. `currentData` is undefined until the requested page is in.
  const { currentData: movies, isFetching } = useSearchByQueryQuery(
    { query: SearchQuery, page: currentPage },
    { skip: !SearchQuery }
  );

  const totalPages = Math.ceil(totalResults / PAGE_SIZE);

  // Show the skeleton right away while the requested page is being fetched.
  useEffect(() => {
    if (isFetching) dispatch(setDataLoading(true));
  }, [isFetching, dispatch]);

  useEffect(() => {
    if (!movies) return;
    let cancelled = false; // a slower, older page must not overwrite a newer one
    (async () => {
      try {
        dispatch(setDataLoading(true));
        if (movies.Response === "True") {
          dispatch(setTotalResults(Number(movies.totalResults)));
          const combinedResults = await enrichSearchResults(movies.Search);
          if (cancelled) return;
          dispatch(setSearchResults(combinedResults));
        } else {
          dispatch(resetSearchResults());
          dispatch(setTotalResults(0));
        }
      } catch (error) {
        console.error("Error handling search:", error);
      } finally {
        if (!cancelled) dispatch(setDataLoading(false));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [movies, dispatch]);

  const go = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      dispatch(setCurrentPage(page));
    }
  };

  if (totalPages <= 1) return null;

  return (
    <nav aria-label="Search result pages" className="mt-12 flex flex-wrap items-center justify-center gap-2">
      <Arrow dir={-1} disabled={currentPage <= 1} onClick={() => go(currentPage - 1)} />
      {pageList(currentPage, totalPages).map((p) =>
        typeof p === "string" ? (
          <span key={p} className="px-1 text-white/40">
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => go(p)}
            aria-current={p === currentPage ? "page" : undefined}
            className={`h-10 min-w-10 rounded-full px-3 text-sm font-semibold transition ${
              p === currentPage
                ? "bg-gradient-to-r from-violet-400 to-rose-500 text-white shadow-lg shadow-violet-500/25"
                : "bg-white/5 text-white/70 ring-1 ring-white/10 hover:bg-white/15 hover:text-white"
            }`}
          >
            {p}
          </button>
        )
      )}
      <Arrow dir={1} disabled={currentPage >= totalPages} onClick={() => go(currentPage + 1)} />
    </nav>
  );
};

export default Pagination;
