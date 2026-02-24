// @/roadmap/animation/timelineShift.ts
import gsap from "gsap";

export const timelineShift = (isShifted: boolean, isLeftBox: boolean = false) => {
  if (document.body.classList.contains("modal-open")) return;

  const viewportWidth = typeof window !== "undefined" ? window.innerWidth : 0;
  const shiftX = isShifted && viewportWidth >= 1024 ? "-25vw" : "0%";

  gsap.to(".timeline-container", {
    x: shiftX,
    duration: 0.8,
    ease: "power3.inOut",
  });

  // Animate timeline boxes for better visual feedback
  gsap.to(".roadmap-box", {
    duration: 0.8,
    ease: "power3.inOut",
  });
};

// New animation for individual box entrance
export const boxEntranceAnimation = (element: HTMLElement, delay: number = 0) => {
  gsap.from(element, {
    opacity: 0,
    y: 30,
    duration: 0.6,
    delay,
    ease: "back.out",
  });
};

// Scale animation on interaction
export const boxScaleAnimation = (element: HTMLElement, scale: number = 1.05) => {
  gsap.to(element, {
    scale,
    duration: 0.3,
    ease: "power2.out",
  });
};




