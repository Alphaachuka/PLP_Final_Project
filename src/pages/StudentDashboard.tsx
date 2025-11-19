import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  GraduationCap, 
  BookOpen, 
  ArrowLeft,
  CheckCircle,
  Clock,
  Award,
  Target
} from "lucide-react";

interface Course {
  _id: string;
  title: string;
  description: string;
  category: string;
  level: string;
  durationHours: number;
  price: number;
  instructorId: { email: string };
}

interface Enrollment {
  _id: string;
  courseId: Course;
  progressPercentage: number;
  completedAt?: string;
  createdAt: string;
  lessonProgress: any[];
}

const StudentDashboard = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    console.log("StudentDashboard: User:", user);
    
    if (!user) {
      console.log("StudentDashboard: No user, redirecting to auth");
      navigate("/auth");
      return;
    }

    if (!user.roles.includes('student')) {
      console.log("StudentDashboard: User doesn't have student role:", user.roles);
      toast({
        title: "Access Denied",
        description: "You need to be a student to access this page",
        variant: "destructive"
      });
      navigate("/dashboard");
      return;
    }

    console.log("StudentDashboard: User has student role, fetching data");
    fetchCourses();
  }, [user, navigate, toast]);

  const fetchCourses = async () => {
    try {
      console.log("StudentDashboard: Fetching courses and enrollments...");
      
      // Fetch available courses
      const coursesData = await api.getCourses();
      console.log("StudentDashboard: Courses fetched:", coursesData);
      setCourses(coursesData || []);
      
      // Fetch student's enrollments
      try {
        const enrollmentsData = await api.getMyEnrollments();
        console.log("StudentDashboard: Enrollments fetched:", enrollmentsData);
        setEnrollments(enrollmentsData || []);
      } catch (enrollmentError) {
        console.log("StudentDashboard: No enrollments found or error:", enrollmentError);
        setEnrollments([]);
      }
    } catch (error) {
      console.error("StudentDashboard: Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to load courses",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = () => {
    setIsLoading(true);
    fetchCourses();
  };

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "beginner":
        return "bg-green-100 text-green-800";
      case "intermediate":
        return "bg-yellow-100 text-yellow-800";
      case "advanced":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  console.log("StudentDashboard: Rendering, isLoading:", isLoading, "user:", user);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-12 text-center">
          <GraduationCap className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">Please Login</h3>
          <p className="text-muted-foreground mb-4">You need to login to access the student dashboard</p>
          <Button asChild>
            <Link to="/auth">Login</Link>
          </Button>
        </Card>
      </div>
    );
  }

  if (!user.roles.includes('student')) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-12 text-center">
          <GraduationCap className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">Access Denied</h3>
          <p className="text-muted-foreground mb-4">
            You need to be a student to access this page. Your current roles: {user.roles.join(", ")}
          </p>
          <Button asChild>
            <Link to="/dashboard">Back to Dashboard</Link>
          </Button>
        </Card>
      </div>
    );
  }

  // Calculate stats from enrollment data
  const completedCourses = enrollments.filter(e => e.completedAt).length;
  const inProgressCourses = enrollments.filter(e => !e.completedAt).length;
  const totalHoursLearned = enrollments
    .filter(e => e.completedAt)
    .reduce((sum, e) => sum + (e.courseId.durationHours || 0), 0);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <Link to="/dashboard" className="text-2xl font-bold text-primary flex items-center gap-2">
            <ArrowLeft className="h-6 w-6" />
            Back to Dashboard
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <GraduationCap className="h-10 w-10 text-accent" />
            My Learning Journey
          </h1>
          <p className="text-muted-foreground">Welcome, {user.email}! Track your progress and discover new skills</p>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 text-center">
            <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-600" />
            <div className="text-3xl font-bold mb-1">{completedCourses}</div>
            <div className="text-sm text-muted-foreground">Completed Courses</div>
          </Card>

          <Card className="p-6 text-center">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-primary" />
            <div className="text-3xl font-bold mb-1">{inProgressCourses}</div>
            <div className="text-sm text-muted-foreground">In Progress</div>
          </Card>

          <Card className="p-6 text-center">
            <Clock className="h-12 w-12 mx-auto mb-4 text-accent" />
            <div className="text-3xl font-bold mb-1">{totalHoursLearned}</div>
            <div className="text-sm text-muted-foreground">Hours Learned</div>
          </Card>

          <Card className="p-6 text-center">
            <Award className="h-12 w-12 mx-auto mb-4 text-secondary" />
            <div className="text-3xl font-bold mb-1">{completedCourses}</div>
            <div className="text-sm text-muted-foreground">Certificates</div>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* My Courses */}
          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-primary" />
              My Courses
            </h2>

            {enrollments.length === 0 ? (
              <div className="text-center py-8">
                <GraduationCap className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-30" />
                <h3 className="text-lg font-semibold mb-2">No enrolled courses yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start your learning journey by enrolling in a course
                </p>
                <Button asChild>
                  <Link to="/courses">Browse Courses</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {enrollments.map((enrollment) => (
                  <Card key={enrollment._id} className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">{enrollment.courseId.title}</h3>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getLevelColor(enrollment.courseId.level || 'beginner')}>
                            {enrollment.courseId.level || 'Beginner'}
                          </Badge>
                          <Badge variant="outline">{enrollment.courseId.category || 'General'}</Badge>
                        </div>
                      </div>
                      {enrollment.completedAt && (
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      )}
                    </div>

                    <div className="mb-3">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span>{enrollment.progressPercentage || 0}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all" 
                          style={{ width: `${enrollment.progressPercentage || 0}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        {enrollment.courseId.durationHours || 0} hours • {enrollment.courseId.instructorId?.email || 'Unknown'}
                      </div>
                      <Button asChild size="sm">
                        <Link to={`/courses/${enrollment.courseId._id}/learn`}>
                          {enrollment.completedAt ? "Review" : "Continue"}
                        </Link>
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </Card>

          {/* Available Courses */}
          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Target className="h-6 w-6 text-accent" />
              Available Courses
            </h2>

            {courses.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-30" />
                <p className="text-muted-foreground">No courses available at the moment</p>
              </div>
            ) : (
              <div className="space-y-4">
                {courses.slice(0, 3).map((course) => (
                  <Card key={course._id} className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">{course.title || 'Untitled Course'}</h3>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getLevelColor(course.level || 'beginner')}>
                            {course.level || 'Beginner'}
                          </Badge>
                          <Badge variant="outline">{course.category || 'General'}</Badge>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {course.description || 'No description available'}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        {course.durationHours || 0} hours • KES {(course.price || 0).toLocaleString()}
                      </div>
                      <Button asChild size="sm" variant="outline">
                        <Link to={`/courses/${course._id}`}>
                          View Course
                        </Link>
                      </Button>
                    </div>
                  </Card>
                ))}

                <Button asChild className="w-full" variant="outline">
                  <Link to="/courses">View All Courses</Link>
                </Button>
              </div>
            )}
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <Card className="p-6 text-center">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h3 className="font-semibold mb-2">Browse Courses</h3>
            <p className="text-sm text-muted-foreground mb-4">Discover new skills and knowledge</p>
            <Button asChild className="w-full">
              <Link to="/courses">Browse All</Link>
            </Button>
          </Card>

          <Card className="p-6 text-center">
            <Award className="h-12 w-12 mx-auto mb-4 text-accent" />
            <h3 className="font-semibold mb-2">My Certificates</h3>
            <p className="text-sm text-muted-foreground mb-4">View your earned certificates</p>
            <Button className="w-full" variant="outline" disabled>
              Coming Soon
            </Button>
          </Card>

          <Card className="p-6 text-center">
            <GraduationCap className="h-12 w-12 mx-auto mb-4 text-secondary" />
            <h3 className="font-semibold mb-2">Learning Path</h3>
            <p className="text-sm text-muted-foreground mb-4">Follow structured learning paths</p>
            <Button className="w-full" variant="outline" disabled>
              Coming Soon
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;