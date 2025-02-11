import { useEffect, useRef, useState } from "react";
import StarRating from "./StarRating.js";

const tempMovieData = [
  {
    imdbID: "tt1375666",
    Title: "Inception",
    Year: "2010",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
  },
  {
    imdbID: "tt0133093",
    Title: "The Matrix",
    Year: "1999",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI0MTEtMDllZjNkYzNjNTc4L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg",
  },
  {
    imdbID: "tt6751668",
    Title: "Parasite",
    Year: "2019",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BYWZjMjk3ZTItODQ2ZC00NTY5LWE0ZDYtZTI3MjcwN2Q5NTVkXkEyXkFqcGdeQXVyODk4OTc3MTY@._V1_SX300.jpg",
  },
];

const tempWatchedData = [
  {
    imdbID: "tt1375666",
    Title: "Inception",
    Year: "2010",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
    runtime: 148,
    imdbRating: 8.8,
    userRating: 10,
  },
  {
    imdbID: "tt0088763",
    Title: "Back to the Future",
    Year: "1985",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BZmU0M2Y1OGUtZjIxNi00ZjBkLTg1MjgtOWIyNThiZWIwYjRiXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX300.jpg",
    runtime: 116,
    imdbRating: 8.5,
    userRating: 9,
  },
];

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

const KEY = "4a63a7f2";
// const tempQuery = "interstellar";

export default function App() {
  const [movies, setMovies] = useState([]);
  const [watched, setWatched] = useState(() =>
    JSON.parse(localStorage.getItem("watched"))
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  useEffect(
    function () {
      const controller = new AbortController();
      async function fetchMovies() {
        try {
          setError("");
          setIsLoading(true);
          const res = await fetch(
            `http://www.omdbapi.com/?apikey=${KEY}&s=${query}`,
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
      if (query.length === 0) {
        setMovies([]);
        setError("");
      }
      if (query.length < 3) return;
      fetchMovies();
      return function () {
        controller.abort();
      };
    },
    [query]
  );
  function handleID(id) {
    setSelectedId((oldId) => (oldId === id ? null : id));
  }
  function handleCloseMovie() {
    setSelectedId(null);
  }
  function handleRemoveMovie(id) {
    setWatched((movies) => movies.filter((mov) => mov.imdbID !== id));
  }

  useEffect(
    function () {
      localStorage.setItem("watched", JSON.stringify(watched));
    },
    [watched]
  );

  return (
    <>
      <Nav>
        <Logo />
        <Search query={query} setQuery={setQuery} />
        <NumResults movies={movies} />
      </Nav>
      <Main>
        <Box>
          {isLoading && <Loader />}
          {error && <ErrorMessage error={error} />}
          {!error && !isLoading && (
            <MovieList
              handleID={handleID}
              setSelectedId={setSelectedId}
              movies={movies}
            />
          )}
        </Box>
        <Box>
          {selectedId ? (
            <MovieDetails
              id={selectedId}
              handleCloseMovie={handleCloseMovie}
              setWatched={setWatched}
              watched={watched}
            />
          ) : (
            <>
              <WatchedMoviesSummary watched={watched} />
              <WatchedMovieList
                watched={watched}
                selectedId={selectedId}
                setSelectedId={setSelectedId}
                handleRemoveMovie={handleRemoveMovie}
              />
            </>
          )}
        </Box>
      </Main>
    </>
  );
}

///////////////////  LOADER COMPONENT  ////////////////////
function Loader() {
  return <p className="loader">Loading...</p>;
}

///////////////////  ERROR COMPONENT  ////////////////////
function ErrorMessage({ error }) {
  return (
    <p className="error">
      {error}
      <span>⛔</span>
    </p>
  );
}

///////////////////  NAVIGATION  ////////////////////
function Nav({ children }) {
  return <nav className="nav-bar">{children}</nav>;
}

function Logo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  );
}

function Search({ query, setQuery }) {
  const inputEl = useRef(null);

  useEffect(
    function () {
      inputEl.current.focus();
      function callBack(e) {
        if (document.activeElement === inputEl.current) return;
        if (e.code === "Enter") {
          inputEl.current.focus();
          setQuery("");
        }
      }
      document.addEventListener("keydown", callBack);
      return () => document.removeEventListener("keydown", callBack);
    },
    [setQuery]
  );

  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      ref={inputEl}
      onChange={(e) => setQuery(e.target.value)}
    />
  );
}

function NumResults({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies?.length}</strong> results
    </p>
  );
}

///////////////////  MAIN  ////////////////////
function Main({ children }) {
  return <main className="main">{children}</main>;
}
////////  MOVIES BOX (REUSEABLE)  ////////

function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "–" : "+"}
      </button>
      {isOpen && children}
    </div>
  );
}

////////  MOVIES LIST DATA  ////////}
function MovieList({ movies, handleID }) {
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <Movie handleID={handleID} movie={movie} key={movie.imdbID} />
      ))}
    </ul>
  );
}

function Movie({ movie, handleID }) {
  return (
    <li onClick={() => handleID(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}

////////  WATCHED MOVIES DATA  ////////
function WatchedMoviesSummary({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));

  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating.toFixed(2)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating.toFixed(2)}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime} min</span>
        </p>
      </div>
    </div>
  );
}

function WatchedMovieList({ watched, handleRemoveMovie }) {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchedMovie
          movie={movie}
          key={movie.imdbID}
          handleRemoveMovie={handleRemoveMovie}
        />
      ))}
    </ul>
  );
}

function WatchedMovie({ movie, handleRemoveMovie }) {
  return (
    <li>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>
        <button
          className="btn-delete"
          onClick={() => handleRemoveMovie(movie.imdbID)}
        >
          x
        </button>
      </div>
    </li>
  );
}

///////////////////  MOVIE DETAILS COMPONENT  ////////////////////
function MovieDetails({ id, handleCloseMovie, watched, setWatched }) {
  const [movie, setMovie] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [userRating, setUserRating] = useState(null);
  const isWatched = watched.map((mov) => mov.imdbID).includes(id);
  const watchedUserRating = watched.find(
    (movie) => movie.imdbID === id
  )?.userRating;
  const {
    Title: title,
    Year: year,
    Released: released,
    Poster: poster,
    Genre: genre,
    Director: director,
    Actors: actors,
    Plot: plot,
    imdbRating,
    Runtime: runtime,
  } = movie;

  useEffect(
    function () {
      function close(e) {
        if (e.code === "Escape") {
          handleCloseMovie();
        }
      }
      document.addEventListener("keydown", close);
      return function () {
        document.removeEventListener("keydown", close);
      };
    },
    [handleCloseMovie]
  );

  useEffect(
    function () {
      async function fetchMovieDetails() {
        setIsLoading(true);
        const res = await fetch(
          `http://www.omdbapi.com/?apikey=${KEY}&i=${id}`
        );
        const data = await res.json();
        setMovie(data);
        setIsLoading(false);
      }
      fetchMovieDetails();
    },
    [id]
  );

  useEffect(
    function () {
      if (!title) return;
      document.title = `Movie | ${title}`;
      return () => (document.title = "MovieMate");
    },
    [title]
  );

  function handleUserRating(rating) {
    setUserRating(rating);
  }
  function addWatchedMovie() {
    // imdbID: "tt1375666",
    // Title: "Inception",
    // Year: "2010",
    // Poster:
    //   "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
    // runtime: 148,
    // imdbRating: 8.8,
    // userRating: 10,
    setWatched([
      ...watched,
      {
        imdbID: id,
        Title: title,
        Year: year,
        Poster: poster,
        runtime: runtime.split(" ")[0],
        imdbRating: imdbRating,
        userRating: userRating,
      },
    ]);
    handleCloseMovie();
  }
  return (
    <div className="details">
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <header>
            <button className="btn-back" onClick={handleCloseMovie}>
              &larr;
            </button>
            <img src={poster} alt={`Poster of ${title} movie`}></img>
            <div className="details-overview">
              <h2>{title}</h2>
              <p>
                {released} &bull;{runtime}
              </p>
              <p>{genre}</p>
              <p>
                <span>⭐</span>
                {imdbRating} IMDB Rating
              </p>
            </div>
          </header>
          <section>
            <div className="rating">
              {isWatched ? (
                <Rated rating={watchedUserRating} />
              ) : (
                <StarRating
                  maxRating={10}
                  size={24}
                  handleGetRating={handleUserRating}
                />
              )}
              {userRating && (
                <button className="btn-add" onClick={addWatchedMovie}>
                  Add to watchlist
                </button>
              )}
            </div>
            <p>
              <em>{plot}</em>
            </p>
            <p>Starring {actors}</p>
            <p>Directed by {director}</p>
          </section>
        </>
      )}
    </div>
  );
}

function Rated({ rating }) {
  return <p>You have already rated the movie {rating} ⭐</p>;
}
////////  WATCHED MOVIES BOX  ////////
// function WatchedBox() {
//   const [watched, setWatched] = useState(tempWatchedData);
//   const [isOpen2, setIsOpen2] = useState(true);

//   return (
//     <div className="box">
//       <button
//         className="btn-toggle"
//         onClick={() => setIsOpen2((open) => !open)}
//       >
//         {isOpen2 ? "–" : "+"}
//       </button>
//       {isOpen2 && (
//         <>
//           <WatchedMoviesSummary watched={watched} />
//           <WatchedMovieList watched={watched} />
//         </>
//       )}
//     </div>
//   );
// }
