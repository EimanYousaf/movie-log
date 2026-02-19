// Movie Log (beginner-friendly)

// DOM elements
const movieForm = document.getElementById("movieForm");
const titleInput = document.getElementById("title");
const genreInput = document.getElementById("genre");
const yearInput = document.getElementById("year");
const statusInput = document.getElementById("status");

const movieList = document.getElementById("movieList");
const emptyState = document.getElementById("emptyState");
const countText = document.getElementById("countText");

const formMsg = document.getElementById("formMsg");
const searchInput = document.getElementById("searchInput");
const filterStatus = document.getElementById("filterStatus");
const sortBy = document.getElementById("sortBy");

const toast = document.getElementById("toast");
const confetti = document.getElementById("confetti");

// Data (stored in memory; optional: you can add localStorage later)
let movies = [
  // starter example (you can delete this)
  { id: crypto.randomUUID(), title: "Spider-Man: Into the Spider-Verse", genre: "Animation", year: 2018, status: "Watched", rating: 5, createdAt: Date.now() - 20000 },
  { id: crypto.randomUUID(), title: "Inception", genre: "Sci-Fi", year: 2010, status: "To Watch", rating: 0, createdAt: Date.now() - 10000 }
];

// Helpers
function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 1500);
}

function celebrate() {
  // simple confetti burst (no library)
  confetti.innerHTML = "";
  const pieces = 40;

  for (let i = 0; i < pieces; i++) {
    const piece = document.createElement("div");
    piece.className = "confettiPiece";

    // random position + random color
    piece.style.left = Math.random() * 100 + "vw";
    piece.style.top = "-10px";
    piece.style.background = `hsl(${Math.floor(Math.random() * 360)}, 90%, 60%)`;

    // random size variation
    const w = 6 + Math.random() * 10;
    const h = 8 + Math.random() * 14;
    piece.style.width = w + "px";
    piece.style.height = h + "px";

    confetti.appendChild(piece);

    // cleanup
    setTimeout(() => piece.remove(), 1000);
  }
}

function updateCount(n) {
  countText.textContent = n === 1 ? "1 movie" : `${n} movies`;
}

function normalize(text) {
  return text.toLowerCase().trim();
}

// Filtering + sorting
function getVisibleMovies() {
  let result = [...movies];

  // search by title
  const q = normalize(searchInput.value);
  if (q.length > 0) {
    result = result.filter(m => normalize(m.title).includes(q));
  }

  // filter by status
  const statusFilter = filterStatus.value;
  if (statusFilter !== "all") {
    result = result.filter(m => m.status === statusFilter);
  }

  // sort
  const sort = sortBy.value;
  if (sort === "newest") {
    result.sort((a, b) => b.createdAt - a.createdAt);
  } else if (sort === "titleAZ") {
    result.sort((a, b) => a.title.localeCompare(b.title));
  } else if (sort === "yearDesc") {
    result.sort((a, b) => b.year - a.year);
  } else if (sort === "ratingDesc") {
    result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  }

  return result;
}

function render() {
  const visible = getVisibleMovies();

  movieList.innerHTML = "";

  if (visible.length === 0) {
    emptyState.style.display = "block";
  } else {
    emptyState.style.display = "none";
  }

  updateCount(visible.length);

  for (const movie of visible) {
    const card = document.createElement("div");
    card.className = "movieCard";

    // left: title + year
    const left = document.createElement("div");
    const titleLine = document.createElement("div");
    titleLine.className = "titleLine";
    titleLine.textContent = movie.title;

    const smallLine = document.createElement("div");
    smallLine.className = "smallLine";
    smallLine.textContent = `Year: ${movie.year}`;

    left.appendChild(titleLine);
    left.appendChild(smallLine);

    // genre tag
    const genreTag = document.createElement("div");
    genreTag.className = "tag";
    genreTag.textContent = movie.genre;

    // status dropdown
    const statusSelect = document.createElement("select");
    statusSelect.innerHTML = `
      <option value="To Watch">To Watch</option>
      <option value="Watching">Watching</option>
      <option value="Watched">Watched</option>
    `;
    statusSelect.value = movie.status;

    statusSelect.addEventListener("change", () => {
      const oldStatus = movie.status;
      movie.status = statusSelect.value;

      // if moved to Watched, celebrate
      if (oldStatus !== "Watched" && movie.status === "Watched") {
        showToast("🎉 Marked as Watched!");
        celebrate();
      }
      // if moved away from Watched, reset rating (optional, but clearer)
      if (movie.status !== "Watched") {
        movie.rating = 0;
      }

      render();
    });

    // rating stars (only for Watched)
    const starsWrap = document.createElement("div");
    starsWrap.className = "stars";

    const isWatched = movie.status === "Watched";

    for (let s = 1; s <= 5; s++) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "starBtn";
      btn.textContent = s <= (movie.rating || 0) ? "⭐" : "☆";

      if (!isWatched) {
        btn.classList.add("disabled");
        btn.disabled = true;
      } else {
        btn.addEventListener("click", () => {
          movie.rating = s;
          showToast(`Rated ${s}/5 ⭐`);
          render();
        });
      }

      starsWrap.appendChild(btn);
    }

    // delete
    const del = document.createElement("button");
    del.className = "deleteBtn";
    del.type = "button";
    del.textContent = "Delete";
    del.addEventListener("click", () => {
      const ok = confirm(`Delete "${movie.title}"?`);
      if (!ok) return;

      movies = movies.filter(m => m.id !== movie.id);
      showToast("Deleted.");
      render();
    });

    card.appendChild(left);
    card.appendChild(genreTag);
    card.appendChild(statusSelect);
    card.appendChild(starsWrap);
    card.appendChild(del);

    movieList.appendChild(card);
  }
}

// Add movie
movieForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const title = titleInput.value.trim();
  const genre = genreInput.value.trim();
  const year = Number(yearInput.value);
  const status = statusInput.value;

  // simple validation
  if (!title || !genre || !year) {
    formMsg.textContent = "Please fill in title, genre, and year.";
    return;
  }
  if (year < 1888 || year > 2100) {
    formMsg.textContent = "Year must be between 1888 and 2100.";
    return;
  }

  const movie = {
    id: crypto.randomUUID(),
    title,
    genre,
    year,
    status,
    rating: status === "Watched" ? 0 : 0,
    createdAt: Date.now()
  };

  movies.unshift(movie);

  // clear form
  titleInput.value = "";
  genreInput.value = "";
  yearInput.value = "";
  statusInput.value = "To Watch";

  formMsg.textContent = "✅ Movie added!";
  setTimeout(() => (formMsg.textContent = ""), 1200);

  // celebrate if added directly as Watched
  if (movie.status === "Watched") {
    showToast("🎉 Added as Watched!");
    celebrate();
  }

  render();
});

// Re-render when controls change
searchInput.addEventListener("input", render);
filterStatus.addEventListener("change", render);
sortBy.addEventListener("change", render);

// First render
render();
