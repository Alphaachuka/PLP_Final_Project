import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { GraduationCap, ArrowLeft, Upload, File } from "lucide-react";
import { FileUpload } from "@/components/FileUpload";
import { Badge } from "@/components/ui/badge";

const CATEGORIES = [
  "Technology",
  "Business", 
  "Design",
  "Marketing",
  "Health",
  "Language",
  "Personal Development",
  "Other"
];

const LEVELS = ["Beginner", "Intermediate", "Advanced"];

const CreateCourse = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [createdCourse, setCreatedCourse] = useState<any>(null);
  const [materials, setMaterials] = useState<any[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    if (!user.roles.includes('mentor')) {
      toast({
        title: "Access Denied",
        description: "You need to be a mentor to create courses",
        variant: "destructive"
      });
      navigate("/dashboard");
      return;
    }
  }, [user, navigate, toast]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    
    try {
      const courseData = {
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        category: selectedCategory,
        level: selectedLevel,
        durationHours: parseInt(formData.get("durationHours") as string) || 0,
        price: parseFloat(formData.get("price") as string) || 0,
        objectives: (formData.get("objectives") as string).split('\n').filter(obj => obj.trim()),
        prerequisites: (formData.get("prerequisites") as string).split('\n').filter(req => req.trim()),
        isPublished: true, // Auto-publish new courses
      };

      if (!courseData.title || !courseData.description || !selectedCategory || !selectedLevel) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields",
          variant: "destructive"
        });
        return;
      }

      const newCourse = await api.createCourse(courseData);
      setCreatedCourse(newCourse);

      toast({
        title: "Course Created!",
        description: "Now you can add course materials",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create course",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user || !user.roles.includes('mentor')) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

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

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <GraduationCap className="h-10 w-10 text-accent" />
            Create New Course
          </h1>
          <p className="text-muted-foreground">Share your knowledge and help others learn new skills</p>
        </div>

        {!createdCourse ? (
          <Card className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">Basic Information</h2>
              
              <div className="space-y-2">
                <Label htmlFor="title">Course Title *</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="e.g., Introduction to Web Development"
                  required
                  maxLength={100}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Course Description *</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Describe what students will learn in this course..."
                  rows={4}
                  required
                  maxLength={1000}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category *</Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Difficulty Level *</Label>
                  <Select value={selectedLevel} onValueChange={setSelectedLevel} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      {LEVELS.map((level) => (
                        <SelectItem key={level} value={level}>
                          {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="durationHours">Duration (Hours)</Label>
                  <Input
                    id="durationHours"
                    name="durationHours"
                    type="number"
                    min="1"
                    max="200"
                    placeholder="e.g., 10"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Price (KES)</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="e.g., 2500"
                  />
                  <p className="text-xs text-muted-foreground">Set to 0 for free course</p>
                </div>
              </div>
            </div>

            {/* Course Content */}
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">Course Content</h2>
              
              <div className="space-y-2">
                <Label htmlFor="objectives">Learning Objectives</Label>
                <Textarea
                  id="objectives"
                  name="objectives"
                  placeholder="Enter each objective on a new line:&#10;- Understand basic HTML and CSS&#10;- Build responsive websites&#10;- Deploy web applications"
                  rows={4}
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground">Enter each objective on a new line</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="prerequisites">Prerequisites</Label>
                <Textarea
                  id="prerequisites"
                  name="prerequisites"
                  placeholder="Enter each prerequisite on a new line:&#10;- Basic computer skills&#10;- No programming experience required"
                  rows={3}
                  maxLength={300}
                />
                <p className="text-xs text-muted-foreground">Enter each prerequisite on a new line (optional)</p>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-6">
              <Button type="button" variant="outline" asChild className="flex-1">
                <Link to="/dashboard">Cancel</Link>
              </Button>
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? "Creating Course..." : "Create Course"}
              </Button>
            </div>
          </form>
        </Card>
        ) : (
          <div className="space-y-6">
            {/* Course Created Success */}
            <Card className="p-6 bg-green-50 border-green-200">
              <h2 className="text-2xl font-semibold text-green-800 mb-2">Course Created Successfully! 🎉</h2>
              <p className="text-green-700 mb-4">
                Your course "{createdCourse.title}" has been created. Now you can add course materials to enhance the learning experience.
              </p>
              <div className="flex gap-4">
                <Button asChild>
                  <Link to={`/courses/${createdCourse._id}`}>View Course</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/dashboard">Back to Dashboard</Link>
                </Button>
              </div>
            </Card>

            {/* Course Materials Upload */}
            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <Upload className="h-6 w-6 text-primary" />
                Add Course Materials
              </h2>
              <p className="text-muted-foreground mb-6">
                Upload documents, presentations, images, and other materials to support your course content.
              </p>

              <FileUpload
                onUpload={async (file) => {
                  try {
                    const result = await api.uploadCourseMaterial(createdCourse._id, file);
                    setMaterials(prev => [...prev, result.material]);
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

              <div className="mt-4 text-sm text-muted-foreground">
                <p><strong>Supported formats:</strong> PDF, Word documents, PowerPoint presentations, Images</p>
                <p><strong>Maximum file size:</strong> 50MB per file</p>
              </div>
            </Card>

            {/* Uploaded Materials List */}
            {materials.length > 0 && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Uploaded Materials ({materials.length})</h3>
                <div className="space-y-3">
                  {materials.map((material, index) => (
                    <div key={index} className="flex items-center gap-4 p-3 bg-muted rounded-lg">
                      <File className="h-8 w-8 text-primary" />
                      <div className="flex-1">
                        <p className="font-medium">{material.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {material.fileName} • {Math.round(material.fileSize / 1024)}KB
                        </p>
                      </div>
                      <Badge variant="outline">{material.fileType}</Badge>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateCourse;