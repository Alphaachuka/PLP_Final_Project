import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { NotificationBell } from "@/components/NotificationBell";
import UpliftLogo from "@/components/UpliftLogo";
import { 
  Briefcase, 
  GraduationCap, 
  Wallet, 
  User,
  LogOut,
  Plus,
  TrendingUp,
  BookOpen
} from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const [walletBalance, setWalletBalance] = useState(0);
  const [mentorStats, setMentorStats] = useState({ totalCourses: 0, totalStudents: 0 });
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, profile, isLoading, logout } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/auth");
      return;
    }

    if (user) {
      fetchWalletData();
      if (user.roles.includes('mentor')) {
        fetchMentorStats();
      }
    }
  }, [user, isLoading, navigate]);

  const fetchWalletData = async () => {
    try {
      const walletData = await api.getWallet();
      if (walletData) {
        setWalletBalance(walletData.balance || 0);
      }
    } catch (error) {
      console.error("Error fetching wallet data:", error);
    }
  };

  const fetchMentorStats = async () => {
    try {
      const courses = await api.getMyCourses();
      const totalCourses = courses.length;
      const totalStudents = courses.reduce((sum, course) => sum + (course.enrollmentCount || 0), 0);
      setMentorStats({ totalCourses, totalStudents });
    } catch (error) {
      console.error("Error fetching mentor stats:", error);
    }
  };

  const handleSignOut = async () => {
    logout();
    navigate("/auth");
    toast({
      title: "Signed out successfully",
      description: "Come back soon!"
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || !profile) {
    return null;
  }

  const hasRole = (role: string) => user.roles.includes(role);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <UpliftLogo to="/" size="md" showText={true} />
          <div className="flex items-center gap-4">
            <NotificationBell />
            <div className="text-right hidden sm:block">
              <p className="font-semibold">{profile.fullName}</p>
              <p className="text-sm text-muted-foreground">
                {user.roles.map(r => r.charAt(0).toUpperCase() + r.slice(1)).join(", ")}
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={handleSignOut}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Welcome back, {profile.fullName}!</h1>
          <p className="text-muted-foreground">Here's what's happening with your account</p>
        </div>

        {/* Wallet Card */}
        <Card className="p-6 mb-8 bg-gradient-hero text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 mb-1">Wallet Balance</p>
              <p className="text-4xl font-bold">KES {walletBalance.toLocaleString()}</p>
            </div>
            <Wallet className="h-16 w-16 text-white/50" />
          </div>
        </Card>

        {/* Role-based Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {hasRole("admin") && (
            <Card className="p-6 hover:shadow-card transition-all border-primary">
              <div className="flex items-center justify-between mb-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <span className="text-xs font-semibold text-primary">ADMIN</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">Admin Panel</h3>
              <p className="text-sm text-muted-foreground mb-4">Manage users, jobs, and courses</p>
              <Button asChild className="w-full">
                <Link to="/admin">Open Admin Panel</Link>
              </Button>
            </Card>
          )}

          {hasRole("worker") && (
            <>
              <Card className="p-6 hover:shadow-card transition-all">
                <User className="h-10 w-10 text-primary mb-4" />
                <h3 className="font-semibold text-lg mb-2">My Profile</h3>
                <p className="text-sm text-muted-foreground mb-4">Update your skills and experience</p>
                <div className="space-y-2">
                  <Button asChild className="w-full">
                    <Link to="/profile/edit">Edit Profile</Link>
                  </Button>
                  <Button asChild className="w-full" variant="outline">
                    <Link to={`/profile/${user.id}`}>View Public Profile</Link>
                  </Button>
                </div>
              </Card>

              <Card className="p-6 hover:shadow-card transition-all">
                <Briefcase className="h-10 w-10 text-secondary mb-4" />
                <h3 className="font-semibold text-lg mb-2">Find Jobs</h3>
                <p className="text-sm text-muted-foreground mb-4">Browse available micro-jobs near you</p>
                <Button asChild className="w-full">
                  <Link to="/jobs">Browse Jobs</Link>
                </Button>
              </Card>

              <Card className="p-6 hover:shadow-card transition-all">
                <Briefcase className="h-10 w-10 text-info mb-4" />
                <h3 className="font-semibold text-lg mb-2">My Applications</h3>
                <p className="text-sm text-muted-foreground mb-4">View your job applications</p>
                <Button asChild className="w-full" variant="outline">
                  <Link to="/my-applications">View Applications</Link>
                </Button>
              </Card>
            </>
          )}

          {hasRole("employer") && (
            <>
              <Card className="p-6 hover:shadow-card transition-all">
                <Plus className="h-10 w-10 text-secondary mb-4" />
                <h3 className="font-semibold text-lg mb-2">Post a Job</h3>
                <p className="text-sm text-muted-foreground mb-4">Create a new task for workers</p>
                <Button asChild className="w-full" variant="secondary">
                  <Link to="/jobs/new">Post Job</Link>
                </Button>
              </Card>

              <Card className="p-6 hover:shadow-card transition-all">
                <Briefcase className="h-10 w-10 text-info mb-4" />
                <h3 className="font-semibold text-lg mb-2">Applications</h3>
                <p className="text-sm text-muted-foreground mb-4">Review worker applications</p>
                <Button asChild className="w-full" variant="outline">
                  <Link to="/applications">View Applications</Link>
                </Button>
              </Card>
            </>
          )}

          {hasRole("student") && (
            <>
              <Card className="p-6 hover:shadow-card transition-all">
                <GraduationCap className="h-10 w-10 text-accent mb-4" />
                <h3 className="font-semibold text-lg mb-2">My Learning</h3>
                <p className="text-sm text-muted-foreground mb-4">Track progress and certificates</p>
                <Button asChild className="w-full">
                  <Link to="/student/dashboard">Student Dashboard</Link>
                </Button>
              </Card>

              <Card className="p-6 hover:shadow-card transition-all">
                <BookOpen className="h-10 w-10 text-info mb-4" />
                <h3 className="font-semibold text-lg mb-2">Browse Courses</h3>
                <p className="text-sm text-muted-foreground mb-4">Discover new learning opportunities</p>
                <Button asChild className="w-full" variant="outline">
                  <Link to="/courses">View All Courses</Link>
                </Button>
              </Card>
            </>
          )}

          {hasRole("mentor") && (
            <>
              <Card className="p-6 hover:shadow-card transition-all border-accent">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
                    <Plus className="h-6 w-6 text-accent" />
                  </div>
                  <span className="text-xs font-semibold text-accent">MENTOR</span>
                </div>
                <h3 className="font-semibold text-lg mb-2">Create New Course</h3>
                <p className="text-sm text-muted-foreground mb-4">Share your expertise and help others learn</p>
                <Button asChild className="w-full">
                  <Link to="/courses/new">Create Course</Link>
                </Button>
              </Card>

              <Card className="p-6 hover:shadow-card transition-all">
                <BookOpen className="h-10 w-10 text-primary mb-4" />
                <h3 className="font-semibold text-lg mb-2">My Courses</h3>
                <p className="text-sm text-muted-foreground mb-4">Manage and view your published courses</p>
                <Button asChild className="w-full" variant="outline">
                  <Link to="/courses?mentor=true">View My Courses</Link>
                </Button>
              </Card>

              <Card className="p-6 hover:shadow-card transition-all">
                <TrendingUp className="h-10 w-10 text-secondary mb-4" />
                <h3 className="font-semibold text-lg mb-2">Course Analytics</h3>
                <p className="text-sm text-muted-foreground mb-4">Track student enrollment and progress</p>
                <Button asChild className="w-full" variant="secondary">
                  <Link to="/mentor/analytics">View Analytics</Link>
                </Button>
              </Card>
            </>
          )}
        </div>

        {/* Recent Activity Sections */}
        <div className="grid md:grid-cols-2 gap-6">
          {(hasRole("worker") || hasRole("employer")) && (
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary" />
                Recent Jobs
              </h3>
              <p className="text-muted-foreground text-sm">
                No recent activity yet. {hasRole("worker") ? "Start applying to jobs!" : "Post your first job!"}
              </p>
            </Card>
          )}

          {hasRole("student") && (
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-accent" />
                My Learning Progress
              </h3>
              <p className="text-muted-foreground text-sm">
                No enrolled courses yet. Enroll in your first course to start learning!
              </p>
            </Card>
          )}

          {hasRole("mentor") && (
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-accent" />
                Course Management
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div>
                    <p className="font-semibold">Total Courses</p>
                    <p className="text-sm text-muted-foreground">Courses you've created</p>
                  </div>
                  <span className="text-2xl font-bold text-accent">{mentorStats.totalCourses}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div>
                    <p className="font-semibold">Total Students</p>
                    <p className="text-sm text-muted-foreground">Enrolled across all courses</p>
                  </div>
                  <span className="text-2xl font-bold text-primary">{mentorStats.totalStudents}</span>
                </div>
                <Button asChild className="w-full" variant="outline">
                  <Link to={mentorStats.totalCourses > 0 ? "/mentor/analytics" : "/courses/new"}>
                    {mentorStats.totalCourses > 0 ? "View All Courses" : "Create Your First Course"}
                  </Link>
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;