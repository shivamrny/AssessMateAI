/* ================= AUTH ================= */

export interface LoginResponse {
  id: string;
  email: string;
  role: string;
  name: string;
}

export async function login(email: string, password: string) {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    let text: string;

    try {
      const obj = await res.json();
      text = obj.error || obj.message || JSON.stringify(obj);
    } catch {
      text = await res.text().catch(() => "unknown");
    }

    throw new Error(`Login failed (${res.status}): ${text}`);
  }

  return res.json();
}

/* ================= SIGNUP ================= */

export async function signup(data: {
  role: string;
  name?: string;
  email: string;
  password: string;
  rollNumber?: string;
  branch?: string;
  university?: string;
  employeeCode?: string;
}) {
  const res = await fetch("/api/auth/signup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    let text: string;

    try {
      const obj = await res.json();
      text = obj.error || obj.message || JSON.stringify(obj);
    } catch {
      text = await res.text().catch(() => "unknown");
    }

    throw new Error(`Signup failed (${res.status}): ${text}`);
  }

  return res.json();
}

/* ================= EXAMS ================= */

export async function getExams() {
  const res = await fetch("/api/exams");

  if (!res.ok) {
    throw new Error("Failed to fetch exams");
  }

  return res.json();
}

export async function createExam(exam: any) {
  const res = await fetch("/api/exams", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(exam),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(errorData.error || "Failed to create exam");
  }

  const data = await res.json();

  return Array.isArray(data) ? data : [data];
}

/* ================= DELETE EXAM ================= */

export async function deleteExam(examId: string) {
  const res = await fetch(`/api/exams/${examId}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: "Failed to delete exam" }));
    throw new Error(errorData.error || "Failed to delete exam");
  }

  return res.json();
}

/* ================= TEACHER APIs ================= */

export async function getTeacherStats(teacherId: string) {
  const res = await fetch(`/api/teacher/stats/${teacherId}`);

  if (!res.ok) {
    throw new Error("Failed to fetch teacher stats");
  }

  return res.json();
}

export async function getTeacherExams(teacherId: string) {
  const res = await fetch(`/api/teacher/exams/${teacherId}`);

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Failed to fetch teacher exams" }));
    throw new Error(err.error || "Failed to fetch teacher exams");
  }

  return res.json();
}

export async function getTeacherAnalytics(teacherId: string) {
  const res = await fetch(`/api/teacher/analytics/${teacherId}`);

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Failed to fetch teacher analytics" }));
    throw new Error(err.error || "Failed to fetch teacher analytics");
  }

  return res.json();
}

/* ================= DASHBOARD ================= */

export async function getTeacherDashboard(teacherId: string) {
  const res = await fetch(`/api/teacher/dashboard/${teacherId}`);

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Failed to fetch teacher dashboard" }));
    throw new Error(err.error || "Failed to fetch teacher dashboard");
  }

  return res.json();
}

/* ================= STUDENT APIs ================= */

export async function getStudentStats(studentId: string) {
  const res = await fetch(`/api/student/stats/${studentId}`);

  if (!res.ok) {
    throw new Error("Failed to fetch student stats");
  }

  return res.json();
}

export async function getStudentUpcomingExams(studentId: string) {
  const res = await fetch(`/api/student/upcoming-exams/${studentId}`);

  if (!res.ok) {
    throw new Error("Failed to fetch upcoming exams");
  }

  return res.json();
}

export async function getStudentRecentAttempts(studentId: string) {
  const res = await fetch(`/api/student/recent-attempts/${studentId}`);

  if (!res.ok) {
    throw new Error("Failed to fetch recent attempts");
  }

  return res.json();
}

/* ================= FIXED FUNCTION ================= */

export async function getStudentResponses(attemptId: string) {
  const res = await fetch(`/api/exam-attempts/${attemptId}/responses`);

  if (!res.ok) {
    throw new Error("Failed to fetch student responses");
  }

  return res.json();
}

/* ================= EXAM QUESTIONS ================= */

export async function getExamWithQuestions(examId: string) {
  const res = await fetch(`/api/exams/${examId}/with-questions`);

  if (!res.ok) {
    throw new Error("Failed to fetch exam with questions");
  }

  return res.json();
}

/* ================= EXAM ATTEMPTS ================= */

export async function createExamAttempt(studentId: string, examId: string) {
  const res = await fetch("/api/exam-attempts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      student_id: studentId,
      exam_id: examId,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: "Failed to create exam attempt" }));
    throw new Error(errorData.error || "Failed to create exam attempt");
  }

  return res.json();
}

export async function saveStudentResponse(
  examAttemptId: string,
  questionId: string,
  studentAnswer: string
) {
  const res = await fetch("/api/student-responses", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      exam_attempt_id: examAttemptId,
      question_id: questionId,
      student_answer: studentAnswer,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: "Failed to save response" }));
    throw new Error(errorData.error || "Failed to save response");
  }

  return res.json();
}

export async function completeExamAttempt(
  attemptId: string,
  score: number,
  status: string
) {
  const res = await fetch(`/api/exam-attempts/${attemptId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ score, status }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: "Failed to complete exam" }));
    throw new Error(errorData.error || "Failed to complete exam");
  }

  return res.json();
}

export async function getExamAttempt(attemptId: string) {
  const res = await fetch(`/api/exam-attempts/${attemptId}`);

  if (!res.ok) {
    throw new Error("Failed to fetch exam attempt");
  }

  return res.json();
}

export async function getExamAttemptResponses(attemptId: string) {
  const res = await fetch(`/api/exam-attempts/${attemptId}/responses`);

  if (!res.ok) {
    throw new Error("Failed to fetch responses");
  }

  return res.json();
}
export async function updateTeacherMarks(responseId: string, marks: number) {

  const res = await fetch(`/api/exam-attempts/responses/${responseId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ marks }),
  });

  if (!res.ok) {
    throw new Error("Failed to update marks");
  }

  return res.json();
}