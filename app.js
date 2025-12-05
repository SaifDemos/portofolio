const loadingOverlay = document.getElementById("loadingOverlay");
const loaderProgress = document.getElementById("loaderProgress");
const loaderLog = document.getElementById("loaderLog");
const loaderStatus = document.getElementById("loaderStatus");
const terminalFeed = document.getElementById("terminalFeed");
const skillDetail = document.getElementById("skillDetail");
const skillsGrid = document.getElementById("skillsGrid");
const projectGrid = document.getElementById("projectGrid");
const navToggle = document.getElementById("navToggle");
const siteNav = document.getElementById("siteNav");
const pulseSwitch = document.getElementById("pulseSwitch");
const matrixCanvas = document.getElementById("matrixCanvas");

const terminalLines = [
  "boot sequence > secure_labs.sh",
  "loading modules [javafx, cpp, asm, js]",
  "establishing encrypted link...",
  "deploying xbox360_protocol_mapper",
  "self-hosted stack: jellyfin + n8n + monitoring",
  "status >> green · awaiting next mission",
];

const loaderScriptLines = [
  "[ INIT ] mounting /dev/xbox360-wireless",
  "[ INFO ] loading reverse_engineering toolchain",
  "[ INFO ] linking ESP32 controller interface",
  "[ INFO ] scanning self-hosted services (n8n, jellyfin, lab)",
  "[ WARN ] external telemetry: disabled",
  "[ OK ]  local lab integrity verified",
  "[ EXEC ] starting SaifDemos interactive shell",
  "[ GRANT ] access level: root",
];

const pushLoaderLine = (text) => {
  if (!loaderLog) return;
  const line = document.createElement("div");
  line.className = "loader-log-line";
  line.textContent = `> ${text}`;
  loaderLog.appendChild(line);
  if (loaderLog.childElementCount > 6) {
    loaderLog.removeChild(loaderLog.firstElementChild);
  }
};

const fetchProjects = async () => {
  try {
    const response = await fetch(
      "https://api.github.com/users/SaifDemos/repos?sort=updated"
    );
    if (!response.ok) throw new Error("GitHub rate limit reached");
    const repos = await response.json();
    const curated = repos
      .filter((repo) => !repo.fork)
      .sort((a, b) => b.stargazers_count - a.stargazers_count)
      .slice(0, 4);

    if (!curated.length) {
      projectGrid.innerHTML =
        "<p class='muted'>No repositories to display (yet!).</p>";
      return;
    }

    projectGrid.innerHTML = curated
      .map(
        (repo) => `
        <article class="project-card">
          <h3>${repo.name}</h3>
          <p>${repo.description ?? "No description provided."}</p>
          <div class="project-meta">
            <span>${repo.language ?? "multi-lang"}</span>
            <span>★ ${repo.stargazers_count}</span>
          </div>
          <a class="pill pill-ghost" href="${repo.html_url}" target="_blank" rel="noreferrer">
            View Repo ↗
          </a>
        </article>
      `
      )
      .join("");
  } catch (error) {
    projectGrid.innerHTML = `<p class="muted">Unable to pull GitHub data: ${error.message}</p>`;
  }
};

let terminalBooted = false;
const triggerBootTerminal = () => {
  if (terminalBooted) return;
  terminalBooted = true;
  bootTerminal();
};

const bootTerminal = () => {
  let index = 0;
  const interval = setInterval(() => {
    if (!terminalFeed) {
      clearInterval(interval);
      return;
    }
    terminalFeed.innerHTML = `${terminalFeed.innerHTML}
      <div>> ${terminalLines[index]}</div>`;
    terminalFeed.scrollTop = terminalFeed.scrollHeight;
    index += 1;
    if (index === terminalLines.length) clearInterval(interval);
  }, 800);
};

const hideLoader = () => {
  if (!loadingOverlay) return;
  loadingOverlay.classList.add("hidden");
};

const initLoader = () => {
  if (!loadingOverlay || !loaderProgress) {
    triggerBootTerminal();
    return;
  }

  let progress = 0;
  let scriptIndex = 0;

  const timer = setInterval(() => {
    progress += Math.floor(Math.random() * 15) + 5;
    loaderProgress.textContent = `${Math.min(progress, 100)}%`;

    if (scriptIndex < loaderScriptLines.length) {
      pushLoaderLine(loaderScriptLines[scriptIndex]);
      scriptIndex += 1;
      if (loaderStatus) {
        loaderStatus.textContent = loaderScriptLines[scriptIndex - 1];
      }
    }

    if (progress >= 100) {
      clearInterval(timer);
      setTimeout(() => {
        hideLoader();
        triggerBootTerminal();
      }, 350);
    }
  }, 200);

  setTimeout(() => {
    if (loadingOverlay.classList.contains("hidden")) return;
    clearInterval(timer);
    loaderProgress.textContent = "100%";
    hideLoader();
    if (loaderStatus) {
      loaderStatus.textContent = "[ COMPLETE ] access granted · loading UI";
    }
    triggerBootTerminal();
  }, 7000);
};

const initSkillsHover = () => {
  if (!skillsGrid || !skillDetail) return;
  skillsGrid.addEventListener("mouseover", (event) => {
    const chip = event.target.closest(".skill-chip");
    if (!chip) return;
    skillDetail.textContent = chip.dataset.detail;
  });
  skillsGrid.addEventListener("mouseleave", () => {
    skillDetail.textContent = "Hover to inspect module output.";
  });
};

const initNavToggle = () => {
  if (!navToggle || !siteNav) return;
  navToggle.addEventListener("click", () => {
    siteNav.classList.toggle("open");
  });
};

const initPulse = () => {
  if (!pulseSwitch) return;
  pulseSwitch.addEventListener("click", () => {
    document.body.classList.toggle("pulse");
  });
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

  const letters = "01ABCDEFGHIJKLMNOPQRSTUVWXYZ{}[]<>/-=+";
  const fontSize = 16;
  const columns = () => Math.floor(matrixCanvas.width / fontSize);
  const drops = new Array(columns()).fill(1);

  const draw = () => {
    ctx.fillStyle = "rgba(4, 6, 13, 0.08)";
    ctx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);

    ctx.fillStyle = "#58ffda";
    ctx.font = `${fontSize}px ${"Share Tech Mono"}`;

    for (let i = 0; i < drops.length; i += 1) {
      const text = letters.charAt(Math.floor(Math.random() * letters.length));
      ctx.fillText(text, i * fontSize, drops[i] * fontSize);
      if (drops[i] * fontSize > matrixCanvas.height && Math.random() > 0.95)
        drops[i] = 0;
      drops[i] += 1;
    }
  };

  setInterval(draw, 50);
};

const init = () => {
  initLoader();
  initSkillsHover();
  initNavToggle();
  initPulse();
  initMatrix();
  fetchProjects();
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

