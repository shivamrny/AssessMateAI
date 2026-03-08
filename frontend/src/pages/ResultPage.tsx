import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { Loader2 } from "lucide-react";
import {
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Lightbulb,
  Clock
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { getExamAttempt, getExamAttemptResponses } from "@/lib/api";

interface Question {
  id: string;
  question_text: string;
  question_type: string;
  marks: number;
  answers?: Array<{
    correct_answer: string;
  }>;
}

interface Response {
  id: string;
  student_answer: string;
  marks_obtained: number;
  is_correct: boolean;
  attempted_at: string;
  questions: Question;
}

interface ExamAttempt {
  id: string;
  student_id: string;
  exam_id: string;
  score: number;
  status: string;
  attempted_at: string;
  completed_at: string;
  exams?: {
    exam_title: string;
    duration: number;
  };
}

const ResultPage = () => {
  const navigate = useNavigate();
  const { id: attemptId } = useParams<{ id: string }>();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState<ExamAttempt | null>(null);
  const [responses, setResponses] = useState<Response[]>([]);

  useEffect(() => {
    const fetchResults = async () => {
      if (!attemptId) {
        setError("Invalid attempt ID");
        setLoading(false);
        return;
      }

      try {
        // Fetch exam attempt
        const attemptData = await getExamAttempt(attemptId);
        setAttempt(attemptData);

        // Fetch responses
        const responsesData = await getExamAttemptResponses(attemptId);
        setResponses(responsesData || []);
      } catch (err) {
        console.error("Error fetching results:", err);
        // Still try to show the attempt even if responses fail
        try {
          const attemptData = await getExamAttempt(attemptId);
          setAttempt(attemptData);
        } catch (e) {
          console.error("Error fetching attempt:", e);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [attemptId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading results...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => navigate("/student-dashboard")}
            className="px-4 py-2 bg-primary text-white rounded-md"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Get unique questions (deduplicate by question_id)
  const uniqueResponsesMap = new Map();
  responses.forEach(r => {
    if (r.questions?.id && !uniqueResponsesMap.has(r.questions.id)) {
      uniqueResponsesMap.set(r.questions.id, r);
    }
  });
  const uniqueResponses = Array.from(uniqueResponsesMap.values());

  // Calculate stats using unique responses - include partial marks
  const totalQuestions = uniqueResponses.length;
  const answeredQuestions = uniqueResponses.filter(r => r.student_answer && r.student_answer.trim()).length;
  const correctAnswers = uniqueResponses.filter(r => r.is_correct === true).length;
  
  // Calculate total marks obtained
  let totalMarksObtained = 0;
  let totalMarksPossible = 0;
  uniqueResponses.forEach(r => {
    if (r.questions?.marks) {
      totalMarksPossible += r.questions.marks;
      totalMarksObtained += r.marks_obtained || 0;
    }
  });
  
  // Calculate time taken
  const startTime = attempt?.attempted_at ? new Date(attempt.attempted_at) : null;
  const endTime = attempt?.completed_at ? new Date(attempt.completed_at) : null;
  let timeTaken = "N/A";
  if (startTime && endTime) {
    const diffMs = endTime.getTime() - startTime.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
    if (hours > 0) {
      timeTaken = `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      timeTaken = `${minutes}m ${seconds}s`;
    } else {
      timeTaken = `${seconds}s`;
    }
  }

  // Section data for chart - only include sections that have questions
  const mcqResponses = uniqueResponses.filter(r => r.questions?.question_type === "mcq");
  const theoryResponses = uniqueResponses.filter(r => r.questions?.question_type === "theory");
  const codingResponses = uniqueResponses.filter(r => r.questions?.question_type === "coding");

  const sectionData = [];
  if (mcqResponses.length > 0) {
    sectionData.push({ 
      section: "MCQ", 
      score: mcqResponses.length > 0 ? Math.round((mcqResponses.filter(r => r.is_correct === true).length / mcqResponses.length) * 100) : 0,
      correct: mcqResponses.filter(r => r.is_correct === true).length,
      total: mcqResponses.length
    });
  }
  if (theoryResponses.length > 0) {
    sectionData.push({ 
      section: "Theory", 
      score: theoryResponses.length > 0 ? Math.round((theoryResponses.filter(r => r.marks_obtained > 0).length / theoryResponses.length) * 100) : 0,
      correct: theoryResponses.filter(r => r.marks_obtained > 0).length,
      total: theoryResponses.length
    });
  }
  if (codingResponses.length > 0) {
    sectionData.push({ 
      section: "Coding", 
      score: codingResponses.length > 0 ? Math.round((codingResponses.filter(r => r.marks_obtained > 0).length / codingResponses.length) * 100) : 0,
      correct: codingResponses.filter(r => r.marks_obtained > 0).length,
      total: codingResponses.length
    });
  }

  // Ensure we have at least one section for the chart
  if (sectionData.length === 0) {
    sectionData.push({ section: "No Data", score: 0, correct: 0, total: 0 });
  }

  // Convert raw marks to percentage
  const rawScore = attempt?.score || 0;
  const predictedScore = totalMarksPossible > 0
    ? Math.round((rawScore / totalMarksPossible) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-3xl mx-auto px-6 py-10">

        {/* Score Header */}

        <div className="text-center mb-10">

          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-accent text-accent-foreground mb-4">
            <CheckCircle size={36} />
          </div>

          <h1 className="text-2xl font-semibold text-foreground">
            Exam Completed
          </h1>

          <p className="text-muted-foreground text-sm mt-1">
            {attempt?.exams?.exam_title || "Exam"}
          </p>

          <div className="mt-5">
            <span className="text-5xl font-bold text-primary">
              {predictedScore}%
            </span>

            <p className="text-sm text-muted-foreground mt-1">
              Your Score
            </p>

            <span className="inline-block mt-2 text-xs px-3 py-1 rounded-full bg-warning/10 text-warning font-medium">
              {attempt?.status === "completed" ? "Completed" : "Pending"}
            </span>
          </div>

        </div>

        {/* Attempt Summary */}

        <div className="grid grid-cols-3 gap-4 mb-8">

          <div className="bg-card border border-border rounded-lg p-4 text-center">
            <p className="text-xs text-muted-foreground">Questions Attempted</p>
            <p className="text-lg font-semibold">{answeredQuestions} / {totalQuestions}</p>
          </div>

          <div className="bg-card border border-border rounded-lg p-4 text-center">
            <p className="text-xs text-muted-foreground">Marks Obtained</p>
            <p className="text-lg font-semibold">{totalMarksObtained} / {totalMarksPossible}</p>
          </div>

          <div className="bg-card border border-border rounded-lg p-4 text-center">
            <p className="text-xs text-muted-foreground">Time Taken</p>
            <p className="text-lg font-semibold flex items-center justify-center gap-1">
              <Clock size={14} /> {timeTaken}
            </p>
          </div>

        </div>

        {/* Question-wise Marks */}

        <div className="bg-card border border-border rounded-lg p-6 mb-8">

          <h2 className="text-base font-semibold text-foreground mb-4">
            Question-wise Results
          </h2>

          <div className="space-y-3">
            {uniqueResponses.map((response, index) => (
              <div key={response.id || index} className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div className="flex-1">
                  <p className="text-sm font-medium">Question {index + 1}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {response.questions?.question_text?.substring(0, 50) || "Question"}...
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-semibold ${
                    response.is_correct === true ? "text-green-600" : 
                    response.marks_obtained > 0 ? "text-yellow-600" : "text-red-600"
                  }`}>
                    {response.marks_obtained || 0} / {response.questions?.marks || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {response.is_correct === true ? "Correct" : 
                     response.marks_obtained > 0 ? "Partial" : "Incorrect"}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Performance Chart */}

        <div className="bg-card border border-border rounded-lg p-6 mb-8">

          <h2 className="text-base font-semibold text-foreground mb-4">
            Performance Summary
          </h2>

          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={sectionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214,20%,90%)" />
              <XAxis dataKey="section" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="score" fill="hsl(217.2,91.2%,51.8%)" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>

        </div>

        {/* AI Feedback */}

        <div className="bg-card border border-border rounded-lg p-6">

          <h2 className="text-base font-semibold text-foreground mb-4">
            AI Feedback
          </h2>

          <div className="space-y-4">

            <div className="flex gap-3">
              <TrendingUp className="text-accent" size={18} />
              <div>
                <p className="text-sm font-medium">Strength Areas</p>
                <p className="text-sm text-muted-foreground">
                  {mcqResponses.length > 0 && mcqResponses.filter(r => r.is_correct === true).length > 0 
                    ? `You performed well in ${mcqResponses.filter(r => r.is_correct === true).length} out of ${mcqResponses.length} MCQ questions (${Math.round((mcqResponses.filter(r => r.is_correct === true).length / mcqResponses.length) * 100)}%).`
                    : theoryResponses.length > 0 && theoryResponses.filter(r => r.marks_obtained > 0).length > 0
                    ? `You demonstrated good understanding in ${theoryResponses.filter(r => r.marks_obtained > 0).length} theory questions.`
                    : "Keep practicing to improve your performance."}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <TrendingDown className="text-destructive" size={18} />
              <div>
                <p className="text-sm font-medium">Areas for Improvement</p>
                <p className="text-sm text-muted-foreground">
                  {mcqResponses.length > 0 && mcqResponses.filter(r => r.is_correct !== true).length > 0
                    ? `Review ${mcqResponses.filter(r => r.is_correct !== true).length} MCQ questions you got wrong. Focus on understanding the concepts behind incorrect answers.`
                    : theoryResponses.length > 0 && theoryResponses.filter(r => !r.marks_obtained || r.marks_obtained === 0).length > 0
                    ? `Work on your theory answers - consider elaborating more in your responses.`
                    : codingResponses.length > 0 && codingResponses.filter(r => !r.marks_obtained || r.marks_obtained === 0).length > 0
                    ? `Practice coding problems to improve your problem-solving skills.`
                    : "Great job! Review all topics to maintain your performance."}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Lightbulb className="text-warning" size={18} />
              <div>
                <p className="text-sm font-medium">Improvement Suggestions</p>
                <p className="text-sm text-muted-foreground">
                  {predictedScore >= 80 
                    ? "Excellent work! Continue practicing to maintain your high performance. Consider helping peers or exploring advanced topics."
                    : predictedScore >= 60 
                    ? "Good effort! Review the questions you got wrong and practice similar problems. Focus on understanding the underlying concepts."
                    : "Keep practicing regularly. Start with basic concepts and gradually increase difficulty. Don't hesitate to seek help from teachers."}
                </p>
              </div>
            </div>

          </div>

        </div>

        {/* Notice */}

        <p className="text-xs text-muted-foreground text-center mt-6">
          Your theory and coding answers will be reviewed by your teacher for final evaluation.
        </p>

        {/* Navigation */}

        <div className="mt-6 text-center">

          <button
            onClick={() => navigate("/student-dashboard")}
            className="px-6 py-2.5 rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition"
          >
            Go to Student Dashboard
          </button>

        </div>

      </div>
    </div>
  );
};

export default ResultPage;