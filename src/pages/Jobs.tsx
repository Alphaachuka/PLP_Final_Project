import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import { MapPin, DollarSign, Clock, Search, Briefcase, Map, CheckCircle } from "lucide-react";
import { JobsMap } from "@/components/JobsMap";
import UpliftLogo from "@/components/UpliftLogo";

interface Job {
  _id: string;
  title: string;
  description: string;
  category: string;
  paymentAmount: number;
  estimatedDuration: string;
  location: { address: string; lat?: number; lng?: number };
  status: string;
  createdAt: string;
  employerId: {
    email: string;
  };
}

const Jobs = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [userApplications, setUserApplications] = useState<any[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    fetchJobs();
    if (user && user.roles.includes('worker')) {
      fetchUserApplications();
    }
  }, [user]);

  const fetchJobs = async () => {
    try {
      const data = await api.getJobs({ status: 'open' });
      setJobs(data || []);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserApplications = async () => {
    try {
      const applications = await api.getMyApplications();
      setUserApplications(applications);
    } catch (error) {
      console.error("Error fetching applications:", error);
    }
  };

  const getApplicationStatus = (jobId: string) => {
    const application = userApplications.find(app => 
      app.jobId && app.jobId._id === jobId
    );
    return application ? application.status : null;
  };

  const filteredJobs = jobs.filter(job =>
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <div className="flex items-center gap-2">
            <Link to="/dashboard" className="text-muted-foreground hover:text-primary">←</Link>
            <UpliftLogo to="/dashboard" size="md" showText={true} />
          </div>
          <Button asChild>
            <Link to="/jobs/new">Post a Job</Link>
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 flex items-center gap-3">
            <Briefcase className="h-10 w-10 text-primary" />
            Available Jobs
          </h1>
          <p className="text-muted-foreground">Find micro-jobs and opportunities near you</p>
        </div>

        <div className="mb-8">
          <div className="relative max-w-2xl">
            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search jobs by title, description, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Tabs defaultValue="grid" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="grid" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Grid View
            </TabsTrigger>
            <TabsTrigger value="map" className="flex items-center gap-2">
              <Map className="h-4 w-4" />
              Map View
            </TabsTrigger>
          </TabsList>

          <TabsContent value="grid">
            {filteredJobs.length === 0 ? (
              <Card className="p-12 text-center">
                <Briefcase className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No jobs found</h3>
                <p className="text-muted-foreground">
                  {searchTerm ? "Try adjusting your search" : "Check back later for new opportunities"}
                </p>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredJobs.map((job) => (
                  <Card key={job._id} className="p-6 hover:shadow-card transition-all flex flex-col">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <Badge variant="secondary">{job.category}</Badge>
                        <Badge className="bg-success text-white">{job.status}</Badge>
                      </div>

                      <h3 className="text-xl font-semibold mb-2 line-clamp-2">{job.title}</h3>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                        {job.description}
                      </p>

                      <div className="space-y-2 text-sm mb-4">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <DollarSign className="h-4 w-4" />
                          <span className="font-semibold text-foreground">KES {job.paymentAmount.toLocaleString()}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>{job.estimatedDuration || "Duration varies"}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>{job.location?.address || "Location not specified"}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">
                          Posted by: {job.employerId?.email || "Anonymous"}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                      {(() => {
                        const applicationStatus = getApplicationStatus(job._id);
                        if (applicationStatus) {
                          return (
                            <div className="flex items-center gap-2 w-full">
                              <Badge 
                                className={`flex-1 justify-center ${
                                  applicationStatus === 'accepted' ? 'bg-success text-white' :
                                  applicationStatus === 'rejected' ? 'bg-destructive text-white' :
                                  'bg-warning text-white'
                                }`}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Applied - {applicationStatus}
                              </Badge>
                              <Button asChild variant="outline" size="sm">
                                <Link to={`/jobs/${job._id}`}>View</Link>
                              </Button>
                            </div>
                          );
                        }
                        return (
                          <Button asChild className="flex-1">
                            <Link to={`/jobs/${job._id}`}>View Details</Link>
                          </Button>
                        );
                      })()}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="map">
            {filteredJobs.length === 0 ? (
              <Card className="p-12 text-center">
                <Map className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No jobs to display on map</h3>
                <p className="text-muted-foreground">Jobs with location data will appear here</p>
              </Card>
            ) : (
              <JobsMap jobs={filteredJobs} />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Jobs;