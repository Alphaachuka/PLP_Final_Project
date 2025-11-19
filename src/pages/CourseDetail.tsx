import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  GraduationCap, 
  Clock, 
  User,
  ArrowLeft,
  BookOpen,
  Award,
  CheckCircle,
  Upload,
  File,
  Edit,
  Plus
} from "lucide-react";
import { FileUpload } from "@/components/FileUpload";

interface Course {
  _id: string;
  title: string;
  description: string;
  category: string;
  level: string;
  durationHours: number;
  thumbnailUrl?: string;
  instructorId: { email: string; _id: string };
  modules: Module[];
  materials?: Material[];
}

interface Material {
  title: string;
  description: string;
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  publicId: string;
  uploadedAt: string;
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
}

const CourseDetail = () => {
  const { id } = useParams();
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [showMaterialUpload, setShowMaterialUpload] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  // Check if current user is the instructor
  const isInstructor = user && course && course.instructorId._id === user.id;

  useEffect(() => {
    if (id) {
      fetchCourseDetails();
      if (user && user.roles.includes('student')) {
        checkEnrollment();
      }
    }
  }, [id, user]);

  const fetchCourseDetails = async () => {
    try {
      const courseData = await api.getCourse(id!);
      setCourse(courseData);
    } catch (error) {
      console.error("Error fetching course:", error);
      toast({
        title: "Error",
        description: "Failed to load course details",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const checkEnrollment = async () => {
    try {
      const progress = await api.getCourseProgress(id!);
      if (progress) {
        setIsEnrolled(true);
      }
    } catch (error) {
      // Not enrolled yet
      console.log("Not enrolled in course");
    }
  };

  const handleEnroll = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }

    if (!user.roles.includes('student')) {
      toast({
        title: "Access Denied",
        description: "You need to be registered as a student to enroll in courses",
        variant: "destructive"
      });
      return;
    }

    setIsEnrolling(true);

    try {
      await api.enrollCourse(id!);

      toast({
        title: "Enrolled Successfully!",
        description: "You can now start learning",
      });
      
      setIsEnrolled(true);
      // Don't navigate immediately, let user see the success state
      setTimeout(() => {
        navigate(`/courses/${id}/learn`);
      }, 1000);
    } catch (error: any) {
      console.error('Enrollment error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to enroll",
        variant: "destructive"
      });
    } finally {
      setIsEnrolling(false);
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
          <GraduationCap className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">Course not found</h3>
          <Button asChild className="mt-4">
            <Link to="/courses">Browse Courses</Link>
          </Button>
        </Card>
      </div>
    );
  }

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "beginner":
        return "bg-success text-white";
      case "intermediate":
        return "bg-warning text-white";
      case "advanced":
        return "bg-destructive text-white";
      default:
        return "bg-muted";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <Link to="/courses" className="text-2xl font-bold text-primary flex items-center gap-2">
            <ArrowLeft className="h-6 w-6" />
            Back to Courses
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-8">
              <div className="flex items-start gap-3 mb-4">
                <Badge variant="secondary">{course.category}</Badge>
                <Badge className={getLevelColor(course.level)}>{course.level}</Badge>
              </div>
              
              <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
              
              <div className="flex items-center gap-4 text-muted-foreground mb-6">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{course.instructorId?.email || "Anonymous"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{course.durationHours} hours</span>
                </div>
              </div>

              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-3">About this course</h2>
                <p className="text-muted-foreground whitespace-pre-wrap">{course.description}</p>
              </div>

              {/* Course Modules */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-accent" />
                    Course Content
                  </h2>
                  {isInstructor && (
                    <Button
                      onClick={() => setShowMaterialUpload(!showMaterialUpload)}
                      variant="outline"
                      size="sm"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Materials
                    </Button>
                  )}
                </div>

                {/* Material Upload Section for Instructors */}
                {isInstructor && showMaterialUpload && (
                  <Card className="p-6 mb-6 bg-blue-50 border-blue-200">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Upload className="h-5 w-5 text-blue-600" />
                      Add Course Materials
                    </h3>
                    <p className="text-sm text-blue-700 mb-4">
                      Upload documents, presentations, images, and other materials to support your course content.
                    </p>
                    
                    <FileUpload
                      onUpload={async (file) => {
                        try {
                          const result = await api.uploadCourseMaterial(course._id, file);
                          
                          // Update course materials in state
                          setCourse(prev => prev ? {
                            ...prev,
                            materials: [...(prev.materials || []), result.material]
                          } : null);
                          
                          toast({
                            title: "Material Uploaded",
                            description: `${file.name} has been added to your course`
                          });
                          
                          return result;
                        } catch (error) {
                          throw error;
                        }
                      }}
                      acceptedTypes={[
                        'application/pdf',
                        'image/*',
                        'application/msword',
                        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                        'application/vnd.ms-powerpoint',
                        'application/vnd.openxmlformats-officedocument.presentationml.presentation'
                      ]}
                      maxSize={50 * 1024 * 1024} // 50MB
                    />
                    
                    <div className="mt-4 text-sm text-blue-600">
                      <p><strong>Supported formats:</strong> PDF, Word documents, PowerPoint presentations, Images</p>
                      <p><strong>Maximum file size:</strong> 50MB per file</p>
                    </div>
                  </Card>
                )}

                {/* Course Materials */}
                {course.materials && course.materials.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <File className="h-5 w-5 text-primary" />
                      Course Materials ({course.materials.length})
                    </h3>
                    <div className="grid gap-3">
                      {course.materials.map((material, index) => (
                        <Card key={index} className="p-4">
                          <div className="flex items-center gap-4">
                            <File className="h-8 w-8 text-primary flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium truncate">{material.title}</h4>
                              <p className="text-sm text-muted-foreground truncate">
                                {material.fileName} • {Math.round(material.fileSize / 1024)}KB
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Uploaded {new Date(material.uploadedAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {material.fileType.split('/')[1]?.toUpperCase()}
                              </Badge>
                              <Button
                                asChild
                                variant="outline"
                                size="sm"
                              >
                                <a 
                                  href={material.fileUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1"
                                >
                                  <File className="h-3 w-3" />
                                  View
                                </a>
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Course Modules */}
                {!course.modules || course.modules.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-30" />
                    <p className="text-muted-foreground mb-2">No modules added yet</p>
                    {isInstructor && (
                      <p className="text-sm text-muted-foreground">
                        Add course materials above to get started with your course content.
                      </p>
                    )}
                  </div>
                ) : (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Course Modules</h3>
                    <div className="space-y-3">
                      {course.modules.map((module, index) => (
                        <Card key={module._id} className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center font-semibold text-accent">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold">{module.title}</h4>
                              {module.description && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {module.description}
                                </p>
                              )}
                              {module.lessons && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  {module.lessons.length} lesson{module.lessons.length !== 1 ? 's' : ''}
                                </p>
                              )}
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Instructor Management Panel */}
            {isInstructor && (
              <Card className="p-6 mb-6 bg-green-50 border-green-200">
                <div className="text-center mb-4">
                  <Edit className="h-12 w-12 mx-auto mb-3 text-green-600" />
                  <h3 className="font-semibold text-lg text-green-800">Your Course</h3>
                  <p className="text-sm text-green-700">
                    Manage your course content and materials
                  </p>
                </div>
                <div className="space-y-2">
                  <Button
                    onClick={() => setShowMaterialUpload(!showMaterialUpload)}
                    variant="outline"
                    className="w-full"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {showMaterialUpload ? 'Hide Upload' : 'Add Materials'}
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="w-full"
                  >
                    <Link to="/mentor/analytics">
                      <Award className="h-4 w-4 mr-2" />
                      View Analytics
                    </Link>
                  </Button>
                </div>
                <div className="mt-4 pt-4 border-t border-green-200">
                  <div className="text-sm text-green-700">
                    <p><strong>Materials:</strong> {course.materials?.length || 0}</p>
                    <p><strong>Modules:</strong> {course.modules?.length || 0}</p>
                  </div>
                </div>
              </Card>
            )}

            <Card className="p-6 sticky top-4">
              {isEnrolled ? (
                <>
                  <div className="mb-6 text-center">
                    <CheckCircle className="h-16 w-16 mx-auto mb-3 text-success" />
                    <h3 className="font-semibold text-lg mb-2">You're enrolled!</h3>
                    <p className="text-sm text-muted-foreground">
                      Continue your learning journey
                    </p>
                  </div>
                  <Button asChild className="w-full" size="lg">
                    <Link to={`/courses/${id}/learn`}>
                      Continue Learning
                    </Link>
                  </Button>
                </>
              ) : (
                <>
                  <div className="mb-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Award className="h-8 w-8 text-accent" />
                      <div>
                        <p className="text-sm text-muted-foreground">Certificate</p>
                        <p className="font-semibold">Upon completion</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <BookOpen className="h-8 w-8 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Modules</p>
                        <p className="font-semibold">{course.modules?.length || 0} modules</p>
                      </div>
                    </div>
                  </div>
                  
                  {user?.roles.includes('student') ? (
                    <Button 
                      onClick={handleEnroll} 
                      disabled={isEnrolling}
                      size="lg"
                      className="w-full"
                    >
                      {isEnrolling ? "Enrolling..." : "Enroll Now"}
                    </Button>
                  ) : (
                    <Card className="p-4 bg-muted/30">
                      <p className="text-sm text-muted-foreground text-center">
                        Sign up as a student to enroll in courses
                      </p>
                    </Card>
                  )}
                </>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
