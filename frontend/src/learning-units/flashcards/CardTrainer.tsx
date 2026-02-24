import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Button } from "@/components/ui/button";

export default function CardTrainer({ period }: any) {
  const card = useRef<HTMLDivElement>(null);
  const [i, setI] = useState(0);
  const [flip, setFlip] = useState(false);

  useEffect(() => {
    gsap.from(card.current, {
      rotateY: flip ? 180 : 0,
      duration: 0.5,
    });
  }, [flip, i]);

  const toggle = () => setFlip((s) => !s);

  return (
    <div className="my-10">
      <div ref={card} className="bg-indigo-950 p-6 rounded-2xl text-center">
        <p className="text-lg">
          {flip ? period.cards[i].back : period.cards[i].front}
        </p>
      </div>

      <Button className="mt-4" onClick={toggle}>
        Flip Card
      </Button>
    </div>
  );
}
