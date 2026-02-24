// @/roadmap/animation/slideIn.ts
import gsap from "gsap";

export const slideIn = (selector: string) => {
  gsap.fromTo(
    selector,
    { x: "-100%", opacity: 0 }, // Start from off-screen left with opacity
    { x: "0%", opacity: 1, duration: 0.8, ease: "power3.out" } // Slide in to position
  );
};

// Add more animation variations
export const slideInFromRight = (selector: string, duration: number = 0.8) => {
  gsap.fromTo(
    selector,
    { x: "100%", opacity: 0 },
    { x: "0%", opacity: 1, duration, ease: "power3.out" }
  );
};

export const slideInFromTop = (selector: string, duration: number = 0.6) => {
  gsap.fromTo(
    selector,
    { y: "-50px", opacity: 0 },
    { y: "0%", opacity: 1, duration, ease: "back.out" }
  );
};