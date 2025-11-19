import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Briefcase, DollarSign, MapPin, Clock, Tag, X, Upload, File, ArrowLeft } from "lucide-react";
import { z } from "zod";
import { MapPicker } from "@/components/MapPicker";
import { FileUpload } from "@/components/FileUpload";

// Validation schema
const jobSchema = z.object({
  title: z.string()
    .trim()
    .min(5, "Title must be at least 5 characters")
    .max(100, "Title must be less than 100 characters"),
  description: z.string()
    .trim()
    .min(20, "Description must be at least 20 characters")
    .max(2000, "Description must be less than 2000 characters"),
  category: z.string()
    .trim()
    .min(2, "Category is required")
    .max(50, "Category must be less than 50 characters"),
  city: z.string()
    .trim()
    .min(2, "City is required")
    .max(100, "City must be less than 100 characters"),
  paymentAmount: z.number()
    .min(100, "Payment must be at least KES 100")
    .max(1000000, "Payment must be less than KES 1,000,000"),
  estimatedDuration: z.string()
    .trim()
    .max(50, "Duration must be less than 50 characters")
    .optional(),
});

const CATEGORIES = [
  "Cleaning",
  "Delivery",
  "Farm Work",
  "Construction",
  "Gardening",
  "Moving",
  "Painting",
  "Repairs",
  "Pet Care",
  "Childcare",
  "Tutoring",
  "Other"
];

const JobPost = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [skills, setSkills] = useState<string[]>([]);
  const [currentSkill, setCurrentSkill] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [createdJob, setCreatedJob] = useState<any>(null);
  const [attachments, setAttachments] = useState<any[]>([]);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    if (!user.roles.includes('employer')) {
      toast({
        title: "Access Denied",
        description: "You need to be an employer to post jobs",
        variant: "destructive"
      });
      navigate("/dashboard");
      return;
    }
  }, [user, navigate, toast]);

  const addSkill = () => {
    const trimmedSkill = currentSkill.trim();
    if (trimmedSkill && !skills.includes(trimmedSkill) && skills.length < 10) {
      setSkills([...skills, trimmedSkill]);
      setCurrentSkill("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    const formData = new FormData(e.currentTarget);
    
    try {
      // Validate form data
      const validatedData = jobSchema.parse({
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        category: formData.get("category") as string,
        city: formData.get("city") as string,
        paymentAmount: parseFloat(formData.get("paymentAmount") as string),
        estimatedDuration: formData.get("estimatedDuration") as string || undefined,
      });

      if (!user) throw new Error("Not authenticated");

      // Prepare job data
      const jobData = {
        title: validatedData.title,
        description: validatedData.description,
        category: validatedData.category,
        location: {
          address: validatedData.city,
          lat: location?.lat,
          lng: location?.lng
        },
        paymentAmount: validatedData.paymentAmount,
        estimatedDuration: validatedData.estimatedDuration || null,
        requiredSkills: skills.length > 0 ? skills : [],
        status: "open"
      };

      // Create job
      const data = await api.createJob(jobData);
      setCreatedJob(data);

      toast({
        title: "Job Posted!",
        description: "Now you can add attachments to your job posting",
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
        toast({
          title: "Validation Error",
          description: "Please check all required fields",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to post job",
          variant: "destructive"
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user.roles.includes('employer')) {
    return null;
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

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 flex items-center gap-3">
            <Briefcase className="h-10 w-10 text-primary" />
            Post a New Job
          </h1>
          <p className="text-muted-foreground">Create a micro-job opportunity for workers in your community</p>
        </div>

        {!createdJob ? (
          <Card className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
            {/* Job Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Job Title *
              </Label>
              <Input
                id="title"
                name="title"
                type="text"
                placeholder="e.g., House Cleaning for 2-Bedroom Apartment"
                maxLength={100}
                required
              />
              {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category" className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Category *
              </Label>
              <select
                id="category"
                name="category"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                required
              >
                <option value="">Select a category</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              {errors.category && <p className="text-sm text-destructive">{errors.category}</p>}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">
                Job Description *
              </Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Provide a detailed description of the job, what needs to be done, and any specific requirements..."
                rows={6}
                maxLength={2000}
                required
              />
              {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
              <p className="text-xs text-muted-foreground">Minimum 20 characters, maximum 2000</p>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="city" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                City/Location *
              </Label>
              <Input
                id="city"
                name="city"
                type="text"
                placeholder="e.g., Nairobi, Westlands"
                maxLength={100}
                required
              />
              {errors.city && <p className="text-sm text-destructive">{errors.city}</p>}
            </div>

            {/* Payment Amount */}
            <div className="space-y-2">
              <Label htmlFor="paymentAmount" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Payment Amount (KES) *
              </Label>
              <Input
                id="paymentAmount"
                name="paymentAmount"
                type="number"
                step="1"
                min="100"
                max="1000000"
                placeholder="5000"
                required
              />
              {errors.paymentAmount && <p className="text-sm text-destructive">{errors.paymentAmount}</p>}
            </div>

            {/* Estimated Duration */}
            <div className="space-y-2">
              <Label htmlFor="estimatedDuration" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Estimated Duration (Optional)
              </Label>
              <Input
                id="estimatedDuration"
                name="estimatedDuration"
                type="text"
                placeholder="e.g., 2-3 hours, Half day, 1 week"
                maxLength={50}
              />
              {errors.estimatedDuration && <p className="text-sm text-destructive">{errors.estimatedDuration}</p>}
            </div>

            {/* Required Skills */}
            <div className="space-y-2">
              <Label htmlFor="skills">Required Skills (Optional)</Label>
              <div className="flex gap-2">
                <Input
                  id="skills"
                  type="text"
                  placeholder="Add a skill and press Enter or click Add"
                  value={currentSkill}
                  onChange={(e) => setCurrentSkill(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addSkill();
                    }
                  }}
                  maxLength={30}
                />
                <Button 
                  type="button" 
                  variant="secondary" 
                  onClick={addSkill}
                  disabled={!currentSkill.trim() || skills.length >= 10}
                >
                  Add
                </Button>
              </div>
              {skills.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="pl-3 pr-1 py-1">
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="ml-2 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
              <p className="text-xs text-muted-foreground">Maximum 10 skills</p>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-4">
              <Button type="submit" className="flex-1" disabled={isLoading}>
                {isLoading ? "Posting Job..." : "Post Job"}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate("/dashboard")}
                disabled={isLoading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
        ) : (
          <div className="space-y-6">
            {/* Job Created Success */}
            <Card className="p-6 bg-green-50 border-green-200">
              <h2 className="text-2xl font-semibold text-green-800 mb-2">Job Posted Successfully! 🎉</h2>
              <p className="text-green-700 mb-4">
                Your job "{createdJob.title}" has been posted and is now visible to workers. You can add attachments to provide additional information.
              </p>
              <div className="flex gap-4">
                <Button asChild>
                  <Link to={`/jobs/${createdJob._id}`}>View Job</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/dashboard">Back to Dashboard</Link>
                </Button>
              </div>
            </Card>

            {/* Job Attachments Upload */}
            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <Upload className="h-6 w-6 text-primary" />
                Add Job Attachments
              </h2>
              <p className="text-muted-foreground mb-6">
                Upload documents, images, or other files that provide additional details about the job requirements.
              </p>

              <FileUpload
                onUpload={async (file) => {
                  try {
                    const result = await api.uploadJobAttachment(createdJob._id, file);
                    setAttachments(prev => [...prev, result.attachment]);
                    toast({
                      title: "Attachment Uploaded",
                      description: `${file.name} has been added to your job posting`
                    });
                    return result;
                  } catch (error) {
                    throw error;
                  }
                }}
                acceptedTypes={[
                  'application/pdf',
                  'application/msword',
                  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                  'text/plain',
                  'image/jpeg',
                  'image/png'
                ]}
                maxSize={10 * 1024 * 1024} // 10MB
              />

              <div className="mt-4 text-sm text-muted-foreground">
                <p><strong>Supported formats:</strong> PDF, Word documents, Text files, Images (JPG, PNG)</p>
                <p><strong>Maximum file size:</strong> 10MB per file</p>
                <p><strong>Examples:</strong> Job specifications, reference images, requirement documents</p>
              </div>
            </Card>

            {/* Uploaded Attachments List */}
            {attachments.length > 0 && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Job Attachments ({attachments.length})</h3>
                <div className="space-y-3">
                  {attachments.map((attachment, index) => (
                    <div key={index} className="flex items-center gap-4 p-3 bg-muted rounded-lg">
                      <File className="h-8 w-8 text-primary" />
                      <div className="flex-1">
                        <p className="font-medium">{attachment.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {attachment.fileName} • {Math.round(attachment.fileSize / 1024)}KB
                        </p>
                      </div>
                      <Badge variant="outline">{attachment.fileType}</Badge>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Tips Card - Show only when creating job */}
        {!createdJob && (
          <Card className="p-6 mt-6 bg-muted/30">
            <h3 className="font-semibold mb-3">💡 Tips for posting a great job</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Be specific about what needs to be done</li>
              <li>• Set a fair payment based on the work required</li>
              <li>• Include all necessary details to avoid confusion</li>
              <li>• Respond promptly to applications</li>
              <li>• Provide clear location information</li>
            </ul>
          </Card>
        )}
      </div>
    </div>
  );
};

export default JobPost;