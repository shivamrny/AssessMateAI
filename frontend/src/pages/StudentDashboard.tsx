import Navbar from "@/components/Navbar";
import DashboardLayout from "@/components/DashboardLayout";
import DashboardCard from "@/components/DashboardCard";
import { ClipboardList, Trophy, TrendingUp } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  getStudentStats,
  getStudentUpcomingExams,
  getStudentRecentAttempts
} from "@/lib/api";

interface UpcomingExam {
  id: string;
  exam_title: string;
  created_at: string;
  duration: number;
}

interface Attempt {
  id: string;
  score: number;
  attempted_at: string;
  exams?: {
    exam_title: string;
  };
}

const StudentDashboard = () => {

  const navigate = useNavigate();
  const location = useLocation();
  const { auth } = useAuth();

  // Determine active tab from current URL
  const activeTab = location.pathname.includes("past-exams")
    ? "past"
    : location.pathname.includes("exams")
    ? "exams"
    : location.pathname.includes("performance")
    ? "performance"
    : "dashboard";

  const [stats, setStats] = useState({
    averageScore: "0",
    examsAttempted: "0",
    bestScore: "0",
    bestExamName: "N/A"
  });

  const [upcomingExams, setUpcomingExams] = useState<UpcomingExam[]>([]);
  const [recentAttempts, setRecentAttempts] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!auth.isLoggedIn || auth.role !== "student") {
      navigate("/auth");
    }
  }, [auth, navigate]);

  useEffect(() => {

    const fetchData = async () => {

      if (!auth?.id) return;

      try {

        const statsData = await getStudentStats(auth.id).catch(() => null);
        const upcomingData = await getStudentUpcomingExams(auth.id).catch(() => []);
        const attemptsData = await getStudentRecentAttempts(auth.id).catch(() => []);

        setStats({
          averageScore: (statsData?.averageScore || 0).toString(),
          examsAttempted: (statsData?.examsAttempted || 0).toString(),
          bestScore: (statsData?.bestScore || 0).toString(),
          bestExamName: statsData?.bestExamName || "N/A"
        });

        setUpcomingExams(upcomingData || []);
        setRecentAttempts(attemptsData || []);

      } catch (err) {

        console.error("Dashboard fetch error:", err);
        setError("Unable to load dashboard data.");

      } finally {

        setLoading(false);

      }
    };

    fetchData();

  }, [auth?.id]);

  const score = parseInt(stats.averageScore);

  let badge = "Needs Practice";
  if (score >= 85) badge = "Top Performer";
  else if (score >= 70) badge = "Good Progress";
  else if (score >= 50) badge = "Improving";

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <DashboardLayout>
          <div className="max-w-6xl animate-pulse">
            <div className="h-8 bg-muted rounded mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-28 bg-muted rounded-lg"></div>
              ))}
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="h-64 bg-muted rounded-lg"></div>
              <div className="h-64 bg-muted rounded-lg"></div>
            </div>
          </div>
        </DashboardLayout>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <DashboardLayout>
        <div className="max-w-6xl">

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded mb-6 text-sm">
              {error}
            </div>
          )}

          {/* ─── DASHBOARD TAB ─────────────────────────────────────── */}
          {activeTab === "dashboard" && (
            <>
              <h1 className="text-2xl font-semibold text-foreground mb-1">
                Welcome to AssessMate, {auth.name} 👋
              </h1>
              <p className="text-sm text-muted-foreground mb-6">
                Track your exam performance and start upcoming tests.
              </p>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <DashboardCard
                  title="Average Score"
                  value={`${stats.averageScore}%`}
                  icon={<TrendingUp size={20} />}
                />
                <DashboardCard
                  title="Exams Attempted"
                  value={stats.examsAttempted}
                  icon={<ClipboardList size={20} />}
                />
                <DashboardCard
                  title="Best Score"
                  value={`${stats.bestScore}%`}
                  subtitle={stats.bestExamName}
                  icon={<Trophy size={20} />}
                />
              </div>

              {/* Progress Bar */}
              <div className="bg-card border border-border rounded-lg p-6 mb-8 transition-all duration-300 hover:-translate-y-1">
                <h2 className="text-base font-semibold text-foreground mb-3">
                  Overall Progress
                </h2>
                <div className="w-full bg-muted rounded-full h-3">
                  <div
                    className="bg-primary h-3 rounded-full transition-all"
                    style={{ width: `${stats.averageScore}%` }}
                  ></div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Performance Level:
                  <span className="font-semibold text-primary ml-1">{badge}</span>
                </p>
              </div>

              {/* Upcoming + Recent */}
              <div className="grid md:grid-cols-2 gap-6">

                <div className="bg-card border border-border rounded-lg p-6 transition-all hover:shadow-lg">
                  <h2 className="text-base font-semibold text-foreground mb-4">
                    Upcoming Exams
                  </h2>
                  {upcomingExams.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No upcoming exams available
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {upcomingExams.map((exam) => (
                        <div
                          key={exam.id}
                          className="flex items-center justify-between p-3 rounded-md bg-background border border-border hover:border-primary/40 transition"
                        >
                          <div>
                            <p className="text-sm font-medium text-foreground">{exam.exam_title}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(exam.created_at).toLocaleDateString()} · {exam.duration} min
                            </p>
                          </div>
                          <button
                            onClick={() => navigate(`/exam/${exam.id}`)}
                            className="text-xs px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition"
                          >
                            Start Exam →
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-card border border-border rounded-lg p-6 transition-all hover:shadow-lg">
                  <h2 className="text-base font-semibold text-foreground mb-4">
                    Recently Attempted
                  </h2>
                  {recentAttempts.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No recent attempts
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {recentAttempts.map((attempt) => (
                        <div
                          key={attempt.id}
                          className="flex items-center justify-between p-3 rounded-md bg-background border border-border hover:border-primary/40 transition"
                        >
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {attempt.exams?.exam_title || "Exam"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(attempt.attempted_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-foreground">
                              {attempt.score}%
                            </span>
                            <button
                              onClick={() => navigate(`/result/${attempt.id}`)}
                              className="text-xs px-3 py-1.5 rounded-md border border-border hover:bg-secondary transition"
                            >
                              View
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </>
          )}

          {/* ─── AVAILABLE EXAMS TAB ───────────────────────────────── */}
          {activeTab === "exams" && (
            <>
              <h1 className="text-2xl font-semibold text-foreground mb-1">
                Available Exams
              </h1>
              <p className="text-sm text-muted-foreground mb-6">
                Browse and start any exam assigned to you.
              </p>

              <div className="bg-card border border-border rounded-lg p-6">
                {upcomingExams.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No exams available right now.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {upcomingExams.map((exam) => (
                      <div
                        key={exam.id}
                        className="flex items-center justify-between p-4 rounded-md bg-background border border-border hover:border-primary/40 transition"
                      >
                        <div>
                          <p className="text-sm font-medium text-foreground">{exam.exam_title}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(exam.created_at).toLocaleDateString()} · {exam.duration} min
                          </p>
                        </div>
                        <button
                          onClick={() => navigate(`/exam/${exam.id}`)}
                          className="text-xs px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition"
                        >
                          Start Exam →
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* ─── PAST EXAMS TAB ────────────────────────────────────── */}
          {activeTab === "past" && (
            <>
              <h1 className="text-2xl font-semibold text-foreground mb-1">
                Past Exams
              </h1>
              <p className="text-sm text-muted-foreground mb-6">
                Review your previously attempted exams and results.
              </p>

              <div className="bg-card border border-border rounded-lg p-6">
                {recentAttempts.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    You haven't attempted any exams yet.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {recentAttempts.map((attempt) => (
                      <div
                        key={attempt.id}
                        className="flex items-center justify-between p-4 rounded-md bg-background border border-border hover:border-primary/40 transition"
                      >
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {attempt.exams?.exam_title || "Exam"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(attempt.attempted_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span
                            className={`text-sm font-semibold ${
                              attempt.score >= 70
                                ? "text-green-600"
                                : attempt.score >= 50
                                ? "text-yellow-600"
                                : "text-red-500"
                            }`}
                          >
                            {attempt.score}%
                          </span>
                          <button
                            onClick={() => navigate(`/result/${attempt.id}`)}
                            className="text-xs px-3 py-1.5 rounded-md border border-border hover:bg-secondary transition"
                          >
                            View Result
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* ─── PERFORMANCE REPORT TAB ────────────────────────────── */}
          {activeTab === "performance" && (
            <>
              <h1 className="text-2xl font-semibold text-foreground mb-1">
                Performance Report
              </h1>
              <p className="text-sm text-muted-foreground mb-6">
                A detailed breakdown of your academic performance.
              </p>

              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center p-6 bg-card border border-border rounded-lg">
                  <p className="text-3xl font-bold text-primary">{stats.examsAttempted}</p>
                  <p className="text-sm text-muted-foreground mt-1">Exams Attempted</p>
                </div>
                <div className="text-center p-6 bg-card border border-border rounded-lg">
                  <p className="text-3xl font-bold text-primary">{stats.averageScore}%</p>
                  <p className="text-sm text-muted-foreground mt-1">Average Score</p>
                </div>
                <div className="text-center p-6 bg-card border border-border rounded-lg">
                  <p className="text-3xl font-bold text-primary">{stats.bestScore}%</p>
                  <p className="text-sm text-muted-foreground mt-1">Best Score</p>
                  <p className="text-xs text-muted-foreground">{stats.bestExamName}</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="bg-card border border-border rounded-lg p-6 mb-8">
                <h2 className="text-base font-semibold text-foreground mb-3">
                  Overall Progress
                </h2>
                <div className="w-full bg-muted rounded-full h-4">
                  <div
                    className="bg-primary h-4 rounded-full transition-all"
                    style={{ width: `${stats.averageScore}%` }}
                  ></div>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Performance Level:
                  <span className="font-semibold text-primary ml-1">{badge}</span>
                </p>
              </div>

              {/* Attempt History Table */}
              {recentAttempts.length > 0 && (
                <div className="bg-card border border-border rounded-lg overflow-hidden">
                  <div className="p-6 pb-3">
                    <h2 className="text-base font-semibold">Attempt History</h2>
                  </div>
                  <table className="w-full">
                    <thead>
                      <tr className="border-t border-border">
                        <th className="text-left text-xs px-6 py-3 text-muted-foreground">Exam</th>
                        <th className="text-left text-xs px-6 py-3 text-muted-foreground">Date</th>
                        <th className="text-left text-xs px-6 py-3 text-muted-foreground">Score</th>
                        <th className="text-left text-xs px-6 py-3 text-muted-foreground">Result</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentAttempts.map((attempt) => (
                        <tr
                          key={attempt.id}
                          className="border-t border-border hover:bg-secondary/50 transition"
                        >
                          <td className="px-6 py-3 text-sm font-medium">
                            {attempt.exams?.exam_title || "Exam"}
                          </td>
                          <td className="px-6 py-3 text-sm text-muted-foreground">
                            {new Date(attempt.attempted_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-3 text-sm font-semibold">
                            {attempt.score}%
                          </td>
                          <td className="px-6 py-3">
                            <button
                              onClick={() => navigate(`/result/${attempt.id}`)}
                              className="text-xs px-3 py-1.5 rounded-md border border-border hover:bg-secondary transition"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

        </div>
      </DashboardLayout>
    </div>
  );

};

export default StudentDashboard;