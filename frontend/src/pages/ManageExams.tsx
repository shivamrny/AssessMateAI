import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import DashboardLayout from "@/components/DashboardLayout";
import { Edit, Trash2, Plus } from "lucide-react";

interface Exam {
  id: string;
  exam_title: string;
  created_at: string;
  duration: number;
  status?: string;
}

const ManageExams = () => {
  const { auth } = useAuth();
  const navigate = useNavigate();

  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  /* ---------------- Route Protection ---------------- */

  useEffect(() => {
    if (!auth?.isLoggedIn || auth?.role !== "teacher") {
      navigate("/auth");
    }
  }, [auth, navigate]);

  /* ---------------- Fetch Exams ---------------- */

  useEffect(() => {
    const fetchExams = async () => {
      if (!auth?.id) return;

      try {
        const { getTeacherExams } = await import("@/lib/api");
        const data = await getTeacherExams(auth.id);
        setExams(data || []);
      } catch (error) {
        console.error("Failed to fetch exams:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, [auth?.id]);

  /* ---------------- Delete Exam ---------------- */

  const deleteExam = async (examId: string) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this exam?\nThis action cannot be undone."
    );

    if (!confirmDelete) return;

    try {
      const { deleteExam } = await import("@/lib/api");
      await deleteExam(examId);

      setExams((prev) => prev.filter((e) => e.id !== examId));
      alert("Exam deleted successfully!");
    } catch (error) {
      console.error("Failed to delete exam:", error);
      alert("Failed to delete exam.");
    }
  };

  /* ---------------- Edit Exam ---------------- */

  const editExam = (examId: string) => {
    navigate(`/teacher-dashboard/edit-exam/${examId}`);
  };

  /* ---------------- Status Color ---------------- */

  const statusColor = (status: string) => {
    if (status === "Active") return "bg-accent text-accent-foreground";
    if (status === "Completed") return "bg-muted text-muted-foreground";
    return "bg-secondary text-secondary-foreground";
  };

  /* ---------------- Loading UI ---------------- */

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <DashboardLayout>
          <div className="max-w-5xl">
            <p className="text-muted-foreground text-sm">
              Loading exams...
            </p>
          </div>
        </DashboardLayout>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <DashboardLayout>
        <div className="max-w-5xl">

          {/* Header */}

          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-semibold text-foreground">
              Manage Exams ({exams.length})
            </h1>

            <button
              onClick={() => navigate("/teacher-dashboard/create-exam")}
              className="flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition"
            >
              <Plus size={16} />
              Create Exam
            </button>
          </div>

          {/* Table */}

          <div className="bg-card border border-border rounded-lg shadow-sm overflow-x-auto">
            <table className="w-full">

              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs font-medium text-muted-foreground px-6 py-3">
                    Title
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-6 py-3">
                    Date Created
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-6 py-3">
                    Duration
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-6 py-3">
                    Status
                  </th>
                  <th className="text-right text-xs font-medium text-muted-foreground px-6 py-3">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>

                {exams.map((exam) => (
                  <tr
                    key={exam.id}
                    className="border-b border-border last:border-0 hover:bg-accent/40 transition-colors"
                  >

                    <td className="px-6 py-3 text-sm font-medium text-foreground">
                      {exam.exam_title}
                    </td>

                    <td className="px-6 py-3 text-sm text-muted-foreground">
                      {new Date(exam.created_at).toLocaleDateString()}
                    </td>

                    <td className="px-6 py-3 text-sm text-muted-foreground">
                      {exam.duration} min
                    </td>

                    <td className="px-6 py-3">
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded-md ${statusColor(
                          exam.status || "Active"
                        )}`}
                      >
                        {exam.status || "Active"}
                      </span>
                    </td>

                    <td className="px-6 py-3 text-right">

                      <div className="flex items-center justify-end gap-2">

                        <button
                          onClick={() => editExam(exam.id)}
                          className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-accent transition"
                        >
                          <Edit size={15} />
                        </button>

                        <button
                          onClick={() => deleteExam(exam.id)}
                          className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition"
                        >
                          <Trash2 size={15} />
                        </button>

                      </div>

                    </td>

                  </tr>
                ))}

                {exams.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-10 text-center text-muted-foreground"
                    >
                      No exams created yet. Click "Create Exam" to get started.
                    </td>
                  </tr>
                )}

              </tbody>
            </table>
          </div>

        </div>
      </DashboardLayout>
    </div>
  );
};

export default ManageExams;