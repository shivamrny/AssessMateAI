import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import DashboardLayout from "@/components/DashboardLayout";
import { Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { getExamWithQuestions } from "@/lib/api";

type QuestionType = "mcq" | "theory" | "coding";

interface Option {
  text: string;
  isCorrect: boolean;
}

interface Question {
  id: number;
  dbId?: string;
  type: QuestionType;
  text: string;
  marks: string;
  options?: Option[];
  correctAnswer?: string;
  language?: string;
  testInput?: string;
  expectedOutput?: string;
}

const EditExam = () => {
  const { auth } = useAuth();
  const navigate = useNavigate();
  const { examId } = useParams<{ examId: string }>();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  /* ---------- AUTH CHECK ---------- */

  useEffect(() => {
    if (!auth?.isLoggedIn || auth?.role !== "teacher") {
      navigate("/auth");
    }
  }, [auth, navigate]);

  /* ---------- LOAD EXAM ---------- */

  useEffect(() => {
    const loadExamData = async () => {
      try {
        const examData = await getExamWithQuestions(examId!);

        setTitle(examData.exam_title || "");
        setDescription(examData.exam_description || "");
        setDuration(examData.duration?.toString() || "");

        const parsedQuestions = examData.questions.map((q: any, index: number) => ({
          id: Date.now() + index,
          dbId: q.id,
          type: q.question_type,
          text: q.question_text,
          marks: q.marks?.toString() || "1",
          options: q.options
            ? q.options.map((o: any) => ({
                text: o.option_text,
                isCorrect: o.is_correct
              }))
            : [],
          correctAnswer: q.correct_answer || "",
          language: q.language || "",
          testInput: q.test_input || "",
          expectedOutput: q.expected_output || ""
        }));

        setQuestions(parsedQuestions);

      } catch (err) {
        console.error(err);
        alert("Failed to load exam");
        navigate("/teacher-dashboard/manage-exams");
      } finally {
        setInitialLoading(false);
      }
    };

    loadExamData();
  }, [examId, navigate]);

  /* ---------- QUESTION MANAGEMENT ---------- */

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: Date.now(),
        type: "mcq",
        text: "",
        marks: "1",
        options: [
          { text: "", isCorrect: false },
          { text: "", isCorrect: false },
          { text: "", isCorrect: false },
          { text: "", isCorrect: false }
        ]
      }
    ]);
  };

  const updateQuestion = (id: number, updates: Partial<Question>) => {
    setQuestions(
      questions.map((q) => (q.id === id ? { ...q, ...updates } : q))
    );
  };

  const removeQuestion = (id: number) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const moveQuestionUp = (index: number) => {
    if (index === 0) return;

    const updated = [...questions];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];

    setQuestions(updated);
  };

  const moveQuestionDown = (index: number) => {
    if (index === questions.length - 1) return;

    const updated = [...questions];
    [updated[index + 1], updated[index]] = [updated[index], updated[index + 1]];

    setQuestions(updated);
  };

  /* ---------- OPTION MANAGEMENT ---------- */

  const addOption = (questionId: number) => {
    setQuestions(
      questions.map((q) =>
        q.id === questionId
          ? { ...q, options: [...(q.options || []), { text: "", isCorrect: false }] }
          : q
      )
    );
  };

  const removeOption = (questionId: number, index: number) => {
    setQuestions(
      questions.map((q) => {
        if (q.id !== questionId) return q;

        const updated = [...(q.options || [])];
        updated.splice(index, 1);

        return { ...q, options: updated };
      })
    );
  };

  const updateOption = (questionId: number, index: number, value: string) => {
    setQuestions(
      questions.map((q) => {
        if (q.id !== questionId) return q;

        const updated = [...(q.options || [])];
        updated[index].text = value;

        return { ...q, options: updated };
      })
    );
  };

  const setCorrectOption = (questionId: number, index: number) => {
    setQuestions(
      questions.map((q) => {
        if (q.id !== questionId) return q;

        const updated = (q.options || []).map((opt, i) => ({
          ...opt,
          isCorrect: i === index
        }));

        return { ...q, options: updated };
      })
    );
  };

  /* ---------- UPDATE EXAM ---------- */

  const handleUpdate = async () => {
    setLoading(true);

    try {
      await fetch(`/api/exams/${examId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exam_title: title,
          exam_description: description,
          duration: parseInt(duration),
          questions
        })
      });

      alert("Exam updated successfully");
      navigate("/teacher-dashboard/manage-exams");

    } catch (err) {
      console.error(err);
      alert("Update failed");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return <p className="p-6">Loading exam...</p>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <DashboardLayout>

        <div className="max-w-4xl mx-auto">

          <h1 className="text-2xl font-semibold mb-6">
            Edit Exam
          </h1>

          {/* EXAM DETAILS */}

          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Exam Title"
            className="w-full border px-3 py-2 rounded mb-3"
          />

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Exam Description"
            className="w-full border px-3 py-2 rounded mb-3"
          />

          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="Duration (minutes)"
            className="w-full border px-3 py-2 rounded mb-6"
          />

          {/* QUESTIONS */}

          {questions.map((q, i) => (

            <div key={q.id} className="border p-5 rounded-lg mb-4">

              <div className="flex justify-between mb-3">

                <h3>Question {i + 1}</h3>

                <div className="flex gap-2">
                  <button onClick={() => moveQuestionUp(i)}><ArrowUp size={16} /></button>
                  <button onClick={() => moveQuestionDown(i)}><ArrowDown size={16} /></button>
                  <button onClick={() => removeQuestion(q.id)}><Trash2 size={16} /></button>
                </div>

              </div>

              {/* QUESTION TYPE */}

              <select
                value={q.type}
                onChange={(e) =>
                  updateQuestion(q.id, { type: e.target.value as QuestionType })
                }
                className="border px-2 py-1 rounded mb-3"
              >
                <option value="mcq">MCQ</option>
                <option value="theory">Theory</option>
                <option value="coding">Coding</option>
              </select>

              {/* QUESTION TEXT */}

              <textarea
                value={q.text}
                onChange={(e) => updateQuestion(q.id, { text: e.target.value })}
                className="w-full border px-3 py-2 rounded mb-3"
              />

              {/* MARKS */}

              <input
                type="number"
                value={q.marks}
                onChange={(e) => updateQuestion(q.id, { marks: e.target.value })}
                className="border px-2 py-1 rounded mb-3 w-24"
              />

              {/* MCQ OPTIONS */}

              {q.type === "mcq" && (

                <div className="space-y-2">

                  {q.options?.map((opt, idx) => (

                    <div key={idx} className="flex gap-2 items-center">

                      <input
                        type="radio"
                        checked={opt.isCorrect}
                        onChange={() => setCorrectOption(q.id, idx)}
                      />

                      <input
                        type="text"
                        value={opt.text}
                        onChange={(e) =>
                          updateOption(q.id, idx, e.target.value)
                        }
                        className="border px-2 py-1 rounded w-full"
                      />

                      <button
                        onClick={() => removeOption(q.id, idx)}
                        className="text-red-500"
                      >
                        <Trash2 size={16} />
                      </button>

                    </div>

                  ))}

                  <button
                    onClick={() => addOption(q.id)}
                    className="text-blue-600 text-sm"
                  >
                    + Add Option
                  </button>

                </div>

              )}

              {/* THEORY */}

              {q.type === "theory" && (
                <textarea
                  placeholder="Model Answer"
                  value={q.correctAnswer || ""}
                  onChange={(e) =>
                    updateQuestion(q.id, { correctAnswer: e.target.value })
                  }
                  className="w-full border px-3 py-2 rounded"
                />
              )}

              {/* CODING */}

              {q.type === "coding" && (

                <div className="space-y-3">
                  <textarea
                    placeholder="Test Input"
                    value={q.testInput || ""}
                    onChange={(e) =>
                      updateQuestion(q.id, { testInput: e.target.value })
                    }
                    rows={3}
                    className="border px-3 py-2 rounded w-full"
                  />

                  <textarea
                    placeholder="Expected Output"
                    value={q.expectedOutput || ""}
                    onChange={(e) =>
                      updateQuestion(q.id, { expectedOutput: e.target.value })
                    }
                    rows={3}
                    className="border px-3 py-2 rounded w-full"
                  />

                </div>

              )}

            </div>

          ))}

          {/* BUTTONS */}

          <div className="flex gap-3 mt-6">

            <button
              onClick={addQuestion}
              className="flex items-center gap-2 px-4 py-2 border rounded"
            >
              <Plus size={16} />
              Add Question
            </button>

            <button
              onClick={handleUpdate}
              disabled={loading}
              className="px-5 py-2 bg-primary text-white rounded"
            >
              {loading ? "Updating..." : "Update Exam"}
            </button>

          </div>

        </div>

      </DashboardLayout>
    </div>
  );
};

export default EditExam;