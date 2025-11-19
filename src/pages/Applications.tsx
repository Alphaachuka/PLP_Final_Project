import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import RatingForm from "@/components/RatingForm";
import { 
  Briefcase, 
  User, 
  CheckCircle2, 
  XCircle,
  Clock,
  Eye,
  Star
} from "lucide-react";

interface Application {
  _id: string;
  status: string;
  message: string;
  createdAt: string;
  workerId: {
    _id: string;
    email: string;
  };
  jobId: {
    _id: string;
    title: string;
    paymentAmount: number;
    status: string;
  };
}

const Applications = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showRatingForm, setShowRatingForm] = useState<{
    workerId: string;
    workerEmail: string;
    jobId: string;
    jobTitle: string;
  } | null>(null);
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
        description: "You need to be an employer to view applications",
        variant: "destructive"
      });
      navigate("/dashboard");
      return;
    }

    fetchApplications();
  }, [user, navigate, toast]);

  const fetchApplications = async () => {
    try {
      const applications = await api.getEmployerApplications();
      setApplications(applications);
    } catch (error) {
      console.error("Error fetching applications:", error);
      toast({
        title: "Error",
        description: "Failed to load applications",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateApplicationStatus = async (applicationId: string, status: 'accepted' | 'rejected') => {
    try {
      await api.updateApplication(applicationId, status);

      setApplications(prev =>
        prev.map(app => app._id === applicationId ? { ...app, status } : app)
      );

      toast({
        title: status === 'accepted' ? "Application Accepted" : "Application Rejected",
        description: `The worker has been notified of your decision`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update application",
        variant: "destructive"
      });
    }
  };

  const markJobComplete = async (jobId: string) => {
    try {
      await api.updateJob(jobId, { status: 'completed' });

      // Update the applications state to reflect the job status change
      setApplications(prev =>
        prev.map(app => 
          app.jobId._id === jobId 
            ? { ...app, jobId: { ...app.jobId, status: 'completed' } }
            : app
        )
      );

      toast({
        title: "Job Marked Complete",
        description: "You can now rate the worker for this job",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to mark job as complete",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "accepted":
        return "bg-success text-white";
      case "rejected":
        return "bg-destructive text-white";
      case "pending":
        return "bg-warning text-white";
      default:
        return "bg-muted";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || !user.roles.includes('employer')) {
    return null;
  }

  const pendingApplications = applications.filter(a => a.status === 'pending');
  const reviewedApplications = applications.filter(a => a.status !== 'pending');

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <Link to="/dashboard" className="text-2xl font-bold text-primary">← Back to Dashboard</Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <Briefcase className="h-10 w-10 text-primary" />
            Job Applications
          </h1>
          <p className="text-muted-foreground">
            {pendingApplications.length} pending application{pendingApplications.length !== 1 ? "s" : ""} to review
          </p>
        </div>

        {applications.length === 0 ? (
          <Card className="p-12 text-center">
            <Briefcase className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-30" />
            <h3 className="text-xl font-semibold mb-2">No applications yet</h3>
            <p className="text-muted-foreground mb-4">
              Applications will appear here when workers apply to your jobs
            </p>
            <Button asChild>
              <Link to="/jobs/new">Post a Job</Link>
            </Button>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Pending Applications */}
            {pendingApplications.length > 0 && (
              <div>
                <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                  <Clock className="h-6 w-6 text-warning" />
                  Pending Review ({pendingApplications.length})
                </h2>
                <div className="space-y-4">
                  {pendingApplications.map((application) => (
                    <Card key={application.id} className="p-6">
                      <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex items-start gap-4 flex-1">
                          <Avatar className="h-16 w-16">
                            <AvatarFallback className="text-2xl">
                              {application.workerId?.email?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="text-xl font-semibold mb-1">
                                  {application.workerId?.email}
                                </h3>
                                <p className="text-sm text-muted-foreground mb-2">
                                  Applied for: <span className="font-semibold text-foreground">{application.jobId?.title}</span>
                                </p>
                              </div>
                              <Badge className={getStatusColor(application.status)}>
                                {application.status}
                              </Badge>
                            </div>



                            {application.message && (
                              <div className="bg-muted/30 p-3 rounded-lg mb-3">
                                <p className="text-sm font-semibold mb-1">Application Message:</p>
                                <p className="text-sm text-muted-foreground">{application.message}</p>
                              </div>
                            )}

                            <p className="text-xs text-muted-foreground">
                              Applied {new Date(application.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <div className="flex md:flex-col gap-2">
                          <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="flex-1 md:w-full"
                          >
                            <Link to={`/profile/${application.workerId._id}`}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Profile
                            </Link>
                          </Button>
                          <Button
                            onClick={() => updateApplicationStatus(application._id, 'accepted')}
                            size="sm"
                            className="flex-1 md:w-full bg-success hover:bg-success/90"
                          >
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Accept
                          </Button>
                          <Button
                            onClick={() => updateApplicationStatus(application._id, 'rejected')}
                            variant="destructive"
                            size="sm"
                            className="flex-1 md:w-full"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Reviewed Applications */}
            {reviewedApplications.length > 0 && (
              <div>
                <h2 className="text-2xl font-semibold mb-4">
                  Reviewed ({reviewedApplications.length})
                </h2>
                <div className="space-y-4">
                  {reviewedApplications.map((application) => (
                    <Card key={application._id} className="p-6 opacity-75">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Avatar>
                            <AvatarFallback>
                              {application.workerId?.email?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold">{application.workerId?.email}</p>
                            <p className="text-sm text-muted-foreground">{application.jobId?.title}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 flex-wrap">
                          <Badge className={getStatusColor(application.status)}>
                            {application.status}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            Job: {application.jobId?.status || 'open'}
                          </Badge>
                          <Button asChild variant="outline" size="sm">
                            <Link to={`/profile/${application.workerId._id}`}>View Profile</Link>
                          </Button>
                          
                          {/* Mark Job Complete Button */}
                          {application.status === 'accepted' && application.jobId?.status === 'open' && (
                            <Button
                              onClick={() => markJobComplete(application.jobId._id)}
                              variant="default"
                              size="sm"
                            >
                              Mark Job Complete
                            </Button>
                          )}
                          
                          {/* Rate Worker Button */}
                          {application.status === 'accepted' && application.jobId?.status === 'completed' && (
                            <Button
                              onClick={() => setShowRatingForm({
                                workerId: application.workerId._id,
                                workerEmail: application.workerId.email,
                                jobId: application.jobId._id,
                                jobTitle: application.jobId.title
                              })}
                              variant="secondary"
                              size="sm"
                            >
                              <Star className="h-4 w-4 mr-2" />
                              Rate Worker
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Rating Form Modal */}
        {showRatingForm && (
          <RatingForm
            workerId={showRatingForm.workerId}
            workerEmail={showRatingForm.workerEmail}
            jobId={showRatingForm.jobId}
            jobTitle={showRatingForm.jobTitle}
            onClose={() => setShowRatingForm(null)}
            onSuccess={() => {
              // Optionally refresh applications to update UI
              fetchApplications();
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Applications;