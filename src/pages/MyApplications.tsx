import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Briefcase, 
  Clock,
  CheckCircle2,
  XCircle,
  Eye
} from "lucide-react";

interface Application {
  _id: string;
  status: string;
  message: string;
  createdAt: string;
  jobId: {
    _id: string;
    title: string;
    paymentAmount: number;
    category: string;
  };
}

const MyApplications = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    if (!user.roles.includes('worker')) {
      toast({
        title: "Access Denied",
        description: "You need to be a worker to view applications",
        variant: "destructive"
      });
      navigate("/dashboard");
      return;
    }

    fetchApplications();
  }, [user, navigate, toast]);

  const fetchApplications = async () => {
    try {
      const applications = await api.getMyApplications();
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "accepted":
        return <CheckCircle2 className="h-4 w-4" />;
      case "rejected":
        return <XCircle className="h-4 w-4" />;
      case "pending":
        return <Clock className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || !user.roles.includes('worker')) {
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

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <Briefcase className="h-10 w-10 text-primary" />
            My Applications
          </h1>
          <p className="text-muted-foreground">
            {pendingApplications.length} pending application{pendingApplications.length !== 1 ? "s" : ""}
          </p>
        </div>

        {applications.length === 0 ? (
          <Card className="p-12 text-center">
            <Briefcase className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-30" />
            <h3 className="text-xl font-semibold mb-2">No applications yet</h3>
            <p className="text-muted-foreground mb-4">
              Start applying to jobs to see your applications here
            </p>
            <Button asChild>
              <Link to="/jobs">Browse Jobs</Link>
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
                    <Card key={application._id} className="p-6">
                      <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="text-xl font-semibold mb-1">
                                {application.jobId?.title}
                              </h3>
                              <p className="text-sm text-muted-foreground mb-2">
                                Category: {application.jobId?.category}
                              </p>
                              <p className="text-sm font-semibold text-success">
                                KES {application.jobId?.paymentAmount?.toLocaleString()}
                              </p>
                            </div>
                            <Badge className={getStatusColor(application.status)}>
                              {getStatusIcon(application.status)}
                              <span className="ml-1">{application.status}</span>
                            </Badge>
                          </div>

                          {application.message && (
                            <div className="bg-muted/30 p-3 rounded-lg mb-3">
                              <p className="text-sm font-semibold mb-1">Your Message:</p>
                              <p className="text-sm text-muted-foreground">{application.message}</p>
                            </div>
                          )}

                          <p className="text-xs text-muted-foreground">
                            Applied {new Date(application.createdAt).toLocaleDateString()}
                          </p>
                        </div>

                        <div className="flex md:flex-col gap-2">
                          <Button asChild variant="outline" size="sm" className="flex-1 md:w-full">
                            <Link to={`/jobs/${application.jobId?._id}`}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Job
                            </Link>
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
                    <Card key={application._id} className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">{application.jobId?.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            Applied {new Date(application.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className={getStatusColor(application.status)}>
                            {getStatusIcon(application.status)}
                            <span className="ml-1">{application.status}</span>
                          </Badge>
                          <Button asChild variant="outline" size="sm">
                            <Link to={`/jobs/${application.jobId?._id}`}>View Job</Link>
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyApplications;