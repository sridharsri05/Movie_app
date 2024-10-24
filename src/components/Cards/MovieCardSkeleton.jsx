const MovieCardSkeleton = () => {
  return (
    <article className="border-0 relative ">
      <div className="max-w-sm rounded overflow-hidden animate-pulse">
        <div className="relative overflow-hidden">
          <div className="w-full h-72 bg-gray-300"></div>

          <div className="absolute top-0 left-0 w-full h-full opacity-0 transition-opacity flex justify-center items-center">
            <div className="w-14 h-14 bg-gray-400"></div>
          </div>

          <div className="absolute right-0 bottom-0 opacity-0 transition-opacity p-2">
            <div className="text-white text-sm bg-gray-800 bg-opacity-75 rounded"></div>
          </div>
        </div>

        <div className="py-1 bg-transparent">
          <div className="font-bold text-white text-sm text-start mb-2 truncate font-libre">
            <div className="w-3/4 h-4 bg-gray-400 mb-1"></div>
          </div>
          <div className="text-gray-700 text-sm">
            <div className="w-1/4 h-4 bg-gray-400"></div>
          </div>
        </div>
      </div>
    </article>
  );
};

export default MovieCardSkeleton;
