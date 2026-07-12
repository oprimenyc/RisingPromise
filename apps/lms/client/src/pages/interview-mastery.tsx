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
  MessageSquare, 
  Star, 
  Code, 
  Users, 
  Brain,
  CheckCircle,
  Play,
  Clock,
  Target,
  Trophy,
  ArrowRight
} from "lucide-react";
import { LoadingScreen } from '@/components/ui/loading-spinner';
import { Link } from "wouter";

export default function InterviewMastery() {
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

  const interviewModules = [
    {
      id: "star-method",
      title: "STAR Method Mastery",
      description: "Master the Situation, Task, Action, Result framework for behavioral questions",
      duration: "35 min",
      status: "available",
      topics: [
        "STAR Framework Breakdown",
        "Crafting Compelling Stories",
        "Common Behavioral Questions",
        "Practice Scenarios"
      ],
      videoCount: 4
    },
    {
      id: "technical-questions",
      title: "Technical Interview Excellence",
      description: "Navigate technical questions with confidence and demonstrate your expertise",
      duration: "45 min",
      status: "available",
      topics: [
        "System Design Questions",
        "Troubleshooting Scenarios",
        "Network Security Concepts",
        "Hands-on Demonstrations"
      ],
      videoCount: 5
    },
    {
      id: "soft-skills",
      title: "Communication & Soft Skills",
      description: "Excel in the interpersonal aspects that often determine hiring decisions",
      duration: "30 min",
      status: "available",
      topics: [
        "Professional Communication",
        "Team Collaboration Examples",
        "Conflict Resolution",
        "Leadership Potential"
      ],
      videoCount: 4
    },
    {
      id: "salary-negotiation",
      title: "Salary Negotiation Strategies",
      description: "Secure the compensation you deserve with proven negotiation techniques",
      duration: "25 min",
      status: "available",
      topics: [
        "Market Research Methods",
        "Negotiation Timing",
        "Benefits Beyond Salary",
        "Professional Counter-offers"
      ],
      videoCount: 3
    },
    {
      id: "mock-interviews",
      title: "Mock Interview Practice",
      description: "Practice with realistic interview scenarios and receive detailed feedback",
      duration: "60 min",
      status: "available",
      topics: [
        "Full Interview Simulation",
        "Performance Analysis",
        "Improvement Strategies",
        "Confidence Building"
      ],
      videoCount: 6
    }
  ];

  const starExamples = [
    {
      question: "Tell me about a time you solved a difficult technical problem.",
      situation: "Our company's email server went down during peak business hours",
      task: "I needed to restore email services quickly while identifying the root cause",
      action: "I implemented a temporary mail relay, diagnosed a corrupted database, and rebuilt it from backups",
      result: "Restored service in 2 hours instead of the typical 8-hour recovery time"
    },
    {
      question: "Describe a time when you had to learn a new technology quickly.",
      situation: "Client needed a cybersecurity solution using a platform I'd never used",
      task: "Master the new security platform and implement it within 3 weeks",
      action: "Created a structured learning plan, practiced in a lab environment, and consulted with experts",
      result: "Successfully deployed the solution on time, and it prevented 3 security incidents in the first month"
    }
  ];

  const technicalTopics = [
    {
      category: "Network Administration",
      questions: [
        "How would you troubleshoot network connectivity issues?",
        "Explain the difference between TCP and UDP",
        "Walk me through setting up a VLAN"
      ]
    },
    {
      category: "Cybersecurity",
      questions: [
        "How do you respond to a suspected security breach?",
        "Explain multi-factor authentication implementation",
        "Describe your approach to vulnerability assessments"
      ]
    },
    {
      category: "System Administration",
      questions: [
        "How would you optimize server performance?",
        "Explain your backup and disaster recovery strategy",
        "Describe automating routine maintenance tasks"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Trophy className="w-8 h-8 text-orange-600 dark:text-orange-400 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Interview Mastery</h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-6">
            Excel in technical interviews with comprehensive preparation strategies, proven frameworks, and hands-on practice
          </p>
          <div className="flex items-center justify-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              <span>3+ Hours Training</span>
            </div>
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-1" />
              <span>Mock Interviews</span>
            </div>
            <div className="flex items-center">
              <Target className="w-4 h-4 mr-1" />
              <span>Real Scenarios</span>
            </div>
          </div>
        </div>

        {/* Progress Tracker */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="text-gray-900 dark:text-white">Interview Preparation Progress</span>
              <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                Ready to Begin
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>Modules Completed</span>
                <span>0 of 5 modules</span>
              </div>
              <Progress value={0} className="h-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Start with the STAR Method module to build your storytelling foundation
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Interview Modules */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Complete Interview Training</h2>
          <div className="space-y-6">
            {interviewModules.map((module, index) => (
              <Card key={module.id} className="group hover:shadow-lg transition-all duration-300" data-testid={`card-module-${module.id}`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center text-orange-600 dark:text-orange-400 font-semibold">
                          {index + 1}
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{module.title}</h3>
                        <div className="flex space-x-2">
                          <Badge variant="outline" className="text-xs">
                            <Clock className="w-3 h-3 mr-1" />
                            {module.duration}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            <Play className="w-3 h-3 mr-1" />
                            {module.videoCount} videos
                          </Badge>
                        </div>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">{module.description}</p>
                      
                      {/* Topics */}
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">What You'll Learn:</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {module.topics.map((topic, topicIndex) => (
                            <div key={topicIndex} className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                              <CheckCircle className="w-3 h-3 text-orange-500 mr-2 flex-shrink-0" />
                              {topic}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="ml-6">
                      <Button className="bg-orange-600 hover:bg-orange-700 text-white" data-testid={`button-start-${module.id}`}>
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

        {/* STAR Method Examples */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">STAR Method Examples</h2>
          <div className="space-y-6">
            {starExamples.map((example, index) => (
              <Card key={index} className="p-6" data-testid={`card-star-${index}`}>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  "{example.question}"
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="border-l-4 border-blue-500 pl-3">
                      <h4 className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-1">SITUATION</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{example.situation}</p>
                    </div>
                    <div className="border-l-4 border-green-500 pl-3">
                      <h4 className="text-sm font-semibold text-green-600 dark:text-green-400 mb-1">TASK</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{example.task}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="border-l-4 border-orange-500 pl-3">
                      <h4 className="text-sm font-semibold text-orange-600 dark:text-orange-400 mb-1">ACTION</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{example.action}</p>
                    </div>
                    <div className="border-l-4 border-purple-500 pl-3">
                      <h4 className="text-sm font-semibold text-purple-600 dark:text-purple-400 mb-1">RESULT</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{example.result}</p>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Technical Questions */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Common Technical Questions</h2>
          <div className="grid lg:grid-cols-3 gap-6">
            {technicalTopics.map((topic, index) => (
              <Card key={index} className="p-6" data-testid={`card-technical-${index}`}>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Code className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                  {topic.category}
                </h3>
                <div className="space-y-3">
                  {topic.questions.map((question, qIndex) => (
                    <div key={qIndex} className="text-sm text-gray-600 dark:text-gray-400 pl-4 border-l-2 border-gray-200 dark:border-gray-700">
                      {question}
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Success Statistics */}
        <Card className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/10 dark:to-red-900/10 mb-8">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">Interview Success Rate</h2>
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">92%</div>
                <div className="text-gray-700 dark:text-gray-300">Students who complete training pass interviews</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">3.2x</div>
                <div className="text-gray-700 dark:text-gray-300">Higher offer acceptance rate</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">$12K</div>
                <div className="text-gray-700 dark:text-gray-300">Average salary increase from negotiation</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Tips */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Star className="w-5 h-5 mr-2" />
              Quick Interview Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Before the Interview</h4>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-center"><CheckCircle className="w-3 h-3 text-green-500 mr-2" />Research the company and role thoroughly</li>
                  <li className="flex items-center"><CheckCircle className="w-3 h-3 text-green-500 mr-2" />Prepare 5-7 STAR method stories</li>
                  <li className="flex items-center"><CheckCircle className="w-3 h-3 text-green-500 mr-2" />Practice technical explanations out loud</li>
                  <li className="flex items-center"><CheckCircle className="w-3 h-3 text-green-500 mr-2" />Prepare thoughtful questions to ask</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">During the Interview</h4>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-center"><CheckCircle className="w-3 h-3 text-green-500 mr-2" />Arrive 10-15 minutes early</li>
                  <li className="flex items-center"><CheckCircle className="w-3 h-3 text-green-500 mr-2" />Listen actively and ask clarifying questions</li>
                  <li className="flex items-center"><CheckCircle className="w-3 h-3 text-green-500 mr-2" />Use specific examples with measurable results</li>
                  <li className="flex items-center"><CheckCircle className="w-3 h-3 text-green-500 mr-2" />Show enthusiasm and cultural fit</li>
                </ul>
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