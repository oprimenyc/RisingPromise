import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Bot, 
  Brain, 
  Zap, 
  Code, 
  Database, 
  Shield,
  CheckCircle,
  ArrowRight,
  Clock,
  Users,
  TrendingUp
} from "lucide-react";
import { LoadingScreen } from '@/components/ui/loading-spinner';
import { Link } from "wouter";

export default function AIWorkplace() {
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

  const aiModules = [
    {
      id: "ai-fundamentals",
      title: "AI Fundamentals for IT Professionals",
      description: "Understanding machine learning, neural networks, and AI applications in enterprise environments",
      duration: "45 min",
      status: "available",
      topics: ["Machine Learning Basics", "Neural Networks", "AI vs Traditional Computing", "Enterprise AI Applications"]
    },
    {
      id: "ai-tools",
      title: "Essential AI Tools & Platforms",
      description: "Hands-on experience with ChatGPT, GitHub Copilot, and enterprise AI solutions",
      duration: "60 min",
      status: "available",
      topics: ["ChatGPT for Technical Work", "GitHub Copilot", "Azure AI Services", "AWS AI/ML Tools"]
    },
    {
      id: "ai-automation",
      title: "AI-Driven IT Automation",
      description: "Implementing AI for system monitoring, incident response, and infrastructure management",
      duration: "75 min",
      status: "available",
      topics: ["Automated Monitoring", "Predictive Maintenance", "Incident Response", "Infrastructure Optimization"]
    },
    {
      id: "ai-security",
      title: "AI in Cybersecurity",
      description: "Leveraging AI for threat detection, vulnerability assessment, and security automation",
      duration: "55 min",
      status: "available",
      topics: ["Threat Detection", "Behavioral Analysis", "Security Automation", "AI-Powered SIEM"]
    }
  ];

  const practicalSkills = [
    {
      icon: Bot,
      title: "Prompt Engineering",
      description: "Master the art of communicating effectively with AI systems"
    },
    {
      icon: Code,
      title: "AI-Assisted Coding",
      description: "Accelerate development with AI pair programming tools"
    },
    {
      icon: Database,
      title: "Data Analysis with AI",
      description: "Extract insights from complex datasets using AI tools"
    },
    {
      icon: Shield,
      title: "AI Ethics & Security",
      description: "Implement AI responsibly with security best practices"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Brain className="w-8 h-8 text-purple-600 dark:text-purple-400 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">AI in the Modern Workplace</h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-6">
            Master artificial intelligence tools and concepts that are transforming IT careers and driving business innovation
          </p>
          <div className="flex items-center justify-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              <span>4+ Hours Content</span>
            </div>
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-1" />
              <span>Industry-Relevant</span>
            </div>
            <div className="flex items-center">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span>Career Advancement</span>
            </div>
          </div>
        </div>

        {/* Course Progress */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="text-gray-900 dark:text-white">Your AI Learning Progress</span>
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                Just Getting Started
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>Overall Completion</span>
                <span>0 of 4 modules completed</span>
              </div>
              <Progress value={0} className="h-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Begin your AI journey and discover how these powerful tools can accelerate your IT career
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Learning Modules */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Learning Modules</h2>
          <div className="space-y-6">
            {aiModules.map((module, index) => (
              <Card key={module.id} className="group hover:shadow-lg transition-all duration-300" data-testid={`card-module-${module.id}`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center text-purple-600 dark:text-purple-400 font-semibold">
                          {index + 1}
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{module.title}</h3>
                        <Badge variant="outline" className="text-xs">
                          <Clock className="w-3 h-3 mr-1" />
                          {module.duration}
                        </Badge>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">{module.description}</p>
                      
                      {/* Topics */}
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">What You'll Learn:</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {module.topics.map((topic, topicIndex) => (
                            <div key={topicIndex} className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                              <CheckCircle className="w-3 h-3 text-green-500 mr-2 flex-shrink-0" />
                              {topic}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="ml-6">
                      <Button className="bg-purple-600 hover:bg-purple-700 text-white" data-testid={`button-start-${module.id}`}>
                        Start Module
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Practical Skills */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Practical Skills You'll Master</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {practicalSkills.map((skill, index) => {
              const IconComponent = skill.icon;
              return (
                <Card key={index} className="text-center p-6 hover:shadow-lg transition-shadow">
                  <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <IconComponent className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{skill.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{skill.description}</p>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Industry Impact */}
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/10 dark:to-blue-900/10 mb-8">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 text-center">AI's Impact on IT Careers</h2>
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">75%</div>
                <div className="text-gray-700 dark:text-gray-300">of IT roles will require AI skills by 2025</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">40%</div>
                <div className="text-gray-700 dark:text-gray-300">productivity increase with AI tools</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">$25K</div>
                <div className="text-gray-700 dark:text-gray-300">average salary premium for AI skills</div>
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