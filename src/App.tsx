import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { SocketProvider } from "@/contexts/SocketContext";
import LoadingScreen from "./components/LoadingScreen";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Jobs from "./pages/Jobs";
import JobPost from "./pages/JobPost";
import JobDetail from "./pages/JobDetail";
import Applications from "./pages/Applications";
import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";
import CourseLearn from "./pages/CourseLearn";
import CreateCourse from "./pages/CreateCourse";
import Notifications from "./pages/Notifications";
import WorkerProfile from "./pages/WorkerProfile";
import ProfileEdit from "./pages/ProfileEdit";
import StudentDashboard from "./pages/StudentDashboard";
import MyApplications from "./pages/MyApplications";
import MentorAnalytics from "./pages/MentorAnalytics";
import Admin from "./pages/Admin";
import TestFileUpload from "./pages/TestFileUpload";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate initial load time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SocketProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
            <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/jobs/new" element={<JobPost />} />
            <Route path="/jobs/:id" element={<JobDetail />} />
            <Route path="/applications" element={<Applications />} />
            <Route path="/my-applications" element={<MyApplications />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/courses/new" element={<CreateCourse />} />
            <Route path="/courses/:id" element={<CourseDetail />} />
            <Route path="/courses/:id/learn" element={<CourseLearn />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/profile/:id" element={<WorkerProfile />} />
            <Route path="/profile/edit" element={<ProfileEdit />} />
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/mentor/analytics" element={<MentorAnalytics />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/test-upload" element={<TestFileUpload />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
        </SocketProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
