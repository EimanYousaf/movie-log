// book log project

// get things from the html page
const movieForm = document.getElementById("movieForm");
const titleInput = document.getElementById("title");
const genreInput = document.getElementById("genre");
const authorInput = document.getElementById("author");
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


// starter books
let movies = [
  {
    id: crypto.randomUUID(),
    title: "The Hunger Games",
    genre: "Dystopian",
    author: "Suzanne Collins",
    year: 2008,
    status: "Completed",
    rating: 5,
    createdAt: Date.now() - 20000
  },
  {
    id: crypto.randomUUID(),
    title: "Twilight",
    genre: "Fantasy",
    author: "Stephenie Meyer",
    year: 2005,
    status: "To Read",
    rating: 0,
    createdAt: Date.now() - 10000
  }
];


// save books in local storage
function saveBooks() {
  localStorage.setItem("myBooks", JSON.stringify(movies));
}


// load books from local storage
function loadBooks() {
  let savedBooks = localStorage.getItem("myBooks");

  if (savedBooks) {
    movies = JSON.parse(savedBooks);
  }
}


// small popup message
function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");

  setTimeout(function () {
    toast.classList.remove("show");
  }, 1500);
}


// simple confetti animation when book is completed
function celebrate() {
  confetti.innerHTML = "";

  let pieces = 40;

  for (let i = 0; i < pieces; i++) {
    let piece = document.createElement("div");
    piece.className = "confettiPiece";

    piece.style.left = Math.random() * 100 + "vw";
    piece.style.top = "-10px";
    piece.style.background =
      "hsl(" + Math.floor(Math.random() * 360) + ",90%,60%)";

    let w = 6 + Math.random() * 10;
    let h = 8 + Math.random() * 14;

    piece.style.width = w + "px";
    piece.style.height = h + "px";

    confetti.appendChild(piece);

    setTimeout(function () {
      piece.remove();
    }, 1000);
  }
}


// update number of books
function updateCount(n) {
  if (n === 1) {
    countText.textContent = "1 book";
  } else {
    countText.textContent = n + " books";
  }
}


// makes text lowercase for searching
function normalize(text) {
  return text.toLowerCase().trim();
}


// filter and sort books
function getVisibleMovies() {
  let result = [...movies];

  // search by title or author
  let q = normalize(searchInput.value);

  if (q.length > 0) {
    result = result.filter(function (m) {
      return (
        normalize(m.title).includes(q) ||
        normalize(m.author).includes(q)
      );
    });
  }

  // filter by reading status
  let statusFilter = filterStatus.value;

  if (statusFilter !== "all") {
    result = result.filter(function (m) {
      return m.status === statusFilter;
    });
  }

  // sorting options
  let sort = sortBy.value;

  if (sort === "newest") {
    result.sort(function (a, b) {
      return b.createdAt - a.createdAt;
    });
  }

  if (sort === "titleAZ") {
    result.sort(function (a, b) {
      return a.title.localeCompare(b.title);
    });
  }

  if (sort === "yearDesc") {
    result.sort(function (a, b) {
      return b.year - a.year;
    });
  }

  if (sort === "ratingDesc") {
    result.sort(function (a, b) {
      return (b.rating || 0) - (a.rating || 0);
    });
  }

  return result;
}


// draw books on screen
function render() {
  let visible = getVisibleMovies();

  movieList.innerHTML = "";

  if (visible.length === 0) {
    emptyState.style.display = "block";
  } else {
    emptyState.style.display = "none";
  }

  updateCount(visible.length);

  // create a card for each book
  for (let movie of visible) {
    let card = document.createElement("div");
    card.className = "movieCard";

    // left side with title and info
    let left = document.createElement("div");

    let titleLine = document.createElement("div");
    titleLine.className = "titleLine";
    titleLine.textContent = movie.title;

    let smallLine = document.createElement("div");
    smallLine.className = "smallLine";
    smallLine.textContent = "Author: " + movie.author + " | Year: " + movie.year;

    left.appendChild(titleLine);
    left.appendChild(smallLine);

    // genre tag
    let genreTag = document.createElement("div");
    genreTag.className = "tag";
    genreTag.textContent = movie.genre;

    // dropdown to change reading status
    let statusSelect = document.createElement("select");

    statusSelect.innerHTML = `
      <option value="To Read">To Read</option>
      <option value="Reading">Reading</option>
      <option value="Completed">Completed</option>
    `;

    statusSelect.value = movie.status;

    statusSelect.addEventListener("change", function () {
      let oldStatus = movie.status;
      movie.status = statusSelect.value;

      // celebrate when a book becomes completed
      if (oldStatus !== "Completed" && movie.status === "Completed") {
        showToast("book completed");
        celebrate();
      }

      // remove rating if book is not completed anymore
      if (movie.status !== "Completed") {
        movie.rating = 0;
      }

      saveBooks();
      render();
    });

    // star rating
    let starsWrap = document.createElement("div");
    starsWrap.className = "stars";

    let isCompleted = movie.status === "Completed";

    for (let s = 1; s <= 5; s++) {
      let btn = document.createElement("button");

      btn.type = "button";
      btn.className = "starBtn";

      if (s <= (movie.rating || 0)) {
        btn.textContent = "★";
      } else {
        btn.textContent = "☆";
      }

      if (!isCompleted) {
        btn.classList.add("disabled");
        btn.disabled = true;
      } else {
        btn.addEventListener("click", function () {
          movie.rating = s;
          showToast("rated " + s + " stars");
          saveBooks();
          render();
        });
      }

      starsWrap.appendChild(btn);
    }

    // delete button
    let del = document.createElement("button");

    del.className = "deleteBtn";
    del.type = "button";
    del.textContent = "Delete";

    del.addEventListener("click", function () {
      let ok = confirm('Delete "' + movie.title + '"?');

      if (!ok) return;

      movies = movies.filter(function (m) {
        return m.id !== movie.id;
      });

      showToast("deleted");
      saveBooks();
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


// when user adds a book
movieForm.addEventListener("submit", function (e) {
  e.preventDefault();

  let title = titleInput.value.trim();
  let genre = genreInput.value.trim();
  let author = authorInput.value.trim();
  let year = Number(yearInput.value);
  let status = statusInput.value;

  // simple form check
  if (!title || !genre || !author || !year) {
    formMsg.textContent = "please fill all fields";
    return;
  }

  if (year < 1450 || year > 2100) {
    formMsg.textContent = "year must be valid";
    return;
  }

  let movie = {
    id: crypto.randomUUID(),
    title: title,
    genre: genre,
    author: author,
    year: year,
    status: status,
    rating: 0,
    createdAt: Date.now()
  };

  movies.unshift(movie);
  saveBooks();

  // clear form
  titleInput.value = "";
  genreInput.value = "";
  authorInput.value = "";
  yearInput.value = "";
  statusInput.value = "To Read";

  formMsg.textContent = "book added";

  setTimeout(function () {
    formMsg.textContent = "";
  }, 1200);

  // celebrate if added as completed
  if (movie.status === "Completed") {
    showToast("book completed");
    celebrate();
  }

  render();
});


// update list when controls change
searchInput.addEventListener("input", render);
filterStatus.addEventListener("change", render);
sortBy.addEventListener("change", render);


// load saved books first
loadBooks();

// first time showing books
render();
