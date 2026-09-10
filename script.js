"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.querySelector(".menu-toggle");
  const mainNav = document.querySelector(".main-nav");
  const navLinks = document.querySelectorAll(".main-nav a");
  const timelineTriggers = document.querySelectorAll(".timeline-trigger");
  const mobileQuery = window.matchMedia("(max-width: 760px)");

  const setMenuState = (isOpen) => {
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Cerrar menú" : "Abrir menú");
    mainNav.hidden = mobileQuery.matches && !isOpen;
    mainNav.classList.toggle("is-open", isOpen);
    navLinks.forEach((link) => {
      link.tabIndex = mobileQuery.matches && !isOpen ? -1 : 0;
    });
  };

  menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    setMenuState(!isOpen);
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      setMenuState(false);
      if (mobileQuery.matches) menuToggle.focus();
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && mobileQuery.matches && menuToggle.getAttribute("aria-expanded") === "true") {
      setMenuState(false);
      menuToggle.focus();
    }
  });

  mobileQuery.addEventListener("change", () => setMenuState(false));
  setMenuState(false);

  timelineTriggers.forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const item = trigger.closest(".timeline-item");
      const story = document.getElementById(trigger.getAttribute("aria-controls"));
      const isExpanded = trigger.getAttribute("aria-expanded") === "true";

      timelineTriggers.forEach((otherTrigger) => {
        const otherItem = otherTrigger.closest(".timeline-item");
        const otherStory = document.getElementById(otherTrigger.getAttribute("aria-controls"));
        otherTrigger.setAttribute("aria-expanded", "false");
        otherStory.hidden = true;
        otherItem.classList.remove("is-active");
      });

      if (!isExpanded) {
        trigger.setAttribute("aria-expanded", "true");
        story.hidden = false;
        item.classList.add("is-active");
      }
    });
  });
});
