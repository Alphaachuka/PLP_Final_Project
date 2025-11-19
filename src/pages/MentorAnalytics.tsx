import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  Users, 
  TrendingUp, 
  Award,
  ArrowLeft,
  Plus,
  Eye
} from "lucide-react";

interface Course {
  _id: string;
  title: string;
  description: string;
  category: string;
  level: string;
  price?: number;
  enrollmentCount?: number;
  durationHours?: number;
  instructorId?: {
    _id: string;
    email: string;
  };
  createdAt: string;
}

const MentorAnalytics = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    totalRevenue: 0,
    avgRating: 0
  });
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    if (!user.roles.includes('mentor')) {
      navigate("/dashboard");
      return;
    }

    fetchMentorData();
  }, [user, navigate]);

  const fetchMentorData = async () => {
    try {
      // Fetch mentor's own courses (including unpublished)
      const mentorCourses = await api.getMyCourses();
      setCourses(mentorCourses);

      // Calculate stats
      const totalCourses = mentorCourses.length;
      const totalStudents = mentorCourses.reduce((sum, course) => sum + (course.enrollmentCount || 0), 0);
      const totalRevenue = mentorCourses.reduce((sum, course) => sum + ((course.price || 0) * (course.enrollmentCount || 0)), 0);

      setStats({
        totalCourses,
        totalStudents,
        totalRevenue,
        avgRating: 4.5 // Placeholder - would be calculated from course ratings
      });
    } catch (error) {
      console.error("Error fetching mentor data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/dashboard" className="text-2xl font-bold text-primary flex items-center gap-2">
            <ArrowLeft className="h-6 w-6" />
            Back to Dashboard
          </Link>
          <Button asChild>
            <Link to="/courses/new">
              <Plus className="h-4 w-4 mr-2" />
              Create Course
            </Link>
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <TrendingUp className="h-10 w-10 text-accent" />
            Mentor Analytics
          </h1>
          <p className="text-muted-foreground">Track your course performance and student engagement</p>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 text-center">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-accent" />
            <div className="text-3xl font-bold mb-1">{stats.totalCourses}</div>
            <div className="text-sm text-muted-foreground">Total Courses</div>
          </Card>

          <Card className="p-6 text-center">
            <Users className="h-12 w-12 mx-auto mb-4 text-primary" />
            <div className="text-3xl font-bold mb-1">{stats.totalStudents}</div>
            <div className="text-sm text-muted-foreground">Total Students</div>
          </Card>

          <Card className="p-6 text-center">
            <TrendingUp className="h-12 w-12 mx-auto mb-4 text-secondary" />
            <div className="text-3xl font-bold mb-1">KES {stats.totalRevenue.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Total Revenue</div>
          </Card>

          <Card className="p-6 text-center">
            <Award className="h-12 w-12 mx-auto mb-4 text-accent" />
            <div className="text-3xl font-bold mb-1">{stats.avgRating.toFixed(1)}</div>
            <div className="text-sm text-muted-foreground">Average Rating</div>
          </Card>
        </div>

        {/* Course Management */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-accent" />
              My Courses
            </h2>
            <Button asChild>
              <Link to="/courses/new">
                <Plus className="h-4 w-4 mr-2" />
                Create New Course
              </Link>
            </Button>
          </div>

          {courses.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-30" />
              <h3 className="text-xl font-semibold mb-2">No courses yet</h3>
              <p className="text-muted-foreground mb-4">
                Start sharing your knowledge by creating your first course
              </p>
              <Button asChild>
                <Link to="/courses/new">Create Your First Course</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {courses.map((course) => (
                <Card key={course._id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{course.title}</h3>
                        <Badge variant="secondary">{course.category}</Badge>
                        <Badge variant="outline">{course.level}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                        {course.description}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {course.enrollmentCount || 0} students
                        </span>
                        <span>KES {course.price.toLocaleString()}</span>
                        <span>Created {new Date(course.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button asChild variant="outline" size="sm">
                        <Link to={`/courses/${course._id}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Link>
                      </Button>
                      <Button asChild variant="outline" size="sm">
                        <Link to={`/courses/${course._id}/edit`}>
                          Edit
                        </Link>
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Card>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <Card className="p-6 text-center">
            <Plus className="h-12 w-12 mx-auto mb-4 text-accent" />
            <h3 className="font-semibold mb-2">Create Course</h3>
            <p className="text-sm text-muted-foreground mb-4">Share your expertise with students</p>
            <Button asChild className="w-full">
              <Link to="/courses/new">Create Course</Link>
            </Button>
          </Card>

          <Card className="p-6 text-center">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h3 className="font-semibold mb-2">Browse Courses</h3>
            <p className="text-sm text-muted-foreground mb-4">See what other mentors are teaching</p>
            <Button asChild className="w-full" variant="outline">
              <Link to="/courses">Browse All</Link>
            </Button>
          </Card>

          <Card className="p-6 text-center">
            <Users className="h-12 w-12 mx-auto mb-4 text-secondary" />
            <h3 className="font-semibold mb-2">Student Feedback</h3>
            <p className="text-sm text-muted-foreground mb-4">View reviews and ratings</p>
            <Button className="w-full" variant="outline" disabled>
              Coming Soon
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MentorAnalytics;