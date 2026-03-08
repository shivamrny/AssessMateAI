import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import DashboardLayout from "@/components/DashboardLayout";
import { Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";

type QuestionType = "mcq" | "theory" | "coding";

interface Question {
  id: number;
  type: QuestionType;
  text: string;
  marks: string;
  options?: { text: string; isCorrect: boolean }[];
  correctAnswer?: string;
  language?: string;
  testInput?: string;
  expectedOutput?: string;
}

const CreateExam = () => {
  const { auth } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth.isLoggedIn || auth.role !== "teacher") {
      navigate("/auth");
    }
  }, [auth, navigate]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: Date.now() + Math.random(),
        type: "mcq",
        text: "",
        marks: "",
        options: [
          { text: "", isCorrect: false },
          { text: "", isCorrect: false },
          { text: "", isCorrect: false },
          { text: "", isCorrect: false },
        ],
      },
    ]);
  };

  const updateQuestion = (id: number, updates: Partial<Question>) => {
    setQuestions(questions.map((q) => (q.id === id ? { ...q, ...updates } : q)));
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

  const handlePublish = async () => {
    if (!title || !description || !duration || questions.length === 0) {
      alert("Please fill all fields and add at least one question.");
      return;
    }

    const dur = parseInt(duration);
    if (isNaN(dur) || dur <= 0) {
      alert("Enter a valid duration.");
      return;
    }

    for (const q of questions) {
      if (!q.text.trim()) {
        alert("Every question must have text.");
        return;
      }
      const marks = parseInt(q.marks);
      if (!marks || marks <= 0) {
        alert("Please assign valid marks for all questions.");
        return;
      }
      if (q.type === "mcq" && (!q.options || q.options.length < 2 || !q.options.some(o => o.isCorrect))) {
        alert("MCQ questions must have at least 2 options and at least one correct answer.");
        return;
      }
      if (q.type === "theory" && !q.correctAnswer?.trim()) {
        alert("Theory questions must have a correct answer.");
        return;
      }
      if (q.type === "coding" && !q.expectedOutput?.trim()) {
        alert("Coding questions must have an expected output.");
        return;
      }
    }

    setLoading(true);

    try {
      const examData = {
        teacher_id: auth.id,
        exam_title: title,
        exam_description: description,
        duration: dur,
      };

      const { createExam } = await import("@/lib/api");
      const examResult = await createExam(examData);
      const examId = examResult[0].id;

      for (let qIdx = 0; qIdx < questions.length; qIdx++) {
        const question = questions[qIdx];
        console.log(`Creating question ${qIdx + 1}/${questions.length}:`, question);
        
        const questionData = {
          exam_id: examId,
          question_text: question.text,
          question_type: question.type,
          marks: parseInt(question.marks) || 1,
          language: question.language || null,
          test_input: question.testInput || null,
          expected_output: question.expectedOutput || null,
        };

        const questionRes = await fetch("/api/exams/questions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(questionData),
        });

        if (!questionRes.ok) {
          const errorText = await questionRes.text();
          console.error(`Failed to create question ${qIdx + 1}:`, errorText);
          throw new Error(`Failed to create question ${qIdx + 1}: ${errorText}`);
        }

        const questionResult = await questionRes.json();
        console.log(`Question ${qIdx + 1} created, response:`, questionResult);
        
        // Support both array [{id}] and object {id} responses
        const questionId = Array.isArray(questionResult)
          ? questionResult[0]?.id
          : questionResult?.id;

        if (!questionId) {
          throw new Error(`Could not get ID for question ${qIdx + 1}`);
        }
        console.log(`Question ${qIdx + 1} ID:`, questionId);

        if (question.type === "mcq" && question.options) {
          for (let oIdx = 0; oIdx < question.options.length; oIdx++) {
            const option = question.options[oIdx];
            if (option.text.trim()) {
              const optRes = await fetch("/api/exams/question-options", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  question_id: questionId,
                  option_text: option.text,
                  is_correct: option.isCorrect,
                }),
              });
              
              if (!optRes.ok) {
                const errorText = await optRes.text();
                console.error(`Failed to create option ${oIdx + 1} for question ${qIdx + 1}:`, errorText);
                throw new Error(`Failed to create option: ${errorText}`);
              }
              console.log(`Option ${oIdx + 1} created for question ${qIdx + 1}`);
            }
          }
        } else if (question.type === "theory" && question.correctAnswer) {
          const ansRes = await fetch("/api/exams/answers", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              question_id: questionId,
              correct_answer: question.correctAnswer,
            }),
          });
          
          if (!ansRes.ok) {
            const errorText = await ansRes.text();
            console.error(`Failed to create answer for question ${qIdx + 1}:`, errorText);
            throw new Error(`Failed to create answer: ${errorText}`);
          }
          console.log(`Answer created for question ${qIdx + 1}`);
        }
      }

      alert("🎉 Congratulations! Your exam has been published successfully.");
      navigate("/teacher-dashboard");
    } catch (error) {
      console.error(error);
      alert("Failed to publish exam. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <DashboardLayout>
        <div className="max-w-4xl mx-auto">

          <h1 className="text-2xl font-semibold text-foreground mb-6">
            Create Exam
          </h1>

          <div className="space-y-4 mb-8">

            <input
              type="text"
              placeholder="Exam Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            />

            <textarea
              placeholder="Exam Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            />

            <input
              type="number"
              placeholder="Duration (minutes)"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            />

          </div>

          {questions.map((q, idx) => (
            <div
              key={q.id}
              className="bg-white border border-gray-200 rounded-xl p-6 mb-5 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex justify-between items-center mb-4">

                <h3 className="font-semibold">
                  Question {idx + 1}
                </h3>

                <div className="flex gap-2">

                  <button onClick={() => moveQuestionUp(idx)}>
                    <ArrowUp size={16} />
                  </button>

                  <button onClick={() => moveQuestionDown(idx)}>
                    <ArrowDown size={16} />
                  </button>

                  <button onClick={() => removeQuestion(q.id)}>
                    <Trash2 size={16} />
                  </button>

                </div>
              </div>

              <textarea
                placeholder="Question text"
                value={q.text}
                onChange={(e) =>
                  updateQuestion(q.id, { text: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-md mb-3"
              />

              <div className="flex gap-4 mb-3">
                <select
                  value={q.type}
                  onChange={(e) =>
                    updateQuestion(q.id, { type: e.target.value as QuestionType })
                  }
                  className="px-3 py-2 border rounded-md"
                >
                  <option value="mcq">Multiple Choice</option>
                  <option value="theory">Theory</option>
                  <option value="coding">Coding</option>
                </select>

                <input
                  type="number"
                  placeholder="Marks"
                  value={q.marks}
                  onChange={(e) =>
                    updateQuestion(q.id, {
                      marks: e.target.value,
                    })
                  }
                  className="px-3 py-2 border rounded-md"
                />
              </div>

              {q.type === "mcq" && q.options && (
                <div className="mb-3">
                  <h4 className="font-medium mb-2">Options (check all correct answers):</h4>
                  {q.options.map((option, optIdx) => (
                    <div key={optIdx} className="flex items-center gap-2 mb-2">
                      <input
                        type="checkbox"
                        checked={option.isCorrect}
                        onChange={(e) =>
                          updateQuestion(q.id, {
                            options: q.options?.map((o, i) =>
                              i === optIdx ? { ...o, isCorrect: e.target.checked } : o
                            ),
                          })
                        }
                      />
                      <input
                        type="text"
                        placeholder={`Option ${optIdx + 1}`}
                        value={option.text}
                        onChange={(e) =>
                          updateQuestion(q.id, {
                            options: q.options?.map((o, i) =>
                              i === optIdx ? { ...o, text: e.target.value } : o
                            ),
                          })
                        }
                        className="flex-1 px-3 py-2 border rounded-md"
                      />
                      <button
                        onClick={() =>
                          updateQuestion(q.id, {
                            options: q.options?.filter((_, i) => i !== optIdx),
                          })
                        }
                        className="text-red-500"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() =>
                      updateQuestion(q.id, {
                        options: [...(q.options || []), { text: "", isCorrect: false }],
                      })
                    }
                    className="text-blue-500 flex items-center gap-1"
                  >
                    <Plus size={16} /> Add Option
                  </button>
                </div>
              )}

              {q.type === "theory" && (
                <textarea
                  placeholder="Correct Answer"
                  value={q.correctAnswer || ""}
                  onChange={(e) =>
                    updateQuestion(q.id, { correctAnswer: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-md mb-3"
                />
              )}

              {q.type === "coding" && (
                <div className="space-y-3">
                  <textarea
                    placeholder="Test Input"
                    value={q.testInput || ""}
                    onChange={(e) =>
                      updateQuestion(q.id, { testInput: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-md"
                  />
                  <textarea
                    placeholder="Expected Output"
                    value={q.expectedOutput || ""}
                    onChange={(e) =>
                      updateQuestion(q.id, { expectedOutput: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
              )}
            </div>
          ))}

          <div className="flex gap-3 mt-6">

            <button
              onClick={addQuestion}
              className="flex items-center gap-2 px-5 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition"
            >
              <Plus size={16} />
              Add Question
            </button>

            <button
              onClick={handlePublish}
              disabled={loading}
              className="px-6 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold hover:opacity-90 transition"
            >
              {loading ? "Publishing..." : "Publish Exam"}
            </button>

          </div>

        </div>
      </DashboardLayout>
    </div>
  );
};

export default CreateExam;