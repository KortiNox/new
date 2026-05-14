(function () {
  "use strict";

  const DESKTOP_MQ = window.matchMedia("(min-width: 768px)");

  /* ---------- Slider ---------- */

  function initSlider(root) {
    const track = root.querySelector("[data-slider-track]");
    const btnPrev = root.querySelector("[data-slider-prev]");
    const btnNext = root.querySelector("[data-slider-next]");
    const dotsWrap = root.querySelector("[data-slider-dots]");
    const slides = track ? Array.from(track.children) : [];
    const total = slides.length;
    if (!track || total === 0 || !btnPrev || !btnNext || !dotsWrap) return;

    let index = 0;
    let touchStartX = null;

    function isDesktop() {
      return DESKTOP_MQ.matches;
    }

    function maxIndex() {
      return isDesktop() ? Math.max(0, total - 3) : total - 1;
    }

    function clamp(i) {
      const max = maxIndex();
      if (i < 0) return 0;
      if (i > max) return max;
      return i;
    }

    function buildDots() {
      dotsWrap.innerHTML = "";
      for (let i = 0; i < total; i++) {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "slider__dot";
        b.setAttribute("role", "tab");
        b.setAttribute("aria-label", "Слайд " + (i + 1));
        b.addEventListener("click", function () {
          if (isDesktop() && i > maxIndex()) return;
          index = clamp(i);
          update();
        });
        dotsWrap.appendChild(b);
      }
    }

    function stepPx() {
      const first = slides[0];
      if (!first) return 0;
      const gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap) || 16;
      return first.getBoundingClientRect().width + gap;
    }

    function update() {
      index = clamp(index);
      const step = stepPx();
      track.style.transform = "translate3d(" + -index * step + "px,0,0)";

      const dots = dotsWrap.querySelectorAll(".slider__dot");
      const max = maxIndex();
      dots.forEach(function (dot, i) {
        const active = i === index;
        dot.setAttribute("aria-selected", active ? "true" : "false");
        if (isDesktop() && i > max) {
          dot.disabled = true;
          dot.setAttribute("aria-disabled", "true");
        } else {
          dot.disabled = false;
          dot.removeAttribute("aria-disabled");
        }
      });

      btnPrev.disabled = index <= 0;
      btnNext.disabled = index >= max;
    }

    btnPrev.addEventListener("click", function () {
      index = clamp(index - 1);
      update();
    });

    btnNext.addEventListener("click", function () {
      index = clamp(index + 1);
      update();
    });

    track.addEventListener(
      "touchstart",
      function (e) {
        if (e.touches.length !== 1) return;
        touchStartX = e.touches[0].clientX;
      },
      { passive: true }
    );

    track.addEventListener(
      "touchend",
      function (e) {
        if (touchStartX == null || e.changedTouches.length !== 1) return;
        const dx = e.changedTouches[0].clientX - touchStartX;
        touchStartX = null;
        const threshold = 40;
        if (dx > threshold) {
          index = clamp(index - 1);
          update();
        } else if (dx < -threshold) {
          index = clamp(index + 1);
          update();
        }
      },
      { passive: true }
    );

    buildDots();

    let resizeTimer;
    window.addEventListener("resize", function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        index = clamp(index);
        update();
      }, 80);
    });

    DESKTOP_MQ.addEventListener("change", function () {
      index = clamp(index);
      update();
    });

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(update);
    }
    requestAnimationFrame(update);
  }

  const sliderRoot = document.querySelector("[data-slider]");
  if (sliderRoot) initSlider(sliderRoot);

  /* ---------- Accordion ---------- */

  function initAccordion(root) {
    const triggers = root.querySelectorAll("[data-accordion-trigger]");
    triggers.forEach(function (btn) {
      const panelId = btn.getAttribute("aria-controls");
      const panel = panelId ? document.getElementById(panelId) : null;
      if (!panel) return;

      btn.addEventListener("click", function () {
        const open = btn.getAttribute("aria-expanded") === "true";
        const next = !open;
        btn.setAttribute("aria-expanded", next ? "true" : "false");
        panel.hidden = !next;
        const item = btn.closest(".accordion__item");
        if (item) item.classList.toggle("is-open", next);
      });
    });
  }

  const acc = document.querySelector("[data-accordion]");
  if (acc) initAccordion(acc);

  /* ---------- Form + dialog ---------- */

  const form = document.getElementById("booking-form");
  const modal = document.getElementById("success-modal");
  const closeBtn = document.getElementById("success-close");
  const backdrop = modal ? modal.querySelector("[data-success-dismiss]") : null;

  function setFieldError(id, message) {
    const span = document.querySelector('[data-error-for="' + id + '"]');
    const input = document.getElementById(id);
    if (span) span.textContent = message || "";
    if (input) input.classList.toggle("is-invalid", Boolean(message));
  }

  function clearErrors() {
    ["first-name", "last-name", "email", "phone"].forEach(function (id) {
      setFieldError(id, "");
    });
  }

  function digitsOnly(s) {
    return s.replace(/\D/g, "");
  }

  function validate() {
    clearErrors();
    let ok = true;

    const first = document.getElementById("first-name");
    const last = document.getElementById("last-name");
    const email = document.getElementById("email");
    const phone = document.getElementById("phone");

    if (!first.value.trim()) {
      setFieldError("first-name", "Введите имя.");
      ok = false;
    }
    if (!last.value.trim()) {
      setFieldError("last-name", "Введите фамилию.");
      ok = false;
    }
    if (!email.value.trim()) {
      setFieldError("email", "Введите email.");
      ok = false;
    } else if (!email.checkValidity()) {
      setFieldError("email", "Укажите корректный email.");
      ok = false;
    }
    const tel = digitsOnly(phone.value);
    if (!phone.value.trim()) {
      setFieldError("phone", "Введите телефон.");
      ok = false;
    } else if (tel.length < 10) {
      setFieldError("phone", "Телефон слишком короткий.");
      ok = false;
    }

    return ok;
  }

  function openSuccessModal() {
    if (!modal) return;
    modal.removeAttribute("hidden");
    document.body.style.overflow = "hidden";
    if (closeBtn) closeBtn.focus();
  }

  function closeSuccessModal() {
    if (!modal) return;
    modal.setAttribute("hidden", "");
    document.body.style.overflow = "";
    form.reset();
    clearErrors();
  }

  if (form && modal) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!validate()) return;
      openSuccessModal();
    });

    if (closeBtn) {
      closeBtn.addEventListener("click", function () {
        closeSuccessModal();
      });
    }

    if (backdrop) {
      backdrop.addEventListener("click", function () {
        closeSuccessModal();
      });
    }

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && modal && !modal.hasAttribute("hidden")) {
        closeSuccessModal();
      }
    });
  }
})();
