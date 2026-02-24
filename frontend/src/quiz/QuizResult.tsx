import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

export default function QuizResult({ quizId }: any) {
  const box = useRef<HTMLDivElement>(null);
  const [score] = useState(Math.floor(Math.random() * 100));

  useEffect(() => {
    gsap.from(box.current, {
      width: "0%",
      duration: 1,
      ease: "power2.out",
    });
  }, []);

  return (
    <div ref={box} className="bg-emerald-900 p-6 rounded-2xl">
      <h3 className="text-2xl">Quiz {quizId}</h3>
      <p className="mt-3">Score: {score}%</p>
    </div>
  );
}
