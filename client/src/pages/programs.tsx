import { siteConfig } from "@/lib/siteConfig";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { Heart, Laptop, Check, Clock, DollarSign, Award, ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";
import logoImage from "@assets/logo.png";

const iconMap: Record<string, any> = {
  "Heart": Heart,
  "Laptop": Laptop,
};

export default function Programs() {
  const [selectedProgram, setSelectedProgram] = useState<"cna" | "it" | null>(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    hasHighSchoolDiploma: "",
    hasTransportation: "",
    motivationStatement: "",
  });
  const [pageLoaded, setPageLoaded] = useState(false);
  const { toast } = useToast();
  const headlineRef = useScrollReveal();
  const programsRef = useScrollReveal();

  useEffect(() => {
    setPageLoaded(true);
  }, []);

  const applicationMutation = useMutation({
    mutationFn: async (data: any) =>
      apiRequest("POST", "/api/programs/apply", data),
    onSuccess: () => {
      toast({
        title: "Application Submitted!",
        description: "We'll review your application and be in touch soon.",
      });
      setSelectedProgram(null);
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        hasHighSchoolDiploma: "",
        hasTransportation: "",
        motivationStatement: "",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProgram) return;

    // Validate required radio fields
    if (!formData.hasHighSchoolDiploma || !formData.hasTransportation) {
      toast({
        title: "Missing Information",
        description: "Please answer all required questions.",
        variant: "destructive",
      });
      return;
    }

    applicationMutation.mutate({
      programType: selectedProgram,
      ...formData,
    });
  };

  const programs = [
    { key: "cna" as const, data: siteConfig.programs.cna },
    { key: "it" as const, data: siteConfig.programs.it },
  ].filter(p => p.data.visible);

  if (!siteConfig.features.programsActive) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="max-w-md p-12 text-center">
          <h1 className="font-heading text-3xl font-bold mb-4">Programs Coming Soon</h1>
          <p className="text-muted-foreground mb-6">
            Our training programs are launching soon. Check back or sign up on our homepage to be notified when applications open.
          </p>
          <Link href="/">
            <Button className="no-default-hover-elevate no-default-active-elevate btn-minimal-hover" data-testid="button-back-home">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Homepage
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  if (selectedProgram) {
    const program = selectedProgram === "cna" ? siteConfig.programs.cna : siteConfig.programs.it;
    const isOpen = selectedProgram === "cna" ? siteConfig.features.cnaApplicationOpen : siteConfig.features.itApplicationOpen;

    if (!isOpen) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
          <Card className="max-w-md p-12 text-center">
            <h1 className="font-heading text-3xl font-bold mb-4">{program.title}</h1>
            <p className="text-muted-foreground mb-6">
              Applications for this program are currently closed. Check back soon or sign up for updates on our homepage.
            </p>
            <Button onClick={() => setSelectedProgram(null)} className="no-default-hover-elevate no-default-active-elevate btn-minimal-hover" data-testid="button-back-programs">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Programs
            </Button>
          </Card>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-background">
        <header className="bg-secondary text-white py-6">
          <div className="container mx-auto px-6">
            <div className="flex items-center gap-3 mb-4">
              <img src={logoImage} alt="Rising Promise Logo" className="h-12" />
              <span className="font-heading text-2xl font-bold">{siteConfig.organization.name}</span>
            </div>
            <Button 
              variant="ghost" 
              onClick={() => setSelectedProgram(null)}
              className="text-white mb-4 no-default-hover-elevate no-default-active-elevate btn-minimal-hover"
              data-testid="button-back-programs-header"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Programs
            </Button>
            <h1 className="font-heading text-4xl font-bold">{program.title}</h1>
            <p className="text-xl opacity-90 mt-2">Application Form</p>
          </div>
        </header>

        <div className="container mx-auto px-6 py-12 max-w-3xl">
          <form onSubmit={handleSubmit} className="space-y-6" data-testid="form-program-application">
            <Card className="p-6">
              <h3 className="font-heading text-xl font-bold mb-4">Your Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    data-testid="input-first-name"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    data-testid="input-last-name"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    data-testid="input-email"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    data-testid="input-phone"
                  />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-heading text-xl font-bold mb-4">Eligibility Questions</h3>
              
              <div className="mb-4">
                <Label className="mb-2 block">Do you have a high school diploma or GED? *</Label>
                <RadioGroup
                  value={formData.hasHighSchoolDiploma}
                  onValueChange={(value) => setFormData({ ...formData, hasHighSchoolDiploma: value })}
                  required
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="diploma-yes" data-testid="radio-diploma-yes" />
                    <Label htmlFor="diploma-yes">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="diploma-no" data-testid="radio-diploma-no" />
                    <Label htmlFor="diploma-no">No</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label className="mb-2 block">Do you have reliable transportation? *</Label>
                <RadioGroup
                  value={formData.hasTransportation}
                  onValueChange={(value) => setFormData({ ...formData, hasTransportation: value })}
                  required
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="transport-yes" data-testid="radio-transport-yes" />
                    <Label htmlFor="transport-yes">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="transport-no" data-testid="radio-transport-no" />
                    <Label htmlFor="transport-no">No</Label>
                  </div>
                </RadioGroup>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-heading text-xl font-bold mb-4">Tell Us Your Story (100–500 words)</h3>
              <Label htmlFor="motivation">Why do you want to join this program? What would this mean for your life?</Label>
              <Textarea
                id="motivation"
                required
                minLength={100}
                maxLength={2000}
                rows={8}
                value={formData.motivationStatement}
                onChange={(e) => setFormData({ ...formData, motivationStatement: e.target.value })}
                className="mt-2"
                data-testid="textarea-motivation"
              />
              <p className="text-sm text-muted-foreground mt-2">
                {formData.motivationStatement.length} characters
              </p>
            </Card>

            <Button 
              type="submit" 
              size="lg" 
              className="w-full no-default-hover-elevate no-default-active-elevate btn-minimal-hover"
              disabled={applicationMutation.isPending}
              data-testid="button-submit-application"
            >
              {applicationMutation.isPending ? "Submitting..." : "Submit My Application"}
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-background ${pageLoaded ? 'animate-hero-fade' : ''}`}>
      <header className="bg-secondary text-white py-16">
        <div className="container mx-auto px-6">
          <div className="flex items-center gap-3 mb-6">
            <img src={logoImage} alt="Rising Promise Logo" className="h-14" />
            <span className="font-heading text-2xl font-bold">{siteConfig.organization.name}</span>
          </div>
          <Link href="/">
            <Button variant="ghost" className="text-white mb-4 no-default-hover-elevate no-default-active-elevate btn-minimal-hover" data-testid="link-back-home">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Homepage
            </Button>
          </Link>
          <h1 ref={headlineRef.ref as any} className="font-heading text-5xl font-bold mb-4 scroll-reveal" data-testid="text-programs-headline">Real Skills. Real Jobs. Real Change.</h1>
          <p className="text-xl opacity-90 max-w-3xl" data-testid="text-programs-intro">
            Choose your path. Every program Rising Promise offers is built to lead directly to employment — with job placement support included.
          </p>
        </div>
      </header>

      <div className="container mx-auto px-6 py-16">
        <div ref={programsRef.ref as any} className="grid grid-cols-1 lg:grid-cols-2 gap-8 card-stagger scroll-reveal">
          {programs.map(({ key, data }) => {
            const Icon = iconMap[data.icon] || Heart;
            const isOpen = key === "cna" ? siteConfig.features.cnaApplicationOpen : siteConfig.features.itApplicationOpen;

            return (
              <Card key={key} className="overflow-hidden" data-testid={`card-program-${key}`}>
                <img 
                  src={data.image} 
                  alt={data.title} 
                  className="w-full h-64 object-cover"
                  data-testid={`img-program-${key}`}
                />
                <div className="p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <Icon className="w-8 h-8 text-primary" />
                    <h2 className="font-heading text-3xl font-bold" data-testid={`text-program-title-${key}`}>
                      {data.title}
                    </h2>
                  </div>
                  {data.description && (
                    <p className="text-muted-foreground mb-4 leading-relaxed" data-testid={`text-program-desc-${key}`}>
                      {data.description}
                    </p>
                  )}

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Duration</p>
                        <p className="font-semibold">{data.duration}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Salary Range</p>
                        <p className="font-semibold">{data.salary}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-muted-foreground mb-1">Format</p>
                    <p className="font-semibold">{data.format}</p>
                  </div>

                  {data.certifications && (
                    <div className="mb-6 flex items-start gap-2">
                      <Award className="w-5 h-5 text-primary mt-1" />
                      <div>
                        <p className="text-sm text-muted-foreground">Certification</p>
                        <p className="font-semibold">{data.certifications}</p>
                      </div>
                    </div>
                  )}

                  <div className="mb-6">
                    <h4 className="font-heading font-bold mb-2">What You'll Learn</h4>
                    <ul className="space-y-1">
                      {data.curriculum.slice(0, 4).map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                      {data.curriculum.length > 4 && (
                        <li className="text-sm text-muted-foreground">+ {data.curriculum.length - 4} more...</li>
                      )}
                    </ul>
                  </div>

                  <Button
                    className="w-full no-default-hover-elevate no-default-active-elevate btn-minimal-hover"
                    onClick={() => setSelectedProgram(key)}
                    disabled={!isOpen}
                    data-testid={`button-apply-${key}`}
                  >
                    {isOpen ? "Apply Now" : "Applications Closed"}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
