import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import UpliftLogo from "@/components/UpliftLogo";
import { 
  Briefcase, 
  GraduationCap, 
  Users, 
  Wallet, 
  Heart,
  TrendingUp,
  Award,
  MapPin,
  Sparkles,
  Shield,
  Zap,
  Globe,
  ArrowRight,
  CheckCircle2
} from "lucide-react";

const Index = () => {
  const features = [
    {
      icon: Briefcase,
      title: "Find Micro-Jobs",
      description: "Access short-term tasks near you - cleaning, delivery, farm help, and more",
      color: "text-primary",
      gradient: "from-primary/10 to-primary/5",
      sdg: "SDG 1: No Poverty"
    },
    {
      icon: GraduationCap,
      title: "Learn New Skills",
      description: "Free courses, video lessons, and mentorship to grow your capabilities",
      color: "text-secondary",
      gradient: "from-secondary/10 to-secondary/5",
      sdg: "SDG 4: Quality Education"
    },
    {
      icon: Wallet,
      title: "Earn & Save",
      description: "Simple in-app wallet for payments and tracking your earnings",
      color: "text-accent",
      gradient: "from-accent/10 to-accent/5",
      sdg: "Financial Inclusion"
    },
    {
      icon: Users,
      title: "Community Support",
      description: "Connect with mentors, employers, and fellow community members",
      color: "text-info",
      gradient: "from-info/10 to-info/5",
      sdg: "SDG 5: Gender Equality"
    }
  ];

  const stats = [
    { label: "Active Jobs", value: "1,240+", icon: Briefcase },
    { label: "Courses Available", value: "350+", icon: GraduationCap },
    { label: "Community Members", value: "15,000+", icon: Users },
    { label: "Total Earnings", value: "KES 250M+", icon: TrendingUp }
  ];

  const benefits = [
    { text: "No fees to join or apply for jobs", icon: CheckCircle2 },
    { text: "Verified employers & mentors", icon: Shield },
    { text: "Instant payments to your wallet", icon: Zap },
    { text: "Learn at your own pace", icon: Globe }
  ];

  const impactStories = [
    {
      name: "Sarah M.",
      role: "Domestic Worker",
      story: "Found 15 jobs in my area within the first month. Uplift changed my life!",
      earnings: "+KES 85,000"
    },
    {
      name: "James K.",
      role: "Student",
      story: "Completed 5 courses and got certified. Now I'm working as a mentor.",
      courses: "5 Courses"
    },
    {
      name: "Maria L.",
      role: "Employer",
      story: "Found reliable workers quickly. The platform is easy to use and secure.",
      hires: "12 Hires"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-hero text-white">
        {/* Animated background pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnptMCAxMmMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLW9wYWNpdHk9Ii4xIi8+PC9nPjwvc3ZnPg==')] opacity-10 animate-float"></div>
        
        <div className="container mx-auto px-4 py-24 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-6xl md:text-7xl font-display font-bold mb-6 leading-tight animate-fade-in-up">
              Empowering Communities,
              <br />
              <span className="bg-gradient-to-r from-white via-white/90 to-white/80 bg-clip-text text-transparent">
                One Opportunity at a Time
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl mb-10 text-white/90 max-w-2xl mx-auto leading-relaxed animate-fade-in-up" style={{animationDelay: '0.2s'}}>
              Connect to micro-jobs, learn new skills, and build a better future. 
              A platform designed for <span className="font-semibold text-white">workers, employers, students, and mentors.</span>
            </p>
            
            <div className="flex flex-wrap gap-4 justify-center mb-12 animate-fade-in-up" style={{animationDelay: '0.3s'}}>
              <Button asChild size="lg" className="text-lg px-8 py-6 bg-white text-primary hover:bg-white/90 shadow-glow group">
                <Link to="/auth" className="flex items-center gap-2">
                  Get Started Free
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-lg px-8 py-6 bg-white/10 backdrop-blur-sm border-white/30 hover:bg-white/20 hover:border-white/50">
                <Link to="/jobs">Browse Jobs</Link>
              </Button>
            </div>

            {/* Benefits Pills */}
            <div className="flex flex-wrap gap-4 justify-center animate-fade-in-up" style={{animationDelay: '0.4s'}}>
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                  <benefit.icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{benefit.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Enhanced Wave decoration */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V120Z" fill="hsl(var(--background))"/>
          </svg>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {stats.map((stat, index) => (
              <Card 
                key={index} 
                className="p-6 text-center hover-lift bg-gradient-card border-border/50 animate-scale-in"
                style={{animationDelay: `${index * 0.1}s`}}
              >
                <stat.icon className="h-8 w-8 mx-auto mb-3 text-primary" />
                <div className="text-3xl md:text-4xl font-display font-bold text-foreground mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground font-medium">
                  {stat.label}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-4">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-primary">Platform Features</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4 text-foreground">
              Everything You Need to <span className="text-primary">Succeed</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Our comprehensive platform brings together jobs, education, and community support
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className={`p-8 hover-lift bg-gradient-to-br ${feature.gradient} border-border/50 group cursor-pointer`}
              >
                <div className={`p-4 rounded-2xl bg-gradient-to-br from-background to-background/80 w-fit mb-6 shadow-md group-hover:shadow-lg transition-shadow`}>
                  <feature.icon className={`h-8 w-8 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-display font-bold mb-3 text-foreground group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  {feature.description}
                </p>
                <div className="inline-flex items-center gap-2 text-xs font-semibold text-primary bg-primary/10 px-3 py-1.5 rounded-full">
                  <Heart className="h-3 w-3" />
                  {feature.sdg}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Stories Section */}
      <section className="py-20 bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 bg-secondary/10 px-4 py-2 rounded-full mb-4">
              <Award className="h-4 w-4 text-secondary" />
              <span className="text-sm font-semibold text-secondary">Success Stories</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4 text-foreground">
              Real People, <span className="text-secondary">Real Impact</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              See how Uplift is transforming lives across communities
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {impactStories.map((story, index) => (
              <Card 
                key={index} 
                className="p-8 hover-lift bg-gradient-card border-border/50 relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-bl-full -mr-16 -mt-16 group-hover:scale-110 transition-transform"></div>
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="font-display font-bold text-lg text-foreground">{story.name}</h4>
                      <p className="text-sm text-muted-foreground">{story.role}</p>
                    </div>
                    {story.earnings && (
                      <div className="bg-gradient-success text-white px-3 py-1 rounded-full text-sm font-bold">
                        {story.earnings}
                      </div>
                    )}
                    {story.courses && (
                      <div className="bg-gradient-accent text-white px-3 py-1 rounded-full text-sm font-bold">
                        {story.courses}
                      </div>
                    )}
                    {story.hires && (
                      <div className="bg-primary text-white px-3 py-1 rounded-full text-sm font-bold">
                        {story.hires}
                      </div>
                    )}
                  </div>
                  <p className="text-muted-foreground italic leading-relaxed">
                    "{story.story}"
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-hero text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnptMCAxMmMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLW9wYWNpdHk9Ii4wNSIvPjwvZz48L3N2Zz4=')] opacity-20"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
              Ready to Transform Your Future?
            </h2>
            <p className="text-xl mb-10 text-white/90 max-w-2xl mx-auto">
              Join thousands of community members already building better lives through Uplift
            </p>
            
            <div className="flex flex-wrap gap-4 justify-center">
              <Button asChild size="lg" className="text-lg px-8 py-6 bg-white text-primary hover:bg-white/90 shadow-glow group">
                <Link to="/auth" className="flex items-center gap-2">
                  Create Free Account
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-lg px-8 py-6 bg-white/10 backdrop-blur-sm border-white/30 hover:bg-white/20 hover:border-white/50">
                <Link to="/courses">Explore Courses</Link>
              </Button>
            </div>

            <div className="mt-12 flex flex-wrap gap-8 justify-center items-center text-white/80">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                <span>Free forever</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                <span>Start earning today</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/50 py-12 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <UpliftLogo to="/" size="md" showText={true} className="mb-4" />
              <p className="text-sm text-muted-foreground">
                Empowering communities through jobs, education, and opportunities.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-foreground">Platform</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/jobs" className="hover:text-primary transition-colors">Find Jobs</Link></li>
                <li><Link to="/courses" className="hover:text-primary transition-colors">Courses</Link></li>
                <li><Link to="/auth" className="hover:text-primary transition-colors">Sign Up</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-foreground">For Employers</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/job-post" className="hover:text-primary transition-colors">Post a Job</Link></li>
                <li><Link to="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-foreground">About</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">About Uplift</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">UN SDG Goals</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
            <p>&copy; 2025 Uplift - Empowering Communities. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;