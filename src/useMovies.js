import { useState, useEffect } from "react";

const KEY = "4a63a7f2";

export function useMovies(query) {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  useEffect(
    function () {
      const controller = new AbortController();
      async function fetchMovies() {
        try {
          setError("");
          setIsLoading(true);
          const res = await fetch(
            `https://www.omdbapi.com/?apikey=${KEY}&s=${query}`,
            { signal: controller.signal }
          );
          if (!res.ok)
            throw new Error("Something went wrong while getting movies");
          const data = await res.json();
          if (data.Response === "False") throw new Error("Movie Not Found");

          setMovies(data.Search);
          setError("");
        } catch (err) {
          if (err.name !== "AbortError") setError(err.message);
        } finally {
          setIsLoading(false);
        }
      }
      console.log(query.length);
      if (query.length === 0) {
        setMovies([]);
        setError("Please start by typing movies name in search bar");
        return;
      }
      if (query.length < 3 && query.length > 0) {
        setError("");
        return;
      }
      fetchMovies();
      // action?.();
      return function () {
        controller.abort();
      };
    },
    [query]
  );
  return { movies, isLoading, error };
}
