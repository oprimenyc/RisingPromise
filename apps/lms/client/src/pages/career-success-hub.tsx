import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Bot, 
  FileUser, 
  Search, 
  MessageSquare, 
  ArrowRight, 
  Star,
  Briefcase,
  Users,
  Target
} from "lucide-react";
import { LoadingScreen } from '@/components/ui/loading-spinner';
import { Link } from "wouter";

export default function CareerSuccessHub() {
  const { toast } = useToast();
  const { user, isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const careerResources = [
    {
      id: "ai-workplace",
      title: "AI in the Modern Workplace",
      description: "Master AI tools and concepts essential for today's IT professionals",
      icon: Bot,
      badge: "Essential",
      badgeColor: "bg-blue-500",
      link: "/career/ai-workplace",
      features: ["AI Tool Mastery", "Industry Applications", "Future-Ready Skills"]
    },
    {
      id: "resume-builder",
      title: "AI-Powered Resume Optimization",
      description: "Create compelling resumes that stand out to employers using AI",
      icon: FileUser,
      badge: "Premium",
      badgeColor: "bg-purple-500",
      link: "/resume-builder",
      features: ["AI Optimization", "Industry Templates", "ATS Compatible"]
    },
    {
      id: "job-search",
      title: "Strategic Job Search",
      description: "Navigate the job market with proven strategies and networking techniques",
      icon: Search,
      badge: "Strategic",
      badgeColor: "bg-green-500",
      link: "/career/job-search",
      features: ["Networking Strategies", "Job Board Mastery", "Hidden Job Markets"]
    },
    {
      id: "interview-mastery",
      title: "Interview Mastery",
      description: "Excel in technical interviews with comprehensive preparation strategies",
      icon: MessageSquare,
      badge: "Advanced",
      badgeColor: "bg-orange-500",
      link: "/career/interview-mastery",
      features: ["STAR Method", "Technical Questions", "Mock Interviews"]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Briefcase className="w-8 h-8 text-blue-600 dark:text-blue-400 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Career Success Hub</h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Comprehensive career development resources designed to accelerate your transition from certification to career success
          </p>
          <div className="mt-6 flex items-center justify-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center">
              <Target className="w-4 h-4 mr-1" />
              <span>Job-Ready Skills</span>
            </div>
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-1" />
              <span>Industry Networking</span>
            </div>
            <div className="flex items-center">
              <Star className="w-4 h-4 mr-1" />
              <span>Career Excellence</span>
            </div>
          </div>
        </div>

        {/* Career Resources Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8 mb-12">
          {careerResources.map((resource) => {
            const IconComponent = resource.icon;
            return (
              <Card key={resource.id} className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-blue-200 dark:hover:border-blue-800" data-testid={`card-career-${resource.id}`}>
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <IconComponent className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <Badge className={`${resource.badgeColor} text-white text-xs font-medium px-2 py-1`}>
                        {resource.badge}
                      </Badge>
                    </div>
                  </div>
                  <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {resource.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {resource.description}
                  </p>
                  
                  {/* Features List */}
                  <div className="space-y-2 mb-6">
                    {resource.features.map((feature, index) => (
                      <div key={index} className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></div>
                        {feature}
                      </div>
                    ))}
                  </div>

                  <Link href={resource.link}>
                    <Button 
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white group-hover:shadow-md transition-all"
                      data-testid={`button-start-${resource.id}`}
                    >
                      Start Learning
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Success Statistics */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">Career Success Outcomes</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">87%</div>
              <div className="text-gray-600 dark:text-gray-400">Job Placement Rate</div>
              <div className="text-sm text-gray-500 dark:text-gray-500 mt-1">Within 6 months</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">$65K</div>
              <div className="text-gray-600 dark:text-gray-400">Average Starting Salary</div>
              <div className="text-sm text-gray-500 dark:text-gray-500 mt-1">Entry-level positions</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">94%</div>
              <div className="text-gray-600 dark:text-gray-400">Student Satisfaction</div>
              <div className="text-sm text-gray-500 dark:text-gray-500 mt-1">Career preparation</div>
            </div>
          </div>
        </div>

        {/* Return to Dashboard */}
        <div className="text-center">
          <Link href="/dashboard">
            <Button variant="outline" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white" data-testid="button-back-dashboard">
              ← Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}