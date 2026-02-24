import { useState } from "react";
import { Button } from "@/components/ui/button";
import QuizResult from "./QuizResult";

export default function QuizGate({ quizId }: any) {
  const [start, setStart] = useState(false);

  if (!start)
    return (
      <div className="text-center my-6">
        <Button onClick={() => setStart(true)}>Start Quiz</Button>
      </div>
    );

  return <QuizResult quizId={quizId} />;
}
