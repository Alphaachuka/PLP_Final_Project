import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  User, 
  Star, 
  Briefcase, 
  Award, 
  MapPin, 
  DollarSign,
  Calendar,
  ArrowLeft
} from "lucide-react";

interface Profile {
  _id: string;
  userId: string;
  fullName: string;
  bio: string;
  avatarUrl: string;
  location: { address: string };
  hourlyRate: number;
  availability: string;
  yearsExperience: number;
  experience: Experience[];
  skills: Skill[];
  averageRating: number;
  totalReviews: number;
}

interface Rating {
  _id: string;
  rating: number;
  review: string;
  createdAt: string;
  employerId: {
    email: string;
  };
  jobId: {
    title: string;
  };
}

interface Skill {
  skillName: string;
  experienceLevel: string;
  yearsExperience: number;
}

interface Experience {
  jobTitle: string;
  company: string;
  description: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
}

const WorkerProfile = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (id) {
      fetchWorkerProfile();
      setIsOwnProfile(user?.id === id);
    }
  }, [id, user]);

  const fetchWorkerProfile = async () => {
    try {
      const profileData = await api.getWorkerProfile(id!);
      setProfile(profileData);
      
      // Fetch ratings
      const ratingsData = await api.getWorkerRatings(id!);
      setRatings(ratingsData);
    } catch (error) {
      console.error("Error fetching worker profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getExperienceLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "expert":
        return "bg-green-600 text-white";
      case "intermediate":
        return "bg-yellow-600 text-white";
      default:
        return "bg-blue-600 text-white";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-12 text-center">
          <User className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">Profile not found</h3>
          <Button asChild className="mt-4">
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
          <Link to="/dashboard" className="text-2xl font-bold text-primary flex items-center gap-2">
            <ArrowLeft className="h-6 w-6" />
            Back
          </Link>
          {isOwnProfile && (
            <Button asChild>
              <Link to="/profile/edit">Edit Profile</Link>
            </Button>
          )}
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header Section */}
        <Card className="p-8 mb-6">
          <div className="flex flex-col md:flex-row gap-6">
            <Avatar className="h-32 w-32">
              <AvatarFallback className="text-4xl">
                {profile.fullName?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{profile.fullName}</h1>
              
              <div className="flex flex-wrap items-center gap-4 mb-4 text-muted-foreground">
                {profile.location?.address && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{profile.location.address}</span>
                  </div>
                )}
                {profile.hourlyRate && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    <span>KES {profile.hourlyRate.toLocaleString()}/hour</span>
                  </div>
                )}
                {profile.yearsExperience && (
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    <span>{profile.yearsExperience} years experience</span>
                  </div>
                )}
              </div>

              {profile.bio && (
                <p className="text-muted-foreground mb-4">{profile.bio}</p>
              )}

              {profile.availability && (
                <Badge variant="secondary">{profile.availability}</Badge>
              )}
            </div>
          </div>
        </Card>

        {/* Stats Section */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <Card className="p-4 text-center">
            <div className="text-3xl font-bold text-accent mb-1 flex items-center justify-center gap-1">
              <Star className="h-6 w-6 fill-current" />
              {profile.averageRating?.toFixed(1) || '0.0'}
            </div>
            <div className="text-sm text-muted-foreground">Average Rating</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-3xl font-bold mb-1">{profile.totalReviews || 0}</div>
            <div className="text-sm text-muted-foreground">Reviews</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-3xl font-bold text-primary mb-1">{profile.experience?.length || 0}</div>
            <div className="text-sm text-muted-foreground">Work Experience</div>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Skills Section */}
          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Award className="h-6 w-6 text-primary" />
              Skills
            </h2>
            {!profile.skills || profile.skills.length === 0 ? (
              <p className="text-muted-foreground">No skills added yet</p>
            ) : (
              <div className="space-y-3">
                {profile.skills.map((skill, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div>
                      <p className="font-semibold">{skill.skillName}</p>
                      {skill.yearsExperience && (
                        <p className="text-sm text-muted-foreground">{skill.yearsExperience} years</p>
                      )}
                    </div>
                    <Badge className={getExperienceLevelColor(skill.experienceLevel)}>
                      {skill.experienceLevel}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Work Experience Section */}
          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Briefcase className="h-6 w-6 text-primary" />
              Work Experience
            </h2>
            {!profile.experience || profile.experience.length === 0 ? (
              <p className="text-muted-foreground">No experience added yet</p>
            ) : (
              <div className="space-y-4">
                {profile.experience.map((exp, index) => (
                  <div key={index} className="border-l-2 border-primary pl-4">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-semibold">{exp.jobTitle}</h3>
                      {exp.isCurrent && (
                        <Badge className="bg-green-600 text-white">Current</Badge>
                      )}
                    </div>
                    {exp.company && (
                      <p className="text-sm text-muted-foreground mb-2">{exp.company}</p>
                    )}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {new Date(exp.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        {' - '}
                        {exp.isCurrent ? 'Present' : new Date(exp.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    {exp.description && (
                      <p className="text-sm text-muted-foreground">{exp.description}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Ratings Section */}
        <Card className="p-6 mt-6">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <Star className="h-6 w-6 text-primary" />
            Reviews & Ratings ({ratings.length})
          </h2>
          
          {ratings.length === 0 ? (
            <p className="text-muted-foreground">No reviews yet</p>
          ) : (
            <div className="space-y-4">
              {ratings.map((rating, index) => (
                <div key={rating._id} className="border-b last:border-b-0 pb-4 last:pb-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < rating.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-muted-foreground"
                            }`}
                          />
                        ))}
                        <span className="font-semibold">{rating.rating}/5</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        By {rating.employerId.email} • {rating.jobId.title}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(rating.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {rating.review && (
                    <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
                      "{rating.review}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default WorkerProfile;