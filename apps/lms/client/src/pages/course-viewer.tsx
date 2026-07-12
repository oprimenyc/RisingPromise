import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import VideoPlayer from "@/components/VideoPlayer";
import MobileDeviceCategoryQuiz from "@/components/MobileDeviceCategoryQuiz";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronLeft, 
  CheckCircle, 
  Play, 
  Lock,
  FileText,
  ClipboardList,
  Wrench
} from "lucide-react";
import type { Course, Module } from "@shared/schema";

interface ModuleWithProgress extends Module {
  progress?: {
    watchTime: number;
    totalTime: number;
    isCompleted: boolean;
  } | null;
}

interface CourseWithModules extends Course {
  modules?: ModuleWithProgress[];
}

export default function CourseViewer() {
  const params = useParams();
  const courseId = params.courseId;
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [currentModuleId, setCurrentModuleId] = useState<string | null>(null);

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

  const { data: course, isLoading: courseLoading } = useQuery<CourseWithModules>({
    queryKey: ["/api/courses", courseId],
    enabled: isAuthenticated && !!courseId,
  });

  const { data: modules, isLoading: modulesLoading } = useQuery<ModuleWithProgress[]>({
    queryKey: ["/api/courses", courseId, "modules"],
    enabled: isAuthenticated && !!courseId,
  });

  const progressMutation = useMutation({
    mutationFn: async (progressData: { moduleId: string; courseId: string; watchTime: number; totalTime: number; isCompleted: boolean }) => {
      return await apiRequest("/api/progress", {
        method: "POST",
        body: progressData
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses", courseId, "modules"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/metrics"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to update progress",
        variant: "destructive",
      });
    },
  });

  const studySessionMutation = useMutation({
    mutationFn: async (sessionData: { courseId: string; duration: number; moduleId?: string }) => {
      return await apiRequest("/api/study-sessions", {
        method: "POST",
        body: sessionData
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
    },
  });

  useEffect(() => {
    if (modules && modules.length > 0 && !currentModuleId) {
      // Find first incomplete module or first module
      const incompleteModule = modules.find((m) => !m.progress?.isCompleted);
      setCurrentModuleId(incompleteModule?.id || modules[0].id);
    }
  }, [modules, currentModuleId]);

  const handleVideoProgress = (watchTime: number, totalTime: number) => {
    if (!currentModuleId || !courseId) return;
    
    const isCompleted = watchTime >= totalTime * 0.9; // 90% completion threshold
    
    progressMutation.mutate({
      moduleId: currentModuleId,
      courseId,
      watchTime: Math.floor(watchTime),
      totalTime: Math.floor(totalTime),
      isCompleted
    });
  };

  const handleVideoEnd = () => {
    if (!currentModuleId || !courseId) return;
    
    const currentModule = modules?.find((m) => m.id === currentModuleId);
    if (currentModule) {
      // Record study session
      studySessionMutation.mutate({
        courseId,
        duration: Math.floor(currentModule.duration),
        moduleId: currentModuleId
      });
    }
  };

  if (isLoading || courseLoading || modulesLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 rounded w-1/3 mb-6"></div>
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 h-96 bg-slate-200 rounded-xl"></div>
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-32 bg-slate-200 rounded-xl"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentModule = modules?.find((m) => m.id === currentModuleId);

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Course Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" asChild data-testid="button-back-dashboard">
              <Link href="/">
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{course?.title}</h1>
              <p className="text-slate-600">{course?.description}</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Video Player */}
            {currentModule && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold text-slate-900 mb-4">
                    {currentModule.title}
                  </h2>
                  <VideoPlayer
                    videoUrl={currentModule.videoUrl || "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4"}
                    title={currentModule.title}
                    duration={currentModule.duration * 60} // Convert minutes to seconds
                    lastPosition={currentModule.progress?.watchTime || 0}
                    onProgress={handleVideoProgress}
                    onEnded={handleVideoEnd}
                  />
                  
                  {/* Interactive Content for specific modules */}
                  {currentModule.title.toLowerCase().includes('introduction to mobile devices') && (
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Section 1.1: Device Category Classification
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Now that you've learned about mobile device categories, test your understanding 
                        with this interactive drag-and-drop exercise.
                      </p>
                      <MobileDeviceCategoryQuiz />
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Module List */}
            <Card>
              <CardHeader>
                <CardTitle>Course Modules</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {modules?.map((module, index: number) => {
                    const isCompleted = module.progress?.isCompleted;
                    const isCurrentModule = module.id === currentModuleId;
                    const isLocked = module.isLocked && !isCompleted && !isCurrentModule;
                    const progress = module.progress ? (module.progress.watchTime / (module.duration * 60) * 100) : 0;

                    return (
                      <div
                        key={module.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          isCurrentModule
                            ? 'border-blue-500 bg-blue-50'
                            : isCompleted
                            ? 'border-green-200 bg-green-50'
                            : isLocked
                            ? 'border-slate-200 bg-slate-50 cursor-not-allowed opacity-60'
                            : 'border-slate-200 bg-white hover:border-blue-300'
                        }`}
                        onClick={() => !isLocked && setCurrentModuleId(module.id)}
                        data-testid={`module-${index + 1}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            {isCompleted ? (
                              <CheckCircle className="text-green-600 h-5 w-5" />
                            ) : isLocked ? (
                              <Lock className="text-slate-400 h-5 w-5" />
                            ) : (
                              <Play className="text-blue-600 h-5 w-5" />
                            )}
                            <div>
                              <h3 className="font-semibold text-slate-900">
                                {index + 1}. {module.title}
                              </h3>
                              <p className="text-sm text-slate-600">
                                {module.duration} minutes
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            {!isLocked && !isCompleted && progress > 0 && (
                              <>
                                <Progress value={progress} className="w-20" />
                                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                                  {Math.round(progress)}%
                                </Badge>
                              </>
                            )}
                            {isCompleted && (
                              <Badge variant="secondary" className="bg-green-100 text-green-800">
                                Complete
                              </Badge>
                            )}
                            {isLocked && (
                              <Badge variant="secondary" className="bg-slate-100 text-slate-600">
                                Locked
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Study Resources */}
            <Card>
              <CardHeader>
                <CardTitle>Study Resources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <a href="#" className="flex items-center p-3 border border-slate-200 rounded-lg hover:border-blue-600 transition-colors">
                    <FileText className="text-red-600 mr-3 h-5 w-5" />
                    <div>
                      <p className="font-medium text-slate-900">Study Guide</p>
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

            {/* Progress Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Your Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Course Progress</span>
                      <span>{modules ? Math.round((modules.filter((m: any) => m.progress?.isCompleted).length / modules.length) * 100) : 0}%</span>
                    </div>
                    <Progress value={modules ? (modules.filter((m: any) => m.progress?.isCompleted).length / modules.length) * 100 : 0} />
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-slate-600">Completed</p>
                      <p className="font-semibold text-slate-900">
                        {modules?.filter((m: any) => m.progress?.isCompleted).length || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-600">Remaining</p>
                      <p className="font-semibold text-slate-900">
                        {modules ? modules.length - modules.filter((m: any) => m.progress?.isCompleted).length : 0}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
