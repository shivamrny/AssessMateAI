import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import DashboardLayout from "@/components/DashboardLayout";
import DashboardCard from "@/components/DashboardCard";
import {
  ClipboardList,
  BookOpen,
  Users,
  TrendingUp,
  Edit,
  Trash2,
  Plus
} from "lucide-react";

import { getTeacherDashboard, deleteExam } from "@/lib/api";

interface Exam {
  id: string;
  exam_title: string;
  created_at: string;
  duration: number;
}

interface Stats {
  totalExams: number;
  totalQuestions: number;
  totalStudentsAttempted: number;
  activeExams: number;
}

const TeacherDashboard = () => {
  const { auth } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState<Stats>({
    totalExams: 0,
    totalQuestions: 0,
    totalStudentsAttempted: 0,
    activeExams: 0
  });

  const [recentExams, setRecentExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  /* ---------- Route Protection ---------- */

  useEffect(() => {
    if (!auth?.isLoggedIn || auth?.role !== "teacher") {
      navigate("/auth");
    }
  }, [auth, navigate]);

  /* ---------- Fetch Dashboard Data ---------- */

  useEffect(() => {

    const fetchDashboard = async () => {

      if (!auth?.id) return;

      try {

        const data = await getTeacherDashboard(auth.id);

        setStats(data.stats || {
          totalExams: 0,
          totalQuestions: 0,
          totalStudentsAttempted: 0,
          activeExams: 0
        });

        setRecentExams(data.exams || []);

      } catch (error) {
        console.error("Dashboard fetch error:", error);
      } finally {
        setLoading(false);
      }

    };

    fetchDashboard();

  }, [auth?.id]);

  /* ---------- Delete Exam ---------- */

  const handleDelete = async (examId: string) => {
    if (!confirm("Are you sure you want to delete this exam?")) return;

    try {

      await deleteExam(examId);

      setRecentExams((prev) => prev.filter((e) => e.id !== examId));

      setStats((prev) => ({
        ...prev,
        totalExams: Math.max(0, prev.totalExams - 1),
        activeExams: Math.max(0, prev.activeExams - 1)
      }));

      alert("Exam deleted successfully!");

    } catch (error) {
      console.error("Delete exam error:", error);
      alert("Failed to delete exam.");
    }
  };

  /* ---------- Loading UI ---------- */

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <DashboardLayout>
          <div className="animate-pulse max-w-6xl space-y-6">
            <div className="h-8 bg-muted rounded w-1/3"></div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-muted rounded"></div>
              ))}
            </div>

            <div className="h-64 bg-muted rounded"></div>
          </div>
        </DashboardLayout>
      </div>
    );
  }

  /* ---------- New Teacher (Empty State) ---------- */

  if (recentExams.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />

        <DashboardLayout>
          <div className="flex flex-col items-center justify-center py-24 text-center">

            <h1 className="text-4xl font-bold mb-4">
              Welcome to AssessMate AI 👋
            </h1>

            <p className="text-muted-foreground mb-2">
              Hello, {auth?.name || "Teacher"}!
            </p>

            <p className="text-muted-foreground max-w-lg mb-8">
              Create your first exam to start evaluating students using
              AI-powered assessment tools.
            </p>

            <button
              onClick={() => navigate("/teacher-dashboard/create-exam")}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90"
            >
              <Plus size={18} />
              Create Your First Exam
            </button>

          </div>
        </DashboardLayout>
      </div>
    );
  }

  /* ---------- Existing Teacher Dashboard ---------- */

  return (
    <div className="min-h-screen bg-background">

      <Navbar />

      <DashboardLayout>

        <div className="max-w-6xl">

          <div className="mb-6">
            <h1 className="text-2xl font-semibold">
              Welcome back, {auth?.name || "Teacher"} 👋
            </h1>

            <p className="text-muted-foreground text-sm">
              Here's an overview of your exams and student performance.
            </p>
          </div>

          <div className="flex justify-end mb-6">
            <button
              onClick={() => navigate("/teacher-dashboard/create-exam")}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
            >
              <Plus size={18} />
              Create Exam
            </button>
          </div>

          {/* Stats */}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">

            <DashboardCard
              title="Total Exams"
              value={stats.totalExams.toString()}
              icon={<ClipboardList size={20} />}
              subtitle={`${stats.activeExams} active`}
            />

            <DashboardCard
              title="Total Questions"
              value={stats.totalQuestions.toString()}
              icon={<BookOpen size={20} />}
            />

            <DashboardCard
              title="Students Attempted"
              value={stats.totalStudentsAttempted.toString()}
              icon={<Users size={20} />}
            />

            <DashboardCard
              title="Active Exams"
              value={stats.activeExams.toString()}
              icon={<TrendingUp size={20} />}
            />

          </div>

          {/* Exams Table */}

          <div className="bg-card border rounded-lg overflow-x-auto">

            <div className="p-6 pb-3">
              <h2 className="font-semibold">Recent Exams</h2>
            </div>

            <table className="w-full">

              <thead>
                <tr className="border-t">
                  <th className="text-left px-6 py-3 text-xs">Exam Title</th>
                  <th className="text-left px-6 py-3 text-xs">Date Created</th>
                  <th className="text-left px-6 py-3 text-xs">Duration</th>
                  <th className="text-left px-6 py-3 text-xs">Status</th>
                  <th className="text-center px-6 py-3 text-xs">Actions</th>
                </tr>
              </thead>

              <tbody>

                {recentExams.map((exam) => (

                  <tr key={exam.id} className="border-t hover:bg-secondary/40">

                    <td className="px-6 py-3">{exam.exam_title}</td>

                    <td className="px-6 py-3 text-muted-foreground">
                      {new Date(exam.created_at).toLocaleDateString()}
                    </td>

                    <td className="px-6 py-3 text-muted-foreground">
                      {exam.duration} min
                    </td>

                    <td className="px-6 py-3">
                      <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-800">
                        Active
                      </span>
                    </td>

                    <td className="px-6 py-3">

                      <div className="flex justify-center gap-2">

                        <button
                          onClick={() =>
                            navigate(`/teacher-dashboard/edit-exam/${exam.id}`)
                          }
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <Edit size={16} />
                        </button>

                        <button
                          onClick={() => handleDelete(exam.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 size={16} />
                        </button>

                      </div>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </div>

      </DashboardLayout>

    </div>
  );
};

export default TeacherDashboard;