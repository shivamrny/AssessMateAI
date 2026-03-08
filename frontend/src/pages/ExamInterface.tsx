import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Clock, AlertTriangle, Loader2, Flag } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  getExamWithQuestions,
  createExamAttempt,
  saveStudentResponse,
  completeExamAttempt,
} from "@/lib/api";

interface Question {
  id: string;
  question_text: string;
  question_type: string;
  marks: number;
  options?: {
    id: string;
    option_text: string;
    is_correct?: boolean;
  }[];
}

interface Exam {
  id: string;
  exam_title: string;
  duration: number;
  questions: Question[];
}

interface ExamAttempt {
  id: string;
  student_id: string;
  exam_id: string;
  score: number;
  status: string;
}

const ExamInterface = () => {
  const navigate = useNavigate();
  const { id: examId } = useParams<{ id: string }>();
  const { auth } = useAuth();

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const submittedRef = useRef(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const [exam, setExam] = useState<Exam | null>(null);
  const [attempt, setAttempt] = useState<ExamAttempt | null>(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [review, setReview] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [warnings, setWarnings] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [saved, setSaved] = useState(true);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  /* ---------------- LOAD EXAM ---------------- */

  useEffect(() => {
    const initExam = async () => {
      try {
        if (!examId || !auth?.id) return;

        const examData = await getExamWithQuestions(examId);
        setExam(examData);
        setTimeLeft(examData.duration * 60);

        const attemptData = await createExamAttempt(auth.id, examId);
        setAttempt(attemptData);
      } catch {
        setError("Failed to load exam");
      } finally {
        setLoading(false);
      }
    };

    initExam();
  }, [examId, auth?.id]);

  const questions = exam?.questions || [];
  const question = questions[currentQ];

  /* ---------------- TIMER ---------------- */

  useEffect(() => {
    if (timeLeft === null) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (!prev || prev <= 1) {
          submitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current!);
  }, [timeLeft]);

  /* ---------------- KEYBOARD NAV ---------------- */

  useEffect(() => {
    const keyNav = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight")
        setCurrentQ((q) => Math.min(q + 1, questions.length - 1));
      if (e.key === "ArrowLeft")
        setCurrentQ((q) => Math.max(q - 1, 0));
    };

    window.addEventListener("keydown", keyNav);
    return () => window.removeEventListener("keydown", keyNav);
  }, [questions.length]);

  /* ---------------- REFRESH WARNING ---------------- */

  useEffect(() => {
    const handleBeforeUnload = (e: any) => {
      e.preventDefault();
      e.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () =>
      window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  /* ---------------- FULLSCREEN ---------------- */

  useEffect(() => {
    document.documentElement.requestFullscreen?.();
  }, []);

  /* ---------------- TAB SWITCH WARNING ---------------- */

  const handleVisibilityChange = useCallback(() => {
    if (document.hidden) {
      setWarnings((w) => {
        const newWarnings = w + 1;

        if (newWarnings >= 3) {
          alert("Too many tab switches. Exam has been automatically submitted.");
          submitExam(true);
        }

        return newWarnings;
      });

      setShowWarning(true);
      setTimeout(() => setShowWarning(false), 3000);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  /* ---------------- FORMAT TIME ---------------- */

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  /* ---------------- SAVE ANSWER ---------------- */

  const handleAnswer = async (value: string, debounce = false) => {
    if (!question || !attempt) return;

    setSaved(false);

    setAnswers((prev) => ({
      ...prev,
      [question.id]: value,
    }));

    // Debounce API call for text inputs (theory/coding) to avoid call per keystroke
    if (debounce) {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(async () => {
        try {
          await saveStudentResponse(attempt.id, question.id, value);
          setSaved(true);
        } catch {}
      }, 800);
    } else {
      try {
        await saveStudentResponse(attempt.id, question.id, value);
      } catch {}
      setTimeout(() => setSaved(true), 400);
    }
  };

  /* ---------------- REVIEW ---------------- */

  const toggleReview = () => {
    if (!question) return;

    setReview((prev) =>
      prev.includes(question.id)
        ? prev.filter((id) => id !== question.id)
        : [...prev, question.id]
    );
  };

  /* ---------------- SUBMIT ---------------- */

  const submitExam = async (force = false) => {
    if (submittedRef.current || submitting) return;

    if (!force) {
      const confirmSubmit = window.confirm(
        "Are you sure you want to submit the exam?"
      );
      if (!confirmSubmit) return;
    }

    submittedRef.current = true;
    setSubmitting(true);

    if (attempt?.id) {
      await completeExamAttempt(attempt.id, 0, "completed");
    }

    navigate(`/result/${attempt?.id}`);
  };

  /* ---------------- STATES ---------------- */

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );

  if (error) return <div>{error}</div>;

  if (!exam) return <div>No exam found</div>;

  /* ---------------- UI ---------------- */

  return (
    <div className="flex min-h-screen bg-background">

      {/* SIDEBAR QUESTION PALETTE */}

      <div className="w-60 border-r p-4">
        <h2 className="font-semibold mb-3">Questions</h2>

        <div className="grid grid-cols-5 gap-2">

          {questions.map((q, i) => {
            let color = "border";

            if (i === currentQ) color = "bg-primary text-white";
            else if (review.includes(q.id)) color = "bg-yellow-300";
            else if (answers[q.id]) color = "bg-green-300";

            return (
              <button
                key={q.id}
                onClick={() => setCurrentQ(i)}
                className={`w-8 h-8 text-xs rounded ${color}`}
              >
                {i + 1}
              </button>
            );
          })}

        </div>
      </div>

      {/* MAIN */}

      <div className="flex-1">

        {/* TOP BAR */}

        <div className="flex justify-between items-center border-b px-6 h-14">

          <h1 className="font-semibold">{exam.exam_title}</h1>

          <div className="flex items-center gap-4">

            <span className={saved ? "text-green-500 text-xs" : "text-yellow-500 text-xs"}>
              {saved ? "✓ Saved" : "Saving..."}
            </span>

            {warnings > 0 && (
              <span className="text-xs text-yellow-600">
                ⚠ {warnings}
              </span>
            )}

            <div
              className={`flex items-center gap-1 font-mono ${
                timeLeft && timeLeft < 300 ? "text-red-500" : ""
              }`}
            >
              <Clock size={16} />
              {timeLeft ? formatTime(timeLeft) : "--"}
            </div>

          </div>
        </div>

        {/* QUESTION */}

        <div className="max-w-3xl mx-auto px-6 py-10">

          <div className="flex items-center gap-3 mb-4">

            <span className="text-sm text-muted-foreground">
              Question {currentQ + 1}/{questions.length}
            </span>

            <button
              onClick={toggleReview}
              className="flex items-center gap-1 text-xs border px-2 py-1 rounded"
            >
              <Flag size={14} />
              Review
            </button>

          </div>

          <h2 className="text-lg mb-6">{question.question_text}</h2>

          {/* MCQ */}

          {question.question_type === "mcq" && (
            <div className="space-y-3">

              {question.options?.map((opt, i) => (
                <button
                  key={opt.id}
                  onClick={() => handleAnswer(opt.option_text)}
                  className={`w-full text-left px-4 py-3 border rounded-lg transition
                  ${
                    answers[question.id] === opt.option_text
                      ? "border-primary bg-accent"
                      : "hover:border-primary"
                  }`}
                >
                  {String.fromCharCode(65 + i)}. {opt.option_text}
                </button>
              ))}

            </div>
          )}

          {/* THEORY */}

          {question.question_type === "theory" && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-muted-foreground">
                Write your answer below
              </label>
              <textarea
                rows={10}
                placeholder="Type your answer here..."
                value={answers[question.id] || ""}
                onChange={(e) => handleAnswer(e.target.value, true)}
                className="w-full border rounded-lg p-3 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
              />
            </div>
          )}

          {/* CODING */}

          {question.question_type === "coding" && (
            <div className="space-y-4">

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Select Language
                </label>
                <select
                  value={(() => {
                    try { return JSON.parse(answers[question.id] || "{}").language || ""; } catch { return ""; }
                  })()}
                  onChange={(e) => {
                    const current = (() => { try { return JSON.parse(answers[question.id] || "{}"); } catch { return {}; } })();
                    handleAnswer(JSON.stringify({ ...current, language: e.target.value }), false);
                  }}
                  className="px-3 py-2 border rounded-lg text-sm w-48 bg-background"
                >
                  <option value="">Choose language...</option>
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                  <option value="cpp">C++</option>
                  <option value="c">C</option>
                  <option value="javascript">JavaScript</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Write your code here
                </label>
                <textarea
                  rows={14}
                  placeholder="// Write your solution here..."
                  value={(() => {
                    try { return JSON.parse(answers[question.id] || "{}").code || ""; } catch { return ""; }
                  })()}
                  onChange={(e) => {
                    const current = (() => { try { return JSON.parse(answers[question.id] || "{}"); } catch { return {}; } })();
                    handleAnswer(JSON.stringify({ ...current, code: e.target.value }), true);
                  }}
                  className="w-full border rounded-lg p-3 font-mono text-sm bg-background resize-y"
                  spellCheck={false}
                />
              </div>

            </div>
          )}

          {/* NAVIGATION */}

          <div className="flex justify-between mt-10">

            <button
              disabled={currentQ === 0}
              onClick={() => setCurrentQ((q) => q - 1)}
              className="px-4 py-2 border rounded"
            >
              Previous
            </button>

            {currentQ < questions.length - 1 ? (
              <button
                onClick={() => setCurrentQ((q) => q + 1)}
                className="px-4 py-2 bg-primary text-white rounded"
              >
                Next
              </button>
            ) : (
              <button
                onClick={() => submitExam()}
                className="px-6 py-2 bg-primary text-white rounded"
              >
                Submit Exam
              </button>
            )}

          </div>

        </div>
      </div>

      {/* TAB WARNING */}

      {showWarning && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-yellow-300 px-4 py-2 rounded shadow">
          <AlertTriangle size={16} className="inline mr-1" />
          Tab switch detected! {warnings}/3
        </div>
      )}
    </div>
  );
};

export default ExamInterface;