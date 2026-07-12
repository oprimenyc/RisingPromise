import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  GraduationCap, 
  Users, 
  Award,
  CheckCircle,
  Star,
  Clock,
  Globe,
  ArrowRight,
  BookOpen,
  Target,
  TrendingUp,
  Zap,
  Brain,
  Briefcase,
  DollarSign,
  FileText,
  Phone,
  Mail
} from "lucide-react";
import Footer from "@/components/Footer";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-red-50 dark:from-gray-900 dark:via-blue-900/10 dark:to-red-900/10">
      {/* Navigation Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 dark:bg-gray-900/80 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-red-600 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Veridian Tech</h1>
                <p className="text-xs text-gray-600 dark:text-gray-400">Government Certified Training</p>
              </div>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#why" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Why Choose Us</a>
              <a href="#how" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">How It Works</a>
              <a href="#programs" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Programs</a>
              <a href="#success" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Success Stories</a>
            </nav>
            <div className="flex space-x-3">
              <Button variant="outline" asChild data-testid="button-funding">
                <a href="#funding">Check Funding</a>
              </Button>
              <Button asChild data-testid="button-login">
                <a href="/api/login">Sign In</a>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section with Animated Background */}
      <section className="relative overflow-hidden">
        {/* Animated Background Grid */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-red-600/10"></div>
          <div className="grid grid-cols-12 gap-4 h-full animate-pulse">
            {Array.from({ length: 144 }).map((_, i) => (
              <div key={i} className="bg-gradient-to-br from-blue-500/5 to-red-500/5 rounded-lg"></div>
            ))}
          </div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            {/* Government Certification Badge */}
            <div className="flex justify-center mb-8">
              <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-4 py-2">
                <Shield className="w-4 h-4 mr-2" />
                WIOA Government Certified Platform
              </Badge>
            </div>

            {/* Main Headlines */}
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Secure Your American
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-red-600">
                Future in Tech
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-12 leading-relaxed">
              Our government-certified platform provides the training, tools, and support you need to land a high-paying job in tech. 
              Join thousands of Americans building successful careers in information technology.
            </p>

            {/* Dual CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 text-lg font-semibold shadow-lg"
                asChild
                data-testid="button-get-started"
              >
                <a href="/api/login">
                  Get Started Today
                  <ArrowRight className="ml-2 w-5 h-5" />
                </a>
              </Button>
              
              <Button 
                size="lg" 
                variant="outline"
                className="border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white px-8 py-4 text-lg font-semibold"
                asChild
                data-testid="button-funding"
              >
                <a href="#funding">
                  <Shield className="mr-2 w-5 h-5" />
                  Check WIOA Funding
                </a>
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">87%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Job Placement Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">$65K</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Average Starting Salary</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">2,500+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Graduates Employed</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 1: The "Why" - Value Proposition */}
      <section id="why" className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Why Veridian Tech is America's #1 Choice
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              We combine government certification, cutting-edge technology, and proven career outcomes 
              to deliver the most effective IT training platform in the nation.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
              <CardContent className="p-8 text-center">
                <Shield className="w-12 h-12 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Government Certified</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  WIOA-approved training with full compliance and reporting. Your education is backed by federal workforce development standards.
                </p>
                <Badge className="bg-blue-600 text-white">100% Compliant</Badge>
              </CardContent>
            </Card>

            <Card className="border-2 border-red-200 dark:border-red-800 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900">
              <CardContent className="p-8 text-center">
                <Award className="w-12 h-12 text-red-600 dark:text-red-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Industry Recognition</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  CompTIA Tech+ certification preparation with hands-on labs and real-world scenarios trusted by employers nationwide.
                </p>
                <Badge className="bg-red-600 text-white">Employer Trusted</Badge>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
              <CardContent className="p-8 text-center">
                <TrendingUp className="w-12 h-12 text-green-600 dark:text-green-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Proven Results</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  87% job placement rate with an average starting salary of $65,000. Our graduates land careers, not just jobs.
                </p>
                <Badge className="bg-green-600 text-white">Results Guaranteed</Badge>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Section 2: The "How" - Unique Selling Points */}
      <section id="how" className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              How We Guarantee Your Success
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Our comprehensive approach combines AI-powered learning, expert instruction, 
              and dedicated career support to ensure every student succeeds.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Brain className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">AI-Powered Learning Assistant</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Your personal AI tutor provides 24/7 support, adaptive learning paths, and instant answers to technical questions. 
                    Never get stuck on a concept again.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <GraduationCap className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Comprehensive Curriculum</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Complete CompTIA Tech+ certification preparation with hands-on labs, real-world projects, 
                    and industry-standard tools and practices.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Briefcase className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Career Development Suite</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    AI resume builder, interview preparation, job search strategies, and networking guidance. 
                    We don't just train you—we help you land the job.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-600 to-red-600 rounded-2xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-6">Success Metrics That Matter</h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2">87%</div>
                  <div className="text-blue-100">Job Placement Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2">$65K</div>
                  <div className="text-blue-100">Avg. Starting Salary</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2">94%</div>
                  <div className="text-blue-100">Student Satisfaction</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2">3-6</div>
                  <div className="text-blue-100">Months to Employment</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Funding & Eligibility Section */}
      <section id="funding" className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Two Paths to Your Tech Career
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Choose the funding option that works best for your situation. 
              Both paths provide access to the same world-class training and support.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <Card className="border-2 border-blue-500 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-blue-500 text-white px-4 py-1 text-sm font-semibold">
                GOVERNMENT FUNDED
              </div>
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3 mb-4">
                  <Shield className="w-8 h-8 text-blue-600" />
                  <CardTitle className="text-2xl">WIOA Participants</CardTitle>
                </div>
                <div className="text-3xl font-bold text-blue-600 mb-2">$0 Cost</div>
                <p className="text-gray-600 dark:text-gray-400">Fully funded by government workforce development programs</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center text-gray-700 dark:text-gray-300">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
                    Complete CompTIA Tech+ training
                  </li>
                  <li className="flex items-center text-gray-700 dark:text-gray-300">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
                    AI-powered learning tools
                  </li>
                  <li className="flex items-center text-gray-700 dark:text-gray-300">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
                    Career development suite
                  </li>
                  <li className="flex items-center text-gray-700 dark:text-gray-300">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
                    Job placement assistance
                  </li>
                  <li className="flex items-center text-gray-700 dark:text-gray-300">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
                    Compliance reporting included
                  </li>
                </ul>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-6">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Eligibility Requirements:</strong> Must be eligible for WIOA workforce development funding. 
                    Contact your local American Job Center or case worker for enrollment.
                  </p>
                </div>
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" data-testid="button-wioa-contact">
                  Contact Your Case Worker
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-red-500 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-red-500 text-white px-4 py-1 text-sm font-semibold">
                PREMIUM ACCESS
              </div>
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3 mb-4">
                  <Star className="w-8 h-8 text-red-600" />
                  <CardTitle className="text-2xl">Private Investment</CardTitle>
                </div>
                <div className="text-3xl font-bold text-red-600 mb-2">$8,500</div>
                <p className="text-gray-600 dark:text-gray-400">One-time payment for lifetime access</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center text-gray-700 dark:text-gray-300">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
                    Everything in WIOA program
                  </li>
                  <li className="flex items-center text-gray-700 dark:text-gray-300">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
                    Instant enrollment & access
                  </li>
                  <li className="flex items-center text-gray-700 dark:text-gray-300">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
                    Priority support & mentorship
                  </li>
                  <li className="flex items-center text-gray-700 dark:text-gray-300">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
                    Lifetime course updates
                  </li>
                  <li className="flex items-center text-gray-700 dark:text-gray-300">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
                    Advanced networking opportunities
                  </li>
                </ul>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg mb-6">
                  <p className="text-sm text-green-800 dark:text-green-200">
                    <strong>Investment Protection:</strong> With our 87% job placement rate and $65K average salary, 
                    most graduates recover their investment within 3 months.
                  </p>
                </div>
                <Button className="w-full bg-red-600 hover:bg-red-700 text-white" asChild data-testid="button-start-premium">
                  <a href="/api/login">Start Premium Training</a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section id="success" className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Real Success Stories from Real Americans
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Join thousands of graduates who transformed their careers and secured their future in technology.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-white dark:bg-gray-900 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                    MJ
                  </div>
                  <div className="ml-3">
                    <h4 className="font-semibold text-gray-900 dark:text-white">Marcus Johnson</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Network Administrator</p>
                  </div>
                </div>
                <div className="flex mb-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  "The WIOA program changed my life. From unemployment to a $68K network admin role in 4 months. 
                  The AI tutor made complex concepts finally click."
                </p>
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  WIOA Graduate
                </Badge>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-900 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-white font-bold">
                    SR
                  </div>
                  <div className="ml-3">
                    <h4 className="font-semibold text-gray-900 dark:text-white">Sarah Rodriguez</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Cybersecurity Analyst</p>
                  </div>
                </div>
                <div className="flex mb-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  "Worth every penny! Landed a $75K cybersecurity position. The career support and interview prep were incredible. 
                  ROI achieved in 2 months."
                </p>
                <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                  Premium Graduate
                </Badge>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-900 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
                    DK
                  </div>
                  <div className="ml-3">
                    <h4 className="font-semibold text-gray-900 dark:text-white">David Kim</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">IT Support Specialist</p>
                  </div>
                </div>
                <div className="flex mb-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  "Career transition at 45 seemed impossible until Veridian Tech. The platform made learning engaging 
                  and the job placement team was phenomenal."
                </p>
                <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  Career Changer
                </Badge>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section id="programs" className="py-20 bg-gradient-to-r from-blue-600 to-red-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Your Tech Career Starts Today
          </h2>
          <p className="text-xl text-blue-100 mb-12 max-w-3xl mx-auto">
            Join the thousands of Americans who chose Veridian Tech to secure their future. 
            Whether WIOA-funded or self-invested, your success is our mission.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Button 
              size="lg" 
              className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold"
              asChild
              data-testid="button-enroll-now"
            >
              <a href="/api/login">
                <GraduationCap className="mr-2 w-5 h-5" />
                Enroll Now
              </a>
            </Button>
            
            <Button 
              size="lg" 
              variant="outline"
              className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg font-semibold"
              data-testid="button-contact"
            >
              <Phone className="mr-2 w-5 h-5" />
              Speak with Advisor
            </Button>
          </div>

          <p className="text-blue-100">
            Questions? Email us at <a href="mailto:support@veridiantech.com" className="text-white underline">support@veridiantech.com</a>
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}