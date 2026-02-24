// @/roadmap/animation/verticalLine.ts
import gsap from "gsap";

export const verticalLineAnimation = () => {
  gsap.to(".vertical-line", {
    x: "-50%", // Move to the left (assuming it's centered, this shifts it left by half its width)
    width: "4px", // Increase width to make it visible
    duration: 0.8,
    ease: "power3.out",
  });
};

// Pulse animation for visual attention
export const verticalLinePulse = () => {
  gsap.to(".vertical-line", {
    boxShadow: [
      "0 0 0 0 rgba(59, 130, 246, 0.7)",
      "0 0 0 10px rgba(59, 130, 246, 0)",
    ],
    duration: 2,
    repeat: -1,
    ease: "power2.out",
  });
};

// Gradient animation
export const verticalLineGradient = () => {
  gsap.fromTo(
    ".vertical-line",
    { backgroundPosition: "0% 0%" },
    {
      backgroundPosition: "0% 100%",
      duration: 3,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    }
  );
};
