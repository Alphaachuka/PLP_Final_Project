import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
  Shield, 
  Users, 
  BookOpen, 
  Briefcase,
  TrendingUp,
  Settings,
  Database,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Trash2,
  ArrowLeft,
  Search,
  Filter
} from "lucide-react";

interface PlatformStats {
  totalUsers: number;
  totalCourses: number;
  totalJobs: number;
  totalEnrollments: number;
  totalApplications: number;
  totalRatings: number;
  recentActivity: any[];
}

interface User {
  _id: string;
  email: string;
  roles: string[];
  createdAt: string;
  isActive: boolean;
}

interface Course {
  _id: string;
  title: string;
  instructorId: { email: string };
  enrollmentCount: number;
  isPublished: boolean;
  createdAt: string;
}

interface Job {
  _id: string;
  title: string;
  employerId: { email: string };
  status: string;
  paymentAmount: number;
  createdAt: string;
}

const Admin = () => {
  const [stats, setStats] = useState<PlatformStats>({
    totalUsers: 0,
    totalCourses: 0,
    totalJobs: 0,
    totalEnrollments: 0,
    totalApplications: 0,
    totalRatings: 0,
    recentActivity: []
  });
  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    if (!user.roles.includes('admin')) {
      toast({
        title: "Access Denied",
        description: "You need admin privileges to access this page",
        variant: "destructive"
      });
      navigate("/dashboard");
      return;
    }

    fetchAdminData();
  }, [user, navigate, toast]);

  const fetchAdminData = async () => {
    try {
      console.log("Fetching admin data...");
      
      // Fetch platform statistics and data
      const [statsData, coursesData, jobsData, usersData, activityData] = await Promise.all([
        api.getPlatformStats().catch(() => ({ totalUsers: 0, totalCourses: 0, totalJobs: 0, totalEnrollments: 0, totalApplications: 0, totalRatings: 0 })),
        api.getCourses(),
        api.getJobs(),
        api.getUsers().catch(() => []),
        api.getRecentActivity().catch(() => [])
      ]);

      console.log("Stats data:", statsData);
      console.log("Courses data:", coursesData);
      console.log("Jobs data:", jobsData);
      console.log("Users data:", usersData);

      // Set platform stats
      setStats({
        ...statsData,
        recentActivity: activityData
      });

      setCourses(coursesData);
      setJobs(jobsData);
      setUsers(usersData);
    } catch (error) {
      console.error("Error fetching admin data:", error);
      toast({
        title: "Error",
        description: "Failed to load admin data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCourseStatus = async (courseId: string, currentStatus: boolean) => {
    try {
      console.log(`Toggling course ${courseId} from ${currentStatus} to ${!currentStatus}`);
      
      // Update course status
      await api.updateCourse(courseId, { isPublished: !currentStatus });
      
      // Update local state
      setCourses(prev => prev.map(course => 
        course._id === courseId 
          ? { ...course, isPublished: !currentStatus }
          : course
      ));

      toast({
        title: "Course Updated",
        description: `Course ${!currentStatus ? 'published' : 'unpublished'} successfully`
      });
    } catch (error) {
      console.error("Error updating course:", error);
      toast({
        title: "Error",
        description: "Failed to update course status",
        variant: "destructive"
      });
    }
  };

  const filteredCourses = courses.filter(course => 
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.instructorId?.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.employerId?.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || !user.roles.includes('admin')) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-12 text-center">
          <Shield className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">Access Denied</h3>
          <p className="text-muted-foreground mb-4">You need admin privileges to access this page</p>
          <Button asChild>
            <Link to="/dashboard">Back to Dashboard</Link>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="text-2xl font-bold text-primary flex items-center gap-2">
              <ArrowLeft className="h-6 w-6" />
              Back to Dashboard
            </Link>
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-accent" />
              <span className="font-semibold">Admin Panel</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Welcome, {user.email}</span>
            <Badge variant="secondary">Admin</Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-8 border-b">
          {[
            { id: 'overview', label: 'Overview', icon: Activity },
            { id: 'courses', label: 'Courses', icon: BookOpen },
            { id: 'jobs', label: 'Jobs', icon: Briefcase },
            { id: 'users', label: 'Users', icon: Users },
            { id: 'settings', label: 'Settings', icon: Settings }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-t-lg transition-colors ${
                  activeTab === tab.id 
                    ? 'bg-primary text-primary-foreground' 
                    : 'hover:bg-muted'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Platform Overview</h1>
              <p className="text-muted-foreground">Monitor and manage your platform's performance</p>
            </div>

            {/* Stats Grid */}
            <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4">
              <Card className="p-4 text-center">
                <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
                <div className="text-xs text-muted-foreground">Total Users</div>
              </Card>
              
              <Card className="p-4 text-center">
                <BookOpen className="h-8 w-8 mx-auto mb-2 text-accent" />
                <div className="text-2xl font-bold">{stats.totalCourses}</div>
                <div className="text-xs text-muted-foreground">Courses</div>
              </Card>
              
              <Card className="p-4 text-center">
                <Briefcase className="h-8 w-8 mx-auto mb-2 text-secondary" />
                <div className="text-2xl font-bold">{stats.totalJobs}</div>
                <div className="text-xs text-muted-foreground">Jobs</div>
              </Card>
              
              <Card className="p-4 text-center">
                <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <div className="text-2xl font-bold">{stats.totalEnrollments}</div>
                <div className="text-xs text-muted-foreground">Enrollments</div>
              </Card>
              
              <Card className="p-4 text-center">
                <Activity className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <div className="text-2xl font-bold">{stats.totalApplications}</div>
                <div className="text-xs text-muted-foreground">Applications</div>
              </Card>
              
              <Card className="p-4 text-center">
                <CheckCircle className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
                <div className="text-2xl font-bold">{stats.totalRatings}</div>
                <div className="text-xs text-muted-foreground">Ratings</div>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Database className="h-5 w-5 text-primary" />
                  System Health
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Database</span>
                    <Badge className="bg-green-100 text-green-800">Healthy</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">API</span>
                    <Badge className="bg-green-100 text-green-800">Online</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Storage</span>
                    <Badge className="bg-yellow-100 text-yellow-800">75% Used</Badge>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Activity className="h-5 w-5 text-accent" />
                  Recent Activity
                </h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {stats.recentActivity.length === 0 ? (
                    <div className="text-center py-4">
                      <Activity className="h-8 w-8 mx-auto mb-2 text-muted-foreground opacity-50" />
                      <p className="text-sm text-muted-foreground">No recent activity</p>
                    </div>
                  ) : (
                    stats.recentActivity.map((activity, index) => (
                      <div key={index} className="text-xs p-2 bg-muted rounded">
                        <div className="font-medium">{activity.description}</div>
                        <div className="text-muted-foreground">
                          {new Date(activity.timestamp).toLocaleString()}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Activity className="h-5 w-5 text-secondary" />
                  Quick Actions
                </h3>
                <div className="space-y-2">
                  <Button className="w-full" size="sm" onClick={() => setActiveTab('courses')}>
                    Manage Courses
                  </Button>
                  <Button className="w-full" size="sm" variant="outline" onClick={() => setActiveTab('jobs')}>
                    Manage Jobs
                  </Button>
                  <Button className="w-full" size="sm" variant="outline" onClick={() => setActiveTab('users')}>
                    Manage Users
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Courses Tab */}
        {activeTab === 'courses' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold">Course Management</h2>
                <p className="text-muted-foreground">Manage all courses on the platform</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search courses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {filteredCourses.length === 0 ? (
                <Card className="p-8 text-center">
                  <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-30" />
                  <h3 className="text-lg font-semibold mb-2">No Courses Found</h3>
                  <p className="text-muted-foreground">
                    {searchTerm ? "No courses match your search criteria" : "No courses have been created yet"}
                  </p>
                </Card>
              ) : (
                filteredCourses.map((course) => (
                  <Card key={course._id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold">{course.title}</h3>
                          <Badge variant={course.isPublished ? "default" : "secondary"}>
                            {course.isPublished ? "Published" : "Draft"}
                          </Badge>
                          <Badge variant="outline">
                            {course.enrollmentCount || 0} students
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Instructor: {course.instructorId?.email || 'Unknown'} • 
                          Created: {new Date(course.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button asChild variant="outline" size="sm">
                          <Link to={`/courses/${course._id}`}>
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Link>
                        </Button>
                        <Button
                          onClick={() => toggleCourseStatus(course._id, course.isPublished)}
                          variant={course.isPublished ? "destructive" : "default"}
                          size="sm"
                        >
                          {course.isPublished ? "Unpublish" : "Publish"}
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}

        {/* Jobs Tab */}
        {activeTab === 'jobs' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold">Job Management</h2>
                <p className="text-muted-foreground">Monitor all job postings on the platform</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search jobs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {filteredJobs.length === 0 ? (
                <Card className="p-8 text-center">
                  <Briefcase className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-30" />
                  <h3 className="text-lg font-semibold mb-2">No Jobs Found</h3>
                  <p className="text-muted-foreground">
                    {searchTerm ? "No jobs match your search criteria" : "No jobs have been posted yet"}
                  </p>
                </Card>
              ) : (
                filteredJobs.map((job) => (
                  <Card key={job._id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold">{job.title}</h3>
                          <Badge variant={job.status === 'open' ? "default" : "secondary"}>
                            {job.status}
                          </Badge>
                          <Badge variant="outline">
                            KES {job.paymentAmount?.toLocaleString() || 0}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Employer: {job.employerId?.email || 'Unknown'} • 
                          Posted: {new Date(job.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button asChild variant="outline" size="sm">
                          <Link to={`/jobs/${job._id}`}>
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newStatus = job.status === 'open' ? 'closed' : 'open';
                            api.updateJobStatus(job._id, newStatus)
                              .then(() => {
                                setJobs(prev => prev.map(j => 
                                  j._id === job._id ? { ...j, status: newStatus } : j
                                ));
                                toast({
                                  title: "Job Updated",
                                  description: `Job status changed to ${newStatus}`
                                });
                              })
                              .catch(error => {
                                toast({
                                  title: "Error",
                                  description: "Failed to update job status",
                                  variant: "destructive"
                                });
                              });
                          }}
                        >
                          {job.status === 'open' ? 'Close' : 'Reopen'}
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold">User Management</h2>
                <p className="text-muted-foreground">Manage platform users and their roles</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {users.length === 0 ? (
                <Card className="p-8 text-center">
                  <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-30" />
                  <h3 className="text-lg font-semibold mb-2">No Users Found</h3>
                  <p className="text-muted-foreground">
                    {searchTerm ? "No users match your search criteria" : "No users have registered yet"}
                  </p>
                </Card>
              ) : (
                users
                  .filter(user => 
                    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    user.roles.some(role => role.toLowerCase().includes(searchTerm.toLowerCase()))
                  )
                  .map((user) => (
                    <Card key={user._id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold">{user.email}</h3>
                            <div className="flex gap-1">
                              {user.roles.map(role => (
                                <Badge key={role} variant={role === 'admin' ? 'destructive' : 'default'}>
                                  {role}
                                </Badge>
                              ))}
                            </div>
                            <Badge variant={user.isActive !== false ? "default" : "secondary"}>
                              {user.isActive !== false ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            User ID: {user._id} • 
                            Joined: {new Date(user.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              // Toggle user active status
                              api.updateUser(user._id, { isActive: !user.isActive })
                                .then(() => {
                                  setUsers(prev => prev.map(u => 
                                    u._id === user._id ? { ...u, isActive: !u.isActive } : u
                                  ));
                                  toast({
                                    title: "User Updated",
                                    description: `User ${user.isActive ? 'deactivated' : 'activated'} successfully`
                                  });
                                })
                                .catch(error => {
                                  toast({
                                    title: "Error",
                                    description: "Failed to update user",
                                    variant: "destructive"
                                  });
                                });
                            }}
                          >
                            {user.isActive !== false ? "Deactivate" : "Activate"}
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))
              )}
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-2">Platform Settings</h2>
              <p className="text-muted-foreground">Configure platform-wide settings</p>
            </div>
            
            <Card className="p-8 text-center">
              <Settings className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-30" />
              <h3 className="text-lg font-semibold mb-2">Settings Panel Coming Soon</h3>
              <p className="text-muted-foreground">Advanced configuration options will be available in the next update</p>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;