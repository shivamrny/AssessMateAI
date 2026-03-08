import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import AuthModal from "@/components/AuthModal";
import { Brain, Code2, BarChart3 } from "lucide-react";
import { LogoLetter } from "@/components/Logo";

const Index = () => {
  const { auth } = useAuth();
  const navigate = useNavigate();

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);

  /* ---------- Redirect if logged in ---------- */

  useEffect(() => {
    if (auth.isLoggedIn) {
      const path =
        auth.role === "teacher"
          ? "/teacher-dashboard"
          : "/student-dashboard";

      navigate(path);
    }
  }, [auth, navigate]);

  /* ---------- Feature Section ---------- */

  const features = [
    {
      icon: <Brain size={32} className="text-blue-500" />,
      title: "AI-Based Evaluation",
      description:
        "Smart grading powered by AI that delivers fast, accurate, and unbiased evaluation of student performance.",
    },
    {
      icon: <Code2 size={32} className="text-green-500" />,
      title: "Live Coding Support",
      description:
        "Integrated coding environment supporting C, C++, Python, and Java with real-time compilation and test validation.",
    },
    {
      icon: <BarChart3 size={32} className="text-purple-500" />,
      title: "Analytics & Insights",
      description:
        "Visual dashboards that analyze exam performance, identify trends, and provide actionable insights.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-indigo-50">

      <Navbar />

      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] px-6 py-14 space-y-14">

        {/* ---------- Hero Section ---------- */}

        <div className="text-center max-w-4xl">
          <div className="flex items-center justify-center gap-3 mb-6">
            <LogoLetter size={56} className="text-primary" />
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
              AssessMate AI
            </h1>
          </div>

          <p className="text-xl text-muted-foreground leading-relaxed font-medium">
            The Future of AI-Powered Real-Time Examinations & Intelligent
            Assessment
          </p>

          <p className="text-sm text-muted-foreground mt-3">
            Trusted by educators and students for intelligent online
            assessments.
          </p>

        </div>

        {/* ---------- Top CTA ---------- */}

        <button
          onClick={() => setShowLoginModal(true)}
          className="px-8 py-4 text-lg font-semibold rounded-2xl bg-gradient-to-r from-indigo-500 via-blue-500 to-violet-600 text-white shadow-lg hover:shadow-2xl hover:shadow-indigo-500/30 hover:scale-105 transition-all duration-300"
        >
          Login Here
        </button>

        {/* ---------- Features ---------- */}

        <div className="w-full max-w-6xl">

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white/70 backdrop-blur-md border border-gray-200 rounded-2xl p-10 shadow-lg hover:shadow-2xl hover:border-indigo-400 transition-all duration-300 transform hover:-translate-y-2 hover:scale-105"
              >

                <div className="flex justify-center mb-6">
                  <div className="p-4 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full">
                    {feature.icon}
                  </div>
                </div>

                <h3 className="text-2xl font-bold text-center mb-4">
                  {feature.title}
                </h3>

                <p className="text-muted-foreground text-center leading-relaxed">
                  {feature.description}
                </p>

              </div>
            ))}

          </div>

        </div>

        {/* ---------- Bottom CTA ---------- */}

        <div className="w-full max-w-2xl space-y-6 text-center">

          <div>

            <h2 className="text-3xl font-bold mb-3">
              Ready to Transform the Way You Conduct Exams?
            </h2>

            <p className="text-lg text-muted-foreground">
              Empower your institution with AI-powered exams, intelligent
              grading, and real-time performance analytics.
            </p>

          </div>

          <button
            onClick={() => setShowSignupModal(true)}
            className="w-full px-8 py-5 text-xl font-bold rounded-2xl tracking-wide bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-xl hover:shadow-2xl hover:shadow-purple-500/30 transition-all transform hover:scale-105 duration-300"
          >
            Create Your Account Now
          </button>

        </div>

      </div>

      {/* ---------- Auth Modals ---------- */}

      <AuthModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        defaultTab="login"
      />

      <AuthModal
        isOpen={showSignupModal}
        onClose={() => setShowSignupModal(false)}
        defaultTab="signup"
      />

    </div>
  );
};

export default Index;