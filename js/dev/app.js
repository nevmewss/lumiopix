(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) return;
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) processPreload(link);
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") continue;
      for (const node of mutation.addedNodes) if (node.tagName === "LINK" && node.rel === "modulepreload") processPreload(node);
    }
  }).observe(document, {
    childList: true,
    subtree: true
  });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity) fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials") fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
    else fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep) return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
let slideUp = (target, duration = 500, showmore = 0) => {
  if (!target.classList.contains("--slide")) {
    target.classList.add("--slide");
    target.style.transitionProperty = "height, margin, padding";
    target.style.transitionDuration = duration + "ms";
    target.style.height = `${target.offsetHeight}px`;
    target.offsetHeight;
    target.style.overflow = "hidden";
    target.style.height = showmore ? `${showmore}px` : `0px`;
    target.style.paddingTop = 0;
    target.style.paddingBottom = 0;
    target.style.marginTop = 0;
    target.style.marginBottom = 0;
    window.setTimeout(() => {
      target.hidden = !showmore ? true : false;
      !showmore ? target.style.removeProperty("height") : null;
      target.style.removeProperty("padding-top");
      target.style.removeProperty("padding-bottom");
      target.style.removeProperty("margin-top");
      target.style.removeProperty("margin-bottom");
      !showmore ? target.style.removeProperty("overflow") : null;
      target.style.removeProperty("transition-duration");
      target.style.removeProperty("transition-property");
      target.classList.remove("--slide");
      document.dispatchEvent(new CustomEvent("slideUpDone", {
        detail: {
          target
        }
      }));
    }, duration);
  }
};
let slideDown = (target, duration = 500, showmore = 0) => {
  if (!target.classList.contains("--slide")) {
    target.classList.add("--slide");
    target.hidden = target.hidden ? false : null;
    showmore ? target.style.removeProperty("height") : null;
    let height = target.offsetHeight;
    target.style.overflow = "hidden";
    target.style.height = showmore ? `${showmore}px` : `0px`;
    target.style.paddingTop = 0;
    target.style.paddingBottom = 0;
    target.style.marginTop = 0;
    target.style.marginBottom = 0;
    target.offsetHeight;
    target.style.transitionProperty = "height, margin, padding";
    target.style.transitionDuration = duration + "ms";
    target.style.height = height + "px";
    target.style.removeProperty("padding-top");
    target.style.removeProperty("padding-bottom");
    target.style.removeProperty("margin-top");
    target.style.removeProperty("margin-bottom");
    window.setTimeout(() => {
      target.style.removeProperty("height");
      target.style.removeProperty("overflow");
      target.style.removeProperty("transition-duration");
      target.style.removeProperty("transition-property");
      target.classList.remove("--slide");
      document.dispatchEvent(new CustomEvent("slideDownDone", {
        detail: {
          target
        }
      }));
    }, duration);
  }
};
let slideToggle = (target, duration = 500) => {
  if (target.hidden) {
    return slideDown(target, duration);
  } else {
    return slideUp(target, duration);
  }
};
let bodyLockStatus = true;
let bodyLockToggle = (delay = 500) => {
  if (document.documentElement.hasAttribute("data-fls-scrolllock")) {
    bodyUnlock(delay);
  } else {
    bodyLock(delay);
  }
};
let bodyUnlock = (delay = 500) => {
  if (bodyLockStatus) {
    const lockPaddingElements = document.querySelectorAll("[data-fls-lp]");
    setTimeout(() => {
      lockPaddingElements.forEach((lockPaddingElement) => {
        lockPaddingElement.style.paddingRight = "";
      });
      document.body.style.paddingRight = "";
      document.documentElement.removeAttribute("data-fls-scrolllock");
    }, delay);
    bodyLockStatus = false;
    setTimeout(function() {
      bodyLockStatus = true;
    }, delay);
  }
};
let bodyLock = (delay = 500) => {
  if (bodyLockStatus) {
    const lockPaddingElements = document.querySelectorAll("[data-fls-lp]");
    const lockPaddingValue = window.innerWidth - document.body.offsetWidth + "px";
    lockPaddingElements.forEach((lockPaddingElement) => {
      lockPaddingElement.style.paddingRight = lockPaddingValue;
    });
    document.body.style.paddingRight = lockPaddingValue;
    document.documentElement.setAttribute("data-fls-scrolllock", "");
    bodyLockStatus = false;
    setTimeout(function() {
      bodyLockStatus = true;
    }, delay);
  }
};
function dataMediaQueries(array, dataSetValue) {
  const media = Array.from(array).filter((item) => item.dataset[dataSetValue]).map((item) => {
    const [value, type = "max"] = item.dataset[dataSetValue].split(",");
    return { value, type, item };
  });
  if (media.length === 0) return [];
  const breakpointsArray = media.map(({ value, type }) => `(${type}-width: ${value}px),${value},${type}`);
  const uniqueQueries = [...new Set(breakpointsArray)];
  return uniqueQueries.map((query) => {
    const [mediaQuery, mediaBreakpoint, mediaType] = query.split(",");
    const matchMedia = window.matchMedia(mediaQuery);
    const itemsArray = media.filter((item) => item.value === mediaBreakpoint && item.type === mediaType);
    return { itemsArray, matchMedia };
  });
}
function menuInit() {
  document.addEventListener("click", function(e) {
    if (bodyLockStatus && e.target.closest("[data-fls-menu]")) {
      bodyLockToggle();
      document.documentElement.toggleAttribute("data-fls-menu-open");
    }
  });
}
document.querySelector("[data-fls-menu]") ? window.addEventListener("load", menuInit) : null;
document.addEventListener("DOMContentLoaded", () => {
  const button2 = document.querySelector(".benefits__button.fixed-button");
  const footer = document.querySelector("footer");
  function checkButtonVisibility() {
    const scrollY = window.scrollY || window.pageYOffset;
    const windowHeight = window.innerHeight;
    const scrolledEnough = scrollY > 300;
    const footerRect = footer.getBoundingClientRect();
    const buttonHeight = button2.offsetHeight;
    const buttonBottomPosition = windowHeight - 20;
    const footerOverlappingButton = footerRect.top < buttonBottomPosition + buttonHeight;
    if (scrolledEnough && !footerOverlappingButton) {
      button2.classList.add("visible");
    } else {
      button2.classList.remove("visible");
    }
  }
  window.addEventListener("scroll", checkButtonVisibility);
  window.addEventListener("resize", checkButtonVisibility);
  checkButtonVisibility();
});
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.querySelector(".text__more");
  const text = document.querySelector(".text__fish");
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    const isExpanded = text.classList.toggle("expanded");
    btn.classList.toggle("expanded");
    btn.childNodes[0].nodeValue = isExpanded ? "Hide" : "Learn more";
  });
});
document.addEventListener("DOMContentLoaded", () => {
  const itemsPerPage = 5;
  const blogItems = Array.from(document.querySelectorAll(".blog__item"));
  const paginationContainer = document.querySelector(".blog__pagination");
  const totalPages = Math.ceil(blogItems.length / itemsPerPage);
  let currentPage = 1;
  function renderPagination() {
    paginationContainer.innerHTML = "";
    const createPagItem = (text, page, active = false, disabled = false) => {
      const el = document.createElement("div");
      el.className = "blog__pag";
      if (active) el.classList.add("pag-act");
      if (disabled) el.classList.add("disabled");
      el.textContent = text;
      if (!disabled && !active && text !== "...") {
        el.addEventListener("click", () => {
          currentPage = page;
          renderPagination();
          showPage();
        });
      }
      paginationContainer.appendChild(el);
    };
    createPagItem("‹", currentPage - 1, false, currentPage === 1);
    const delta = 2;
    const range = [];
    const rangeWithDots = [];
    let last;
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || i >= currentPage - delta && i <= currentPage + delta) {
        range.push(i);
      }
    }
    for (let i of range) {
      if (last) {
        if (i - last === 2) {
          rangeWithDots.push(last + 1);
        } else if (i - last > 1) {
          rangeWithDots.push("...");
        }
      }
      rangeWithDots.push(i);
      last = i;
    }
    rangeWithDots.forEach((num) => {
      if (num === "...") {
        createPagItem("...", null, false, true);
      } else {
        createPagItem(num, num, num === currentPage);
      }
    });
    createPagItem("›", currentPage + 1, false, currentPage === totalPages);
  }
  function showPage() {
    blogItems.forEach((item, i) => {
      item.style.display = "none";
    });
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    blogItems.slice(start, end).forEach((item) => {
      item.style.display = "";
    });
  }
  renderPagination();
  showPage();
});
document.addEventListener("DOMContentLoaded", () => {
  const input = document.querySelector(".comments__input");
  const button2 = document.querySelector(".comments__button");
  input.addEventListener("input", () => {
    const hasText = input.value.trim().length > 0;
    button2.disabled = !hasText;
  });
});
document.addEventListener("DOMContentLoaded", () => {
  const copyButtons = document.querySelectorAll(".discount__copy");
  copyButtons.forEach((button2) => {
    button2.addEventListener("click", () => {
      const codeElement = button2.parentElement;
      const codeText = codeElement.childNodes[0].textContent.trim();
      navigator.clipboard.writeText(codeText).then(() => {
        button2.classList.add("copied");
        setTimeout(() => button2.classList.remove("copied"), 1500);
      }).catch((err) => {
        console.error("Не удалось скопировать:", err);
      });
    });
  });
});
const form = document.getElementById("contactForm");
const button = form.querySelector('button[type="submit"]');
const inputs = form.querySelectorAll("input[required]");
function checkValidity() {
  const allValid = Array.from(inputs).every((input) => input.checkValidity());
  button.disabled = !allValid;
}
inputs.forEach((input) => {
  input.addEventListener("input", checkValidity);
});
checkValidity();
export {
  slideUp as a,
  slideDown as b,
  dataMediaQueries as d,
  slideToggle as s
};
