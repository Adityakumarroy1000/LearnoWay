import { useEffect } from "react";
import gsap from "gsap";

export default function PageTransition() {
  useEffect(() => {
    const tl = gsap.timeline();

    tl.from(".skill-header", {
      y: -60,
      opacity: 0,
      duration: 0.8,
      ease: "power3.out",
    })
      .from(
        ".skill-card",
        {
          y: 40,
          opacity: 0,
          stagger: 0.15,
          duration: 0.6,
          ease: "power3.out",
        },
        "-=0.3"
      )
      .from(
        ".skill-sidebar",
        {
          x: 60,
          opacity: 0,
          duration: 0.6,
        },
        "-=0.4"
      );
  }, []);

  return null;
}
