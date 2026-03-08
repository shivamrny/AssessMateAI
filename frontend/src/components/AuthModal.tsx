import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, UserRole } from '@/context/AuthContext';
import { X } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'login' | 'signup';
}

const AuthModal = ({ isOpen, onClose, defaultTab = 'login' }: AuthModalProps) => {
  const navigate = useNavigate();
  const { login, auth } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLogin, setIsLogin] = useState(defaultTab === 'login');
  const [role, setRole] = useState<UserRole>('student');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    rollNumber: '',
    branch: '',
    university: '',
    employeeCode: '',
  });

  if (!isOpen) return null;

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (isLogin) {
        if (!formData.email || !formData.password) {
          throw new Error('Email and password are required');
        }
        const loginResponse = await import('@/lib/api').then((mod) =>
          mod.login(formData.email, formData.password)
        );
        console.log('loginResponse (login):', loginResponse);
        await login(formData.email, formData.password, role);
        onClose();
        // Redirect based on actual backend response role - use navigate to keep context alive
        setTimeout(() => {
          const redirectPath = (loginResponse.role === 'teacher' ? '/teacher-dashboard' : '/student-dashboard');
          console.log('Backend role:', loginResponse.role, 'Redirecting to:', redirectPath);
          navigate(redirectPath);
        }, 150);
      } else {
        // Signup
        const signupData = {
          role,
          email: formData.email,
          password: formData.password,
          name: formData.name,
          rollNumber: role === 'student' ? formData.rollNumber : undefined,
          branch: role === 'student' ? formData.branch : undefined,
          university: role === 'teacher' ? formData.university : undefined,
          employeeCode: role === 'teacher' ? formData.employeeCode : undefined,
        };
        await import('@/lib/api').then((mod) => mod.signup(signupData));
        // After signup, log the user in automatically
        const loginResponse = await import('@/lib/api').then((mod) =>
          mod.login(formData.email, formData.password)
        );
        console.log('loginResponse (after signup):', loginResponse);
        await login(formData.email, formData.password, role);
        onClose();
        // Redirect based on actual backend response role - use navigate to keep context alive
        setTimeout(() => {
          const redirectPath = (loginResponse.role === 'teacher' ? '/teacher-dashboard' : '/student-dashboard');
          console.log('Backend role after signup:', loginResponse.role, 'Redirecting to:', redirectPath);
          navigate(redirectPath);
        }, 150);
      }
      setFormData({
        email: '',
        password: '',
        name: '',
        rollNumber: '',
        branch: '',
        university: '',
        employeeCode: '',
      });
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    }
  };

  const roles: { value: UserRole; label: string }[] = [
    { value: 'student', label: 'Student' },
    { value: 'teacher', label: 'Teacher' },
  ];

  const branches = ['CSE', 'IT', 'CYBERSECURITY', 'AIML', 'AIDS', 'ECE'];
  const universities = ['CGC University', 'MIT', 'IIT Patna', 'Galgotia University', 'LPU'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-card rounded-lg w-full max-w-sm p-4 shadow-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-3 sticky top-0 bg-card py-2 -mx-4 px-4 border-b border-border">
          <h2 className="text-base font-semibold text-foreground">
            {isLogin ? 'Login' : 'Register'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-red-500/20 transition-colors flex-shrink-0 ml-2"
          >
            <X size={24} className="text-red-500" />
          </button>
        </div>

        {/* Role Selection */}
        <div className="mb-2.5">
          <label className="block text-xs font-medium text-foreground mb-1">
            {isLogin ? 'Login as:' : 'Register as:'}
          </label>
          <div className="flex gap-2">
            {roles.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => setRole(r.value)}
                className={`flex-1 px-2 py-1.5 text-xs font-medium rounded-md border transition-colors ${
                  role === r.value
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background text-muted-foreground border-border hover:border-primary/40'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-2">
          {!isLogin && (
            <>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-primary transition-colors"
                  placeholder="Full Name"
                  required
                />
              </div>

              {role === 'student' && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">
                      Roll Number
                    </label>
                    <input
                      type="text"
                      value={formData.rollNumber}
                      onChange={(e) => handleInputChange('rollNumber', e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-primary transition-colors"
                      placeholder="Roll Number"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">
                      Branch
                    </label>
                    <select
                      value={formData.branch}
                      onChange={(e) => handleInputChange('branch', e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-primary transition-colors"
                      required
                    >
                      <option value="">Select Branch</option>
                      {branches.map(branch => (
                        <option key={branch} value={branch}>{branch}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {role === 'teacher' && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">
                      University
                    </label>
                    <select
                      value={formData.university}
                      onChange={(e) => handleInputChange('university', e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-primary transition-colors"
                      required
                    >
                      <option value="">Select University</option>
                      {universities.map(uni => (
                        <option key={uni} value={uni}>{uni}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">
                      Employee Code
                    </label>
                    <input
                      type="text"
                      value={formData.employeeCode}
                      onChange={(e) => handleInputChange('employeeCode', e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-primary transition-colors"
                      placeholder="Employee Code"
                      required
                    />
                  </div>
                </>
              )}
            </>
          )}

          <div>
            <label className="block text-xs font-medium text-foreground mb-1">
              {role === 'student' ? 'College Email' : 'Official Email'}
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-primary transition-colors"
              placeholder={role === 'student' ? 'you@college.edu' : 'you@university.edu'}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground mb-1">
              Password
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-primary transition-colors"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-1.5 text-xs font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            {isLogin ? 'Login' : 'Register'}
          </button>
          {error && (
            <p className="text-xs text-red-500 mt-1">{error}</p>
          )}

          <p className="text-center text-xs text-muted-foreground pt-1">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary font-medium hover:underline"
            >
              {isLogin ? 'Register' : 'Login'}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
};

export default AuthModal;
