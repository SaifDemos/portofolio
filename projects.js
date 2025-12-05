const loadingOverlay = document.getElementById("loadingOverlay");
const loaderProgress = document.getElementById("loaderProgress");
const repoGrid = document.getElementById("repoGrid");
const languageFilter = document.getElementById("languageFilter");
const sortOrder = document.getElementById("sortOrder");
const searchInput = document.getElementById("searchInput");
const pulseSwitch = document.getElementById("pulseSwitch");
const matrixCanvas = document.getElementById("matrixCanvas");

let repos = [];

const initLoader = () => {
  let progress = 0;
  const timer = setInterval(() => {
    progress += Math.floor(Math.random() * 12) + 4;
    loaderProgress.textContent = `${Math.min(progress, 100)}%`;
    if (progress >= 100) {
      clearInterval(timer);
      setTimeout(() => loadingOverlay.classList.add("hidden"), 400);
    }
  }, 180);
};

const initMatrix = () => {
  if (!matrixCanvas) return;
  const ctx = matrixCanvas.getContext("2d");

  const resize = () => {
    matrixCanvas.width = window.innerWidth;
    matrixCanvas.height = window.innerHeight;
  };
  resize();
  window.addEventListener("resize", resize);

  const letters = "01<>[]{}?/#&";
  const fontSize = 14;
  const drops = new Array(Math.floor(matrixCanvas.width / fontSize)).fill(1);

  const draw = () => {
    ctx.fillStyle = "rgba(4, 6, 13, 0.09)";
    ctx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);
    ctx.fillStyle = "#8c6ef7";
    ctx.font = `${fontSize}px Share Tech Mono`;

    drops.forEach((drop, index) => {
      const text = letters.charAt(Math.floor(Math.random() * letters.length));
      ctx.fillText(text, index * fontSize, drop * fontSize);
      if (drop * fontSize > matrixCanvas.height && Math.random() > 0.95) {
        drops[index] = 0;
      }
      drops[index] += 1;
    });
  };

  setInterval(draw, 60);
};

const renderRepos = () => {
  const query = searchInput.value.toLowerCase();
  const language = languageFilter.value;
  const sort = sortOrder.value;

  let filtered = [...repos];

  if (language !== "all") {
    filtered = filtered.filter(
      (repo) => (repo.language ?? "multi-lang") === language
    );
  }

  if (query) {
    filtered = filtered.filter(
      (repo) =>
        repo.name.toLowerCase().includes(query) ||
        (repo.description ?? "").toLowerCase().includes(query)
    );
  }

  filtered.sort((a, b) => {
    if (sort === "stars") {
      return b.stargazers_count - a.stargazers_count;
    }
    return new Date(b.updated_at) - new Date(a.updated_at);
  });

  if (!filtered.length) {
    repoGrid.innerHTML = "<p class='muted'>No repositories matched.</p>";
    return;
  }

  repoGrid.innerHTML = filtered
    .map(
      (repo) => `
      <article class="repo-card">
        <header>
          <h3>${repo.name}</h3>
          <a class="pill pill-ghost" href="${repo.html_url}" target="_blank" rel="noreferrer">↗</a>
        </header>
        <p>${repo.description ?? "No description provided."}</p>
        <div class="repo-tags">
          <span>${repo.language ?? "multi-lang"}</span>
          <span>★ ${repo.stargazers_count}</span>
          <span>⟳ ${repo.updated_at.slice(0, 10)}</span>
        </div>
        <div class="repo-stats">
          <span>Issues: ${repo.open_issues}</span>
          <span>Forks: ${repo.forks_count}</span>
          <span>Watchers: ${repo.watchers_count}</span>
        </div>
      </article>
    `
    )
    .join("");
};

const populateLanguageFilter = () => {
  const languages = Array.from(
    new Set(repos.map((repo) => repo.language).filter(Boolean))
  ).sort();

  languageFilter.innerHTML =
    '<option value="all">All languages</option>' +
    languages.map((lang) => `<option value="${lang}">${lang}</option>`).join("");
};

const fetchRepos = async () => {
  try {
    const response = await fetch(
      "https://api.github.com/users/SaifDemos/repos?per_page=100"
    );
    if (!response.ok) throw new Error("GitHub API limit reached");
    repos = await response.json();
    populateLanguageFilter();
    renderRepos();
  } catch (error) {
    repoGrid.innerHTML = `<p class="muted">Unable to load repositories: ${error.message}</p>`;
  }
};

const initFilters = () => {
  [searchInput, languageFilter, sortOrder].forEach((element) =>
    element.addEventListener("input", renderRepos)
  );
};

const initPulse = () => {
  if (!pulseSwitch) return;
  pulseSwitch.addEventListener("click", () => {
    document.body.classList.toggle("pulse");
  });
};

const init = () => {
  initLoader();
  initMatrix();
  initFilters();
  initPulse();
  fetchRepos();
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

