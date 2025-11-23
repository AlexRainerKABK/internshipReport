const spine = document.querySelector(".spine");
const originalImages = Array.from(
  document.querySelectorAll(".spine-contentImg")
);
const textSection = document.querySelector(".spine-text");

const cloneCount = 10;
for (let i = 0; i < cloneCount; i++) {
  originalImages.forEach((img) => {
    const clone = img.cloneNode(true);
    spine.appendChild(clone);
  });
}

const images = document.querySelectorAll(".spine-contentImg");
const imageHeight = window.innerHeight;
const loopLength = originalImages.length * imageHeight;
let isLooping = false;

function updateImageScales() {
  const viewportHeight = window.innerHeight;

  images.forEach((img, index) => {
    const rect = img.getBoundingClientRect();
    let topScale = 1;
    let bottomScale = 1;

    if (index < images.length - 1) {
      const nextImg = images[index + 1];
      const nextRect = nextImg.getBoundingClientRect();

      if (nextRect.top < viewportHeight) {
        const pushDistance = viewportHeight - nextRect.top;
        const squeezeRatio = Math.min(1, pushDistance / viewportHeight);
        topScale = Math.max(0.01, 1 - squeezeRatio);
      }
    }

    if (index > 0) {
      const prevImg = images[index - 1];
      const prevRect = prevImg.getBoundingClientRect();

      if (prevRect.bottom > 0 && prevRect.top < 0) {
        const pushDistance = Math.abs(prevRect.top);
        const squeezeRatio = Math.min(1, pushDistance / viewportHeight);
        bottomScale = Math.max(0.01, 1 - squeezeRatio);
      }
    }

    const finalScale = Math.min(topScale, bottomScale);

    if (bottomScale < topScale) {
      img.style.transformOrigin = "bottom";
    } else {
      img.style.transformOrigin = "top";
    }

    img.style.transform = `scaleY(${finalScale})`;
  });
}

function handleInfiniteScroll() {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;

  if (scrollTop >= maxScroll - imageHeight && !isLooping) {
    isLooping = true;
    window.scrollTo(0, scrollTop - loopLength);
    setTimeout(() => {
      isLooping = false;
    }, 50);
  } else if (scrollTop <= imageHeight && !isLooping && scrollTop > 0) {
    isLooping = true;
    window.scrollTo(0, scrollTop + loopLength);
    setTimeout(() => {
      isLooping = false;
    }, 50);
  }
}

let ticking = false;
window.addEventListener("scroll", () => {
  if (!ticking) {
    window.requestAnimationFrame(() => {
      updateImageScales();
      handleInfiniteScroll();
      ticking = false;
    });
    ticking = true;
  }
});

updateImageScales();

const buttons = document.querySelectorAll(".text-btn");
const paragraphs = document.querySelectorAll(".content-paragraph");

buttons.forEach((button) => {
  button.addEventListener("click", () => {
    const target = button.getAttribute("data-target");
    const targetParagraph = document.getElementById(target);

    buttons.forEach((btn) => btn.classList.remove("active"));

    if (targetParagraph.style.display === "block") {
      targetParagraph.style.display = "none";
      button.classList.remove("active");

      images.forEach((img) => img.classList.remove("dimmed"));
    } else {
      paragraphs.forEach((p) => (p.style.display = "none"));
      targetParagraph.style.display = "block";
      button.classList.add("active");

      images.forEach((img) => img.classList.add("dimmed"));
    }
  });
});

function isMobile() {
  return window.innerWidth <= 768;
}

function isSafari() {
  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
}

if (isMobile() && isSafari()) {
  let lastUpdate = 0;
  const throttleDelay = 32;

  window.addEventListener(
    "scroll",
    () => {
      const now = Date.now();
      if (now - lastUpdate > throttleDelay) {
        lastUpdate = now;
        if (!ticking) {
          window.requestAnimationFrame(() => {
            updateImageScales();
            handleInfiniteScroll();
            ticking = false;
          });
          ticking = true;
        }
      }
    },
    { passive: true }
  );
} else if (isMobile()) {
  if ("IntersectionObserver" in window) {
    const observerOptions = {
      root: null,
      rootMargin: "100% 0px 100% 0px",
      threshold: 0,
    };

    const observer = new IntersectionObserver((entries) => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updateImageScales();
          handleInfiniteScroll();
          ticking = false;
        });
        ticking = true;
      }
    }, observerOptions);

    images.forEach((img) => observer.observe(img));
  }
}
