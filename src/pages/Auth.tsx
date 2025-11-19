import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Briefcase, GraduationCap, Users, Award, Heart, Shield } from "lucide-react";

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login, register } = useAuth();

  const roles = [
    { value: "worker", label: "Worker", icon: Briefcase, desc: "Find micro-jobs" },
    { value: "employer", label: "Employer", icon: Users, desc: "Post tasks" },
    { value: "student", label: "Student", icon: GraduationCap, desc: "Learn skills" },
    { value: "mentor", label: "Mentor", icon: Award, desc: "Teach others" },
    { value: "admin", label: "Admin", icon: Shield, desc: "Manage platform" }
  ];

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const fullName = formData.get("fullName") as string;

    if (selectedRoles.length === 0) {
      toast({
        title: "Role Required",
        description: "Please select at least one role to continue",
        variant: "destructive"
      });
      setIsLoading(false);
      return;
    }

    try {
      await register(email, password, fullName, selectedRoles);
      
      toast({
        title: "Account created!",
        description: "Welcome to the community platform",
      });
      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create account",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      await login(email, password);
      
      toast({
        title: "Welcome back!",
        description: "You've successfully signed in",
      });
      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to sign in",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleRole = (role: string) => {
    setSelectedRoles(prev =>
      prev.includes(role)
        ? prev.filter(r => r !== role)
        : [...prev, role]
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background p-4">
      <Card className="w-full max-w-lg p-8 shadow-lg">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-hero rounded-2xl mb-4">
            <Heart className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold">Community Platform</h1>
          <p className="text-muted-foreground mt-2">Empowering communities together</p>
        </div>

        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="signin">
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signin-email">Email</Label>
                <Input
                  id="signin-email"
                  name="email"
                  type="email"
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signin-password">Password</Label>
                <Input
                  id="signin-password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>

              <div className="text-center mt-4">
                <a 
                  href="/forgot-password" 
                  className="text-sm text-muted-foreground hover:text-primary underline"
                >
                  Forgot your password?
                </a>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="John Doe"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+254 700 000000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  name="email"
                  type="email"
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <Input
                  id="signup-password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  minLength={6}
                  required
                />
              </div>

              <div className="space-y-3">
                <Label>Select Your Role(s)</Label>
                <div className="space-y-2">
                  {roles.map((role) => (
                    <label
                      key={role.value}
                      className={`flex items-start space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedRoles.includes(role.value)
                          ? role.value === "admin" 
                            ? "border-red-500 bg-red-50" 
                            : "border-primary bg-primary/5"
                          : role.value === "admin"
                            ? "border-red-200 hover:border-red-400"
                            : "border-border hover:border-primary/50"
                      }`}
                    >
                      <Checkbox
                        checked={selectedRoles.includes(role.value)}
                        onCheckedChange={() => toggleRole(role.value)}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <role.icon className="h-4 w-4" />
                          <span className="font-medium text-sm">{role.label}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{role.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating account..." : "Create Account"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default Auth;