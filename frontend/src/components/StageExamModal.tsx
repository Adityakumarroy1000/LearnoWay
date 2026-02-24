import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { getExam, submitExam, type ExamQuestion, type SubmitExamResponse } from "@/api/exam";
import { X, Loader2, CheckCircle, XCircle } from "lucide-react";

type StageExamModalProps = {
  roadmapId: number;
  roadmapTitle: string;
  onClose: () => void;
  onPass: (roadmapId: number) => void;
};

export default function StageExamModal({
  roadmapId,
  roadmapTitle,
  onClose,
  onPass,
}: StageExamModalProps) {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [sessionKey, setSessionKey] = useState<string | null>(null);
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [answers, setAnswers] = useState<(number | string)[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<SubmitExamResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    getExam(roadmapId)
      .then((res) => {
        if (!cancelled) {
          setSessionKey(res.session_key);
          setQuestions(res.questions);
          setAnswers(
            res.questions.map((q) =>
              q.type === "short_answer" ? "" : -1
            )
          );
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.response?.data?.error || err.message || "Failed to load exam");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [roadmapId]);

  const handleMcSelect = (questionIndex: number, optionIndex: number) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[questionIndex] = optionIndex;
      return next;
    });
  };

  const handleShortAnswerChange = (questionIndex: number, value: string) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[questionIndex] = value;
      return next;
    });
  };

  const isAnswerComplete = () => {
    return questions.every((q, i) => {
      const a = answers[i];
      if (q.type === "short_answer") {
        return typeof a === "string" && a.trim().length > 0;
      }
      return typeof a === "number" && a >= 0;
    });
  };

  const handleSubmit = () => {
    if (!isAnswerComplete()) {
      setError("Please answer all questions.");
      return;
    }
    if (!sessionKey) {
      setError("Exam session lost. Please close and start the exam again.");
      return;
    }
    setSubmitting(true);
    setError(null);
    submitExam(roadmapId, sessionKey, answers)
      .then((res) => {
        setResult(res);
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
            Exam: {roadmapTitle}
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
                Generating your exam...
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
                  {q.type === "short_answer" ? (
                    <div>
                      <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">
                        Write your answer
                      </label>
                      <textarea
                        value={(answers[qIndex] as string) || ""}
                        onChange={(e) =>
                          handleShortAnswerChange(qIndex, e.target.value)
                        }
                        placeholder="Type your answer here..."
                        className="w-full min-h-[80px] px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={3}
                      />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {(q.options || []).map((opt, optIndex) => (
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
                            onChange={() => handleMcSelect(qIndex, optIndex)}
                            className="w-4 h-4 text-blue-600"
                          />
                          <span className="text-gray-700 dark:text-gray-300">
                            {opt}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
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
              {Array.isArray(result.review) && result.review.length > 0 && (
                <div className="mt-6 text-left space-y-3">
                  <h4 className="text-base font-semibold text-gray-900 dark:text-white">
                    Answer Review
                  </h4>
                  {result.review.map((item, idx) => (
                    <div
                      key={`${item.question_id}-${idx}`}
                      className={`rounded-lg border p-3 text-sm ${
                        item.is_correct
                          ? "border-green-300 bg-green-50 dark:border-green-800 dark:bg-green-900/20"
                          : "border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-900/20"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {idx + 1}. {item.question_text}
                        </p>
                        <span
                          className={`text-xs font-semibold px-2 py-1 rounded-full ${
                            item.is_correct
                              ? "bg-green-600 text-white"
                              : "bg-red-600 text-white"
                          }`}
                        >
                          {item.is_correct ? "Correct" : "Wrong"}
                        </span>
                      </div>

                      {item.type === "multiple_choice" ? (
                        <div className="mt-2 space-y-1 text-gray-700 dark:text-gray-300">
                          <p>
                            Your answer: {item.selected_text || "Not answered"}
                          </p>
                          {!item.is_correct && (
                            <p>
                              Correct answer: {item.correct_text || "N/A"}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="mt-2 space-y-1 text-gray-700 dark:text-gray-300">
                          <p>
                            Your answer: {item.user_answer?.trim() || "Not answered"}
                          </p>
                          {!item.is_correct &&
                            Array.isArray(item.expected_keywords) &&
                            item.expected_keywords.length > 0 && (
                              <p>
                                Expected keywords: {item.expected_keywords.join(", ")}
                              </p>
                            )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
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
                disabled={submitting || !isAnswerComplete()}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Exam"
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

