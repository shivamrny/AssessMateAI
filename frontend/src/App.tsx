import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";

import Index from "./pages/Index";
import TeacherDashboard from "./pages/TeacherDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import CreateExam from "./pages/CreateExam";
import EditExam from "./pages/EditExam";
import ManageExams from "./pages/ManageExams";
import TeacherAnalytics from "./pages/TeacherAnalytics";
import ExamInterface from "./pages/ExamInterface";
import ResultPage from "./pages/ResultPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>

        <Toaster />
        <Sonner />

        <BrowserRouter>
          <Routes>

            {/* Landing Page */}
            <Route path="/" element={<Index />} />

            {/* Teacher Routes */}
            <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
            <Route path="/teacher-dashboard/create-exam" element={<CreateExam />} />
            <Route path="/teacher-dashboard/edit-exam/:examId" element={<EditExam />} />
            <Route path="/teacher-dashboard/manage-exams" element={<ManageExams />} />
            <Route path="/teacher-dashboard/analytics" element={<TeacherAnalytics />} />

            {/* Student Routes */}
            <Route path="/student-dashboard" element={<StudentDashboard />} />
            <Route path="/student-dashboard/exams" element={<StudentDashboard />} />
            <Route path="/student-dashboard/past-exams" element={<StudentDashboard />} />
            <Route path="/student-dashboard/performance" element={<StudentDashboard />} />

            {/* Exam System */}
            <Route path="/exam/:id" element={<ExamInterface />} />
            <Route path="/result/:id" element={<ResultPage />} />

            {/* 404 Page */}
            <Route path="*" element={<NotFound />} />

          </Routes>
        </BrowserRouter>

      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;