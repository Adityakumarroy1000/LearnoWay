import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Button } from "@/components/ui/button";

export default function SlidePlayer({ period }: any) {
  const box = useRef<HTMLDivElement>(null);
  const [i, setI] = useState(0);

  useEffect(() => {
    gsap.from(box.current, {
      scale: 0.8,
      opacity: 0,
      duration: 0.6,
      ease: "back.out",
    });
  }, [i]);

  const next = () =>
    setI((s: number) => Math.min(s + 1, period.slides.length - 1));
  const prev = () => setI((s: number) => Math.max(s - 1, 0));

  return (
    <div className="my-6">
      <div ref={box} className="bg-black/30 p-8 rounded-2xl min-h-[220px]">
        <h3 className="text-xl">{period.slides[i].headline}</h3>
        <p className="mt-3 text-gray-300">{period.slides[i].text}</p>
      </div>

      <div className="flex gap-4 mt-4">
        <Button onClick={prev}>Prev</Button>
        <Button onClick={next}>Next</Button>
      </div>
    </div>
  );
}
