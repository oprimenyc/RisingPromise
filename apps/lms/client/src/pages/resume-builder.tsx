import { useState, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Download, 
  FileText, 
  User, 
  Briefcase, 
  Award, 
  Mail, 
  Phone, 
  MapPin,
  Plus,
  Trash2,
  Loader2,
  X
} from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { User as UserType } from "@shared/schema";

interface WorkExperience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string;
  isCurrentJob: boolean;
}

interface ResumeData {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    linkedin: string;
  };
  workExperience: WorkExperience[];
  skills: string[];
  certifications: string[];
}

interface GeneratedResume {
  formattedResume: string;
  atsKeywords: string[];
  improvementSuggestions: string[];
}

export default function ResumeBuilder() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const typedUser = user as UserType | undefined;
  const { toast } = useToast();
  const resumePreviewRef = useRef<HTMLDivElement>(null);

  const [resumeData, setResumeData] = useState<ResumeData>({
    personalInfo: {
      fullName: typedUser ? `${typedUser.firstName || ''} ${typedUser.lastName || ''}`.trim() : '',
      email: typedUser?.email || '',
      phone: '',
      address: '',
      linkedin: ''
    },
    workExperience: [],
    skills: [],
    certifications: ['CompTIA A+ (In Progress)'] // Auto-populated from user data
  });

  const [generatedResume, setGeneratedResume] = useState<GeneratedResume | null>(null);
  const [newSkill, setNewSkill] = useState('');

  const generateResumeMutation = useMutation({
    mutationFn: async (data: ResumeData) => {
      return await apiRequest("/api/ai/generate-resume", {
        method: "POST",
        body: data
      });
    },
    onSuccess: (response) => {
      setGeneratedResume(response);
      toast({
        title: "Resume Generated Successfully",
        description: "Your ATS-optimized resume has been created and is ready for download."
      });
    },
    onError: (error) => {
      toast({
        title: "Generation Failed", 
        description: "Unable to generate resume. Please check your information and try again.",
        variant: "destructive"
      });
    }
  });

  const downloadResumeMutation = useMutation({
    mutationFn: async (resumeContent: string) => {
      return await apiRequest("/api/ai/download-resume", {
        method: "POST", 
        body: { resumeContent }
      });
    },
    onSuccess: (response) => {
      // Create download link for PDF
      const byteCharacters = atob(response.pdfData);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${resumeData.personalInfo.fullName.replace(/\s+/g, '_')}_Resume.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Download Started",
        description: "Your resume PDF has been downloaded successfully."
      });
    }
  });

  const addWorkExperience = () => {
    const newExperience: WorkExperience = {
      id: Date.now().toString(),
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      description: '',
      isCurrentJob: false
    };
    setResumeData(prev => ({
      ...prev,
      workExperience: [...prev.workExperience, newExperience]
    }));
  };

  const updateWorkExperience = (id: string, field: keyof WorkExperience, value: string | boolean) => {
    setResumeData(prev => ({
      ...prev,
      workExperience: prev.workExperience.map(exp => 
        exp.id === id ? { ...exp, [field]: value } : exp
      )
    }));
  };

  const removeWorkExperience = (id: string) => {
    setResumeData(prev => ({
      ...prev,
      workExperience: prev.workExperience.filter(exp => exp.id !== id)
    }));
  };

  const addSkill = () => {
    if (!newSkill.trim()) return;
    setResumeData(prev => ({
      ...prev,
      skills: [...prev.skills, newSkill.trim()]
    }));
    setNewSkill('');
  };

  const removeSkill = (index: number) => {
    setResumeData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
  };

  const handleGenerateResume = () => {
    if (!resumeData.personalInfo.fullName || !resumeData.personalInfo.email) {
      toast({
        title: "Missing Information",
        description: "Please fill in your name and email address.",
        variant: "destructive"
      });
      return;
    }
    generateResumeMutation.mutate(resumeData);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Please log in to access the Resume Builder
          </h1>
          <Button 
            onClick={() => window.location.href = "/api/login"}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Log In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            AI Resume Builder
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Create a professional, ATS-optimized resume powered by AI
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <div className="space-y-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Personal Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      value={resumeData.personalInfo.fullName}
                      onChange={(e) => setResumeData(prev => ({
                        ...prev,
                        personalInfo: { ...prev.personalInfo, fullName: e.target.value }
                      }))}
                      data-testid="input-full-name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={resumeData.personalInfo.email}
                      onChange={(e) => setResumeData(prev => ({
                        ...prev,
                        personalInfo: { ...prev.personalInfo, email: e.target.value }
                      }))}
                      data-testid="input-email"
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={resumeData.personalInfo.phone}
                      onChange={(e) => setResumeData(prev => ({
                        ...prev,
                        personalInfo: { ...prev.personalInfo, phone: e.target.value }
                      }))}
                      data-testid="input-phone"
                    />
                  </div>
                  <div>
                    <Label htmlFor="linkedin">LinkedIn Profile</Label>
                    <Input
                      id="linkedin"
                      value={resumeData.personalInfo.linkedin}
                      onChange={(e) => setResumeData(prev => ({
                        ...prev,
                        personalInfo: { ...prev.personalInfo, linkedin: e.target.value }
                      }))}
                      data-testid="input-linkedin"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={resumeData.personalInfo.address}
                    onChange={(e) => setResumeData(prev => ({
                      ...prev,
                      personalInfo: { ...prev.personalInfo, address: e.target.value }
                    }))}
                    data-testid="input-address"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Work Experience */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Briefcase className="h-5 w-5" />
                    <span>Work Experience</span>
                  </div>
                  <Button 
                    onClick={addWorkExperience}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                    data-testid="button-add-experience"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {resumeData.workExperience.map((experience, index) => (
                    <div key={experience.id} className="border border-gray-200 dark:border-gray-700 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold">Experience {index + 1}</h4>
                        <Button
                          onClick={() => removeWorkExperience(experience.id)}
                          variant="destructive"
                          size="sm"
                          data-testid={`button-remove-experience-${experience.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <Label>Company</Label>
                          <Input
                            value={experience.company}
                            onChange={(e) => updateWorkExperience(experience.id, 'company', e.target.value)}
                            data-testid={`input-company-${experience.id}`}
                          />
                        </div>
                        <div>
                          <Label>Position</Label>
                          <Input
                            value={experience.position}
                            onChange={(e) => updateWorkExperience(experience.id, 'position', e.target.value)}
                            data-testid={`input-position-${experience.id}`}
                          />
                        </div>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <Label>Start Date</Label>
                          <Input
                            type="date"
                            value={experience.startDate}
                            onChange={(e) => updateWorkExperience(experience.id, 'startDate', e.target.value)}
                            data-testid={`input-start-date-${experience.id}`}
                          />
                        </div>
                        <div>
                          <Label>End Date</Label>
                          <Input
                            type="date"
                            value={experience.endDate}
                            onChange={(e) => updateWorkExperience(experience.id, 'endDate', e.target.value)}
                            disabled={experience.isCurrentJob}
                            data-testid={`input-end-date-${experience.id}`}
                          />
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <Label>
                          <input
                            type="checkbox"
                            checked={experience.isCurrentJob}
                            onChange={(e) => updateWorkExperience(experience.id, 'isCurrentJob', e.target.checked)}
                            className="mr-2"
                            data-testid={`checkbox-current-job-${experience.id}`}
                          />
                          Current Job
                        </Label>
                      </div>
                      
                      <div>
                        <Label>Job Description</Label>
                        <Textarea
                          value={experience.description}
                          onChange={(e) => updateWorkExperience(experience.id, 'description', e.target.value)}
                          placeholder="Describe your responsibilities and achievements..."
                          rows={3}
                          data-testid={`textarea-description-${experience.id}`}
                        />
                      </div>
                    </div>
                  ))}
                  
                  {resumeData.workExperience.length === 0 && (
                    <p className="text-gray-500 text-center py-4">
                      No work experience added yet. Click "Add" to get started.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Skills */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Award className="h-5 w-5" />
                  <span>Skills & Certifications</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Add Skills</Label>
                  <div className="flex space-x-2">
                    <Input
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      placeholder="e.g., Network Troubleshooting"
                      onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                      data-testid="input-new-skill"
                    />
                    <Button 
                      onClick={addSkill}
                      disabled={!newSkill.trim()}
                      data-testid="button-add-skill"
                    >
                      Add
                    </Button>
                  </div>
                </div>
                
                <div>
                  <Label>Current Skills</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {resumeData.skills.map((skill, index) => (
                      <Badge 
                        key={index} 
                        variant="secondary"
                        className="flex items-center space-x-1"
                      >
                        <span>{skill}</span>
                        <Button
                          onClick={() => removeSkill(index)}
                          variant="ghost"
                          size="sm"
                          className="h-auto p-0 ml-1"
                          data-testid={`button-remove-skill-${index}`}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <Label>Certifications</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {resumeData.certifications.map((cert, index) => (
                      <Badge key={index} variant="default" className="bg-blue-600">
                        {cert}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex space-x-4">
              <Button
                onClick={handleGenerateResume}
                disabled={generateResumeMutation.isPending}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                data-testid="button-generate-resume"
              >
                {generateResumeMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    Generate AI Resume
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Resume Preview */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Resume Preview</CardTitle>
              </CardHeader>
              <CardContent>
                {generatedResume ? (
                  <div className="space-y-6">
                    <div 
                      ref={resumePreviewRef}
                      className="bg-white dark:bg-gray-800 p-8 border border-gray-200 dark:border-gray-700 rounded-lg min-h-[600px]"
                      style={{ fontFamily: 'Arial, sans-serif' }}
                    >
                      <div 
                        className="prose prose-sm max-w-none text-gray-900 dark:text-white"
                        dangerouslySetInnerHTML={{ __html: generatedResume.formattedResume }}
                        data-testid="resume-preview"
                      />
                    </div>
                    
                    <div className="flex space-x-4">
                      <Button
                        onClick={() => downloadResumeMutation.mutate(generatedResume.formattedResume)}
                        disabled={downloadResumeMutation.isPending}
                        className="bg-green-600 hover:bg-green-700"
                        data-testid="button-download-resume"
                      >
                        {downloadResumeMutation.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Preparing...
                          </>
                        ) : (
                          <>
                            <Download className="h-4 w-4 mr-2" />
                            Download PDF
                          </>
                        )}
                      </Button>
                    </div>

                    <Separator />

                    {/* ATS Keywords */}
                    <div>
                      <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">ATS Keywords Included</h4>
                      <div className="flex flex-wrap gap-1">
                        {generatedResume.atsKeywords.map((keyword, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Improvement Suggestions */}
                    <div>
                      <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">AI Improvement Suggestions</h4>
                      <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                        {generatedResume.improvementSuggestions.map((suggestion, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <span className="text-blue-600 mt-1">•</span>
                            <span>{suggestion}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      No Resume Generated Yet
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Fill out your information and click "Generate AI Resume" to create your professional resume.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}