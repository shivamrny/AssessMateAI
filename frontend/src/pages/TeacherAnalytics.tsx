import Navbar from "@/components/Navbar";
import DashboardLayout from "@/components/DashboardLayout";
import { updateTeacherMarks } from "@/lib/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { useQuery } from "@tanstack/react-query";
import { getTeacherAnalytics, getStudentResponses } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

import { Pencil } from "lucide-react";
import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const TeacherAnalytics = () => {

  const { auth } = useAuth();

  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [teacherMarks, setTeacherMarks] = useState<{ [key: string]: number }>({});

  const { data, isLoading, error } = useQuery({
    queryKey: ["teacherAnalytics", auth?.id],
    queryFn: () => getTeacherAnalytics(auth?.id || ""),
    enabled: !!auth?.id,
  });

  const { data: responsesData, isLoading: responsesLoading } = useQuery({
    queryKey: ["studentResponses", selectedStudent?.attemptId],
    queryFn: () => getStudentResponses(selectedStudent?.attemptId || ""),
    enabled: !!selectedStudent?.attemptId && isDialogOpen,
  });

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading analytics...
      </div>
    );

  if (error) return <div>Error loading analytics</div>;

  const examAvgData =
    data?.averageScores?.map((e: any) => ({
      exam: e.exam_title,
      avg: e.average_score,
    })) || [];

  const studentPerformance =
    data?.attempts?.map((a: any) => ({
      attemptId: a.id,
      studentName: a.student_name,
      exam: a.exam_title,
      score: a.score,
      status: a.status === "completed" ? "Evaluated" : "AI Evaluated",
      aiSummary: "AI evaluated submission",
    })) || [];

  const sortedStudentPerformance = [...studentPerformance].sort(
    (a, b) => b.score - a.score
  );

  const topStudents = sortedStudentPerformance.slice(0, 5);

  const handleViewSubmission = (student: any) => {
    setSelectedStudent(student);
    setIsDialogOpen(true);
  };

  const handleMarksChange = (responseId: string, value: number) => {
    setTeacherMarks((prev) => ({
      ...prev,
      [responseId]: value,
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <DashboardLayout>
        <div className="max-w-6xl">

          <h1 className="text-2xl font-semibold text-foreground mb-6">
            Results & Analytics
          </h1>

          <div className="grid lg:grid-cols-2 gap-6 mb-6">

            <div className="bg-card border border-border rounded-lg p-6 card-shadow">

              <h2 className="text-base font-semibold mb-4">
                Exam Average Scores
              </h2>

              <ResponsiveContainer width="100%" height={240}>

                <BarChart data={examAvgData}>

                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(214,20%,90%)" />

                  <XAxis
                    dataKey="exam"
                    tick={{ fontSize: 11, fill: "hsl(220,10%,46%)" }}
                  />

                  <YAxis
                    tick={{ fontSize: 11, fill: "hsl(220,10%,46%)" }}
                    domain={[0, 100]}
                  />

                  <Tooltip />

                  <Bar
                    dataKey="avg"
                    fill="hsl(217.2,91.2%,51.8%)"
                    radius={[4, 4, 0, 0]}
                  />

                </BarChart>

              </ResponsiveContainer>

            </div>

            <div className="bg-card border border-border rounded-lg p-6 card-shadow">

              <h2 className="text-base font-semibold mb-4">
                Top Performing Students
              </h2>

              <div className="space-y-3">

                {topStudents.map((s, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between border-b pb-2"
                  >
                    <span className="text-sm font-medium">
                      {i + 1}. {s.studentName}
                    </span>

                    <span className="text-sm text-primary font-semibold">
                      {s.score}%
                    </span>
                  </div>
                ))}

              </div>

            </div>

          </div>

          <div className="bg-card border border-border rounded-lg card-shadow overflow-hidden">

            <div className="p-6 pb-3">
              <h2 className="text-base font-semibold">
                Student Performance
              </h2>
            </div>

            <table className="w-full">

              <thead>
                <tr className="border-t border-border">

                  <th className="text-left text-xs px-6 py-3 text-muted-foreground">
                    Student
                  </th>

                  <th className="text-left text-xs px-6 py-3 text-muted-foreground">
                    Exam
                  </th>

                  <th className="text-left text-xs px-6 py-3 text-muted-foreground">
                    Score
                  </th>

                  <th className="text-left text-xs px-6 py-3 text-muted-foreground">
                    Status
                  </th>

                  <th className="text-left text-xs px-6 py-3 text-muted-foreground">
                    AI Summary
                  </th>

                  <th className="text-left text-xs px-6 py-3 text-muted-foreground">
                    Actions
                  </th>

                </tr>
              </thead>

              <tbody>

                {sortedStudentPerformance.map((s, i) => (

                  <tr
                    key={i}
                    className="border-t border-border hover:bg-secondary/50 transition"
                  >

                    <td className="px-6 py-3 text-sm font-medium">
                      {s.studentName}
                    </td>

                    <td className="px-6 py-3 text-sm text-muted-foreground">
                      {s.exam}
                    </td>

                    <td className="px-6 py-3 text-sm font-semibold">
                      {s.score}%
                    </td>

                    <td className="px-6 py-3 text-sm">
                      <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-700">
                        {s.status}
                      </span>
                    </td>

                    <td className="px-6 py-3 text-sm text-muted-foreground">
                      {s.aiSummary}
                    </td>

                    <td className="px-6 py-3">

                      <button
                        onClick={() => handleViewSubmission(s)}
                        className="p-1 hover:bg-secondary rounded"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </div>
      </DashboardLayout>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>

        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">

          <DialogHeader>

            <DialogTitle>
              {selectedStudent?.studentName}'s Submission — {selectedStudent?.exam}
            </DialogTitle>

          </DialogHeader>

          <div className="space-y-5">

            {responsesLoading ? (
              <div>Loading responses...</div>
            ) : Array.isArray(responsesData) && responsesData.length > 0 ? (

              responsesData.map((response: any, index: number) => {

                const currentMarks =
                  teacherMarks[response.id] ?? response.marks_obtained;

                return (

                  <div
                    key={response.id}
                    className="border border-border rounded-lg p-4"
                  >

                    <h3 className="font-medium mb-2">
                      Question {index + 1}
                    </h3>

                    <p className="text-sm text-muted-foreground mb-3">
                      {response.questions.question_text}
                    </p>

                    <div className="space-y-3">

                      <div>
                        <strong>Student Answer</strong>
                        <p className="bg-secondary p-2 rounded mt-1 text-sm">
                          {response.student_answer || "No answer"}
                        </p>
                      </div>

                      <div className="text-xs bg-muted px-2 py-1 rounded inline-block">
                        AI Score: {response.marks_obtained} / {response.questions.marks}
                      </div>

                      <div className="flex items-center gap-3 mt-3">

                        <label className="text-sm font-medium">
                          Teacher Marks
                        </label>

                        <input
                          type="number"
                          min={0}
                          max={response.questions.marks}
                          value={currentMarks}
                          onChange={(e) =>
                            handleMarksChange(response.id, Number(e.target.value))
                          }
                          className="w-20 border rounded px-2 py-1 text-sm"
                        />

                        <span className="text-sm text-muted-foreground">
                          / {response.questions.marks}
                        </span>

                      </div>

                      <button
                        onClick={async () => {
                          try {

                            const marks =
                              teacherMarks[response.id] ?? response.marks_obtained;

                            await updateTeacherMarks(response.id, marks);

                            alert("Marks updated successfully");

                          } catch (err) {

                            console.error(err);
                            alert("Failed to update marks");

                          }
                        }}
                        className="mt-2 px-3 py-1.5 text-sm rounded bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                        Save Marks
                      </button>

                    </div>

                  </div>

                );

              })

            ) : (
              <div>No responses found.</div>
            )}

          </div>

        </DialogContent>

      </Dialog>

    </div>
  );
};

export default TeacherAnalytics;