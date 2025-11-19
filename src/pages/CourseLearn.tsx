import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { 
  GraduationCap, 
  ArrowLeft,
  CheckCircle,
  Circle,
  ChevronRight,
  Award,
  BookOpen,
  Play
} from "lucide-react";

interface Course {
  _id: string;
  title: string;
  description: string;
  category: string;
  level: string;
  durationHours: number;
  instructorId: { email: string };
  modules: Module[];
}

interface Module {
  _id: string;
  title: string;
  description: string;
  orderIndex: number;
  lessons: Lesson[];
}

interface Lesson {
  _id: string;
  title: string;
  content?: string;
  videoUrl?: string;
  durationMinutes?: number;
  orderIndex: number;
  completed?: boolean;
}

interface Enrollment {
  _id: string;
  courseId: string;
  studentId: string;
  progressPercentage: number;
  completedAt?: string;
  lessonProgress: any[];
}

const CourseLearn = () => {
  const { id } = useParams();
  const [course, setCourse] = useState<Course | null>(null);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    if (!user.roles.includes('student')) {
      toast({
        title: "Access Denied",
        description: "You need to be a student to access course content",
        variant: "destructive"
      });
      navigate("/dashboard");
      return;
    }

    if (id) {
      fetchCourseData();
    }
  }, [id, user, navigate, toast]);

  const fetchCourseData = async () => {
    try {
      // Fetch course details
      const courseData = await api.getCourse(id!);
      setCourse(courseData);

      // Check enrollment and progress
      try {
        const enrollmentData = await api.getCourseProgress(id!);
        setEnrollment(enrollmentData);
      } catch (error) {
        // Not enrolled, redirect to course detail
        toast({
          title: "Not Enrolled",
          description: "You need to enroll in this course first",
          variant: "destructive"
        });
        navigate(`/courses/${id}`);
        return;
      }

      // Set first lesson as current if available
      if (courseData.modules && courseData.modules.length > 0) {
        const firstModule = courseData.modules[0];
        if (firstModule.lessons && firstModule.lessons.length > 0) {
          setCurrentLesson(firstModule.lessons[0]);
        }
      }
    } catch (error) {
      console.error("Error fetching course data:", error);
      toast({
        title: "Error",
        description: "Failed to load course content",
        variant: "destructive"
      });
      navigate("/courses");
    } finally {
      setIsLoading(false);
    }
  };

  const markLessonComplete = async (lessonId: string) => {
    try {
      // This would be implemented when lesson progress tracking is added
      toast({
        title: "Lesson Completed!",
        description: "Great job! Moving to the next lesson.",
      });
      
      // Move to next lesson
      goToNextLesson();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark lesson as complete",
        variant: "destructive"
      });
    }
  };

  const goToNextLesson = () => {
    if (!course || !course.modules) return;

    const currentModule = course.modules[currentModuleIndex];
    if (!currentModule || !currentModule.lessons) return;

    // Check if there's a next lesson in current module
    if (currentLessonIndex < currentModule.lessons.length - 1) {
      const nextLessonIndex = currentLessonIndex + 1;
      setCurrentLessonIndex(nextLessonIndex);
      setCurrentLesson(currentModule.lessons[nextLessonIndex]);
    } else if (currentModuleIndex < course.modules.length - 1) {
      // Move to first lesson of next module
      const nextModuleIndex = currentModuleIndex + 1;
      const nextModule = course.modules[nextModuleIndex];
      if (nextModule.lessons && nextModule.lessons.length > 0) {
        setCurrentModuleIndex(nextModuleIndex);
        setCurrentLessonIndex(0);
        setCurrentLesson(nextModule.lessons[0]);
      }
    } else {
      // Course completed
      toast({
        title: "Course Completed!",
        description: "Congratulations on completing the course!",
      });
    }
  };

  const goToPreviousLesson = () => {
    if (!course || !course.modules) return;

    // Check if there's a previous lesson in current module
    if (currentLessonIndex > 0) {
      const prevLessonIndex = currentLessonIndex - 1;
      setCurrentLessonIndex(prevLessonIndex);
      setCurrentLesson(course.modules[currentModuleIndex].lessons[prevLessonIndex]);
    } else if (currentModuleIndex > 0) {
      // Move to last lesson of previous module
      const prevModuleIndex = currentModuleIndex - 1;
      const prevModule = course.modules[prevModuleIndex];
      if (prevModule.lessons && prevModule.lessons.length > 0) {
        const lastLessonIndex = prevModule.lessons.length - 1;
        setCurrentModuleIndex(prevModuleIndex);
        setCurrentLessonIndex(lastLessonIndex);
        setCurrentLesson(prevModule.lessons[lastLessonIndex]);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-12 text-center">
          <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">Course not found</h3>
          <Button asChild>
            <Link to="/courses">Back to Courses</Link>
          </Button>
        </Card>
      </div>
    );
  }

  const totalLessons = course.modules?.reduce((sum, module) => sum + (module.lessons?.length || 0), 0) || 0;
  const completedLessons = 0; // This would be calculated from enrollment progress
  const progressPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to={`/courses/${id}`} className="text-2xl font-bold text-primary flex items-center gap-2">
            <ArrowLeft className="h-6 w-6" />
            Back to Course
          </Link>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="font-semibold">{course.title}</p>
              <p className="text-sm text-muted-foreground">
                {Math.round(progressPercentage)}% Complete
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Course Content */}
          <div className="lg:col-span-3">
            {currentLesson ? (
              <Card className="p-8">
                <div className="mb-6">
                  <h1 className="text-3xl font-bold mb-2">{currentLesson.title}</h1>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Module {currentModuleIndex + 1}</span>
                    <span>Lesson {currentLessonIndex + 1}</span>
                    {currentLesson.durationMinutes && (
                      <span>{currentLesson.durationMinutes} minutes</span>
                    )}
                  </div>
                </div>

                {/* Video Player Placeholder */}
                {currentLesson.videoUrl && (
                  <div className="mb-8">
                    <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <Play className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-muted-foreground">Video Player</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Video URL: {currentLesson.videoUrl}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Lesson Content */}
                <div className="prose max-w-none mb-8">
                  {currentLesson.content ? (
                    <div dangerouslySetInnerHTML={{ __html: currentLesson.content }} />
                  ) : (
                    <p className="text-muted-foreground">No content available for this lesson.</p>
                  )}
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between pt-6 border-t">
                  <Button 
                    onClick={goToPreviousLesson}
                    variant="outline"
                    disabled={currentModuleIndex === 0 && currentLessonIndex === 0}
                  >
                    Previous Lesson
                  </Button>
                  
                  <Button onClick={() => markLessonComplete(currentLesson._id)}>
                    {currentModuleIndex === course.modules!.length - 1 && 
                     currentLessonIndex === course.modules![currentModuleIndex].lessons!.length - 1
                      ? "Complete Course"
                      : "Mark Complete & Continue"
                    }
                  </Button>
                </div>
              </Card>
            ) : (
              <Card className="p-12 text-center">
                <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No lessons available</h3>
                <p className="text-muted-foreground">This course doesn't have any lessons yet.</p>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-4">
              <h3 className="font-semibold mb-4">Course Progress</h3>
              
              <div className="mb-6">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span>Overall Progress</span>
                  <span>{Math.round(progressPercentage)}%</span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
              </div>

              {/* Module List */}
              <div className="space-y-4">
                {course.modules?.map((module, moduleIndex) => (
                  <div key={module._id} className="space-y-2">
                    <h4 className="font-semibold text-sm">{module.title}</h4>
                    <div className="space-y-1">
                      {module.lessons?.map((lesson, lessonIndex) => (
                        <button
                          key={lesson._id}
                          onClick={() => {
                            setCurrentModuleIndex(moduleIndex);
                            setCurrentLessonIndex(lessonIndex);
                            setCurrentLesson(lesson);
                          }}
                          className={`w-full text-left p-2 rounded text-sm flex items-center gap-2 hover:bg-muted/50 ${
                            currentLesson?._id === lesson._id ? 'bg-primary/10 text-primary' : ''
                          }`}
                        >
                          {lesson.completed ? (
                            <CheckCircle className="h-4 w-4 text-success" />
                          ) : (
                            <Circle className="h-4 w-4" />
                          )}
                          <span className="flex-1 truncate">{lesson.title}</span>
                          {lesson.durationMinutes && (
                            <span className="text-xs text-muted-foreground">
                              {lesson.durationMinutes}m
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {progressPercentage === 100 && (
                <div className="mt-6 pt-6 border-t text-center">
                  <Award className="h-12 w-12 mx-auto mb-3 text-accent" />
                  <h4 className="font-semibold mb-2">Course Completed!</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Congratulations on completing this course
                  </p>
                  <Button className="w-full" disabled>
                    Download Certificate
                  </Button>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseLearn;