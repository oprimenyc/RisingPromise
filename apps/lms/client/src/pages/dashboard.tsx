import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MetricTile from "@/components/MetricTile";
import AIChatbot from "@/components/AIChatbot";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  CheckCircle, 
  Calendar, 
  Award, 
  Play, 
  Shield,
  FileText,
  ClipboardList,
  Wrench,
  TriangleAlert,
  Bot,
  FileUser,
  Settings,
  Briefcase
} from "lucide-react";
import { LoadingScreen, LoadingCard } from '@/components/ui/loading-spinner';
import { ErrorMessage } from '@/components/ui/error-boundary';
import { ProgramStatus } from "@/components/ui/program-status";
import { Link } from "wouter";
import type { Course } from "@shared/schema";

interface DashboardMetrics {
  studyHours: number;
  weeklyStudyHours: number;
  modulesCompleted: number;
  totalModules: number;
  daysRemaining: number;
}

interface WIOACompliance {
  funding: string;
  daysRemaining: number;
  programCode: string;
  caseWorker: string;
}

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

  // Redirect to home if not authenticated
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

  const { data: metrics, isLoading: metricsLoading } = useQuery<DashboardMetrics>({
    queryKey: ["/api/dashboard/metrics"],
    enabled: isAuthenticated,
  });

  const { data: courses, isLoading: coursesLoading } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
    enabled: isAuthenticated,
  });

  const { data: compliance, isLoading: complianceLoading } = useQuery<WIOACompliance>({
    queryKey: ["/api/wioa/compliance"],
    enabled: isAuthenticated,
  });

  if (isLoading || metricsLoading || coursesLoading || complianceLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-40 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentCourse = courses?.[0];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <section className="bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-950 dark:to-gray-900 rounded-xl p-8 mb-8 text-white">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-2/3">
              <h2 className="text-3xl font-bold mb-4">Your Professional Development Dashboard</h2>
              <p className="text-lg mb-6 text-gray-200">
                Track your progress through WIOA-approved CompTIA Tech+ certification training with advanced analytics and insights.
              </p>
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-blue-400" />
                  <span className="font-semibold">Government Certified</span>
                </div>
                <div className="flex items-center">
                  <Award className="h-5 w-5 mr-2 text-blue-400" />
                  <span className="font-semibold">Industry Standard</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Metrics Dashboard */}
        <section className="mb-8">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Training Progress Overview</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <MetricTile
              title="Study Hours"
              value={metrics?.studyHours?.toFixed(1) || "0"}
              subtitle={`+${metrics?.weeklyStudyHours?.toFixed(1) || 0} this week`}
              icon={<Clock className="text-blue-600 h-6 w-6" />}
              progress={Math.min((metrics?.studyHours || 0) / 100 * 100, 100)}
              progressLabel={`${Math.min(Math.round((metrics?.studyHours || 0) / 100 * 100), 100)}% of weekly goal`}
              bgColor="bg-blue-50 dark:bg-blue-900/20"
              testId="tile-study-hours"
            />
            
            <MetricTile
              title="Modules Completed"
              value={`${metrics?.modulesCompleted || 0}/${metrics?.totalModules || 0}`}
              subtitle={`${(metrics?.totalModules || 0) - (metrics?.modulesCompleted || 0)} remaining`}
              icon={<CheckCircle className="text-green-600 h-6 w-6" />}
              progress={metrics?.totalModules && metrics.totalModules > 0 ? (metrics.modulesCompleted / metrics.totalModules * 100) : 0}
              progressLabel={`${metrics?.totalModules && metrics.totalModules > 0 ? Math.round(metrics.modulesCompleted / metrics.totalModules * 100) : 0}% complete`}
              bgColor="bg-green-50 dark:bg-green-900/20"
              testId="tile-modules-completed"
            />
            
            <MetricTile
              title="Days Remaining"
              value={metrics?.daysRemaining?.toString() || "0"}
              subtitle="Program duration"
              icon={<Calendar className="text-orange-600 h-6 w-6" />}
              progress={metrics?.daysRemaining ? Math.max(0, 100 - (metrics.daysRemaining / 180 * 100)) : 0}
              progressLabel={`${metrics?.daysRemaining ? Math.round(Math.max(0, 100 - (metrics.daysRemaining / 180 * 100))) : 0}% elapsed`}
              bgColor="bg-orange-50 dark:bg-orange-900/20"
              testId="tile-days-remaining"
            />
            
            <MetricTile
              title="Certification Track"
              value="CompTIA A+"
              subtitle="Active enrollment"
              icon={<Award className="text-purple-600 h-6 w-6" />}
              bgColor="bg-purple-50 dark:bg-purple-900/20"
              footer={
                <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                  <Shield className="text-blue-600 mr-1 h-3 w-3" />
                  WIOA Approved
                </div>
              }
              testId="tile-certification-status"
            />
          </div>
        </section>

        {/* Course Section */}
        {currentCourse && (
          <section className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-slate-900">
                Current Course: {currentCourse.title}
              </h3>
              <Button 
                className="bg-blue-600 hover:bg-blue-700"
                asChild
                data-testid="button-continue-learning"
              >
                <Link href={`/course/${currentCourse.id}`}>
                  <Play className="mr-2 h-4 w-4" />
                  Continue Learning
                </Link>
              </Button>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Course Progress */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Course Progress</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center">
                          <CheckCircle className="text-green-600 mr-3 h-5 w-5" />
                          <div>
                            <h5 className="font-semibold text-slate-900">1. Computer Hardware Basics</h5>
                            <p className="text-sm text-slate-600">8 lessons • 2.5 hours</p>
                          </div>
                        </div>
                        <Badge variant="secondary" className="bg-green-100 text-green-800">Complete</Badge>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center">
                          <Play className="text-blue-600 mr-3 h-5 w-5" />
                          <div>
                            <h5 className="font-semibold text-slate-900">2. Motherboards and System Units</h5>
                            <p className="text-sm text-slate-600">12 lessons • 3.2 hours</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Progress value={75} className="w-24" />
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800">75%</Badge>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-lg">
                        <div className="flex items-center">
                          <div className="w-5 h-5 rounded-full bg-slate-400 mr-3 flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                          <div>
                            <h5 className="font-semibold text-slate-500">3. Power Supplies and Cooling</h5>
                            <p className="text-sm text-slate-400">10 lessons • 2.8 hours</p>
                          </div>
                        </div>
                        <Badge variant="secondary" className="bg-slate-100 text-slate-600">Locked</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Study Resources */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Study Resources</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <a href="#" className="flex items-center p-3 border border-slate-200 rounded-lg hover:border-blue-600 transition-colors">
                        <FileText className="text-red-600 mr-3 h-5 w-5" />
                        <div>
                          <p className="font-medium text-slate-900">Module 2 Study Guide</p>
                          <p className="text-sm text-slate-600">PDF • 2.4 MB</p>
                        </div>
                      </a>
                      <a href="#" className="flex items-center p-3 border border-slate-200 rounded-lg hover:border-blue-600 transition-colors">
                        <ClipboardList className="text-blue-600 mr-3 h-5 w-5" />
                        <div>
                          <p className="font-medium text-slate-900">Practice Quiz</p>
                          <p className="text-sm text-slate-600">25 Questions</p>
                        </div>
                      </a>
                      <a href="#" className="flex items-center p-3 border border-slate-200 rounded-lg hover:border-blue-600 transition-colors">
                        <Wrench className="text-amber-600 mr-3 h-5 w-5" />
                        <div>
                          <p className="font-medium text-slate-900">Virtual Lab</p>
                          <p className="text-sm text-slate-600">Hands-on Practice</p>
                        </div>
                      </a>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-red-600 to-red-700 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-3">
                      <Award className="text-yellow-400 mr-3 h-6 w-6" />
                      <h4 className="text-lg font-semibold">Excellence Tracker</h4>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-red-100">Quiz Average</span>
                        <span className="font-bold">92%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-red-100">Study Sessions</span>
                        <span className="font-bold">Daily</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-red-100">Performance</span>
                        <span className="font-bold">Excellent</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Upcoming Deadlines</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <div>
                          <p className="font-medium text-slate-900">Module 2 Quiz</p>
                          <p className="text-sm text-amber-700">Due in 3 days</p>
                        </div>
                        <TriangleAlert className="text-amber-600 h-5 w-5" />
                      </div>
                      <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div>
                          <p className="font-medium text-slate-900">Lab Assignment</p>
                          <p className="text-sm text-blue-700">Due next week</p>
                        </div>
                        <Calendar className="text-blue-600 h-5 w-5" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>
        )}

        {/* AI-Powered Features Section */}
        <section className="mb-8">
          <Card>
            <CardHeader>
              <div className="flex items-center">
                <Bot className="text-purple-600 mr-4 h-8 w-8" />
                <div>
                  <CardTitle className="text-2xl">Premium Success Tools</CardTitle>
                  <p className="text-gray-600 dark:text-gray-400">AI-powered learning and career development features</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <Card className="border-2 border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <Bot className="text-purple-600 mr-3 h-6 w-6" />
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">AI Study Assistant</h4>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Get instant help with CompTIA Tech+ concepts, study strategies, and troubleshooting guidance from your personal AI tutor.
                    </p>
                    <Button 
                      variant="outline" 
                      className="w-full border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white"
                      onClick={() => {
                        // The chatbot will appear when clicked - it's always available as a floating widget
                        const chatButton = document.querySelector('[data-testid="ai-chat-open"]') as HTMLButtonElement;
                        if (chatButton) chatButton.click();
                      }}
                      data-testid="button-open-ai-chat"
                    >
                      <Bot className="h-4 w-4 mr-2" />
                      Start Chat
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <FileUser className="text-blue-600 mr-3 h-6 w-6" />
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">AI Resume Builder</h4>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Create a professional, ATS-optimized resume powered by AI that highlights your CompTIA certification and technical skills.
                    </p>
                    <Link href="/resume-builder">
                      <Button 
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        data-testid="button-resume-builder"
                      >
                        <FileUser className="h-4 w-4 mr-2" />
                        Build Resume
                      </Button>
                    </Link>
                  </CardContent>
                </Card>

                <Card className="border-2 border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <Briefcase className="text-green-600 mr-3 h-6 w-6" />
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Career Success Hub</h4>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Access comprehensive career development resources including job search strategies, interview mastery, and AI workplace skills.
                    </p>
                    <Link href="/career/career-success-hub">
                      <Button 
                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                        data-testid="button-career-hub"
                      >
                        <Briefcase className="h-4 w-4 mr-2" />
                        Explore Career Hub
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* WIOA Compliance Section */}
        {compliance && (
          <section className="mb-8">
            <Card>
              <CardHeader>
                <div className="flex items-center">
                  <Shield className="text-blue-600 mr-4 h-8 w-8" />
                  <div>
                    <CardTitle className="text-2xl">WIOA Compliance Dashboard</CardTitle>
                    <p className="text-slate-600">Your government-funded training compliance status</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                    <CardContent className="p-6 text-center">
                      <CheckCircle className="text-green-600 mx-auto mb-3 h-10 w-10" />
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Enrollment Verified</h4>
                      <p className="text-sm text-green-700 dark:text-green-400">WIOA eligibility confirmed</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                    <CardContent className="p-6 text-center">
                      <Clock className="text-blue-600 mx-auto mb-3 h-10 w-10" />
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Hours Tracked</h4>
                      <p className="text-sm text-blue-700 dark:text-blue-400">Automated compliance reporting</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
                    <CardContent className="p-6 text-center">
                      <Award className="text-amber-600 mx-auto mb-3 h-10 w-10" />
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Progress Monitored</h4>
                      <p className="text-sm text-amber-700 dark:text-amber-400">Meeting program requirements</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="p-6 bg-slate-50 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-slate-900">Program Funding Status</h4>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Total Investment:</span>
                      <span className="font-semibold text-slate-900">${compliance.funding}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Days Remaining:</span>
                      <span className="font-semibold text-slate-900">{compliance.daysRemaining} Days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Program Code:</span>
                      <span className="font-semibold text-slate-900">{compliance.programCode}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Case Worker:</span>
                      <span className="font-semibold text-slate-900">{compliance.caseWorker || 'Sarah Johnson'}</span>
                    </div>
                  </div>
                  
                  {/* Admin Dashboard Access */}
                  <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">Admin Dashboard</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Access compliance monitoring and reporting tools</p>
                      </div>
                      <Link href="/admin">
                        <Button variant="outline" size="sm" data-testid="button-admin-dashboard">
                          <Settings className="h-4 w-4 mr-2" />
                          Admin Panel
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        )}
      </main>

      <Footer />
      
      {/* AI Chatbot Widget */}
      <AIChatbot />
    </div>
  );
}
