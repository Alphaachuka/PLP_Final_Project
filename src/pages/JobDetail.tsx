import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
  Briefcase, 
  DollarSign, 
  MapPin, 
  Clock, 
  User,
  ArrowLeft,
  Send
} from "lucide-react";

interface Job {
  _id: string;
  title: string;
  description: string;
  category: string;
  paymentAmount: number;
  estimatedDuration: string;
  location: { address: string; lat?: number; lng?: number };
  status: string;
  requiredSkills: string[];
  employerId: {
    email: string;
  };
  createdAt: string;
}

const JobDetail = () => {
  const { id } = useParams();
  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [applicationMessage, setApplicationMessage] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (id) {
      fetchJobDetails();
      if (user) {
        checkExistingApplication();
      }
    }
  }, [id, user]);

  const fetchJobDetails = async () => {
    try {
      const data = await api.getJob(id!);
      setJob(data);
    } catch (error) {
      console.error("Error fetching job:", error);
      toast({
        title: "Error",
        description: "Failed to load job details",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const checkExistingApplication = async () => {
    try {
      const applications = await api.getMyApplications();
      const existingApplication = applications.find((app: any) => 
        app.jobId && app.jobId._id === id
      );
      if (existingApplication) {
        setHasApplied(true);
      }
    } catch (error) {
      console.error("Error checking applications:", error);
    }
  };



  const handleApply = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }

    if (!user.roles.includes('worker')) {
      toast({
        title: "Access Denied",
        description: "You need to be registered as a worker to apply for jobs",
        variant: "destructive"
      });
      return;
    }

    setIsApplying(true);

    try {
      await api.createApplication(id!, applicationMessage.trim() || undefined);

      toast({
        title: "Application Submitted!",
        description: "The employer will review your application",
      });
      
      setHasApplied(true);
      setApplicationMessage("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit application",
        variant: "destructive"
      });
    } finally {
      setIsApplying(false);
    }
  };

  const updateJobStatus = async (newStatus: string) => {
    try {
      await api.updateJob(id!, { status: newStatus });
      setJob(prev => prev ? { ...prev, status: newStatus } : null);
      
      toast({
        title: "Job Updated",
        description: `Job status changed to ${newStatus.replace('_', ' ')}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update job status",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-12 text-center">
          <Briefcase className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">Job not found</h3>
          <Button asChild className="mt-4">
            <Link to="/jobs">Browse Jobs</Link>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <Link to="/jobs" className="text-2xl font-bold text-primary flex items-center gap-2">
            <ArrowLeft className="h-6 w-6" />
            Back to Jobs
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="p-8">
          {/* Header Section */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <Badge variant="secondary" className="text-sm">{job.category}</Badge>
                <Badge className="bg-success text-white">{job.status}</Badge>
              </div>
              <h1 className="text-3xl font-bold mb-2">{job.title}</h1>
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="h-4 w-4" />
                <span>Posted by {job.employerId?.email || "Anonymous"}</span>
              </div>
            </div>
          </div>

          {/* Key Info Cards */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <Card className="p-4 bg-muted/30">
              <div className="flex items-center gap-3">
                <DollarSign className="h-8 w-8 text-success" />
                <div>
                  <p className="text-sm text-muted-foreground">Payment</p>
                  <p className="text-2xl font-bold">KES {job.paymentAmount.toLocaleString()}</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-muted/30">
              <div className="flex items-center gap-3">
                <MapPin className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="text-lg font-semibold">{job.location?.address || "Not specified"}</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-muted/30">
              <div className="flex items-center gap-3">
                <Clock className="h-8 w-8 text-accent" />
                <div>
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="text-lg font-semibold">{job.estimatedDuration || "Varies"}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Description */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-3">Job Description</h2>
            <p className="text-muted-foreground whitespace-pre-wrap">{job.description}</p>
          </div>

          {/* Required Skills */}
          {job.requiredSkills && job.requiredSkills.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-3">Required Skills</h2>
              <div className="flex flex-wrap gap-2">
                {job.requiredSkills.map((skill, index) => (
                  <Badge key={index} variant="outline">{skill}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* Application Section */}
          {user?.roles.includes('worker') && job.status === "open" && (
            <div className="border-t pt-8">
              {hasApplied ? (
                <Card className="p-6 bg-success/10 border-success">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-success flex items-center justify-center">
                      <Send className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Application Submitted</h3>
                      <p className="text-sm text-muted-foreground">
                        The employer will review your application and contact you soon
                      </p>
                    </div>
                  </div>
                </Card>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">Apply for this Job</h2>
                    <Button asChild variant="outline" size="sm">
                      <Link to="/profile/edit">Update My Profile</Link>
                    </Button>
                  </div>
                  <Card className="p-4 bg-info/10">
                    <p className="text-sm text-muted-foreground">
                      💡 Tip: Employers can view your profile when you apply. Make sure your skills and experience are up to date!
                    </p>
                  </Card>
                  <div className="space-y-2">
                    <Label htmlFor="message">Message to Employer (Optional)</Label>
                    <Textarea
                      id="message"
                      placeholder="Tell the employer why you're a good fit for this job..."
                      value={applicationMessage}
                      onChange={(e) => setApplicationMessage(e.target.value)}
                      rows={4}
                      maxLength={500}
                    />
                    <p className="text-xs text-muted-foreground">Maximum 500 characters</p>
                  </div>
                  <Button 
                    onClick={handleApply} 
                    disabled={isApplying}
                    size="lg"
                    className="w-full md:w-auto"
                  >
                    {isApplying ? "Submitting..." : "Submit Application"}
                  </Button>
                </div>
              )}
            </div>
          )}

          {!user?.roles.includes('worker') && !user?.roles.includes('employer') && (
            <Card className="p-6 bg-muted/30 border-border">
              <p className="text-center text-muted-foreground">
                You need to be registered as a worker to apply for jobs.{" "}
                <Link to="/auth" className="text-primary hover:underline">
                  Sign up as a worker
                </Link>
              </p>
            </Card>
          )}

          {/* Employer Controls */}
          {user?.roles.includes('employer') && (
            <div className="border-t pt-8">
              <h2 className="text-xl font-semibold mb-4">Job Management</h2>
              <div className="flex items-center gap-4 flex-wrap">
                <p className="text-sm text-muted-foreground">Current Status: <span className="font-semibold capitalize">{job.status.replace('_', ' ')}</span></p>
                {job.status === 'open' && (
                  <Button
                    onClick={() => updateJobStatus('completed')}
                    variant="secondary"
                    size="sm"
                  >
                    Mark as Completed
                  </Button>
                )}
                {job.status === 'completed' && (
                  <Button
                    onClick={() => updateJobStatus('open')}
                    variant="outline"
                    size="sm"
                  >
                    Reopen Job
                  </Button>
                )}
                <Button asChild variant="outline" size="sm">
                  <Link to="/applications">View Applications</Link>
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default JobDetail;