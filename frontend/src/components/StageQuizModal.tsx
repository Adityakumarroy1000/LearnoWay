import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { getQuiz, submitQuiz, type QuizQuestion } from "@/api/quiz";
import { X, Loader2, CheckCircle, XCircle } from "lucide-react";

type StageQuizModalProps = {
  roadmapId: number;
  roadmapTitle: string;
  onClose: () => void;
  onPass: (roadmapId: number) => void;
};

export default function StageQuizModal({
  roadmapId,
  roadmapTitle,
  onClose,
  onPass,
}: StageQuizModalProps) {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [sessionKey, setSessionKey] = useState<string | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<number[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<{
    passed: boolean;
    score: number;
    correct: number;
    total: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    getQuiz(roadmapId)
      .then((res) => {
        if (!cancelled) {
          setSessionKey(res.session_key);
          setQuestions(res.questions);
          setAnswers(res.questions.map(() => -1));
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.response?.data?.error || err.message || "Failed to load quiz");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [roadmapId]);

  const handleSelect = (questionIndex: number, optionIndex: number) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[questionIndex] = optionIndex;
      return next;
    });
  };

  const handleSubmit = () => {
    const hasUnanswered = answers.some((a) => a < 0);
    if (hasUnanswered) {
      setError("Please answer all questions.");
      return;
    }
    if (!sessionKey) {
      setError("Quiz session lost. Please close and start the quiz again.");
      return;
    }
    setSubmitting(true);
    setError(null);
    submitQuiz(roadmapId, sessionKey, answers)
      .then((res) => {
        setResult({
          passed: res.passed,
          score: res.score,
          correct: res.correct,
          total: res.total,
        });
        setSubmitted(true);
        if (res.passed) onPass(roadmapId);
      })
      .catch((err) => {
        setError(err.response?.data?.error || err.message || "Submit failed");
      })
      .finally(() => setSubmitting(false));
  };

  const handleClose = () => {
    if (result?.passed) onPass(roadmapId);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Quiz: {roadmapTitle}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto flex-1">
          {loading && (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
              <p className="text-gray-600 dark:text-gray-400">
                Generating your quiz...
              </p>
            </div>
          )}

          {error && !loading && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 text-sm">
              {error}
            </div>
          )}

          {!loading && questions.length === 0 && !error && (
            <p className="text-gray-600 dark:text-gray-400 py-8 text-center">
              No questions available. Try again later.
            </p>
          )}

          {!loading && questions.length > 0 && !submitted && (
            <div className="space-y-6">
              {questions.map((q, qIndex) => (
                <div
                  key={q.id}
                  className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600"
                >
                  <p className="font-medium text-gray-900 dark:text-white mb-3">
                    {qIndex + 1}. {q.question_text}
                  </p>
                  <div className="space-y-2">
                    {q.options.map((opt, optIndex) => (
                      <label
                        key={optIndex}
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                          answers[qIndex] === optIndex
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                            : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                        }`}
                      >
                        <input
                          type="radio"
                          name={`q-${q.id}`}
                          checked={answers[qIndex] === optIndex}
                          onChange={() => handleSelect(qIndex, optIndex)}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="text-gray-700 dark:text-gray-300">
                          {opt}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {submitted && result && (
            <div className="py-6 text-center space-y-4">
              {result.passed ? (
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
              ) : (
                <XCircle className="w-16 h-16 text-red-500 mx-auto" />
              )}
              <h3
                className={`text-xl font-bold ${
                  result.passed
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {result.passed ? "You passed!" : "Not quite there yet"}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Score: {result.correct}/{result.total} ({result.score}%)
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                {result.passed
                  ? "The next stage is now unlocked."
                  : "You need 70% to pass. Review the stage and try again."}
              </p>
            </div>
          )}
        </div>

        <div className="p-4 border-t dark:border-gray-700 flex gap-3 justify-end">
          {!submitted ? (
            <>
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={submitting || answers.some((a) => a < 0)}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit"
                )}
              </Button>
            </>
          ) : (
            <Button onClick={handleClose}>Close</Button>
          )}
        </div>
      </div>
    </div>
  );
}
