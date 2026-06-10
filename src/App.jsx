import { useEffect, useState } from "react";

const API_BASE = "/api";
const emptyAuth = { name: "", email: "", password: "" };
const emptyMovie = { title: "", description: "", year: "" };

function App() {
  const [view, setView] = useState("login");
  const [authForm, setAuthForm] = useState(emptyAuth);
  const [movieForm, setMovieForm] = useState(emptyMovie);
  const [movies, setMovies] = useState([]);
  const [message, setMessage] = useState("");
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");

  useEffect(() => {
    fetchMovies();
  }, []);

  const setSession = (data) => {
    const { token: jwtToken, user: currentUser } = data;
    setToken(jwtToken);
    setUser(currentUser);
    localStorage.setItem("token", jwtToken);
    localStorage.setItem("user", JSON.stringify(currentUser));
  };

  const clearSession = () => {
    setToken("");
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  const fetchMovies = async () => {
    try {
      const response = await fetch(`${API_BASE}/movies`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Unable to load movies.");
      }
      setMovies(data);
    } catch (error) {
      setMessage(error.message);
    }
  };

  const handleAuth = async (type) => {
    setMessage("");
    const endpoint = type === "login" ? "login" : "register";
    const payload = {
      email: authForm.email,
      password: authForm.password,
      ...(type === "register" ? { name: authForm.name } : {}),
    };

    try {
      const response = await fetch(`${API_BASE}/auth/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Authentication failed.");
      }
      setSession(data);
      setAuthForm(emptyAuth);
      setView("movies");
      fetchMovies();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const handleAddMovie = async () => {
    setMessage("");
    try {
      const response = await fetch(`${API_BASE}/movies`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(movieForm),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Unable to add movie.");
      }
      setMovies((current) => [...current, data]);
      setMovieForm(emptyMovie);
      setMessage("Movie added successfully.");
    } catch (error) {
      setMessage(error.message);
    }
  };

  const logout = () => {
    clearSession();
    setView("login");
    setMessage("You have been logged out.");
  };

  return (
    <div className="app-shell">
      <header>
        <div>
          <h1>WhatToSee</h1>
          <p>Browse movies and save picks with a simple backend connection.</p>
        </div>
        <div className="header-actions">
          {user ? (
            <>
              <span>Welcome, {user.name}</span>
              <button onClick={logout}>Logout</button>
            </>
          ) : (
            <>
              <button onClick={() => setView("login")} className={view === "login" ? "active" : ""}>
                Login
              </button>
              <button onClick={() => setView("register")} className={view === "register" ? "active" : ""}>
                Register
              </button>
            </>
          )}
        </div>
      </header>

      <main>
        {message && <div className="message">{message}</div>}

        {!user && (
          <section className="card auth-card">
            <h2>{view === "login" ? "Login" : "Register"}</h2>
            {view === "register" && (
              <label>
                Name
                <input
                  value={authForm.name}
                  onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                  placeholder="Your name"
                />
              </label>
            )}
            <label>
              Email
              <input
                type="email"
                value={authForm.email}
                onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                placeholder="you@example.com"
              />
            </label>
            <label>
              Password
              <input
                type="password"
                value={authForm.password}
                onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                placeholder="Password"
              />
            </label>
            <button onClick={() => handleAuth(view)}>{view === "login" ? "Login" : "Register"}</button>
          </section>
        )}

        <section className="card movie-card">
          <div className="movie-card-header">
            <h2>Movie Recommendations</h2>
            <button onClick={fetchMovies}>Refresh</button>
          </div>
          <div className="movie-grid">
            {movies.map((movie) => (
              <article key={movie.id} className="movie-tile">
                <h3>{movie.title}</h3>
                <p>{movie.description}</p>
                <span>{movie.year}</span>
              </article>
            ))}
          </div>
        </section>

        {user && (
          <section className="card add-card">
            <h2>Add a Movie</h2>
            <label>
              Title
              <input
                value={movieForm.title}
                onChange={(e) => setMovieForm({ ...movieForm, title: e.target.value })}
                placeholder="Movie title"
              />
            </label>
            <label>
              Description
              <input
                value={movieForm.description}
                onChange={(e) => setMovieForm({ ...movieForm, description: e.target.value })}
                placeholder="Short description"
              />
            </label>
            <label>
              Year
              <input
                value={movieForm.year}
                onChange={(e) => setMovieForm({ ...movieForm, year: e.target.value })}
                placeholder="Release year"
              />
            </label>
            <button onClick={handleAddMovie}>Add Movie</button>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
