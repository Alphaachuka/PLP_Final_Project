import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, X, Save, User as UserIcon } from "lucide-react";
import { z } from "zod";
import { AvatarUpload } from "@/components/FileUpload";

const profileSchema = z.object({
  full_name: z.string().min(2).max(100),
  bio: z.string().max(500).optional(),
  city: z.string().max(100).optional(),
  hourly_rate: z.number().min(1).max(10000).optional(),
  availability: z.string().max(50).optional(),
  years_experience: z.number().min(0).max(50).optional(),
});

const skillSchema = z.object({
  skill_name: z.string().min(2).max(50),
  experience_level: z.enum(["beginner", "intermediate", "expert"]),
  years_experience: z.number().min(0).max(50).optional(),
});

const ProfileEdit = () => {
  const [skills, setSkills] = useState<any[]>([]);
  const [newSkill, setNewSkill] = useState({ skillName: "", experienceLevel: "intermediate", yearsExperience: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, profile, updateProfile, refreshProfile } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    fetchSkills();
  }, [user, navigate]);

  const fetchSkills = async () => {
    setIsLoading(true);
    try {
      // For now, we'll use empty skills array since we don't have skills API yet
      setSkills([]);
    } catch (error) {
      console.error("Error fetching skills:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);

    const formData = new FormData(e.currentTarget);
    
    try {
      const profileData = {
        fullName: formData.get("fullName") as string,
        bio: formData.get("bio") as string || undefined,
        location: { 
          address: formData.get("city") as string || "",
          lat: 0,
          lng: 0
        },
        hourlyRate: parseFloat(formData.get("hourlyRate") as string) || undefined,
        availability: formData.get("availability") as string || undefined,
        yearsExperience: parseInt(formData.get("yearsExperience") as string) || undefined,
        profileComplete: true,
      };

      await updateProfile(profileData);
      await refreshProfile();

      toast({
        title: "Profile Updated",
        description: "Your profile has been saved successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save profile",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const addSkill = async () => {
    if (!newSkill.skillName.trim()) return;

    try {
      await api.addSkill(newSkill);
      
      setSkills([...skills, { ...newSkill, _id: Date.now().toString() }]);
      setNewSkill({ skillName: "", experienceLevel: "intermediate", yearsExperience: 0 });
      
      toast({
        title: "Skill Added",
        description: "New skill has been added to your profile",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add skill",
        variant: "destructive",
      });
    }
  };

  const removeSkill = async (skillId: string) => {
    try {
      setSkills(skills.filter(s => s._id !== skillId));
      toast({
        title: "Skill Removed",
        description: "Skill has been removed from your profile",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to remove skill",
        variant: "destructive",
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

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/dashboard" className="text-2xl font-bold text-primary">← Back to Dashboard</Link>
          <Button asChild variant="outline">
            <Link to={`/profile/${user?.id}`}>View Public Profile</Link>
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <UserIcon className="h-10 w-10 text-primary" />
            Edit Worker Profile
          </h1>
          <p className="text-muted-foreground">Update your profile to attract more employers</p>
        </div>

        {/* Profile Form */}
        <Card className="p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">Basic Information</h2>
          
          {/* Avatar Upload Section */}
          <div className="mb-6">
            <Label className="text-base font-medium mb-3 block">Profile Picture</Label>
            <div className="flex items-center gap-6">
              <AvatarUpload
                currentAvatar={profile?.avatarUrl}
                onUpload={async (file) => {
                  try {
                    const result = await api.uploadAvatar(file);
                    await refreshProfile(); // Refresh to get updated avatar
                    return result;
                  } catch (error) {
                    throw error;
                  }
                }}
              />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-2">
                  Upload a professional profile picture to help employers recognize you.
                </p>
                <p className="text-xs text-muted-foreground">
                  Recommended: Square image, at least 200x200px, max 5MB
                </p>
                <p className="text-xs text-muted-foreground">
                  Supported formats: JPG, PNG, GIF
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                name="fullName"
                defaultValue={profile?.fullName}
                required
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                name="bio"
                defaultValue={profile?.bio}
                placeholder="Tell employers about yourself, your experience, and what makes you a great worker..."
                rows={4}
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground">Maximum 500 characters</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City/Location</Label>
                <Input
                  id="city"
                  name="city"
                  defaultValue={profile?.location?.address}
                  placeholder="e.g., Nairobi"
                  maxLength={100}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hourlyRate">Hourly Rate (KES)</Label>
                <Input
                  id="hourlyRate"
                  name="hourlyRate"
                  type="number"
                  step="1"
                  min="100"
                  max="100000"
                  defaultValue={profile?.hourlyRate}
                  placeholder="2500"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="availability">Availability</Label>
                <select
                  id="availability"
                  name="availability"
                  defaultValue={profile?.availability}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Select availability</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Weekends">Weekends only</option>
                  <option value="Flexible">Flexible</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="yearsExperience">Years of Experience</Label>
                <Input
                  id="yearsExperience"
                  name="yearsExperience"
                  type="number"
                  min="0"
                  max="50"
                  defaultValue={profile?.yearsExperience}
                  placeholder="5"
                />
              </div>
            </div>

            <Button type="submit" disabled={isSaving} className="w-full">
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Saving..." : "Save Profile"}
            </Button>
          </form>
        </Card>

        {/* Skills Section */}
        <Card className="p-6">
          <h2 className="text-2xl font-semibold mb-4">Skills</h2>
          
          {/* Existing Skills */}
          {skills.length > 0 && (
            <div className="space-y-2 mb-6">
              <Label>Your Skills</Label>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <Badge key={skill._id} variant="secondary" className="pl-3 pr-1 py-1">
                    <span className="mr-2">{skill.skillName} - {skill.experienceLevel}</span>
                    <button
                      type="button"
                      onClick={() => removeSkill(skill._id)}
                      className="hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Add New Skill */}
          <div className="space-y-4">
            <Label>Add New Skill</Label>
            <div className="grid md:grid-cols-3 gap-4">
              <Input
                placeholder="Skill name (e.g., Plumbing)"
                value={newSkill.skillName}
                onChange={(e) => setNewSkill({ ...newSkill, skillName: e.target.value })}
                maxLength={50}
              />
              <select
                value={newSkill.experienceLevel}
                onChange={(e) => setNewSkill({ ...newSkill, experienceLevel: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="expert">Expert</option>
              </select>
              <Input
                type="number"
                placeholder="Years"
                min="0"
                max="50"
                value={newSkill.yearsExperience || ""}
                onChange={(e) => setNewSkill({ ...newSkill, yearsExperience: parseInt(e.target.value) || 0 })}
              />
            </div>
            <Button type="button" onClick={addSkill} variant="secondary">
              <Plus className="h-4 w-4 mr-2" />
              Add Skill
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ProfileEdit;
