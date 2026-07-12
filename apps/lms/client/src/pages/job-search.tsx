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
  Search, 
  Users, 
  Globe, 
  Target, 
  MapPin, 
  TrendingUp,
  CheckCircle,
  ExternalLink,
  Briefcase,
  Network,
  FileText
} from "lucide-react";
import { LoadingScreen } from '@/components/ui/loading-spinner';
import { Link } from "wouter";

export default function JobSearch() {
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

  const searchStrategies = [
    {
      title: "Hidden Job Market Mastery",
      description: "Access 70% of jobs never publicly advertised through strategic networking and direct outreach",
      icon: Network,
      topics: ["Company Research", "Direct Outreach", "Informational Interviews", "Industry Connections"],
      timeInvestment: "2-3 hours weekly"
    },
    {
      title: "Online Job Board Optimization",
      description: "Maximize visibility and response rates on major job platforms",
      icon: Globe,
      topics: ["LinkedIn Optimization", "Indeed Strategy", "Glassdoor Insights", "Tech-Specific Boards"],
      timeInvestment: "1 hour daily"
    },
    {
      title: "Strategic Networking",
      description: "Build meaningful professional relationships that lead to career opportunities",
      icon: Users,
      topics: ["Professional Events", "Online Communities", "Alumni Networks", "Industry Mentors"],
      timeInvestment: "3-4 hours weekly"
    },
    {
      title: "Targeted Application Strategy",
      description: "Apply smarter, not harder, with targeted applications that get results",
      icon: Target,
      topics: ["Company Prioritization", "Application Tracking", "Follow-up Systems", "Referral Programs"],
      timeInvestment: "5-10 applications weekly"
    }
  ];

  const jobBoards = [
    {
      name: "LinkedIn",
      description: "Professional networking and job discovery",
      specialty: "All IT roles, networking opportunities",
      tips: "Optimize profile, engage with content, use job alerts"
    },
    {
      name: "Indeed",
      description: "Comprehensive job search engine",
      specialty: "Entry to mid-level IT positions",
      tips: "Upload resume, set salary expectations, apply quickly"
    },
    {
      name: "Stack Overflow Jobs",
      description: "Developer and tech-focused opportunities",
      specialty: "Software development, DevOps",
      tips: "Showcase technical skills, participate in community"
    },
    {
      name: "Dice",
      description: "Technology career marketplace",
      specialty: "IT, cybersecurity, data science",
      tips: "Highlight certifications, keep skills updated"
    },
    {
      name: "CyberSeek",
      description: "Cybersecurity career pathways",
      specialty: "Information security roles",
      tips: "Focus on security certifications and clearances"
    },
    {
      name: "AngelList",
      description: "Startup and tech company jobs",
      specialty: "Emerging tech, startup environments",
      tips: "Show entrepreneurial spirit, highlight adaptability"
    }
  ];

  const networkingTips = [
    {
      title: "Professional Events & Meetups",
      description: "Local tech meetups, conferences, and industry events",
      action: "Attend 2-3 events monthly, follow up within 48 hours"
    },
    {
      title: "Online Communities",
      description: "Reddit, Discord, Slack workspaces, and professional forums",
      action: "Be helpful first, build reputation before asking for help"
    },
    {
      title: "Alumni Networks",
      description: "School and training program connections",
      action: "Reach out to recent graduates in your target companies"
    },
    {
      title: "Company Insiders",
      description: "Connect with employees at target companies",
      action: "Request 15-minute informational interviews"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Search className="w-8 h-8 text-green-600 dark:text-green-400 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Strategic Job Search</h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-6">
            Navigate the competitive IT job market with proven strategies that connect you to your ideal career opportunity
          </p>
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-sm px-3 py-1">
            87% placement rate for active job seekers
          </Badge>
        </div>

        {/* Search Strategies */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Proven Search Strategies</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {searchStrategies.map((strategy, index) => {
              const IconComponent = strategy.icon;
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow" data-testid={`card-strategy-${index}`}>
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                        <IconComponent className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                      <CardTitle className="text-lg">{strategy.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">{strategy.description}</p>
                    
                    <div className="space-y-2 mb-4">
                      {strategy.topics.map((topic, topicIndex) => (
                        <div key={topicIndex} className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <CheckCircle className="w-3 h-3 text-green-500 mr-2 flex-shrink-0" />
                          {topic}
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Time Investment:</span>
                      <Badge variant="outline">{strategy.timeInvestment}</Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Job Boards Guide */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Top Job Boards for IT Professionals</h2>
          <div className="grid lg:grid-cols-2 gap-6">
            {jobBoards.map((board, index) => (
              <Card key={index} className="p-6" data-testid={`card-jobboard-${index}`}>
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{board.name}</h3>
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-2">{board.description}</p>
                <div className="mb-3">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Best for: </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">{board.specialty}</span>
                </div>
                <div className="text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/10 p-2 rounded">
                  <strong>Pro Tip:</strong> {board.tips}
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Networking Strategies */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Networking That Works
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              {networkingTips.map((tip, index) => (
                <div key={index} className="border-l-4 border-green-500 pl-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{tip.title}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{tip.description}</p>
                  <p className="text-sm text-green-600 dark:text-green-400 font-medium">{tip.action}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Success Metrics */}
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/10 dark:to-blue-900/10 mb-8">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">Job Search Success Metrics</h2>
            <div className="grid md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">2-3 weeks</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Average time to first interview</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">15%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Interview rate with targeted applications</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-2">60%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Jobs found through networking</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-2">3-6 months</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Typical job search timeline</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Plan */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Briefcase className="w-5 h-5 mr-2" />
              Your 30-Day Action Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 font-semibold text-sm">1</div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Week 1: Foundation</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Optimize LinkedIn profile, research 20 target companies, set up job alerts</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 font-semibold text-sm">2</div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Week 2: Networking</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Attend 2 networking events, reach out to 10 professionals, join 3 online communities</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 font-semibold text-sm">3</div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Week 3: Applications</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Submit 15 targeted applications, request 5 informational interviews</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 font-semibold text-sm">4</div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Week 4: Follow-up</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Follow up on applications, attend interviews, expand network connections</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Link href="/career/career-success-hub">
            <Button variant="outline" data-testid="button-back-career">
              ← Back to Career Hub
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline" data-testid="button-dashboard">
              Dashboard
            </Button>
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}