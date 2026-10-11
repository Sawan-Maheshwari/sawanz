
// =============================================
// SAWAN MAHESHWARI — MIDNIGHT AURORA PORTFOLIO
// Vanilla JavaScript
// =============================================

"use strict";

// ---------- 1. Select page elements ----------

const root = document.documentElement;

const themeToggle = document.getElementById("theme-toggle");
const themeIcon = themeToggle?.querySelector(".theme-icon");

const menuToggle = document.getElementById("menu-toggle");
const navLinks = document.getElementById("nav-links");
const navItems = document.querySelectorAll(".nav-link");

const backToTop = document.getElementById("back-to-top");
const copyrightYear = document.getElementById("copyright-year");

const sections = document.querySelectorAll("main section[id]");


// ---------- 2. Theme management ----------

const THEME_STORAGE_KEY = "portfolio-theme";

function getPreferredTheme() {
  // Prefer the theme explicitly saved by the visitor.
  try {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);

    if (savedTheme === "dark" || savedTheme === "light") {
      return savedTheme;
    }
  } catch (error) {
    // Storage may be unavailable in private or restricted contexts.
  }

  // Otherwise, follow the operating system preference.
  if (window.matchMedia("(prefers-color-scheme: light)").matches) {
    return "light";
  }

  return "dark";
}

function applyTheme(theme, savePreference = true) {
  const validTheme = theme === "light" ? "light" : "dark";

  root.dataset.theme = validTheme;

  if (themeIcon) {
    // A sun means the visitor can switch to light mode.
    // A moon means the visitor can switch to dark mode.
    themeIcon.textContent = validTheme === "dark" ? "☀" : "☾";
  }

  if (themeToggle) {
    const nextTheme = validTheme === "dark" ? "light" : "dark";

    themeToggle.setAttribute(
      "aria-label",
      `Switch to ${nextTheme} theme`
    );

    themeToggle.setAttribute(
      "title",
      `Switch to ${nextTheme} theme`
    );
  }

  if (savePreference) {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, validTheme);
    } catch (error) {
      // Theme switching still works if storage is unavailable.
    }
  }
}

// The HTML may already have applied a saved theme before rendering.
applyTheme(
  root.dataset.theme || getPreferredTheme(),
  false
);

themeToggle?.addEventListener("click", () => {
  const currentTheme = root.dataset.theme || "dark";

  const nextTheme = currentTheme === "dark" ? "light" : "dark";

  applyTheme(nextTheme);
});


// ---------- 3. Mobile navigation ----------

function closeMobileMenu() {
  if (!menuToggle || !navLinks) return;

  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Open navigation menu");

  navLinks.classList.remove("is-open");
}

function openMobileMenu() {
  if (!menuToggle || !navLinks) return;

  menuToggle.setAttribute("aria-expanded", "true");
  menuToggle.setAttribute("aria-label", "Close navigation menu");

  navLinks.classList.add("is-open");
}

menuToggle?.addEventListener("click", () => {
  const isOpen = menuToggle.getAttribute("aria-expanded") === "true";

  if (isOpen) {
    closeMobileMenu();
  } else {
    openMobileMenu();
  }
});

// Close the menu after selecting any navigation destination.
navItems.forEach((link) => {
  link.addEventListener("click", () => {
    closeMobileMenu();
  });
});

// Close the menu when clicking outside it.
document.addEventListener("click", (event) => {
  if (!menuToggle || !navLinks) return;

  const clickedInsideMenu = navLinks.contains(event.target);
  const clickedToggle = menuToggle.contains(event.target);

  if (!clickedInsideMenu && !clickedToggle) {
    closeMobileMenu();
  }
});

// Close the menu with Escape for keyboard accessibility.
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    const menuWasOpen =
      menuToggle?.getAttribute("aria-expanded") === "true";

    closeMobileMenu();

    if (menuWasOpen) {
      menuToggle?.focus();
    }
  }
});

// Reset the mobile menu when returning to desktop layout.
const desktopMediaQuery = window.matchMedia("(min-width: 761px)");

desktopMediaQuery.addEventListener("change", (event) => {
  if (event.matches) {
    closeMobileMenu();
  }
});


// ---------- 4. Active navigation highlighting ----------

// Highlight the navigation item matching the section in view.
function setActiveNavigation(sectionId) {
  navItems.forEach((link) => {
    const isActive = link.getAttribute("href") === `#${sectionId}`;

    if (isActive) {
      link.classList.add("active");
      link.setAttribute("aria-current", "location");
    } else {
      link.classList.remove("active");
      link.removeAttribute("aria-current");
    }
  });
}

if ("IntersectionObserver" in window) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      const visibleSections = entries
        .filter((entry) => entry.isIntersecting)
        .sort(
          (a, b) => b.intersectionRatio - a.intersectionRatio
        );

      if (visibleSections.length > 0) {
        setActiveNavigation(visibleSections[0].target.id);
      }
    },
    {
      root: null,
      rootMargin: "-18% 0px -58% 0px",
      threshold: [0, 0.1, 0.25, 0.5]
    }
  );

  sections.forEach((section) => {
    sectionObserver.observe(section);
  });
} else {
  // Fallback for older browsers.
  function updateActiveSection() {
    let currentSection = "home";

    sections.forEach((section) => {
      const sectionTop = section.getBoundingClientRect().top;

      if (sectionTop < window.innerHeight * 0.4) {
        currentSection = section.id;
      }
    });

    setActiveNavigation(currentSection);
  }

  window.addEventListener("scroll", updateActiveSection, {
    passive: true
  });
}


// ---------- 5. Scroll reveal animations ----------

const revealElements = document.querySelectorAll(".reveal");

const reduceMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

if ("IntersectionObserver" in window && !reduceMotion) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");

          // Stop observing after the animation runs once.
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: "0px 0px -35px 0px"
    }
  );

  revealElements.forEach((element) => {
    revealObserver.observe(element);
  });
} else {
  // Ensure content is visible when animations are unsupported
  // or the visitor requests reduced motion.
  revealElements.forEach((element) => {
    element.classList.add("is-visible");
  });
}


// ---------- 6. Back-to-top button ----------

function updateBackToTop() {
  if (!backToTop) return;

  const shouldShow = window.scrollY > 500;

  backToTop.classList.toggle("visible", shouldShow);

  backToTop.setAttribute(
    "tabindex",
    shouldShow ? "0" : "-1"
  );
}

window.addEventListener("scroll", updateBackToTop, {
  passive: true
});

updateBackToTop();

backToTop?.addEventListener("click", () => {
  const shouldReduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  window.scrollTo({
    top: 0,
    behavior: shouldReduceMotion ? "auto" : "smooth"
  });
});


// ---------- 7. Dynamic copyright year ----------

if (copyrightYear) {
  copyrightYear.textContent = new Date().getFullYear();
}


// ---------- 8. Optional polish ----------

// Ensure the initial home navigation state is correct.
if (window.location.hash === "" || window.location.hash === "#home") {
  setActiveNavigation("home");
}

// Keep internal links usable without a JavaScript dependency.
// Native anchor navigation remains available if an observer is unsupported.
